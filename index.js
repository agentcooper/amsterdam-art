const stamenWatercolor = L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
  {
    maxZoom: 18,
    attribution: `Tiles by <a href="http://stamen.com" target="_blank">Stamen Design</a>, data by <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>.`,
  }
);

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap",
});

const map = L.map("map", {
  center: [52.37368660330425, 4.898700714111328],
  zoom: 15,
});

stamenWatercolor.addTo(map);

const baseMaps = {
  "Stamen Watercolor": stamenWatercolor,
  OpenStreetMap: osm,
};

const layerControl = L.control.layers(baseMaps).addTo(map);

const geoJsonPath = "map.geojson";
fetch(geoJsonPath)
  .then((res) => res.json())
  .then((geojsonFeature) => {
    const geoJSON = L.geoJSON(geojsonFeature, {
      onEachFeature: forEachFeature,
    });

    geoJSON.addTo(map);
  })
  .catch((e) => {
    alert(`Error loading ${geoJsonPath}: ${e}`);
  });

function forEachFeature(feature, layer) {
  const { title, date, artist, url, image, streetView } = feature.properties;
  const thumbnail = image.thumbnail || image.full;
  const popupContent = `
      <div>
        <a href='${image.full}' target='_blank'>
          <img src='${thumbnail}' width='300' height='200' style='object-fit: cover;' />
        </a>
        <h4 style='margin-bottom: 0;'><a href='${url}' target='_blank'>${title}</a></h4>
        <p style='margin-top: 0.5em;'>${[artist, date]
          .filter(Boolean)
          .join(", ")}</p>
        ${
          streetView
            ? `<p><a href='${streetView}' target='_blank'>Open in Google Street View</a></p>`
            : ""
        }
      </div>`;

  layer.bindPopup(popupContent, {
    closeButton: false,
  });
}

function onMapClick(e) {
  const wikimedia = prompt("Contribute a marker using Wikimedia URL");

  const index = wikimedia.indexOf("File:");
  if (index !== -1) {
    const file = wikimedia.slice(index);

    const full = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;
    const thumbnail = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=300`;

    const template = {
      geometry: {
        coordinates: [e.latlng.lng, e.latlng.lat],
        type: "Point",
      },
      properties: {
        title: "...",
        artist: "...",
        date: "...",
        image: {
          thumbnail: thumbnail,
          full: full,
        },
        wikimedia: wikimedia,
        streetView: "",
      },
      type: "Feature",
    };

    alert(JSON.stringify(template, null, 2));
  }
}

map.on("contextmenu", onMapClick);
