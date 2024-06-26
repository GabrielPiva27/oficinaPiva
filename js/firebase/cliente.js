document.getElementById('formCliente')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    // Validações
    if (document.getElementById('nome').value.length < 5) {
      alerta('<i class="bi bi-exclamation-circle"></i> O nome é muito curto!', 'warning');
      document.getElementById('nome').focus();
      return false;
    } else if (document.getElementById('nome').value.length > 100) {
      alerta('<i class="bi bi-exclamation-circle"></i> O nome é muito longo!', 'warning');
      document.getElementById('nome').focus();
      return false;
    }
    if (document.getElementById('anoCarro').value > 2025) {
      alerta('<i class="bi bi-exclamation-circle"></i> Favor inserir um ano válido!', 'warning');
      document.getElementById('anoCarro').focus();
      return false;
    } else if (document.getElementById('anoCarro').value < 1950) {
      alerta('<i class="bi bi-exclamation-circle"></i> Favor inserir um ano válido!', 'warning');
      document.getElementById('anoCarro').focus();
      return false;
    }

    // Criando o objeto cliente
    const dadosCliente = {
      placa: document.getElementById('placa').value,
      carro: document.getElementById('carro').value,
      anoCarro: document.getElementById('anoCarro').value,
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value
    };

    if (document.getElementById('id').value !== '') {
      alterar(event, 'clientes', dadosCliente, document.getElementById('id').value);
    } else {
      await verificarPlacaExistente(event, 'clientes', dadosCliente);
    }
  });

// Função para verificar se a placa já existe
async function verificarPlacaExistente(event, collection, dadosCliente) {
  const placa = dadosCliente.placa;
  
  const snapshot = await firebase.database().ref(collection)
    .orderByChild('placa')
    .equalTo(placa)
    .once('value');

  if (snapshot.exists()) {
    alerta('<i class="bi bi-exclamation-circle"></i> Placa já cadastrada!', 'warning');
  } else {
    incluir(event, collection, dadosCliente);
  }
}

// Função para incluir o cliente
async function incluir(event, collection, dados) {
  return await firebase.database().ref(collection).push(dados)
    .then(() => {
      alerta('<i class="bi bi-check-circle"></i> Cliente incluído com sucesso!', 'success');
      document.getElementById('formCliente').reset();
    })
    .catch(error => {
      alerta('<i class="bi bi-exclamation-circle"></i> Falha ao incluir: ' + error.message, 'danger');
    });
}

//Editar
async function alterar(event, collection, dados, id) {
  event.preventDefault()
  return await firebase.database().ref().child(collection + '/' + id).update(dados)
    .then(() => {
      alerta('<i class="bi bi-check-circle"></i> Cliente alterado com sucesso!', 'success')
      document.getElementById('formCliente').reset()
    })
    .catch(error => {
      alerta('<i class="bi bi-exclamation-circle"></i> Falha ao alterar: ' + error.message, 'danger')
    })
}

//Tabela
async function obtemClientes() {
  let spinner = document.getElementById('carregandoCliente')
  let tabela = document.getElementById('tabelaCliente')

  await firebase.database().ref('clientes').orderByChild('placa').on('value', (snapshot) => {
    tabela.innerHTML = ''
    tabela.innerHTML += `
            <tr class='darkTable'>
              <th>Placa</th>   
              <th>Carro</th>   
              <th>Ano do Carro</th>
              <th>Nome</th> 
              <th>CPF</th>     
              <th>Email</th>
              <th>Telefone</th>
            </tr>
    `
    snapshot.forEach(item => {
      //Dados do Firebase
      let db = item.ref._delegate._path.pieces_[0] //nome da collection
      let id = item.ref._delegate._path.pieces_[1] //id do registro
      //Criando as novas linhas da tabela
      let novaLinha = tabela.insertRow() //insere uma nova linha na tabela
      novaLinha.insertCell().textContent = item.val().placa
      novaLinha.insertCell().textContent = item.val().carro
      novaLinha.insertCell().textContent = item.val().anoCarro
      novaLinha.insertCell().textContent = item.val().nome
      novaLinha.insertCell().textContent = item.val().cpf
      novaLinha.insertCell().textContent = item.val().email
      novaLinha.insertCell().textContent = item.val().telefone
      novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o cliente selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
                                          <button class='btn btn-sm btn-warning' title='Edita o cliente selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
    })
  })
  spinner.classList.add('d-none')
}

//Botão Apagar
async function remover(db, id) {
  if (window.confirm('⚠️ Confirma a exclusão do cliente?')) {
    let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
    dadosExclusao.remove()
      .then(() => {
        alerta('<i class="bi bi-check-circle"></i> Cliente removido com sucesso!', 'success')
      })
      .catch(error => {
        alerta(`<i class="bi bi-exclamation-circle"></i> Falha ao apagar o cliente: ${error.message}`)
      })
  }
}

//Botão Editar
async function carregaDadosAlteracao(db, id) {
  await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
    document.getElementById('id').value = id
    document.getElementById('placa').value = snapshot.val().placa
    document.getElementById('carro').value = snapshot.val().carro
    document.getElementById('anoCarro').value = snapshot.val().anoCarro
    document.getElementById('nome').value = snapshot.val().nome
    document.getElementById('cpf').value = snapshot.val().cpf
    document.getElementById('email').value = snapshot.val().email
    document.getElementById('telefone').value = snapshot.val().telefone
  })
  document.getElementById('placa').focus() //foco no campo placa
}

//Função Filtro
function filtrarTabela(idFiltro, idTabela) {
  // Obtém os elementos HTML
  var input = document.getElementById(idFiltro); // Input de texto para pesquisa
  var filter = input.value.toUpperCase(); // Valor da pesquisa em maiúsculas
  var table = document.getElementById(idTabela); // Tabela a ser filtrada
  var tr = table.getElementsByTagName("tr"); // Linhas da tabela

  // Oculta todas as linhas da tabela inicialmente (exceto o cabeçalho)
  for (var i = 1; i < tr.length; i++) { // Começa em 1 para ignorar o cabeçalho
    tr[i].style.display = "none"; // Oculta a linha
  }

  // Filtra cada linha da tabela
  for (var i = 1; i < tr.length; i++) { // Começa em 1 para ignorar o cabeçalho
    for (var j = 0; j < tr[i].cells.length; j++) { // Percorre as células da linha
      var td = tr[i].cells[j]; // Célula atual
      if (td) { // Verifica se a célula existe
        var txtValue = td.textContent || td.innerText; // Conteúdo da célula
        txtValue = txtValue.toUpperCase(); // Conteúdo da célula em maiúsculas

        // Verifica se o valor da pesquisa está presente no conteúdo da célula
        if (txtValue.indexOf(filter) > -1) {
          tr[i].style.display = ""; // Exibe a linha se houver correspondência
          break; // Sai do loop interno quando encontrar uma correspondência
        }
      }
    }
  }
}