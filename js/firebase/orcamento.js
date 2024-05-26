document.getElementById('formOrcamento')
    .addEventListener('submit', function (event) {
        event.preventDefault()
        //validações
        if (document.getElementById('valorServico').value < 0) {
            alerta('<i class="bi bi-exclamation-octagon"></i> Favor inserir um número positivo!', 'warning')
            document.getElementById('nome').focus()
        } else {
            return
        }

        let statusServico = ''
        if (document.getElementById('servicoAtivo').checked) {
            statusServico = 'Serviço em andamento'
        } else { statusServico = 'Carro entregue' }

        const dadosServico = {
            placa: document.getElementById('placa').value,
            nome: document.getElementById('nome').value,
            data: document.getElementById('data').value,
            descricaoServico: document.getElementById('descricaoServico').value,
            valorServico: document.getElementById('valorServico').value,
            Servico: statusServico
        }

        if (document.getElementById('id').value !== '') {
            alterar(event, 'servicos', dadosServico, document.getElementById('id').value)
        } else {
            incluir(event, 'servicos', dadosServico)
        }
    })

//Botão de salvar
async function incluir(event, collection, dados) {
    event.preventDefault()
    return await firebase.database().ref(collection).push(dados)
        .then(() => {
            alerta('<i class="bi bi-check-circle"></i> Serviço incluído com sucesso!', 'success')
            document.getElementById('formOrcamento').reset()
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
            alerta('<i class="bi bi-check-circle"></i> Serviço alterado com sucesso!', 'success')
            document.getElementById('formOrcamento').reset()//limpa
        })
        .catch(error => {
            alerta('<i class="bi bi-x-circle"></i> Falha ao alterar: ' + error.message, 'danger')
        })
}

//Tabela
async function obtemEstoque() {
    let spinner = document.getElementById('carregandoServico')
    let tabela = document.getElementById('tabelaServico')

    await firebase.database().ref('servicos').orderByChild('placa').on('value', (snapshot) => {
        tabela.innerHTML = ''
        tabela.innerHTML += `
              <tr class='darkTable'>
                <th>Placa</th>
                <th>Carro</th>
                <th>Nome</th>
                <th>Data</th>
                <th>Descrição do Serviço</th>
                <th>Valor do Serviço</th>
                <th>Status do Serviço</th>
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
            novaLinha.insertCell().textContent = item.val().nome
            novaLinha.insertCell().textContent = item.val().data
            novaLinha.insertCell().textContent = item.val().descricaoServico
            novaLinha.insertCell().textContent = item.val().valorServico
            novaLinha.insertCell().textContent = item.val().servico
            novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o cliente selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
                                            <button class='btn btn-sm btn-warning' title='Edita o cliente selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
        })
    })
    spinner.classList.add('d-none')
}

//Apagar
async function remover(db, id) {
    if (window.confirm('<i class="bi bi-exclamation-circle"></i> Confirma a exclusão do Item?')) {
        let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
        dadosExclusao.remove()
            .then(() => {
                alerta('<i class="bi bi-check-circle"></i> Serviço removido com sucesso!', 'success')
            })
            .catch(error => {
                alerta(`<i class="bi bi-x-circle"></i> Falha ao apagar o serviço: ${error.message}`)
            })
    }
}

//editar
async function carregaDadosAlteracao(db, id) {
    await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
        document.getElementById('id').value = id
        document.getElementById('placa').value = snapshot.val().placa
        document.getElementById('carro').value = snapshot.val().carro
        document.getElementById('nome').value = snapshot.val().nome
        document.getElementById('data').value = snapshot.val().data
        document.getElementById('descricaoServico').value = snapshot.val().descricaoServico
        document.getElementById('valorServico').value = snapshot.val().valorServico
        if (snapshot.val().servico === 'Serviço em andamento') {
            document.getElementById('servicoAtivo').checked = true
        } else {
            document.getElementById('carroEntregue').checked = true
        }
    })
    document.getElementById('placa').focus() //Foco no campo placa
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