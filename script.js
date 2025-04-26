// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto-id.firebaseapp.com",
  databaseURL: "https://agenda-eventos-ccb-default-rtdb.firebaseio.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto-id.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Seleciona elementos do HTML
const eventoForm = document.getElementById('eventoForm');
const nomeInput = document.getElementById('nome');
const descricaoInput = document.getElementById('descricao');
const listaEventos = document.getElementById('listaEventos');
const salvarButton = document.getElementById('salvar');

// Função para salvar evento no Firebase
function salvarEvento(nome, descricao) {
  const newEventoRef = db.ref('eventos').push();
  newEventoRef.set({
    nome: nome,
    descricao: descricao,
  }).then(() => {
    // Limpa os campos do formulário
    nomeInput.value = '';
    descricaoInput.value = '';
    mostrarEventos();
  });
}

// Função para editar evento
function editarEvento(id, novoNome, novaDescricao) {
  const eventoRef = db.ref('eventos').child(id);
  eventoRef.update({
    nome: novoNome,
    descricao: novaDescricao,
  }).then(() => {
    mostrarEventos();
  });
}

// Função para excluir evento
function excluirEvento(id) {
  const eventoRef = db.ref('eventos').child(id);
  eventoRef.remove().then(() => {
    mostrarEventos();
  });
}

// Função para exibir todos os eventos
function mostrarEventos() {
  listaEventos.innerHTML = ''; // Limpa a lista atual de eventos
  db.ref('eventos').once('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const evento = childSnapshot.val();
      const id = childSnapshot.key;
      
      const eventoDiv = document.createElement('div');
      eventoDiv.classList.add('evento');
      eventoDiv.setAttribute('data-id', id);

      eventoDiv.innerHTML = `
        <h3>${evento.nome}</h3>
        <p>${evento.descricao}</p>
        <button class="editar">Editar</button>
        <button class="excluir">Excluir</button>
      `;
      
      // Adicionar evento de edição
      eventoDiv.querySelector('.editar').addEventListener('click', () => {
        nomeInput.value = evento.nome;
        descricaoInput.value = evento.descricao;
        salvarButton.textContent = 'Salvar Alterações';
        salvarButton.onclick = () => {
          editarEvento(id, nomeInput.value, descricaoInput.value);
          salvarButton.textContent = 'Salvar Evento'; // Restaura o texto do botão
        };
      });

      // Adicionar evento de exclusão
      eventoDiv.querySelector('.excluir').addEventListener('click', () => {
        excluirEvento(id);
      });

      listaEventos.appendChild(eventoDiv);
    });
  });
}

// Chama a função para mostrar eventos quando a página carregar
mostrarEventos();

// Adicionar evento de envio do formulário
eventoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  salvarEvento(nomeInput.value, descricaoInput.value);
});
