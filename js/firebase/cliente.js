document.getElementById('formCliente')
  .addEventListener('submit', function (event) {
    event.preventDefault()
    //validações
    if (document.getElementById('nome').value.length < 5) {
      alerta('<i class="bi bi-exclamation-octagon"></i> O nome é muito curto!', 'warning')
      document.getElementById('nome').focus()
    } else if (document.getElementById('nome').value.length > 100) {
      alerta('<i class="bi bi-exclamation-octagon"></i> O nome é muito longo!', 'warning')
      document.getElementById('nome').focus()
    }
    if (document.getElementById('carro').value.length < 2) {
        alerta('<i class="bi bi-exclamation-octagon"></i> O nome é muito curto!', 'warning')
        document.getElementById('carro').focus()
    } else if (document.getElementById('carro').value.length > 50) {
        alerta('<i class="bi bi-exclamation-octagon"></i> O nome é muito longo!', 'warning')
        document.getElementById('carro').focus()
    }

    const dadosCliente = {
        placa: document.getElementById('placa').value,
        carro: document.getElementById('carro').value,
        anoCarro: document.getElementById('anoCarro').value,
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value
    }

    if (document.getElementById('id').value !== '') {
        alterar(event, 'clientes', dadosCliente, document.getElementById('id').value)
      } else {
        incluir(event, 'clientes', dadosCliente)
    }
})

//Botão de salvar
async function incluir(event, collection, dados) {
    event.preventDefault()
    return await firebase.database().ref(collection).push(dados)
      .then(() => {
        alerta('<i class="bi bi-check-circle"></i> Cliente incluído com sucesso!', 'success')
        document.getElementById('formCliente').reset()
      })
      .catch(error => {
        alerta('<i class="bi bi-x-circle"></i> Falha ao incluir: ' + error.message, 'danger')
      })
}

//Botão de editar
async function alterar(event, collection, dados, id) {
    event.preventDefault()
    return await firebase.database().ref().child(collection + '/' + id).update(dados)
      .then(() => {
        alerta('<i class="bi bi-check-circle"></i> Cliente alterado com sucesso!', 'success')
        document.getElementById('formCliente').reset()//limpa
      })
      .catch(error => {
        alerta('<i class="bi bi-x-circle"></i> Falha ao alterar: ' + error.message, 'danger')
      })
}

//Tabela
async function obtemClientes() {
    let spinner = document.getElementById('carregandoCliente')
    let tabela = document.getElementById('tabelaCliente')
  
    await firebase.database().ref('clientes').orderByChild('nome').on('value', (snapshot) => {
      tabela.innerHTML = ''
      tabela.innerHTML += `
              <tr class='darkTable'>
                <th>PLaca</th>
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

//Apagar
async function remover(db, id) {
    if (window.confirm('<i class="bi bi-exclamation-circle"></i> Confirma a exclusão do cliente?')) {
      let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
      dadosExclusao.remove()
        .then(() => {
          alerta('<i class="bi bi-check-circle"></i> Cliente removido com sucesso!', 'success')
        })
        .catch(error => {
          alerta(`<i class="bi bi-x-circle"></i> Falha ao apagar o cliente: ${error.message}`)
        })
    }
}

//editar
async function carregaDadosAlteracao(db, id) {
    await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
      document.getElementById('id').value = id
      document.getElementById('carro').value = snapshot.val().carro
      document.getElementById('placa').value = snapshot.val().placa
      document.getElementById('carro').value = snapshot.val().anoCarro
      document.getElementById('nome').value = snapshot.val().nome
      document.getElementById('cpf').value = snapshot.val().cpf
      document.getElementById('email').value = snapshot.val().email
      document.getElementById('telefone').value = snapshot.val().telefone
    })
    document.getElementById('nome').focus() //Foco no campo nome
}

//Filtro
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