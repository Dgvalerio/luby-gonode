'use strict'

const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'], // Template de e-mail
        { // Parâmetros para o template
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => { // alterando o objeto de e-mail
          message
            .to(user.email)
            .from('al.davigvalerio@gmail.com', 'Davi | Davi')
            .subject('Recuperação de senha')
        }
      )
    } catch (err) {
      return response.status(err.status).send({ error: { message: 'Algo não deu certo, esse e-mail existe?' } })
    }
  }
}

module.exports = ForgotPasswordController
