document.getElementById('formEstoque')
  .addEventListener('submit', function (event) {
    event.preventDefault()
        
    //criando o objeto cliente

    const dadosEstoque = {
      peca: document.getElementById('peca').value,
      modelo: document.getElementById('modelo').value,
      qtde: document.getElementById('qtde').value,
      valorPeca: document.getElementById('valorPeca').value
    }

    if (document.getElementById('id').value !== '') {
      alterar(event, 'estoques', dadosEstoque, document.getElementById('id').value)
    } else {
      incluir(event, 'estoques', dadosEstoque)
    }
  })

//Salvar
async function incluir(event, collection, dados) {
  event.preventDefault()
  return await firebase.database().ref(collection).push(dados)
    .then(() => {
      alerta('<i class="bi bi-check-circle"></i> Registro incluído com sucesso!', 'success')
      document.getElementById('formEstoque').reset()
    })
    .catch(error => {
      alerta('<i class="bi bi-exclamation-circle"></i> Falha ao incluir: ' + error.message, 'danger')
    })
}

//Editar
async function alterar(event, collection, dados, id) {
  event.preventDefault()
  return await firebase.database().ref().child(collection + '/' + id).update(dados)
    .then(() => {
      alerta('<i class="bi bi-check-circle"></i> Registro alterado com sucesso!', 'success')
      document.getElementById('formEstoque').reset()
    })
    .catch(error => {
      alerta('<i class="bi bi-exclamation-circle"></i> Falha ao alterar: ' + error.message, 'danger')
    })
}

//Tabela
async function obtemEstoque() {
  let spinner = document.getElementById('carregandoEstoque')
  let tabela = document.getElementById('tabelaEstoque')

  await firebase.database().ref('estoques').orderByChild('peca').on('value', (snapshot) => {
    tabela.innerHTML = ''
    tabela.innerHTML += `
            <tr class='darkTable'>
              <th>Peça</th>   
              <th>Modelo</th>   
              <th>Quantidade</th>
              <th>Valor da Peça</th>
            </tr>
    `
    snapshot.forEach(item => {
      //Dados do Firebase
      let db = item.ref._delegate._path.pieces_[0] //nome da collection
      let id = item.ref._delegate._path.pieces_[1] //id do registro
      //Criando as novas linhas da tabela
      let novaLinha = tabela.insertRow() //insere uma nova linha na tabela
      novaLinha.insertCell().textContent = item.val().peca
      novaLinha.insertCell().textContent = item.val().modelo
      novaLinha.insertCell().textContent = item.val().qtde
      novaLinha.insertCell().textContent = item.val().valorPeca
      novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o registro selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
                                          <button class='btn btn-sm btn-warning' title='Edita o registro selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
    })
  })
  spinner.classList.add('d-none')
}

//Botão Apagar da tabela
async function remover(db, id) {
  if (window.confirm('⚠️ Confirma a exclusão do registro?')) {
    let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
    dadosExclusao.remove()
      .then(() => {
        alerta('<i class="bi bi-check-circle"></i> Registro removido com sucesso!', 'success')
      })
      .catch(error => {
        alerta(`<i class="bi bi-exclamation-circle"></i> Falha ao apagar o registro: ${error.message}`)
      })
  }
}

//Botão Editar da tabela
async function carregaDadosAlteracao(db, id) {
  await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
    document.getElementById('id').value = id
    document.getElementById('peca').value = snapshot.val().peca
    document.getElementById('modelo').value = snapshot.val().modelo
    document.getElementById('qtde').value = snapshot.val().qtde
    document.getElementById('valorPeca').value = snapshot.val().valorPeca
  })
  document.getElementById('peca').focus() //foco no campo peça
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