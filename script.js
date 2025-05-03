// Importa o SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, push, get, update, remove, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "sua-apiKey",
  authDomain: "seu-authDomain",
  databaseURL: "https://agenda-eventos-ccb-default-rtdb.firebaseio.com",
  projectId: "seu-projectId",
  storageBucket: "seu-storageBucket",
  messagingSenderId: "seu-messagingSenderId",
  appId: "seu-appId"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Função para salvar evento no Firebase
function salvarEvento() {
  const titulo = document.getElementById('titulo').value;
  const data = document.getElementById('data').value;
  const horaTermino = document.getElementById('horaTermino').value;
  const local = document.getElementById('local').value;
  const descricao = document.getElementById('descricao').value;
  const senha = document.getElementById('senha').value;

  if (!titulo || !data || !horaTermino || !local || !descricao || !senha) {
    alert('Todos os campos devem ser preenchidos!');
    return;
  }

  const eventosRef = ref(db, 'events');
  const newEventRef = push(eventosRef);

  set(newEventRef, {
    title: titulo,
    date: data,
    timeEnd: horaTermino,
    location: local,
    description: descricao,
    password: senha,
  }).then(() => {
    alert('Evento salvo com sucesso!');
    limparCampos();
  }).catch((error) => {
    alert('Erro ao salvar evento: ' + error.message);
  });
}

// Função para limpar campos após salvar
function limparCampos() {
  document.getElementById('titulo').value = '';
  document.getElementById('data').value = '';
  document.getElementById('horaTermino').value = '';
  document.getElementById('local').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('senha').value = '';
}

// Função para mostrar eventos
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
        divEvento.innerHTML = 
          <h3>${evento.title}</h3>
          <p><strong>Data:</strong> ${evento.date}</p>
          <p><strong>Hora de término:</strong> ${evento.timeEnd}</p>
          <p><strong>Local:</strong> ${evento.location}</p>
          <p><strong>Descrição:</strong> ${evento.description}</p>
          <button onclick="editarEvento('${eventoKey}', '${evento.password}')">Editar</button>
          <button onclick="excluirEvento('${eventoKey}', '${evento.password}')">Excluir</button>
        ;

        listaEventos.appendChild(divEvento);
      });
      listaEventos.style.display = 'block';
    } else {
      listaEventos.innerHTML = '<p>Nenhum evento encontrado.</p>';
    }
  }).catch((error) => {
    alert('Erro ao carregar eventos: ' + error.message);
  });
}

// Função para editar evento
window.editarEvento = function (id, senhaCorreta) {
  const senha = prompt('Digite a senha para editar este evento:');
  if (senha === senhaCorreta) {
    const novoTitulo = prompt('Novo título:');
    const novaData = prompt('Nova data (yyyy-mm-dd):');
    const novoHorario = prompt('Novo horário de término:');
    const novoLocal = prompt('Novo local:');
    const novaDescricao = prompt('Nova descrição:');

    const eventoRef = ref(db, 'events/' + id);
    update(eventoRef, {
      title: novoTitulo,
      date: novaData,
      timeEnd: novoHorario,
      location: novoLocal,
      description: novaDescricao
    }).then(() => {
      alert('Evento atualizado com sucesso!');
      mostrarEventos();
    }).catch((error) => {
      alert('Erro ao atualizar evento: ' + error.message);
    });
  } else {
    alert('Senha incorreta!');
  }
}

// Função para excluir evento
window.excluirEvento = function (id, senhaCorreta) {
  const senha = prompt('Digite a senha para excluir este evento:');
  if (senha === senhaCorreta) {
    const eventoRef = ref(db, 'events/' + id);
    remove(eventoRef).then(() => {
      alert('Evento excluído com sucesso!');
      mostrarEventos();
    }).catch((error) => {
      alert('Erro ao excluir evento: ' + error.message);
    });
  } else {
    alert('Senha incorreta!');
  }
}

// Ações dos botões
document.getElementById('btnSalvar').addEventListener('click', salvarEvento);
document.getElementById('btnMostrar').addEventListener('click', mostrarEventos);
