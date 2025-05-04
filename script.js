// Importa o SDK do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, push, get, update, remove } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCe3EqDWGXF9cR8mzCrOb_yryaWzsCuRaM",
  authDomain: "agenda-eventos-ccb.firebaseapp.com",
  databaseURL: "https://agenda-eventos-ccb-default-rtdb.firebaseio.com",
  projectId: "agenda-eventos-ccb",
  storageBucket: "agenda-eventos-ccb.firebasestorage.app",
  messagingSenderId: "325923477189",
  appId: "1:325923477189:web:1aba52c8119d290338c2ac",
  measurementId: "G-PDTYLHH85J"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Função para registrar um novo usuário
function registrarUsuario(email, senha) {
  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      alert('Usuário registrado com sucesso!');
    })
    .catch((error) => {
      alert('Erro ao registrar usuário: ' + error.message);
    });
}

// Função para login de usuário
function loginUsuario(email, senha) {
  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      alert('Usuário logado com sucesso!');
      mostrarEventos();
    })
    .catch((error) => {
      alert('Erro ao fazer login: ' + error.message);
    });
}

// Função para fazer logout
function logoutUsuario() {
  signOut(auth).then(() => {
    alert('Usuário deslogado com sucesso!');
    limparCampos();
  }).catch((error) => {
    alert('Erro ao fazer logout: ' + error.message);
  });
}

// Função para salvar evento
function salvarEvento() {
  const titulo = document.getElementById('titulo').value;
  const data = document.getElementById('data').value;
  const horaTermino = document.getElementById('horaTermino').value;
  const local = document.getElementById('local').value;
  const descricao = document.getElementById('descricao').value;
  const senha = document.getElementById('senha').value;

  // Verifica se todos os campos estão preenchidos
  if (!titulo || !data || !horaTermino || !local || !descricao || !senha) {
    alert('Todos os campos devem ser preenchidos!');
    return;
  }

  // Verifica se a data e hora são válidas e no futuro
  const dataEvento = new Date(`${data}T${horaTermino}`);
  if (isNaN(dataEvento.getTime()) || dataEvento < new Date()) {
    alert('Insira uma data e hora válidas no futuro.');
    return;
  }

  const eventosRef = ref(db, 'events');
  const newEventRef = push(eventosRef);

  // Salva os dados no Firebase
  set(newEventRef, {
    title: titulo,
    date: data,
    timeEnd: horaTermino,
    location: local,
    description: descricao,
    password: senha
  }).then(() => {
    alert('Evento salvo com sucesso!');
    limparCampos();
    mostrarEventos(); // Atualiza a lista de eventos
  }).catch((error) => {
    alert('Erro ao salvar evento: ' + error.message);
  });
}

// Limpa os campos do formulário
function limparCampos() {
  document.getElementById('titulo').value = '';
  document.getElementById('data').value = '';
  document.getElementById('horaTermino').value = '';
  document.getElementById('local').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('senha').value = '';
}

// Mostra todos os eventos salvos
function mostrarEventos() {
  const eventosRef = ref(db, 'events');

  get(eventosRef).then((snapshot) => {
    const listaEventos = document.getElementById('listaEventos');
    listaEventos.innerHTML = '';

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const evento = childSnapshot.val();
        const eventoKey = childSnapshot.key;

        const divEvento = document.createElement('div');
        divEvento.classList.add('evento');
        divEvento.innerHTML = `
          <h3>${evento.title}</h3>
          <p><strong>Data:</strong> ${evento.date}</p>
          <p><strong>Hora de término:</strong> ${evento.timeEnd}</p>
          <p><strong>Local:</strong> ${evento.location}</p>
          <p><strong>Descrição:</strong> ${evento.description}</p>
          <button onclick="editarEvento('${eventoKey}')">Editar</button>
          <button onclick="excluirEvento('${eventoKey}')">Excluir</button>
        `;

        listaEventos.appendChild(divEvento);
      });

      listaEventos.style.display = 'block';
    } else {
      listaEventos.innerHTML = '<p style="color: gray; font-style: italic;">Nenhum evento encontrado.</p>';
    }
  }).catch((error) => {
    alert('Erro ao carregar eventos: ' + error.message);
  });
}

// Função para abrir o modal de edição de evento
function abrirModalEdicao(evento, eventoKey) {
  document.getElementById('editarTitulo').value = evento.title;
  document.getElementById('editarData').value = evento.date;
  document.getElementById('editarHoraTermino').value = evento.timeEnd;
  document.getElementById('editarLocal').value = evento.location;
  document.getElementById('editarDescricao').value = evento.description;
  document.getElementById('modalEditar').style.display = 'flex';

  // Passa a chave do evento para a função de salvar edição
  document.getElementById('btnSalvarEdicao').onclick = () => salvarEdicao(eventoKey);
}

// Função para fechar o modal
function fecharModal() {
  document.getElementById('modalEditar').style.display = 'none';
}

// Função para salvar a edição do evento
function salvarEdicao(eventoKey) {
  const titulo = document.getElementById('editarTitulo').value;
  const data = document.getElementById('editarData').value;
  const horaTermino = document.getElementById('editarHoraTermino').value;
  const local = document.getElementById('editarLocal').value;
  const descricao = document.getElementById('editarDescricao').value;

  const eventoRef = ref(db, 'events/' + eventoKey);

  update(eventoRef, {
    title: titulo,
    date: data,
    timeEnd: horaTermino,
    location: local,
    description: descricao
  }).then(() => {
    alert('Evento atualizado com sucesso!');
    mostrarEventos();
    fecharModal();
  }).catch((error) => {
    alert('Erro ao atualizar evento: ' + error.message);
  });
}

// Função para editar evento
window.editarEvento = function (id) {
  const eventoRef = ref(db, 'events/' + id);

  get(eventoRef).then((snapshot) => {
    if (!snapshot.exists()) {
      alert('Evento não encontrado.');
      return;
    }

    const evento = snapshot.val();
    abrirModalEdicao(evento, id);
  });
};

// Função para excluir evento
window.excluirEvento = function (id) {
  const senha = prompt('Digite a senha para excluir este evento:');
  if (!senha) {
    alert('Senha não fornecida!');
    return;
  }

  const eventoRef = ref(db, 'events/' + id);

  get(eventoRef).then((snapshot) => {
    if (!snapshot.exists()) {
      alert('Evento não encontrado.');
      return;
    }

    const evento = snapshot.val();

    if (senha === evento.password) {
      if (confirm('Tem certeza que deseja excluir este evento?')) {
        remove(eventoRef).then(() => {
          alert('Evento excluído com sucesso!');
          mostrarEventos();
        }).catch((error) => {
          alert('Erro ao excluir evento: ' + error.message);
        });
      }
    } else {
      alert('Senha incorreta!');
    }
  });
};

// Funções de login e logout
document.getElementById('btnLogin').addEventListener('click', () => {
  const email = document.getElementById('emailLogin').value;
  const senha = document.getElementById('senhaLogin').value;
  loginUsuario(email, senha);
});

document.getElementById('btnLogout').addEventListener('click', logoutUsuario);

// Função de registro
document.getElementById('btnCadastrar').addEventListener('click', () => {
  const email = document.getElementById('cadastro-email').value;
  const senha = document.getElementById('cadastro-senha').value;
  registrarUsuario(email, senha);
});

// Evento para carregar os eventos ao carregar a página
document.addEventListener('DOMContentLoaded', mostrarEventos);
