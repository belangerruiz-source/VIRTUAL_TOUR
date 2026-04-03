from flask import Flask, redirect
import requests
import re

app = Flask(__name__)

# 🔥 CONFIG
CANAL = "odisea"
ARCHIVO_PROVEEDORES = "proveedores.txt"


# 📂 Cargar proveedores desde archivo
def cargar_proveedores():
    try:
        with open(ARCHIVO_PROVEEDORES, "r") as f:
            proveedores = [line.strip() for line in f if line.strip()]

        print(f"📂 Proveedores cargados: {len(proveedores)}")
        return proveedores

    except Exception as e:
        print(f"❌ Error cargando proveedores: {e}")
        return []


# 🔧 Parsear Xtream
def parse_xtream(url):
    url = url.replace("tvappapk@", "")
    host = url.split("/get.php")[0]

    user = re.search(r'username=([^&]+)', url)
    password = re.search(r'password=([^&]+)', url)

    if user and password:
        return host, user.group(1), password.group(1)

    return None


# 🔎 Obtener stream en tiempo real
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

            if r.status_code != 200:
                continue

            canales = r.json()

            for c in canales:
                if CANAL.lower() in c["name"].lower():

                    stream = f"{host}/live/{user}/{password}/{c['stream_id']}.ts"

                    print(f"✅ Usando: {c['name']}")
                    return stream

        except:
            continue

    return None


# 📺 Endpoint
@app.route(f"/{CANAL}")
def canal():
    stream = obtener_stream()

    if stream:
        return redirect(stream)

    return "No disponible", 404


# 🔥 Render requiere esto
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)