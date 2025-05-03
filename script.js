// Importa o SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, push, get, update, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Editar evento (com verificação da senha no banco)
window.editarEvento = function (id) {
  const senha = prompt('Digite a senha para editar este evento:');
  const eventoRef = ref(db, 'events/' + id);

  get(eventoRef).then((snapshot) => {
    if (!snapshot.exists()) {
      alert('Evento não encontrado.');
      return;
    }

    const evento = snapshot.val();

    if (senha === evento.password) {
      const novoTitulo = prompt('Novo título:', evento.title);
      const novaData = prompt('Nova data (aaaa-mm-dd):', evento.date);
      const novoHorario = prompt('Novo horário de término:', evento.timeEnd);
      const novoLocal = prompt('Novo local:', evento.location);
      const novaDescricao = prompt('Nova descrição:', evento.description);

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
  });
};

// Excluir evento (com verificação da senha no banco)
window.excluirEvento = function (id) {
  const senha = prompt('Digite a senha para excluir este evento:');
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

// Botões
document.getElementById('btnSalvar').addEventListener('click', salvarEvento);
document.getElementById('btnMostrar').addEventListener('click', mostrarEventos);
