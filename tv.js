let player;

function onYouTubeIframeAPIReady() {
  cargarCanal();
}

function getParametro(nombre) {
  const url = new URL(window.location.href);
  return url.searchParams.get(nombre);
}

function cargarCanal() {
  const ch = getParametro("ch") || 0;
  const canal = canales[ch];

  document.getElementById("canal").innerText = canal.nombre;

  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    playerVars: {
      listType: "playlist",
      list: canal.playlist,
      autoplay: 1,
      controls: 0,
      modestbranding: 1
    }
  });
}