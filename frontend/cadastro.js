// frontend/cadastro.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('personagem-form');
  const galeria = document.getElementById("seletor-imagens");
  const inputImg = document.getElementById("char_img");

  // Lista de imagens disponíveis
  const imagens = [
    "skyla-masters2.png",
    "pokemaniac.png",
    "steven.png",
    "swimmer-gen6.png",
    "swimmerf.png",
    "waitress.png",
    "wallace-gen6.png",
    "winona.png",
    "wulfric.png",
    "zinnia.png",
  ];

  // Monta a galeria visual de imagens
  imagens.forEach(nome => {
    const img = document.createElement("img");
    img.src = `assets/char-images/${nome}`;
    img.alt = nome;
    img.classList.add("char-option");
    img.style.cursor = "pointer";
    img.style.width = "64px"; // Ajuste de tamanho (opcional)
    img.style.margin = "5px";

    img.addEventListener("click", () => {
      document.querySelectorAll(".char-option").forEach(i => i.classList.remove("selected"));
      img.classList.add("selected");
      inputImg.value = nome;
    });

    galeria.appendChild(img);
  });

  // Verifica autenticação antes de cadastrar
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      alert("Você precisa estar logado para cadastrar um personagem.");
      window.location.href = "login.html";
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        nome: form.nome.value.trim(),
        energia_azul: parseInt(form.energia_azul.value) || 0,
        energia_vermelha: parseInt(form.energia_vermelha.value) || 0,
        max_azul: parseInt(form.max_azul.value) || 0,
        max_vermelha: parseInt(form.max_vermelha.value) || 0,
        char_img: inputImg.value || "default.png",
        uid: user.uid,
        ultima_atualizacao: new Date().toISOString(),
        regen_azul: parseInt(form.regen_azul.value),
regen_vermelha: parseInt(form.regen_vermelha.value),

      };

      try {
  const res = await fetch("http://localhost:8000/personagens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    Swal.fire({
      title: '🎉 Sucesso!',
      text: 'Personagem cadastrado com sucesso!',
      icon: 'success',
      confirmButtonText: 'Ir para a Home',
      background: '#1c1c1c',
      color: '#fff',
      confirmButtonColor: '#00ccff'
    }).then(() => {
      window.location.href = "index.html";
    });
  } else {
    const errorText = await res.text();
    Swal.fire({
      title: '❌ Erro!',
      text: 'Erro ao cadastrar personagem: ' + errorText,
      icon: 'error',
      confirmButtonText: 'Ok',
      background: '#1c1c1c',
      color: '#fff',
      confirmButtonColor: '#ff4d4d'
    });
  }
} catch (err) {
  console.error("Erro na requisição:", err);
  Swal.fire({
    title: '⚠️ Falha de conexão',
    text: 'Erro de rede ou servidor offline.',
    icon: 'warning',
    confirmButtonText: 'Tentar novamente',
    background: '#1c1c1c',
    color: '#fff',
    confirmButtonColor: '#ffaa00'
  });
}

    });
  });
});
