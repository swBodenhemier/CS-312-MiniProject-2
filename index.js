import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// note: to run you must get your own api keys and export them from secrets.js file
import { geocodeKey, openWeatherKey } from "./secrets.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let coords = null;
let weather = null;
let location = null;
let error = null;

app.get("/", (req, res) => {
  render(res, error);
});

app.post("/fetch", async (req, res) => {
  try {
    await getLonLat(req.body.address);
    res.render("select.ejs", { coords: coords });
    error = null;
  } catch (err) {
    console.error(err);
    error = err;
    res.redirect("/");
  }
});

app.post("/select", async (req, res) => {
  location = coords[Object.keys(req.body)[0]];
  try {
    await getWeather(location);
    error = null;
  } catch (err) {
    console.error(err);
    error = err;
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

async function getWeather(location) {
  if (location && location.lat && location.lon) {
    const result = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${openWeatherKey}`
    );
    weather = result.data;
  } else {
    throw "No coords";
  }
}

function toFahrenheit(temp) {
  return (temp - 273.15) * (9 / 5) + 32;
}

function render(res, error) {
  res.render("index.ejs", {
    location: location,
    weather: weather,
    toF: toFahrenheit,
    error: error,
  });
}
