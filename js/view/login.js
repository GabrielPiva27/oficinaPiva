const botaoGoogle = document.getElementById('loginGoogle')

botaoGoogle.addEventListener('click', (event) => {
    event.preventDefault()
    loginGoogle()
})

const formLogin = document.getElementById('formLogin')

formLogin.addEventListener('submit', (event) => {
    event.preventDefault()
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value
    loginFirebase(email, senha)
})