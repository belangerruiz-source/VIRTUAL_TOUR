let player;
let cache = {};

const API_KEY = "AIzaSyDsCEmTUrXyr7E8RJQqbZt4AV0IN9XQHiI";

async function cargarCanales() {

  for (let i = 0; i < canales.length; i++) {
    const canal = canales[i];

    const videos = await obtenerVideos(canal.playlist);
    const duraciones = await obtenerDuraciones(videos);

    cache[i] = {
      videos,
      duraciones
    };
  }

  iniciarCanal();
}

async function obtenerVideos(playlistId) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.items.map(i => i.snippet.resourceId.videoId);
}

async function obtenerDuraciones(ids) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(",")}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.items.map(v => convertirISO(v.contentDetails.duration));
}

function convertirISO(iso) {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const h = parseInt(match[1]) || 0;
  const m = parseInt(match[2]) || 0;
  const s = parseInt(match[3]) || 0;
  return h * 3600 + m * 60 + s;
}

function calcularPosicion(duraciones) {
  const ahora = Math.floor(Date.now() / 1000);
  const total = duraciones.reduce((a, b) => a + b, 0);

  let tiempo = ahora % total;

  for (let i = 0; i < duraciones.length; i++) {
    if (tiempo < duraciones[i]) {
      return { index: i, offset: tiempo };
    }
    tiempo -= duraciones[i];
  }
}

function iniciarCanal() {
  const ch = new URLSearchParams(window.location.search).get("ch") || 0;

  const data = cache[ch];
  const canal = canales[ch];

  document.getElementById("canal").innerText = canal.nombre;

  const pos = calcularPosicion(data.duraciones);

  player = new YT.Player("player", {
    videoId: data.videos[pos.index],
    playerVars: {
      autoplay: 1,
      controls: 0,
      start: pos.offset
    },
    events: {
      onStateChange: function(e) {
        if (e.data === 0) {
          pos.index = (pos.index + 1) % data.videos.length;
          player.loadVideoById(data.videos[pos.index]);
        }
      }
    }
  });
}

function onYouTubeIframeAPIReady() {
  cargarCanales();
}