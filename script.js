// Configuração do Firebase
const firebaseConfig = {
    apiKey: "sua_api_key",
    authDomain: "seu_auth_domain",
    projectId: "seu_project_id",
    storageBucket: "seu_storage_bucket",
    messagingSenderId: "seu_messaging_sender_id",
    appId: "seu_app_id"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

const eventoForm = document.getElementById('eventoForm');
const tituloInput = document.getElementById('titulo');
const dataInput = document.getElementById('data');
const horaInput = document.getElementById('hora');
const localInput = document.getElementById('local');
const descricaoInput = document.getElementById('descricao');
const senhaInput = document.getElementById('senha');
const eventosDiv = document.getElementById('eventos');
const salvarEventoButton = document.getElementById('salvarEvento');
const mostrarEventosButton = document.getElementById('mostrarEventos');

// Função para salvar evento no Firebase
function salvarEvento() {
    const titulo = tituloInput.value;
    const data = dataInput.value;
    const hora = horaInput.value;
    const local = localInput.value;
    const descricao = descricaoInput.value;
    const senha = senhaInput.value;

    // Validação dos campos
    if (!titulo || !data || !hora || !local || !descricao || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Salva o evento no Firestore
    db.collection("eventos").add({
        titulo: titulo,
        data: data,
        hora: hora,
        local: local,
        descricao: descricao,
        senha: senha
    })
    .then(() => {
        alert('Evento salvo com sucesso!');
        eventoForm.reset();
    })
    .catch((error) => {
        alert('Erro ao salvar evento: ' + error);
    });
}

// Função para mostrar eventos do Firebase
function mostrarEventos() {
    db.collection("eventos").get().then((querySnapshot) => {
        eventosDiv.innerHTML = '';  // Limpa os eventos antes de mostrar os novos
        querySnapshot.forEach((doc) => {
            const evento = doc.data();
            const eventoDiv = document.createElement('div');
            eventoDiv.classList.add('evento');
            eventoDiv.innerHTML = `
                <h3>${evento.titulo}</h3>
                <p><strong>Data:</strong> ${evento.data}</p>
                <p><strong>Hora de Término:</strong> ${evento.hora}</p>
                <p><strong>Local:</strong> ${evento.local}</p>
                <p><strong>Descrição:</strong> ${evento.descricao}</p>
                <button class="editarEvento" data-id="${doc.id}">Editar</button>
                <button class="excluirEvento" data-id="${doc.id}">Excluir</button>
            `;
            eventosDiv.appendChild(eventoDiv);
        });
    });
}

// Função para excluir evento
function excluirEvento(eventoId) {
    db.collection("eventos").doc(eventoId).delete()
    .then(() => {
        alert('Evento excluído com sucesso!');
        mostrarEventos();  // Atualiza a lista de eventos
    })
    .catch((error) => {
        alert('Erro ao excluir evento: ' + error);
    });
}

// Função para editar evento
function editarEvento(eventoId) {
    const novaSenha = prompt('Digite a senha para editar o evento:');
    if (novaSenha) {
        db.collection("eventos").doc(eventoId).get().then((doc) => {
            if (doc.exists && doc.data().senha === novaSenha) {
                // Aqui você pode implementar a lógica para editar o evento
                alert('Senha correta! Agora edite o evento.');
                // Exemplo: abrir os campos para editar o evento
            } else {
                alert('Senha incorreta.');
            }
        });
    }
}

// Adiciona ouvintes de eventos para os botões
salvarEventoButton.addEventListener('click', salvarEvento);
mostrarEventosButton.addEventListener('click', mostrarEventos);

// Delegação de eventos para os botões de editar e excluir
eventosDiv.addEventListener('click', (event) => {
    if (event.target.classList.contains('excluirEvento')) {
        const eventoId = event.target.dataset.id;
        excluirEvento(eventoId);
    } else if (event.target.classList.contains('editarEvento')) {
        const eventoId = event.target.dataset.id;
        editarEvento(eventoId);
    }
});
