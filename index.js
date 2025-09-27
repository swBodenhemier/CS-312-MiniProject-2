import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import morgan from "morgan";
import axios from "axios";

// note: to run you must get your own api keys and export them from secrets.js file
import { geocodeKey, openWeatherKey } from "./secrets.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

let address = "S San Francisco St, Flagstaff, AZ 86011";
let coords = [];
let weather = {
  coord: { lon: -111.6529, lat: 35.1845 },
  weather: [
    {
      id: 804,
      main: "Clouds",
      description: "overcast clouds",
      icon: "04d",
    },
  ],
  base: "stations",
  main: {
    temp: 288.55,
    feels_like: 288.39,
    temp_min: 288.55,
    temp_max: 288.55,
    pressure: 1013,
    humidity: 86,
    sea_level: 1013,
    grnd_level: 774,
  },
  visibility: 10000,
  wind: { speed: 4.31, deg: 187, gust: 4.66 },
  clouds: { all: 92 },
  dt: 1759007218,
  sys: { country: "US", sunrise: 1758979110, sunset: 1759022182 },
  timezone: -25200,
  id: 5294810,
  name: "Flagstaff",
  cod: 200,
};

app.get("/", (req, res) => {
  render(res);
});

app.post("/fetch", async (req, res) => {
  try {
    //await getLonLat(req.body.address);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }

  try {
    //await getWeather(coords[0]);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

async function getLonLat(address) {
  if (address && address.length > 0) {
    const result = await axios.get(
      `https://geocode.maps.co/search?q=${address}&api_key=${geocodeKey}`
    );
    console.log(result.data);
    coords = result.data.map((location) => {
      return {
        lat: location.lat,
        lon: location.lon,
        name: location.display_name,
      };
    });
    if (coords.length === 0) {
      throw "Invalid address";
    }
  } else {
    throw "No address";
  }
}

async function getWeather(coords) {
  if (coords && coords.lat && coords.lon) {
    const result = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${openWeatherKey}`
    );
    console.log(result.data);
    weather = result.data;
  } else {
    throw "No coords";
  }
}

function toFahrenheit(temp) {
  return (temp - 273.15) * (9 / 5) + 32;
}

function render(res) {
  res.render("index.ejs", {
    coords: coords,
    weather: weather,
    toF: toFahrenheit,
    errors: null,
  });
}
