import axios from "axios";

import {
  getCoordinates
}
from "./geo.js";

export async function getWeather(
  city
) {

  const {
    latitude,
    longitude
  } =
    await getCoordinates(city);

  const response =
    await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {

          latitude,

          longitude,

          current:
            [
              "temperature_2m",
              "relative_humidity_2m",
              "wind_speed_10m"
            ].join(",")
        }
      }
    );

  const current =
    response.data.current;

  return {

    city,

    temperature:
      current.temperature_2m,

    humidity:
      current.relative_humidity_2m,

    windSpeed:
      current.wind_speed_10m
  };
}