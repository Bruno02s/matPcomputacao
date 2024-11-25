const linhas = 5;
const colunas = 5;
const matrizEstacionamento = Array.from({ length: linhas }, () =>
  Array(colunas).fill(null)
);

const registros = {};

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

const placasRJ = gerarPlacas();
const placasSP = gerarPlacasSP();
const placasES = gerarPlacasES();

renderizarGrid();

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
  const estado = identificarRegiaoPlaca(placa);

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

function identificarRegiaoPlaca(placa) {
  const prefixo = placa.slice(0, 3); // Obtém os 3 primeiros caracteres
  if (placasSP.includes(prefixo)) {
      return "São Paulo";
  } else if (placasRJ.includes(prefixo)) {
      return "Rio de Janeiro";
  } else if (placasES.includes(prefixo)) {
      return "Espírito Santo";
  } else {
      return "Desconhecido";
  }
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

function gerarPlacasES() {
  const placas = [];
  
  // Definir o intervalo de letras
  const start = 'MOX';
  const end = 'MTZ';

  // Iterar sobre os caracteres de cada posição
  for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) { // Letra 1 (M)
    for (let j = (i === start.charCodeAt(0) ? start.charCodeAt(1) : 65); j <= (i === end.charCodeAt(0) ? end.charCodeAt(1) : 90); j++) { // Letra 2 (O-T)
      for (let k = (i === start.charCodeAt(0) && j === start.charCodeAt(1) ? start.charCodeAt(2) : 65); k <= (i === end.charCodeAt(0) && j === end.charCodeAt(1) ? end.charCodeAt(2) : 90); k++) { // Letra 3 (X-Z)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const startt = "OCV"
  const endd = "ODT"

  for (let i = startt.charCodeAt(0); i <= endd.charCodeAt(0); i++) { // Letra 1 (O-O)
    for (let j = (i === startt.charCodeAt(0) ? startt.charCodeAt(1) : 65); j <= (i === endd.charCodeAt(0) ? endd.charCodeAt(1) : 90); j++) { // Letra 2 (C-D)
      for (let k = (i === startt.charCodeAt(0) && j === startt.charCodeAt(1) ? startt.charCodeAt(2) : 65); k <= (i === endd.charCodeAt(0) && j === endd.charCodeAt(1) ? endd.charCodeAt(2) : 90); k++) { // Letra 3 (V-T)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const inicio = "OVE"
  const fim = "OVF"

  for (let i = inicio.charCodeAt(0); i <= fim.charCodeAt(0); i++) { // Letra 1 (O-O)
    for (let j = (i === inicio.charCodeAt(0) ? inicio.charCodeAt(1) : 65); j <= (i === fim.charCodeAt(0) ? fim.charCodeAt(1) : 90); j++) { // Letra 2 (V-V)
      for (let k = (i === inicio.charCodeAt(0) && j === inicio.charCodeAt(1) ? inicio.charCodeAt(2) : 65); k <= (i === fim.charCodeAt(0) && j === fim.charCodeAt(1) ? fim.charCodeAt(2) : 90); k++) { // Letra 3 (E-F)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const inicioo = "OVH" 
  const fimm = "OVL"

  for (let i = inicioo.charCodeAt(0); i <= fimm.charCodeAt(0); i++) { // Letra 1 (O-O)
    for (let j = (i === inicioo.charCodeAt(0) ? inicioo.charCodeAt(1) : 65); j <= (i === fimm.charCodeAt(0) ? fimm.charCodeAt(1) : 90); j++) { // Letra 2 (V-V)
      for (let k = (i === inicioo.charCodeAt(0) && j === inicioo.charCodeAt(1) ? inicioo.charCodeAt(2) : 65); k <= (i === fimm.charCodeAt(0) && j === fimm.charCodeAt(1) ? fimm.charCodeAt(2) : 90); k++) { // Letra 3 (E-F)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const inc = "OYD"
  const fm = "OYK"

  for (let i = inc.charCodeAt(0); i <= fm.charCodeAt(0); i++) { // Letra 1 (O-O)
    for (let j = (i === inc.charCodeAt(0) ? inc.charCodeAt(1) : 65); j <= (i === fm.charCodeAt(0) ? fm.charCodeAt(1) : 90); j++) { // Letra 2 (Y-Y)
      for (let k = (i === inc.charCodeAt(0) && j === inc.charCodeAt(1) ? inc.charCodeAt(2) : 65); k <= (i === fm.charCodeAt(0) && j === fm.charCodeAt(1) ? fm.charCodeAt(2) : 90); k++) { // Letra 3 (D-K)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const incc = "PPA"
  const fmm = "PPZ"

  for (let i = incc.charCodeAt(0); i <= fmm.charCodeAt(0); i++) { // Letra 1 (P-P)
    for (let j = (i === incc.charCodeAt(0) ? incc.charCodeAt(1) : 65); j <= (i === fmm.charCodeAt(0) ? fmm.charCodeAt(1) : 90); j++) { // Letra 2 (P-P)
      for (let k = (i === incc.charCodeAt(0) && j === incc.charCodeAt(1) ? incc.charCodeAt(2) : 65); k <= (i === fmm.charCodeAt(0) && j === fmm.charCodeAt(1) ? fmm.charCodeAt(2) : 90); k++) { // Letra 3 (A-Z)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const startES = "QRB"
  const endES = "QRM"

  for (let i = startES.charCodeAt(0); i <= endES.charCodeAt(0); i++) { // Letra 1 (Q-Q)
    for (let j = (i === startES.charCodeAt(0) ? startES.charCodeAt(1) : 65); j <= (i === endES.charCodeAt(0) ? endES.charCodeAt(1) : 90); j++) { // Letra 2 (R-R)
      for (let k = (i === startES.charCodeAt(0) && j === startES.charCodeAt(1) ? startES.charCodeAt(2) : 65); k <= (i === endES.charCodeAt(0) && j === endES.charCodeAt(1) ? endES.charCodeAt(2) : 90); k++) { // Letra 3 (B-M)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const starttES = "RBA"
  const enddES = "RBJ"

  for (let i = starttES.charCodeAt(0); i <= enddES.charCodeAt(0); i++) { // Letra 1 (R-R)
    for (let j = (i === starttES.charCodeAt(0) ? starttES.charCodeAt(1) : 65); j <= (i === enddES.charCodeAt(0) ? enddES.charCodeAt(1) : 90); j++) { // Letra 2 (B-B)
      for (let k = (i === starttES.charCodeAt(0) && j === starttES.charCodeAt(1) ? starttES.charCodeAt(2) : 65); k <= (i === enddES.charCodeAt(0) && j === enddES.charCodeAt(1) ? enddES.charCodeAt(2) : 90); k++) { // Letra 3 (A-J)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const incES = "RQM"
  const fmES = "RQV"

  for (let i = incES.charCodeAt(0); i <= fmES.charCodeAt(0); i++) { // Letra 1 (R-R)
    for (let j = (i === incES.charCodeAt(0) ? incES.charCodeAt(1) : 65); j <= (i === fmES.charCodeAt(0) ? fmES.charCodeAt(1) : 90); j++) { // Letra 2 (Q-Q)
      for (let k = (i === incES.charCodeAt(0) && j === incES.charCodeAt(1) ? incES.charCodeAt(2) : 65); k <= (i === fmES.charCodeAt(0) && j === fmES.charCodeAt(1) ? fmES.charCodeAt(2) : 90); k++) { // Letra 3 (M-V)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }



  return placas;
}

function gerarPlacasSP() {
  const placas = [];
  
  // Definir o intervalo de letras
  const start = 'BFA';
  const end = 'GKI';

  // Iterar sobre os caracteres de cada posição
  for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) { // Letra 1 (B-G)
    for (let j = (i === start.charCodeAt(0) ? start.charCodeAt(1) : 65); j <= (i === end.charCodeAt(0) ? end.charCodeAt(1) : 90); j++) { // Letra 2 (F-K)
      for (let k = (i === start.charCodeAt(0) && j === start.charCodeAt(1) ? start.charCodeAt(2) : 65); k <= (i === end.charCodeAt(0) && j === end.charCodeAt(1) ? end.charCodeAt(2) : 90); k++) { // Letra 3 (A-I)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const startt = "QSN"
  const endd = "QSZ"

  for (let i = startt.charCodeAt(0); i <= endd.charCodeAt(0); i++) { // Letra 1 (Q-Q)
    for (let j = (i === startt.charCodeAt(0) ? startt.charCodeAt(1) : 65); j <= (i === endd.charCodeAt(0) ? endd.charCodeAt(1) : 90); j++) { // Letra 2 (S-S)
      for (let k = (i === startt.charCodeAt(0) && j === startt.charCodeAt(1) ? startt.charCodeAt(2) : 65); k <= (i === endd.charCodeAt(0) && j === endd.charCodeAt(1) ? endd.charCodeAt(2) : 90); k++) { // Letra 3 (N-Z)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  return placas;
}

function gerarPlacas() {
  const placas = [];
  
  // Definir o intervalo de letras
  const start = 'KMF';
  const end = 'LVE';

  // Iterar sobre os caracteres de cada posição
  for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) { // Letra 1 (K-L)
    for (let j = (i === start.charCodeAt(0) ? start.charCodeAt(1) : 65); j <= (i === end.charCodeAt(0) ? end.charCodeAt(1) : 90); j++) { // Letra 2 (M-V)
      for (let k = (i === start.charCodeAt(0) && j === start.charCodeAt(1) ? start.charCodeAt(2) : 65); k <= (i === end.charCodeAt(0) && j === end.charCodeAt(1) ? end.charCodeAt(2) : 90); k++) { // Letra 3 (F-E)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  const startt = "RIO"
  const endd = "RKV"

  // Iterar sobre os caracteres de cada posição
  for (let i = startt.charCodeAt(0); i <= endd.charCodeAt(0); i++) { // Letra 1 (R-R)
    for (let j = (i === startt.charCodeAt(0) ? startt.charCodeAt(1) : 65); j <= (i === endd.charCodeAt(0) ? endd.charCodeAt(1) : 90); j++) { // Letra 2 (I-K)
      for (let k = (i === startt.charCodeAt(0) && j === startt.charCodeAt(1) ? startt.charCodeAt(2) : 65); k <= (i === endd.charCodeAt(0) && j === endd.charCodeAt(1) ? endd.charCodeAt(2) : 90); k++) { // Letra 3 (O-V)
        placas.push(String.fromCharCode(i) + String.fromCharCode(j) + String.fromCharCode(k)); // Adicionar a combinação ao array
      }
    }
  }

  return placas;
}