// frontend/dungeons.js

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    Swal.fire({
      icon: "warning",
      title: "Login necessário",
      text: "Você precisa estar logado para acessar as Dungeons.",
    }).then(() => window.location.href = "login.html");
    return;
  }

  carregarDungeons();

  document.getElementById("dungeon-form").addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const data = {
      nome: form.nome.value,
      tipo: form.tipo.value,
      consumo: parseInt(form.consumo.value),
      imagem: form.imagem.value || "default-dungeon.png"
    };

    try {
      const res = await fetch("http://localhost:8000/dungeons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        Swal.fire("Sucesso", "Dungeon cadastrada com sucesso!", "success").then(() => {
          form.reset();
          carregarDungeons();
        });
      } else {
        const msg = await res.text();
        Swal.fire("Erro", msg, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Erro de rede", "Verifique o servidor ou sua conexão.", "error");
    }
  });
});

function carregarDungeons() {
  fetch("http://localhost:8000/dungeons")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("dungeon-lista");
      lista.innerHTML = "";

      if (!data || Object.keys(data).length === 0) {
        lista.innerHTML = "<p style='color: #ccc;'>Nenhuma dungeon cadastrada ainda.</p>";
        return;
      }

      for (const [id, d] of Object.entries(data)) {
        const div = document.createElement("div");
        div.classList.add("dungeon-card");
        div.innerHTML = `
          <img src="assets/dungeon-images/${d.imagem}" alt="${d.nome}" class="dungeon-thumb" />
          <div>
            <strong>${d.nome}</strong><br>
            Tipo: ${d.tipo} <br>
            Consumo: ${d.consumo}
          </div>
        `;
        lista.appendChild(div);
      }
    });
}
