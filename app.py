from flask import Flask, Response
import requests
import re

app = Flask(__name__)

CANAL = "odisea"
ARCHIVO_PROVEEDORES = "proveedores.txt"


def cargar_proveedores():
    try:
        with open(ARCHIVO_PROVEEDORES, "r") as f:
            return [line.strip() for line in f if line.strip()]
    except:
        return []


def parse_xtream(url):
    url = url.replace("tvappapk@", "")
    host = url.split("/get.php")[0]

    user = re.search(r'username=([^&]+)', url)
    password = re.search(r'password=([^&]+)', url)

    if user and password:
        return host, user.group(1), password.group(1)

    return None


def obtener_stream():
    proveedores = cargar_proveedores()

    for raw in proveedores:
        datos = parse_xtream(raw)
        if not datos:
            continue

        host, user, password = datos

        try:
            api = f"{host}/player_api.php?username={user}&password={password}&action=get_live_streams"
            r = requests.get(api, timeout=5)

            canales = r.json()

            for c in canales:
                if CANAL.lower() in c["name"].lower():
                    stream = f"{host}/live/{user}/{password}/{c['stream_id']}.ts"
                    return stream

        except:
            continue

    return None


@app.route("/odisea")
def canal():
    stream_url = obtener_stream()

    if not stream_url:
        return "No disponible", 404

    try:
        r = requests.get(stream_url, stream=True, timeout=5)

        return Response(
            r.iter_content(chunk_size=1024),
            content_type="video/mp2t"
        )

    except:
        return "Error conectando al stream", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)