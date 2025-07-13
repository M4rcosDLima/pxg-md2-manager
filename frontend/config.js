// frontend/config.js
const API_BASE_URL = location.hostname === "localhost"
  ? "http://localhost:8000"
  : "https://api.pxg-md-manager.com.br"; // ou apenas "https://pxg-md-manager.com.br/api" se você fizer reverse proxy
