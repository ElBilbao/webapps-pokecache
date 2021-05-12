const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios").default;
var path = require("path");

var pokeCache = new Map();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get(["/queryForm", "/"], (req, res) => {
  res.sendFile("index.html", { root: "../PokeCache/views" });
});

app.get("/pokemon", (req, res) => {
  const pokeName = req.query.name;
  let pokeJSON;

  if (pokeCache.has(pokeName)) {
    pokeJSON = pokeCache.get(pokeName);
    res.json(pokeJSON).status(200);
    return;
  }

  axios
    .get("https://pokeapi.co/api/v2/pokemon/" + pokeName)
    .then((pokeapi_res) => {
      let pokemon_data = pokeapi_res.data;

      let response = {
        imageURL:
          "https://pokeres.bastionbot.org/images/pokemon/" +
          pokemon_data["id"] +
          ".png",
        moreInfoURL: "https://pokemon.fandom.com/wiki/" + pokemon_data["name"],
        id: pokemon_data["id"],
        abilities: [pokemon_data["abilities"][0], pokemon_data["abilities"][1]],
        name: pokemon_data["name"],
        weight: pokemon_data["weight"] / 10,
      };

      pokeCache.set(pokeName, response); // Server cache
      console.log("SUCCESSFUL RESPONSE\n" + JSON.stringify(response));
      res.status(200);
      res.json(response);
    })
    .catch(function (error) {
      console.log("ERROR AXIOS REQUEST\n" + error);
      //res = corsHeaders(res);
      res
        .status(404)
        .send({ status: 404, message: "ERROR: Pokemon not found" });
    });
});

const PORT = 3000;
const HOST = "127.0.0.1";
var server = app.listen(PORT, () => {
  console.log("Server running at http://" + HOST + ":" + PORT);
});
