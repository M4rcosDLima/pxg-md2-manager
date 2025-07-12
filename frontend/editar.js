// frontend/editar.js

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const form = document.getElementById("editar-form");

  const user = await new Promise(resolve => {
    firebase.auth().onAuthStateChanged(resolve);
  });

  if (!user) {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
    return;
  }

  // Carregar dados
  const res = await fetch("http://localhost:8000/personagens");
  const data = await res.json();
  const personagem = data[id];

  if (!personagem || personagem.uid !== user.uid) {
    alert("Personagem não encontrado ou acesso negado.");
    window.location.href = "index.html";
    return;
  }

  // Preencher o form
  form.nome.value = personagem.nome;
  form.energia_azul.value = personagem.energia_azul;
  form.energia_vermelha.value = personagem.energia_vermelha;
  form.max_azul.value = personagem.max_azul;
  form.max_vermelha.value = personagem.max_vermelha;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const atualizado = {
      nome: form.nome.value,
      energia_azul: parseInt(form.energia_azul.value),
      energia_vermelha: parseInt(form.energia_vermelha.value),
      max_azul: parseInt(form.max_azul.value),
      max_vermelha: parseInt(form.max_vermelha.value),
      ultima_atualizacao: new Date().toISOString(),
      regen_azul: parseInt(form.regen_azul.value),
regen_vermelha: parseInt(form.regen_vermelha.value),

    };

    const res = await fetch(`http://localhost:8000/personagens/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado)
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Atualizado!",
        text: "Personagem editado com sucesso!",
        confirmButtonText: "OK"
      }).then(() => window.location.href = "index.html");
    } else {
      Swal.fire("Erro", "Não foi possível atualizar.", "error");
    }
  });
});
