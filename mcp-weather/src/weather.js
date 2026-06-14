export function getWeather(city) {

  const weatherData = {

    Delhi: {
      temperature: 42,
      condition: "Sunny"
    },

    Noida: {
      temperature: 40,
      condition: "Sunny"
    },

    Mumbai: {
      temperature: 32,
      condition: "Rainy"
    }
  };

  return (
    weatherData[city] || {
      temperature: 30,
      condition: "Unknown"
    }
  );
}