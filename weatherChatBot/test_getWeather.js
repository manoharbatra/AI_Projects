import 'dotenv/config';
import axios from 'axios';

const weatherApiKey = process.env.WEATHER_API_KEY;
if (!weatherApiKey) {
  console.error('WEATHER_API_KEY is not set. Create a .env or set the environment variable.');
  process.exit(1);
}

const city = process.argv[2] || 'Delhi';
const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`;

console.log('Calling OpenWeather for:', city);

try {
  const resp = await axios.get(url);
  console.log('Status:', resp.status);
  console.log('Body:');
  console.log(JSON.stringify(resp.data, null, 2));
} catch (err) {
  console.error('Request failed:');
  console.error(err.response?.status, err.response?.data || err.message);
  process.exit(1);
}
