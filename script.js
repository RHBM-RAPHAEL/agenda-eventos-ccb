// Importando módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Configuração do Firebase (seu próprio projeto)
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
    const docRef = await addDoc(collection(db, "eventos"), {
      titulo: titulo,
      data: data,
      local: local,
      descricao: descricao,
      senha: senha
    });
    alert("✅ Evento salvo com sucesso!");
    console.log("Evento ID:", docRef.id);
  } catch (error) {
    console.error("Erro ao salvar evento:", error);
    alert("❌ Erro ao salvar o evento.");
  }
}

// Quando clicar no botão "Salvar"
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
