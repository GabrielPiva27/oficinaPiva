function alerta(mensagem, tipo) {
    let mensagemAlerta = document.getElementById('mensagemAlerta')
    let wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + tipo + ' alert-dismissible m-3" role="alert">' + mensagem + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    mensagemAlerta.append(wrapper)
    //Auto Close após 3 segundos
    window.setTimeout(function () {
      wrapper.innerHTML = ''
    }, 3000);
    //Iremos fazer o scroll até a div da mensagem
        mensagemAlerta.scrollIntoView();
  }

 