const POSITION_KEY = process.env.POSITION_KEY;
const WEATHER_BASE_URL = process.env.WEATHER_BASE_URL;

const getServerWeather = async (lat, lon) => {
  const URL = `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${POSITION_KEY}`;

  try {
    const res = await fetch(URL);
    const json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
};

export { getServerWeather };
