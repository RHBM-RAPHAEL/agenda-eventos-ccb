// Importando módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCe3EqDWGXF9cR8mzCrOb_yryaWzsCuRaM",
  authDomain: "agenda-eventos-ccb.firebaseapp.com",
  projectId: "agenda-eventos-ccb",
  storageBucket: "agenda-eventos-ccb.appspot.com",
  messagingSenderId: "325923477189",
  appId: "1:325923477189:web:1aba52c8119d290338c2ac",
  measurementId: "G-PDTYLHH85J"
};

// Inicializar o app e o banco de dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para salvar evento no Firestore
async function salvarEvento(titulo, data, local, descricao, senha) {
  try {
    await addDoc(collection(db, "eventos"), { titulo, data, local, descricao, senha });
    alert("✅ Evento salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar evento:", error);
    alert("❌ Erro ao salvar o evento.");
  }
}

// Função para mostrar ou esconder eventos
function mostrarEventos() {
    const listaEventos = document.getElementById("eventos");
    listaEventos.innerHTML = "";

    getDocs(collection(db, "eventos"))
        .then((querySnapshot) => {
            querySnapshot.forEach((docSnap) => {
                const evento = docSnap.data();
                const li = document.createElement("li");
                li.innerHTML = `
                    <strong>${evento.titulo}</strong><br>
                    📅 ${evento.data} – ⏰ Até ${evento.horaTermino}<br>
                    📍 ${evento.local}<br>
                    📝 ${evento.descricao}<br>
                    <button class="editar" data-id="${docSnap.id}">✏️ Editar</button>
                    <button class="excluir" data-id="${docSnap.id}">🗑️ Excluir</button>
                    <hr>
                `;
                listaEventos.appendChild(li);
            });

            // 🔁 Reatribuir eventos aos botões criados dinamicamente
            document.querySelectorAll(".excluir").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const senha = prompt("Digite a senha para excluir:");
                    if (senha === "1234") {
                        excluirEvento(id);
                    } else {
                        alert("❌ Senha incorreta.");
                    }
                });
            });

            document.querySelectorAll(".editar").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const senha = prompt("Digite a senha para editar:");
                    if (senha === "1234") {
                        editarEvento(id);
                    } else {
                        alert("❌ Senha incorreta.");
                    }
                });
            });
        })
        .catch((error) => {
            console.error("Erro ao mostrar eventos:", error);
        });
}

// Função para excluir evento (pedindo senha)
async function excluirEvento(id) {
  const senhaDigitada = prompt("Digite a senha para excluir este evento:");
  const eventoRef = doc(db, "eventos", id);
  const eventoSnap = await getDoc(eventoRef);

  if (!eventoSnap.exists()) {
    alert("Evento não encontrado.");
    return;
  }

  const evento = eventoSnap.data();

  if (senhaDigitada === evento.senha) {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      await deleteDoc(eventoRef);
      alert("🗑️ Evento excluído com sucesso!");
      mostrarEventos(); // Atualiza a lista após exclusão
    }
  } else {
    alert("❌ Senha incorreta. Não foi possível excluir o evento.");
  }
}

// Função para editar evento (pedindo senha)
async function editarEvento(id) {
  const senhaDigitada = prompt("Digite a senha para editar este evento:");
  const eventoRef = doc(db, "eventos", id);
  const eventoSnap = await getDoc(eventoRef);

  if (!eventoSnap.exists()) {
    alert("Evento não encontrado.");
    return;
  }

  const evento = eventoSnap.data();

  if (senhaDigitada === evento.senha) {
    const novoTitulo = prompt("Novo título:", evento.titulo);
    const novaData = prompt("Nova data:", evento.data);
    const novoLocal = prompt("Novo local:", evento.local);
    const novaDescricao = prompt("Nova descrição:", evento.descricao);

    if (novoTitulo && novaData && novoLocal && novaDescricao) {
      await updateDoc(eventoRef, {
        titulo: novoTitulo,
        data: novaData,
        local: novoLocal,
        descricao: novaDescricao
      });
      alert("✏️ Evento atualizado!");
      mostrarEventos(); // Atualiza a lista após edição
    }
  } else {
    alert("❌ Senha incorreta. Não foi possível editar o evento.");
  }
}

// Eventos de clique
document.getElementById("btnSalvar").addEventListener("click", () => {
  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const local = document.getElementById("local").value;
  const descricao = document.getElementById("descricao").value;
  const senha = document.getElementById("senha").value;

  if (!titulo || !data || !local || !descricao || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  salvarEvento(titulo, data, local, descricao, senha);
});

document.getElementById("btnMostrar").addEventListener("click", mostrarEventos);

// Atribuindo as funções ao window para garantir que sejam globais
// No final do script
window.editarEvento = editarEvento;
window.excluirEvento = excluirEvento;
