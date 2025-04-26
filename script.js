// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  databaseURL: "https://agenda-eventos-ccb-default-rtdb.firebaseio.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referência do Banco de Dados
const database = firebase.database();
const eventosRef = database.ref('eventos');

// Função para salvar evento
function salvarEvento() {
  const nomeEvento = document.getElementById('nomeEvento').value;
  const descricaoEvento = document.getElementById('descricaoEvento').value;

  if (nomeEvento.trim() === '' || descricaoEvento.trim() === '') {
    alert('Preencha todos os campos!');
    return;
  }

  const novoEvento = {
    nome: nomeEvento,
    descricao: descricaoEvento
  };

  eventosRef.push(novoEvento)
    .then(() => {
      alert('Evento salvo com sucesso!');
      document.getElementById('nomeEvento').value = '';
      document.getElementById('descricaoEvento').value = '';
    })
    .catch(error => {
      alert('Erro ao salvar evento: ' + error.message);
    });
}

// Função para mostrar eventos
function mostrarEventos() {
  eventosRef.on('value', (snapshot) => {
    const listaEventos = document.getElementById('listaEventos');
    listaEventos.innerHTML = '';

    snapshot.forEach((childSnapshot) => {
      const evento = childSnapshot.val();
      const eventoId = childSnapshot.key;

      const div = document.createElement('div');
      div.className = 'evento';

      const titulo = document.createElement('h3');
      titulo.innerText = evento.nome;

      const descricao = document.createElement('p');
      descricao.innerText = evento.descricao;

      const botaoEditar = document.createElement('button');
      botaoEditar.innerText = 'Editar';
      botaoEditar.onclick = () => editarEvento(eventoId, evento);

      const botaoExcluir = document.createElement('button');
      botaoExcluir.innerText = 'Excluir';
      botaoExcluir.onclick = () => excluirEvento(eventoId);

      div.appendChild(titulo);
      div.appendChild(descricao);
      div.appendChild(botaoEditar);
      div.appendChild(botaoExcluir);

      listaEventos.appendChild(div);
    });
  });
}

// Função para excluir evento
function excluirEvento(id) {
  if (confirm('Deseja excluir este evento?')) {
    eventosRef.child(id).remove()
      .then(() => {
        alert('Evento excluído com sucesso!');
      })
      .catch(error => {
        alert('Erro ao excluir evento: ' + error.message);
      });
  }
}

// Função para editar evento
function editarEvento(id, eventoAtual) {
  const novoNome = prompt('Novo nome do evento:', eventoAtual.nome);
  const novaDescricao = prompt('Nova descrição do evento:', eventoAtual.descricao);

  if (novoNome && novaDescricao) {
    eventosRef.child(id).update({
      nome: novoNome,
      descricao: novaDescricao
    })
    .then(() => {
      alert('Evento atualizado com sucesso!');
    })
    .catch(error => {
      alert('Erro ao atualizar evento: ' + error.message);
    });
  }
}

// Iniciar a exibição dos eventos
mostrarEventos();
