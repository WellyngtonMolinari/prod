import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove, push } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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
        machineElement.addEventListener("click", () => abrirModal(i));
        machinesGrid.appendChild(machineElement);
    }
}

function abrirModal(maquinaId) {
    const modal = document.getElementById("modal");
    const modalDetails = document.getElementById("modal-details");
    const closeBtn = document.querySelector(".close");

    const machineRef = ref(database, `machines/${maquinaId}/pedidos`);
    get(machineRef).then((snapshot) => {
        const pedidos = snapshot.val();
        let html = `<p><strong>Máquina:</strong> Shima ${maquinaId}</p>`;
        if (pedidos) {
            html += `<ul>`;
            Object.entries(pedidos).forEach(([pedidoId, pedido]) => {
                html += `
                    <li>
                        <strong>Modelo:</strong> ${pedido.modelo}, 
                        <strong>Quantidade:</strong> ${pedido.quantidade}, 
                        <strong>Cor do Fio:</strong> ${pedido.corFio}, 
                        <strong>Tipo do Fio:</strong> ${pedido.tipoFio}
                        <button class="delete-btn" data-id="${pedidoId}" data-maquina="${maquinaId}">Excluir</button>
                    </li>`;
            });
            html += `</ul>`;
        } else {
            html += `<p>Nenhum pedido em andamento para Shima ${maquinaId}.</p>`;
        }
        html += `<button id="novo-pedido">Adicionar Pedido</button>`;
        modalDetails.innerHTML = html;

        // Adicionar evento para botões de exclusão
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const pedidoId = btn.dataset.id;
                const maquinaId = btn.dataset.maquina;
                excluirPedido(maquinaId, pedidoId);
            });
        });

        // Adicionar evento para novo pedido
        document.getElementById("novo-pedido").addEventListener("click", () => {
            modal.style.display = "none";
            criarNovoPedido(maquinaId);
        });

        // Abrir modal
        modal.style.display = "block";

        // Fechar modal
        closeBtn.onclick = () => (modal.style.display = "none");
    });
}

function criarNovoPedido(maquinaId) {
    const quantidade = prompt("Digite a quantidade de blusas a produzir:");
    const modelo = prompt("Digite o modelo:");
    const corFio = prompt("Digite a cor do fio:");
    const tipoFio = prompt("Digite o tipo do fio (poliéster, modal):");

    if (quantidade && modelo && corFio && tipoFio) {
        const pedidosRef = ref(database, `machines/${maquinaId}/pedidos`);
        const novoPedidoRef = push(pedidosRef);
        set(novoPedidoRef, {
            quantidade,
            modelo,
            corFio,
            tipoFio,
            status: "Em produção"
        }).then(() => {
            alert(`Novo pedido adicionado na Shima ${maquinaId}`);
        }).catch((error) => {
            console.error("Erro ao salvar os dados: ", error);
        });
    } else {
        alert("Por favor, preencha todos os dados corretamente!");
    }
}

function excluirPedido(maquinaId, pedidoId) {
    const pedidoRef = ref(database, `machines/${maquinaId}/pedidos/${pedidoId}`);
    remove(pedidoRef)
        .then(() => {
            alert(`Pedido ${pedidoId} excluído com sucesso!`);
            abrirModal(maquinaId); // Atualiza o modal após excluir
        })
        .catch((error) => {
            console.error("Erro ao excluir o pedido: ", error);
        });
}

// Atualizar em tempo real os pedidos
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
