DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS weather;

CREATE TABLE location(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7)
);

CREATE TABLE weather(
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time VARCHAR(255)
);