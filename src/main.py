from Server import Backend
from routes import afd
from config import DevelopmentConfig

app = Backend(__name__, DevelopmentConfig, afd)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
