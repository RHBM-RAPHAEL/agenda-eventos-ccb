// Importa o SDK do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, push, get, update, remove } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

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

// Funções de registro e login de usuário
function registrarUsuario(email, senha) {
  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert('Usuário registrado com sucesso!');
      mostrarLogin();
    })
    .catch((error) => {
      alert('Erro ao registrar usuário: ' + error.message);
    });
}

function loginUsuario(email, senha) {
  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert('Usuário logado com sucesso!');
      mostrarEventos();
    })
    .catch((error) => {
      alert('Erro ao fazer login: ' + error.message);
    });
}

function logoutUsuario() {
  signOut(auth).then(() => {
    alert('Usuário deslogado com sucesso!');
    mostrarLogin();
  }).catch((error) => {
    alert('Erro ao fazer logout: ' + error.message);
  });
}

// Funções de manipulação de eventos
function salvarEvento() {
  const horaInicio = document.getElementById('horaInicio').value;
  const titulo = document.getElementById('titulo').value;
  const data = document.getElementById('data').value;
  const horaTermino = document.getElementById('horaTermino').value;
  const local = document.getElementById('local').value;
  const descricao = document.getElementById('descricao').value;
  const senha = document.getElementById('senha').value;

  // Validação dos campos
  if (!titulo || !data || !horaInicio || !horaTermino || !local || !descricao || !senha) {
    alert('Todos os campos devem ser preenchidos!');
    return;
  }

  const horaIni = new Date(`${data}T${horaInicio}`);
  const horaFim = new Date(`${data}T${horaTermino}`);

  // Validações de hora
  if (isNaN(horaIni.getTime()) || isNaN(horaFim.getTime())) {
    alert('Insira uma data e hora válidas.');
    return;
  }

  if (horaFim <= horaIni) {
    alert('A hora de término deve ser depois da hora de início.');
    return;
  }

  // Verifica se a data é no futuro
  if (horaFim <= new Date()) {
    alert('A data do evento deve ser no futuro.');
    return;
  }

  const eventosRef = ref(db, 'events');
  const newEventRef = push(eventosRef);

  set(newEventRef, {
    title: titulo,
    date: data,
    timeStart: horaInicio,
    timeEnd: horaTermino,
    location: local,
    description: descricao,
    password: senha,
    emailCriador: auth.currentUser.email  // Adicionando o email do criador do evento
  }).then(() => {
    alert('Evento salvo com sucesso!');
    limparCampos();
    mostrarEventos();
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

// Exibe os eventos na interface
function mostrarEventos() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('cadastro-container').style.display = 'none';
  document.getElementById('evento-container').style.display = 'block';

  const eventosRef = ref(db, 'events');
  
  get(eventosRef).then((snapshot) => {
    const listaEventos = document.getElementById('listaEventos');
    listaEventos.innerHTML = '';

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const evento = childSnapshot.val();
        const eventoKey = childSnapshot.key;

        const dataEventoTermino = new Date(`${evento.date}T${evento.timeEnd}`);
        const agora = new Date();

        // Exclui evento se já passou
        if (dataEventoTermino <= agora) {
          excluirEventoAutomaticamente(eventoKey);
          return;
        }

        // Verifica se o evento é do usuário logado
        if (evento.emailCriador === auth.currentUser.email) {
          const divEvento = document.createElement('div');
          divEvento.classList.add('evento');
          divEvento.innerHTML = `
            <h3>${evento.title}</h3>
            <p><strong>Data:</strong> ${evento.date}</p>
            <p><strong>Hora de início:</strong> ${evento.timeStart}</p>
            <p><strong>Hora de término:</strong> ${evento.timeEnd}</p>
            <p><strong>Local:</strong> ${evento.location}</p>
            <p><strong>Descrição:</strong> ${evento.description}</p>
            <button class="btnEditar" data-id="${eventoKey}">Editar</button>
            <button class="btnExcluir" data-id="${eventoKey}">Excluir</button>
          `;
          listaEventos.appendChild(divEvento);
        }
      });

      // Event listeners para editar e excluir
      document.querySelectorAll('.btnEditar').forEach((button) => {
        button.addEventListener('click', (event) => {
          const id = event.target.getAttribute('data-id');
          editarEvento(id);
        });
      });

      document.querySelectorAll('.btnExcluir').forEach((button) => {
        button.addEventListener('click', (event) => {
          const id = event.target.getAttribute('data-id');
          excluirEvento(id);
        });
      });
    } else {
      listaEventos.innerHTML = '<p style="color: gray; font-style: italic;">Nenhum evento encontrado.</p>';
    }
  }).catch((error) => {
    alert('Erro ao carregar eventos: ' + error.message);
  });
}

function excluirEventoAutomaticamente(id) {
  const eventoRef = ref(db, 'events/' + id);
  remove(eventoRef)
    .then(() => {
      console.log('Evento expirado removido automaticamente.');
    })
    .catch((error) => {
      console.error('Erro ao remover evento expirado:', error.message);
    });
}

// Exclui um evento
function excluirEvento(id) {
  const eventoRef = ref(db, 'events/' + id);

  const senha = prompt('Digite a senha para excluir este evento:');
  if (!senha) {
    alert('Senha não fornecida!');
    return;
  }

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
}

// Edita um evento
function editarEvento(id) {
  const eventoRef = ref(db, 'events/' + id);

  get(eventoRef).then((snapshot) => {
    if (!snapshot.exists()) {
      alert('Evento não encontrado.');
      return;
    }

    const evento = snapshot.val();
    const senhaDigitada = prompt('Digite a senha para editar este evento:');
    if (!senhaDigitada) {
      alert('Senha não fornecida!');
      return;
    }

    if (senhaDigitada !== evento.password) {
      alert('Senha incorreta!');
      return;
    }

    // Preenche os campos com os dados do evento
    document.getElementById('titulo').value = evento.title;
    document.getElementById('data');
