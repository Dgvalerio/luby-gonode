'use strict'

const Sentry = require('@sentry/node')

const Config = use('Config')
const BaseExceptionHandler = use('BaseExceptionHandler')
const Env = use('Env')
const Youch = use('Youch')

class ExceptionHandler extends BaseExceptionHandler {
  async handle (error, { request, response }) {
    if (error.name === 'ValidationException') {
      return response.status(error.status).send(error.messages)
    }
    if (Env.get('NODE_ENV') === 'development') {
      const youch = new Youch(error, request.request)
      const errorJSON = await youch.toJSON()
      return response.status(error.status).send(errorJSON)
    }
    return response.status(error.status)
  }

  // eslint-disable-next-line node/handle-callback-err
  async report (error) {
    Sentry.init({
      dsn: Config.get('services.entry.dsn'),
      tracesSampleRate: 1.0
    })

    Sentry.captureException(error)
  }
}

module.exports = ExceptionHandler
