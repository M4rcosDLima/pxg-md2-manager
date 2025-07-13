// frontend/home.js

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    loadPersonagens(user.uid, user.displayName);
    setInterval(() => loadPersonagens(user.uid, user.displayName), 60000); // Atualiza a cada minuto
  }
});

function calcularTempoRestante(ultimaDataISO, intervaloMinutos) {
  const ultimaData = new Date(ultimaDataISO);
  const agora = new Date();
  const diff = Math.floor((agora - ultimaData) / 60000); // minutos
  const restante = intervaloMinutos - diff;
  return restante > 0 ? restante : 0;
}

function loadPersonagens(uid, displayName) {
  fetch(`${API_BASE_URL}/personagens`)
    .then(res => res.json())
    .then(data => {
      const lista = document.querySelector(".lista");
      const container = document.getElementById("personagens-container");
      lista.innerHTML = "";

      // Mensagem de boas-vindas
      const oldWelcome = container.querySelector(".welcome-msg");
      if (oldWelcome) oldWelcome.remove();

      if (displayName) {
        const welcome = document.createElement("p");
        welcome.classList.add("welcome-msg");
        welcome.style.color = "#00ccff";
        welcome.style.fontSize = "12px";
        welcome.style.marginBottom = "20px";
        welcome.textContent = `Bem-vindo, ${displayName}!`;
        container.prepend(welcome);
      }

      if (!data) {
        lista.innerHTML = "<p>Nenhum personagem encontrado.</p>";
        return;
      }

      const personagens = Object.entries(data).filter(([_, p]) => p.uid === uid);
      if (personagens.length === 0) {
        lista.innerHTML = `<p style="color: red;">Você ainda não tem personagens.</p>`;
        return;
      }

      for (const [id, p] of personagens) {
        const div = document.createElement("div");
        div.classList.add("personagem-card");

        const regenAzul = parseInt(p.regen_azul || 30);
        const regenVermelha = parseInt(p.regen_vermelha || 60);
        const maxAzul = parseInt(p.max_azul || 100);
        const maxVermelha = parseInt(p.max_vermelha || 100);
        const energiaAzul = parseInt(p.energia_azul || 0);
        const energiaVermelha = parseInt(p.energia_vermelha || 0);

        const ultimaAzul = new Date(p.ultima_azul || new Date());
        const ultimaVermelha = new Date(p.ultima_vermelha || new Date());

        const agora = new Date();
        const minutosPassadosAzul = Math.floor((agora - ultimaAzul) / 60000);
        const minutosPassadosVermelha = Math.floor((agora - ultimaVermelha) / 60000);

        const energiaNovaAzul = Math.min(maxAzul, energiaAzul + Math.floor(minutosPassadosAzul / regenAzul));
        const energiaNovaVermelha = Math.min(maxVermelha, energiaVermelha + Math.floor(minutosPassadosVermelha / regenVermelha));

        const proximaAzul = regenAzul - (minutosPassadosAzul % regenAzul);
        const proximaVermelha = regenVermelha - (minutosPassadosVermelha % regenVermelha);

        //att no Firebase se a energia mudou
        if (energiaNovaAzul !== energiaAzul || energiaNovaVermelha !== energiaVermelha) {
          fetch(`${API_BASE_URL}/personagens/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              energia_azul: energiaNovaAzul,
              energia_vermelha: energiaNovaVermelha,
              ultima_azul: energiaNovaAzul !== maxAzul ? new Date().toISOString() : p.ultima_azul,
              ultima_vermelha: energiaNovaVermelha !== maxVermelha ? new Date().toISOString() : p.ultima_vermelha,
            })
          }).then(() => loadPersonagens(uid, displayName)); 
          return; 
        }

        div.innerHTML = `
        🔵 ${energiaNovaAzul}/${maxAzul} &nbsp;&nbsp;
    🔴 ${energiaNovaVermelha}/${maxVermelha}<br>
  <img src="assets/char-images/${p.char_img || 'default.png'}" alt="${p.nome}" class="char-thumb" />
  <div>
    <strong>${p.nome}</strong><br>
    <p>${p.descricao || "  "}</p>
    <small>
      <i class="fas fa-clock"></i> Cooldown: 🔵 ${regenAzul}min / 🔴 ${regenVermelha}min<br>
      ${energiaNovaAzul >= maxAzul
        ? "🔵 Energia cheia!"
        : `🔵 Próxima em: ${proximaAzul}min`}<br>
      ${energiaNovaVermelha >= maxVermelha
        ? "🔴 Energia cheia!"
        : `🔴 Próxima em: ${proximaVermelha}min`}
    </small>
  </div>
  <div class="acoes-inline">
    <button class="editar" data-id="${id}" title="Editar"><i class="fas fa-edit"></i></button>
    <button class="play" data-id="${id}" title="Entrar na Dungeon"><i class="fas fa-play"></i></button>
    <button class="excluir" data-id="${id}" title="Excluir"><i class="fas fa-trash"></i></button>
  </div>
`;


        lista.appendChild(div);
      }

      // Reativa botões depois de gerar os cards
      ativarEventos(personagens, uid, displayName);
    });
}


tsParticles.load("particles", {
  fullScreen: false,
  background: {
    color: "#0b0b0b"
  },
  particles: {
    number: { value: 60 },
    color: { value: ["#ff4d4d", "#00ccff", "#ffffff"] },
    size: { value: 2 },
    move: { enable: true, speed: 0.6 },
    links: {
      enable: true,
      color: "#555",
      distance: 100,
      opacity: 0.4
    }
  }

  
});
function ativarEventos(personagens, uid, displayName) {
  document.querySelectorAll(".editar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.dataset.id;
      window.location.href = `editar.html?id=${id}`;
    });
  });

  document.querySelectorAll(".excluir").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.dataset.id;
      Swal.fire({
        title: "Excluir personagem?",
        text: "Essa ação não pode ser desfeita!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e74c3c",
        cancelButtonColor: "#7f8c8d",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar"
      }).then(result => {
        if (result.isConfirmed) {
          fetch(`${API_BASE_URL}/personagens/${id}`, { method: "DELETE" })
            .then(res => {
              if (res.ok) {
                Swal.fire("Excluído!", "Personagem removido com sucesso.", "success").then(() => {
                  loadPersonagens(uid, displayName);
                });
              } else {
                Swal.fire("Erro", "Não foi possível excluir o personagem.", "error");
              }
            });
        }
      });
    });
  });

  document.querySelectorAll(".play").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.currentTarget.dataset.id;
      const personagem = personagens.find(([pid]) => pid === id)?.[1];
      if (!personagem) return;

      const res = await fetch(`${API_BASE_URL}/dungeons?uid=${firebase.auth().currentUser.uid}`);

      const dungeons = await res.json();
      const azul = [], vermelha = [];

      
      for (const [_, d] of Object.entries(dungeons || {})) {
        if (d.tipo === "azul" && personagem.energia_azul >= d.quantidade) azul.push(d);
        if (d.tipo === "vermelha" && personagem.energia_vermelha >= d.quantidade) vermelha.push(d);
      }

      

      let html = "";
      if (azul.length) {
        html += `<h3>🔵 Dungeons Azuis</h3>`;
        azul.forEach(d => {
          html += `<button class="dungeon-play-btn" data-id="${id}" data-tipo="azul" data-nome="${d.nome}" data-qtd="${d.quantidade}">${d.nome} - ⚡${d.quantidade}</button><br>`;
        });
      }
      if (vermelha.length) {
        html += `<h3>🔴 Dungeons Vermelhas</h3>`;
        vermelha.forEach(d => {
         html += `
  <button class="dungeon-play-btn" data-id="${id}" data-tipo="azul" data-nome="${d.nome}" data-qtd="${d.quantidade}">
    <img src="assets/dungeons-images/${d.imagem}" alt="${d.nome}" class="dungeon-icon" />
    ${d.nome} - ⚡${d.quantidade}
  </button><br>
`;

        });
      }

      


      if (!html) html = "<p>Sem dungeons disponíveis ou Energia insuficiente.</p>";

      Swal.fire({ title: "Escolha a dungeon", html, showConfirmButton: true });

      setTimeout(() => {
        document.querySelectorAll(".dungeon-play-btn").forEach(dBtn => {
          dBtn.addEventListener("click", async e => {
            const tipo = e.currentTarget.dataset.tipo;
            const qtd = parseInt(e.currentTarget.dataset.qtd);
            const nome = e.currentTarget.dataset.nome;

            const updateData = {};
            if (tipo === "azul") {
              updateData.energia_azul = personagem.energia_azul - qtd;
              updateData.ultima_azul = new Date().toISOString();
            } else {
              updateData.energia_vermelha = personagem.energia_vermelha - qtd;
              updateData.ultima_vermelha = new Date().toISOString();
            }

            const confirm = await fetch(`${API_BASE_URL}/personagens/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateData)
            });

            if (confirm.ok) {
              Swal.fire("Aventura iniciada!", `Você entrou na dungeon: ${nome}`, "success").then(() => {
                loadPersonagens(uid, displayName);
              });
            } else {
              Swal.fire("Erro", "Não foi possível iniciar a dungeon.", "error");
            }
          });
        });
      }, 100);
    });
  });
}


