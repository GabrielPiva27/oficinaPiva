document.getElementById('formOrcamento')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        
        let statusServico = '';
        if (document.getElementById('servicoAtivo').checked) {
            statusServico = 'Serviço em andamento';
        } else {
            statusServico = 'Carro entregue';
        }

        // Pegando os serviços do textarea
        const servicesContainer = document.getElementById('servicosRealizados');
        let servicosRealizados = [];
        servicesContainer.childNodes.forEach(child => {
            if (child.className === 'service-item') {
                servicosRealizados.push(child.firstChild.textContent.trim());
            }
        });

        const dadosServico = {
            placa: document.getElementById('placa').value,
            carro: document.getElementById('carro').value,
            nome: document.getElementById('nome').value,
            data: document.getElementById('data').value,
            servicosRealizados: servicosRealizados.join('\n'),
            valorServico: document.getElementById('valorServico').value,
            servico: statusServico
        };

        if (document.getElementById('id').value !== '') {
            alterar(event, 'orcamentos', dadosServico, document.getElementById('id').value);
        } else {
            incluir(event, 'orcamentos', dadosServico);
        }
    });

//Botão de salvar
async function incluir(event, collection, dados) {
    event.preventDefault();
    return await firebase.database().ref(collection).push(dados)
        .then(() => {
            alerta('<i class="bi bi-check-circle"></i> Serviço incluído com sucesso!', 'success');
            document.getElementById('formOrcamento').reset();
            document.getElementById('servicosRealizados').innerHTML = ''; // Limpa o textarea
        })
        .catch(error => {
            alerta('<i class="bi bi-x-circle"></i> Falha ao incluir: ' + error.message, 'danger');
        });
}

//Botão de editar
async function alterar(event, collection, dados, id) {
    event.preventDefault();
    return await firebase.database().ref().child(collection + '/' + id).update(dados)
        .then(() => {
            alerta('<i class="bi bi-check-circle"></i> Serviço alterado com sucesso!', 'success');
            document.getElementById('formOrcamento').reset();
            document.getElementById('servicosRealizados').innerHTML = ''; // Limpa o textarea
        })
        .catch(error => {
            alerta('<i class="bi bi-x-circle"></i> Falha ao alterar: ' + error.message, 'danger');
        });
}

//Tabela
async function obtemServico() {
    let spinner = document.getElementById('carregandoServico');
    let tabela = document.getElementById('tabelaServico');

    await firebase.database().ref('orcamentos').orderByChild('placa').on('value', (snapshot) => {
        tabela.innerHTML = `
            <tr class='darkTable'>
                <th>Placa</th>
                <th>Carro</th>
                <th>Nome</th>
                <th>Data</th>
                <th>Serviços Realizados</th>
                <th>Valor Total</th>
                <th>Status do Serviço</th>
            </tr>
        `;
        snapshot.forEach(item => {
            // Dados do Firebase
            let db = item.ref._delegate._path.pieces_[0]; // nome da collection
            let id = item.ref._delegate._path.pieces_[1]; // id do registro

            // Criando as novas linhas da tabela
            let novaLinha = tabela.insertRow(); // insere uma nova linha na tabela
            novaLinha.insertCell().textContent = item.val().placa;
            novaLinha.insertCell().textContent = item.val().carro;
            novaLinha.insertCell().textContent = item.val().nome;
            novaLinha.insertCell().textContent = item.val().data;

            // Serviços
            const servicos = item.val().servicosRealizados.split('\n').filter(servico => servico.trim() !== ''); // Remover itens vazios e espaços em branco
            const servicosCell = novaLinha.insertCell();
            servicosCell.innerHTML = servicos.join('<br>'); // Unir os serviços em uma única string com quebras de linha

            novaLinha.insertCell().textContent = item.val().valorServico;
            novaLinha.insertCell().textContent = item.val().servico;
            novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o cliente selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
                                                <button class='btn btn-sm btn-warning' title='Edita o cliente selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`;
        });
    });
    spinner.classList.add('d-none');
}


//Apagar
async function remover(db, id) {
    if (window.confirm('⚠️ Confirma a exclusão do orçamento?')) {
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
    try {
        const snapshot = await firebase.database().ref(db + '/' + id).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('id').value = id;
            document.getElementById('placa').value = data.placa || '';
            document.getElementById('carro').value = data.carro || '';
            document.getElementById('nome').value = data.nome || '';
            document.getElementById('data').value = data.data || '';
            document.getElementById('valorServico').value = data.valorServico || '';

            // Atualizando o campo servicosRealizados com os botões e mesmo formato
            const servicesContainer = document.getElementById('servicosRealizados');
            if (servicesContainer) {
                servicesContainer.innerHTML = '';
                const servicos = (data.servicosRealizados || '').split('\n').filter(Boolean);
                servicos.forEach(servico => {
                    const serviceItem = document.createElement('div');
                    serviceItem.className = 'service-item';
                    const serviceText = document.createElement('span');
                    serviceText.textContent = servico;
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'btn btn-danger btn-sm';
                    deleteButton.textContent = ' ❌';
                    deleteButton.onclick = function () {
                        serviceItem.remove();
                    };
                    serviceItem.appendChild(serviceText);
                    serviceItem.appendChild(deleteButton);
                    servicesContainer.appendChild(serviceItem);
                });
            }

            if (data.servico === 'Serviço em andamento') {
                document.getElementById('servicoAtivo').checked = true;
            } else {
                document.getElementById('carroEntregue').checked = true;
            }

            document.getElementById('placa').focus();
        } else {
            console.error('Nenhum dado encontrado para o ID fornecido.');
        }
    } catch (error) {
        console.error('Erro ao carregar dados para alteração:', error);
    }
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

// Carrega Clientes
async function carregaClientes() {
    let combo = document.getElementById('placa')
    await firebase.database().ref('clientes').orderByChild('placa').on('value', (snapshot) => {
        combo.innerHTML = ''
        combo.innerHTML += `<select name='placa' id='placa' class='form-control'>`
        snapshot.forEach(item => {
            combo.innerHTML += `<option value='${item.val().placa}'>${item.val().placa.toUpperCase()} - ${item.val().carro.toUpperCase()}</option>`
        })
    })
    combo.innerHTML += `</select>`
}

document.getElementById('placa')
    .addEventListener('change', function (event) {
        let placa = document.getElementById("placa").value
        carregaClientePorPlaca(placa)
    })

async function carregaClientePorPlaca(placa) {
    // Supondo que 'placa' seja a placa do cliente que você quer buscar
    let clienteEncontrado = null
    // Consulta ao banco de dados buscando clientes com a placa específica
    await firebase.database().ref('clientes').orderByChild('placa').equalTo(placa).once('value', (snapshot) => {
        snapshot.forEach(item => {
            clienteEncontrado = item.val()
            document.getElementById("carro").value = item.val().carro.toUpperCase()
            document.getElementById("nome").value = item.val().nome.toUpperCase()
        })
    });
    return clienteEncontrado
}

//Adicionar o serviço
document.getElementById('inserirServ').addEventListener('click', function () {
    const select = document.getElementById('servicos');
    const selectedService = select.options[select.selectedIndex].text;

    if (selectedService !== 'Selecione um serviço') {
        const textarea = document.getElementById('servicosRealizados');
        textarea.value = textarea.value ? `${textarea.value.trim()}\n${selectedService}` : selectedService;
    }
});

document.getElementById('inserirServ').addEventListener('click', function () {
    const select = document.getElementById('servicos');
    const selectedService = select.options[select.selectedIndex].text;

    if (selectedService !== 'Selecione um serviço') {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';

        const serviceText = document.createElement('span');
        serviceText.textContent = selectedService;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = ' ❌';
        deleteButton.onclick = function () {
            serviceItem.remove();
        };

        serviceItem.appendChild(serviceText);
        serviceItem.appendChild(deleteButton);

        document.getElementById('servicosRealizados').appendChild(serviceItem);
    }
});