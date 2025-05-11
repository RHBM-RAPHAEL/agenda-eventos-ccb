
// Importa o SDK do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, push, get, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Registrar usuário
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

// Login
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

// Logout
function logoutUsuario() {
  signOut(auth)
    .then(() => {
      alert('Usuário deslogado com sucesso!');
      mostrarLogin();
    })
    .catch((error) => {
      alert('Erro ao fazer logout: ' + error.message);
    });
}

function salvarEvento() {
  const user = auth.currentUser;
  if (!user) return alert('Usuário não autenticado!');

  const evento = {
    title: document.getElementById('titulo').value,
    date: document.getElementById('data').value,
    timeStart: document.getElementById('horaInicio').value,
    timeEnd: document.getElementById('horaTermino').value,
    location: document.getElementById('local').value,
    description: document.getElementById('descricao').value,
    password: document.getElementById('senha').value,
    userId: user.uid
  };

  for (let campo in evento) {
    if (!evento[campo]) return alert('Preencha todos os campos.');
  }

  const inicio = new Date(`${evento.date}T${evento.timeStart}`);
  const fim = new Date(`${evento.date}T${evento.timeEnd}`);
  if (fim <= inicio || fim <= new Date()) {
    return alert('Horários inválidos ou evento no passado.');
  }

  push(ref(db, 'events'), evento).then(() => {
    alert('Evento salvo com sucesso!');
    limparCampos();
    mostrarEventos();
  }).catch(err => alert('Erro ao salvar: ' + err.message));
}

function limparCampos() {
  ['titulo', 'data', 'horaInicio', 'horaTermino', 'local', 'descricao', 'senha'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Garante que o botão de salvar novo evento funcione corretamente após uma edição
  const btn = document.getElementById('btnSalvar');
  const novoBtn = btn.cloneNode(true);
  btn.replaceWith(novoBtn);
  novoBtn.addEventListener('click', salvarEvento);
}

function mostrarEventos() {
  document.getElementById('evento-container').style.display = 'block';
  document.getElementById('secaoEventos').style.display = 'block';
  document.getElementById('secaoCriarEvento').style.display = 'none';
  document.getElementById('secaoMeusEventos').style.display = 'none';

  const eventosRef = ref(db, 'events');
  get(eventosRef).then(snapshot => {
    const lista = document.getElementById('listaEventos');
    lista.innerHTML = '';
    snapshot.forEach(child => {
      const evento = child.val();
      const key = child.key;
      const fim = new Date(`${evento.date}T${evento.timeEnd}`);
      if (fim <= new Date()) return excluirEventoAutomaticamente(key);
      const div = document.createElement('div');
      div.className = 'evento';
      div.innerHTML = `
        <h3>${evento.title}</h3>
        <p><strong>Data:</strong> ${evento.date}</p>
        <p><strong>Hora de início:</strong> ${evento.timeStart}</p>
        <p><strong>Hora de término:</strong> ${evento.timeEnd}</p>
        <p><strong>Local:</strong> ${evento.location}</p>
        <p><strong>Descrição:</strong> ${evento.description}</p>`;
      lista.appendChild(div);
    });
  });
}

function carregarMeusEventos() {
  const user = auth.currentUser;
  if (!user) return alert("Você precisa estar logado.");

  document.getElementById('secaoEventos').style.display = 'none';
  document.getElementById('secaoCriarEvento').style.display = 'none';
  document.getElementById('secaoMeusEventos').style.display = 'block';

  const lista = document.getElementById('listaMeusEventos');
  lista.innerHTML = '';
  onValue(ref(db, 'events'), snapshot => {
    lista.innerHTML = '';
    snapshot.forEach(child => {
      const evento = child.val();
      const eventoKey = child.key;
      if (evento.userId === user.uid) {
        const div = document.createElement('div');
        div.className = 'evento';
        div.innerHTML = `
          <h3>${evento.title}</h3>
          <p><strong>Data:</strong> ${evento.date}</p>
          <p><strong>Hora de início:</strong> ${evento.timeStart}</p>
          <p><strong>Hora de término:</strong> ${evento.timeEnd}</p>
          <p><strong>Local:</strong> ${evento.location}</p>
          <p><strong>Descrição:</strong> ${evento.description}</p>
          <button class="btnEditar" data-id="${eventoKey}">Editar</button>
          <button class="btnExcluir" data-id="${eventoKey}">Excluir</button>`;
        lista.appendChild(div);
      }
    });

    document.querySelectorAll('#listaMeusEventos .btnEditar').forEach(btn => {
      btn.onclick = () => editarEvento(btn.dataset.id);
    });
    document.querySelectorAll('#listaMeusEventos .btnExcluir').forEach(btn => {
      btn.onclick = () => excluirEvento(btn.dataset.id);
    });
  });
}

function excluirEventoAutomaticamente(id) {
  remove(ref(db, 'events/' + id));
}

function excluirEvento(id) {
  const senha = prompt('Digite a senha para excluir este evento:');
  const eventoRef = ref(db, 'events/' + id);
  get(eventoRef).then(snapshot => {
    const ev = snapshot.val();
    if (senha === ev.password) remove(eventoRef);
    else alert('Senha incorreta.');
  });
}

function editarEvento(id) {
  const refEvento = ref(db, 'events/' + id);
  get(refEvento).then(snapshot => {
    const ev = snapshot.val();
    const senha = prompt('Digite a senha para editar:');
    if (senha !== ev.password) return alert('Senha incorreta.');
    document.getElementById('titulo').value = ev.title;
    document.getElementById('data').value = ev.date;
    document.getElementById('horaInicio').value = ev.timeStart;
    document.getElementById('horaTermino').value = ev.timeEnd;
    document.getElementById('local').value = ev.location;
    document.getElementById('descricao').value = ev.description;
    document.getElementById('senha').value = ev.password;

    const btn = document.getElementById('btnSalvar');
    const novo = btn.cloneNode(true);
    btn.replaceWith(novo);
    novo.addEventListener('click', () => salvarEdicao(id));
  });
}

function salvarEdicao(id) {
  const eventoRef = ref(db, 'events/' + id);
  update(eventoRef, {
    title: document.getElementById('titulo').value,
    date: document.getElementById('data').value,
    timeStart: document.getElementById('horaInicio').value,
    timeEnd: document.getElementById('horaTermino').value,
    location: document.getElementById('local').value,
    description: document.getElementById('descricao').value
  }).then(() => {
    alert('Evento atualizado!');
    limparCampos();
    mostrarEventos();
  });
}

function mostrarCadastro() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('cadastro-container').style.display = 'block';
  document.getElementById('evento-container').style.display = 'none';
}

function mostrarLogin() {
  document.getElementById('login-container').style.display = 'block';
  document.getElementById('cadastro-container').style.display = 'none';
  document.getElementById('evento-container').style.display = 'none';
}

// Tudo dentro de DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  [
    { eyeId: 'eyeLogin', inputId: 'senhaLogin' },
    { eyeId: 'eyeCadastro', inputId: 'senhaCadastro' },
    { eyeId: 'eyeEvento', inputId: 'senha' }
  ].forEach(({ eyeId, inputId }) => {
    const icon = document.getElementById(eyeId);
    const input = document.getElementById(inputId);
    if (icon && input) {
      icon.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.textContent = input.type === 'password' ? '👁️' : '🙈';
      });
    }
  });

  onAuthStateChanged(auth, user => {
    if (user) {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('cadastro-container').style.display = 'none';
      document.getElementById('evento-container').style.display = 'block';
      mostrarEventos();
    } else {
      document.getElementById('login-container').style.display = 'block';
      document.getElementById('cadastro-container').style.display = 'none';
      document.getElementById('evento-container').style.display = 'none';
    }
  });

  // Botões
  document.getElementById('btnEntrar').addEventListener('click', () => {
    loginUsuario(
      document.getElementById('emailLogin').value,
      document.getElementById('senhaLogin').value
    );
  });

  document.getElementById('btnCadastrar').addEventListener('click', () => {
    registrarUsuario(
      document.getElementById('emailCadastro').value,
      document.getElementById('senhaCadastro').value
    );
  });

  document.getElementById('btnLogout').addEventListener('click', logoutUsuario);
  document.getElementById('btnSalvar').addEventListener('click', salvarEvento);
  document.getElementById('btnMostrarMeusEventos').addEventListener('click', carregarMeusEventos);
  document.getElementById('btnMostrarCriarEvento').addEventListener('click', () => {
    document.getElementById('secaoEventos').style.display = 'none';
    document.getElementById('secaoMeusEventos').style.display = 'none';
    document.getElementById('secaoCriarEvento').style.display = 'block';
  });
  document.getElementById('btnMostrarEventos').addEventListener('click', mostrarEventos);
  document.getElementById('mostrarCadastro').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarCadastro();
  });
  document.getElementById('mostrarLogin').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarLogin();
  });
}); // ✅ ESTA é a chave que fecha o DOMContentLoaded
