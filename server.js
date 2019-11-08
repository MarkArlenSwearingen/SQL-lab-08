// 'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express =require('express');
const cors = require('cors');
const superagent = require('superagent')
const pg = require('pg');

const PORT = process.env.PORT;
const app = express();

app.use(cors());

const DATABASE_URL = 'https://quiet-fortress-51894.herokuapp.com/';

//Error Functions
  // Error Handler function to throw
  function errorHandler(error,request,response) {
    response.status(500).send(error);
  }
  
  // Error if route does not exist
  app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));
  
//create constructor for client
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.err(err));

// Weather Constructor Function
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

// Location Constructor Function
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

Location.prototype.saveLocationToDB(location){
  // write the data received from API to the SQL database.
  const SQL = `INSERT INTO location
  (search_query, formatted_query, longitude, latitude)
  VALUES ($1, $2, $3, $4)
  RETURNING *`;

  let values = Object.values(this);
  return client.query(SQL, values);
}

Location.fetchLocation = function(query){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  superagent.get(url)
    .then( retult => {
     if (!result.body.results.length) {
       throw 'No data';}
       let location = new Location (query,result[0]);
       return location.save()
        .then ( result =>{
          location.id = result.rows[0].id;
          return location;
        });
     })
    .catch( error => {
      response.status(500).send('Status: 500. Sorry, there is something not quite right');
    })
}

Location.lookup = (handler) => {
  const SQL = `SELECT * FROM locations where search_query = $1`;
  const values = [handler.query];

  return client.query(SQL, values)
  .then( results =>{
    if (results.rowCount > 0){
      handler.cacheHit(results);
    } else {
      handler.cacheMiss(results);
    }
  })
  .catch(console.error);
};

// function checkLocationDB(location){
//   // does location exist in DB?
//   //if not, call to api to get data, 

//   //if yes, call to get location data from database
//   //add to api functions a call to saveLocationToDB  upon receiving data.
//  }
 
//  function getDataFromDB (
//    // get data from database.
//  )
 
// Routes
app.get('/', homePage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather)

function homePage(request,response) {
  response.status(200).send('Welcome to the Home Page!');
}


function getLocation(request,response) {
  //route hit see if location(query) record in database
  //return info from db or get information from api and save to db
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  Location.fetchLocation(request.query.data)
  .then (location => {
    response.send(location)
  })
}

// // Function to handle darksky.json data
function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then( data => {
      const weatherSummaries = data.body.daily.data.map(day => new Weather(day));
      response.status(200).send(weatherSummaries);
    })
    .catch( error => {
      errorHandler('So sorry, something went really wrong', request, response);
    });

}

//Helper functions
// PORT for the server to listen on
// start express server after database connection is established.  put in a handler function with the error routes.
client.connect()
  .then( () =>{
    app.listen(PORT, () => console.log(`Server and database are up. App is listening on ${PORT}`));
  })



