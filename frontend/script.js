// frontend/script.js
fetch("http://localhost:8000/personagens")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("personagens-container");
    for (let id in data) {
      const p = data[id];
      const div = document.createElement("div");
      div.innerHTML = `<strong>${p.nome}</strong> - 🔵 ${p.energia_azul}/100 - 🔴 ${p.energia_vermelha}/100`;
      container.appendChild(div);
    }
  });
