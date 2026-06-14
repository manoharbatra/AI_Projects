import axios from "axios";

export async function getCoordinates(
  city
) {

  const response =
    await axios.get(
      "https://geocoding-api.open-meteo.com/v1/search",
      {
        params: {
          name: city,
          count: 1
        }
      }
    );

  const result =
    response.data.results?.[0];

  if (!result) {
    throw new Error(
      `City not found: ${city}`
    );
  }

  return {
    latitude:
      result.latitude,

    longitude:
      result.longitude
  };
}