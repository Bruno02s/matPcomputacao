// Inicialização da matriz (5x5, por exemplo)
const linhas = 5;
const colunas = 5;
const matrizEstacionamento = Array.from({ length: linhas }, () =>
  Array(colunas).fill(null)
);

// Objeto para registrar as entradas
const registros = {};

// Renderizar a grade inicial
const gridContainer = document.getElementById("grid-container");
function renderizarGrid() {
  gridContainer.innerHTML = "";
  matrizEstacionamento.forEach((linha, i) => {
    linha.forEach((vaga, j) => {
      const cell = document.createElement("div");
      cell.textContent = vaga ? vaga : "";
      cell.className = vaga ? "occupied" : "free";
      cell.dataset.row = i;
      cell.dataset.col = j;
      gridContainer.appendChild(cell);
    });
  });
}
renderizarGrid();

// Registrar entrada
document.getElementById("form-entrada").addEventListener("submit", function (e) {
  e.preventDefault();

  const placa = document.getElementById("placa-entrada").value.toUpperCase();
  const horaEntrada = document.getElementById("hora-entrada").value;

  if (!placa.match(/^[A-Z]{3}[0-9][A-Z][0-9]{2,3}$/)) {
    alert("Formato da placa inválido! Use o padrão Mercosul: ABC1D23 ou ABC1D234.");
    return;
  }

  if (registros[placa]) {
    alert("Este veículo já está registrado no estacionamento.");
    return;
  }

  const vaga = alocarVaga(placa);
  if (!vaga) {
    alert("Estacionamento cheio! Não foi possível registrar o veículo.");
    return;
  }

  registros[placa] = { horaEntrada, vaga };
  renderizarGrid();
  alert(`Entrada registrada para o veículo ${placa} às ${horaEntrada}.`);
});

// Registrar saída e gerar ticket
document.getElementById("form-saida").addEventListener("submit", function (e) {
  e.preventDefault();

  const placa = document.getElementById("placa-saida").value.toUpperCase();
  const horaSaida = document.getElementById("hora-saida").value;

  if (!registros[placa]) {
    alert("Este veículo não está registrado no estacionamento.");
    return;
  }

  const { horaEntrada, vaga } = registros[placa];
  const minutosTotais = calcularMinutos(horaEntrada, horaSaida);

  if (minutosTotais < 0) {
    alert("Hora de saída inválida. Deve ser posterior à hora de entrada.");
    return;
  }

  const horasCobrança = Math.ceil((minutosTotais - 15) / 60);
  const valor = minutosTotais <= 15 ? 0 : calcularValor(horasCobrança);
  const estado = identificarEstado(placa);

  exibirTicket(estado, minutosTotais, valor, horaEntrada, horaSaida, placa);

  liberarVaga(vaga);
  delete registros[placa];
  renderizarGrid();
});

function calcularMinutos(horaEntrada, horaSaida) {
  const [hEntrada, mEntrada] = horaEntrada.split(":").map(Number);
  const [hSaida, mSaida] = horaSaida.split(":").map(Number);
  return (hSaida * 60 + mSaida) - (hEntrada * 60 + mEntrada);
}

function calcularValor(horasCobrança) {
  const valorBase = 15.0;
  const adicionalHora = 2.5;
  return horasCobrança <= 3
    ? valorBase
    : valorBase + (horasCobrança - 3) * adicionalHora;
}

function identificarEstado(placa) {
  const estadosSul = ["ABC", "DEF", "GHI"];
  return estadosSul.includes(placa.slice(0, 3))
    ? "Região Sul (PR/SC/RS)"
    : "Estado Desconhecido";
}

function exibirTicket(estado, minutos, valor, entrada, saida, placa) {
  const ticket = document.getElementById("ticket");
  document.getElementById("ticket-estado").textContent = `Estado: ${estado}`;
  document.getElementById("ticket-tempo").textContent = `Tempo: ${Math.ceil(
    minutos / 60
  )} horas (${minutos} minutos)`;
  document.getElementById("ticket-valor").textContent = `Valor: R$ ${valor.toFixed(
    2
  )}`;
  document.getElementById(
    "ticket-horarios"
  ).textContent = `Entrada: ${entrada} | Saída: ${saida}`;
  ticket.classList.remove("hidden");
}

function alocarVaga(placa) {
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (!matrizEstacionamento[i][j]) {
        matrizEstacionamento[i][j] = placa;
        return { linha: i, coluna: j };
      }
    }
  }
  return null;
}

function liberarVaga({ linha, coluna }) {
  matrizEstacionamento[linha][coluna] = null;
}
