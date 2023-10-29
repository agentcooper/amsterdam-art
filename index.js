/**
 * Add layers
 */

const stamenWatercolor = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
  {
    maxZoom: 18,
    attribution: `&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>
    &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a>
    &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>
    &copy; <a href="https://www.openstreetmap.org/about/" target="_blank">OpenStreetMap contributors</a>`,
  },
);

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap",
});

const map = L.map("map", {
  center: [52.37368660330425, 4.898700714111328],
  zoom: 15,
});

var GitHubIcon = L.Control.extend({
  options: {
    position: "topright",
  },

  onAdd: () => {
    const container = L.DomUtil.create(
      "div",
      "leaflet-control leaflet-control-layers leaflet-control-github-icon",
    );
    container.onclick = () => {
      window.open("https://github.com/agentcooper/amsterdam-art#readme");
    };
    return container;
  },
});

stamenWatercolor.addTo(map);

const baseMaps = {
  "Stamen Watercolor": stamenWatercolor,
  OpenStreetMap: osm,
};

const gitHubIcon = new GitHubIcon();
gitHubIcon.addTo(map);

const layerControl = L.control.layers(baseMaps).addTo(map);

/**
 * Fetch data
 */

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

/**
 * Contribution
 */

function onContextMenu(e) {
  const url = prompt(
    "Contribution guide: https://github.com/agentcooper/amsterdam-art#how-to-contribute\n\nPaste a URL for the painting:",
  );

  alert(
    `Send a pull request adding following JSON to map.geojson:\n\n${JSON.stringify(
      fromTemplate(e, url),
      null,
      2,
    )}`,
  );
}

function fromTemplate(e, url) {
  return {
    geometry: {
      coordinates: [e.latlng.lng, e.latlng.lat],
      type: "Point",
    },
    properties: {
      title: "",
      artist: "",
      date: "",
      image: {
        thumbnail: "",
        full: "",
        ...(getImage(url) ?? {}),
      },
      url,
      streetView: "",
    },
    type: "Feature",
  };
}

function getImage(url) {
  if (!url.includes("wikimedia.org")) {
    return undefined;
  }

  const fileIndex = url.indexOf("File:");
  const isWikimediaUrl = fileIndex !== -1;

  if (!isWikimediaUrl) {
    return undefined;
  }

  const file = url.slice(fileIndex);

  const full = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;
  const thumbnail = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=300`;

  return {
    thumbnail,
    full,
  };
}

map.on("contextmenu", onContextMenu);
