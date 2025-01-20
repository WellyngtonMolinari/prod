import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCX-yX0pbB1t3sWGleDRw-2YcMTzwX-rqI",
    authDomain: "controle-producao-861ea.firebaseapp.com",
    databaseURL: "https://controle-producao-861ea-default-rtdb.firebaseio.com",
    projectId: "controle-producao-861ea",
    storageBucket: "controle-producao-861ea.firebasestorage.app",
    messagingSenderId: "329813346557",
    appId: "1:329813346557:web:4f7d33dc80cd9bb12c1694"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const machinesGrid = document.getElementById("machines-grid");

// Gerar layout de máquinas
definirLayoutMaquinas(15);

function definirLayoutMaquinas(numeroDeMaquinas) {
    for (let i = 1; i <= numeroDeMaquinas; i++) {
        const machineElement = document.createElement("div");
        machineElement.classList.add("machine");
        machineElement.innerText = `Shima ${i}`;
        machineElement.addEventListener("click", () => abrirModal(i)); // Apenas abre o modal
        machinesGrid.appendChild(machineElement);
    }
}

function abrirModal(maquinaId) {
    const modal = document.getElementById("modal");
    const modalDetails = document.getElementById("modal-details");
    const closeBtn = document.querySelector(".close");

    const machineRef = ref(database, `machines/${maquinaId}`);
    get(machineRef).then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            modalDetails.innerHTML = `
                <p><strong>Máquina:</strong> Shima ${maquinaId}</p>
                <p><strong>Modelo:</strong> ${data.modelo}</p>
                <p><strong>Quantidade:</strong> ${data.quantidade}</p>
                <p><strong>Cor do Fio:</strong> ${data.corFio}</p>
                <p><strong>Tipo do Fio:</strong> ${data.tipoFio}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <button id="novo-pedido">Adicionar Novo Pedido</button>
            `;
        } else {
            modalDetails.innerHTML = `<p>Nenhum pedido em andamento para Shima ${maquinaId}.</p>
                <button id="novo-pedido">Adicionar Pedido</button>`;
        }

        // Abrir modal
        modal.style.display = "block";

        // Fechar modal
        closeBtn.onclick = () => (modal.style.display = "none");

        // Adicionar novo pedido
        document.getElementById("novo-pedido").addEventListener("click", () => {
            modal.style.display = "none";
            criarNovoPedido(maquinaId);
        });
    });
}

function criarNovoPedido(maquinaId) {
    const quantidade = prompt("Digite a quantidade de blusas a produzir:");
    const modelo = prompt("Digite o modelo:");
    const corFio = prompt("Digite a cor do fio:");
    const tipoFio = prompt("Digite o tipo do fio (poliéster, modal):");

    if (quantidade && modelo && corFio && tipoFio) {
        salvarDados(maquinaId, quantidade, modelo, corFio, tipoFio);
    } else {
        alert("Por favor, preencha todos os dados corretamente!");
    }
}

function salvarDados(maquinaId, quantidade, modelo, corFio, tipoFio) {
    const machineRef = ref(database, `machines/${maquinaId}`);
    set(machineRef, {
        quantidade,
        modelo,
        corFio,
        tipoFio,
        status: "Em produção"
    }).then(() => {
        alert(`Produção iniciada na Shima ${maquinaId}`);
    }).catch((error) => {
        console.error("Erro ao salvar os dados: ", error);
    });
}

// Atualizar em tempo real
displayRealtimeUpdates();

function displayRealtimeUpdates() {
    const machinesRef = ref(database, "machines");
    onValue(machinesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            atualizarLayoutMaquinas(data);
        }
    });
}

function atualizarLayoutMaquinas(dados) {
    const machineElements = machinesGrid.children;
    for (let i = 0; i < machineElements.length; i++) {
        const machineId = i + 1;
        const machineData = dados[machineId];
        const machineElement = machineElements[i];

        if (machineData && machineData.pedidos) {
            const pedidos = Object.values(machineData.pedidos);
            machineElement.style.backgroundColor = "#27ae60";
            machineElement.innerText = `Shima ${machineId}\n${pedidos.length} pedido(s)`;
        } else {
            machineElement.style.backgroundColor = "#3498db";
            machineElement.innerText = `Shima ${machineId}`;
        }
    }
}
