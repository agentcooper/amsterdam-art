import fs from "fs";

const FILE_NAME = "map.geojson";

const json_input = process.argv[2];
if (!json_input) {
  throw new Error("Missing input");
}
const input = JSON.parse(json_input);

const content = fs.readFileSync(FILE_NAME, "utf-8");
const json = JSON.parse(content);

json.features.push({
  geometry: {
    coordinates: input.coordinates ?? missing("coordinates"),
    type: "Point",
  },
  properties: {
    title: input.title ?? missing("title"),
    artist: input.artist ?? "",
    date: input.date ?? "",
    image: {
      thumbnail: input.thumbnail ?? "",
      full: input.full ?? "",
    },
    url: input.url ?? "",
  },
  type: "Feature",
});

function missing(name) {
  throw new Error(`Missing field: ${name}`);
}

fs.writeFileSync(FILE_NAME, JSON.stringify(json, null, 2));
