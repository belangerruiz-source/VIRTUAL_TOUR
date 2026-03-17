let player;

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
  const canal = canales[ch];

  document.getElementById("canal").innerText = canal.nombre;

  const pos = calcularPosicion(canal.duraciones);

  player = new YT.Player("player", {
    videoId: canal.videos[pos.index],
    playerVars: {
      autoplay: 1,
      controls: 0,
      start: pos.offset
    },
    events: {
      onStateChange: function(e) {
        if (e.data === 0) {
          pos.index = (pos.index + 1) % canal.videos.length;
          player.loadVideoById(canal.videos[pos.index]);
        }
      }
    }
  });
}

function onYouTubeIframeAPIReady() {
  iniciarCanal();
}