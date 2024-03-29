import type { NormalizedOptions, RequestError, Response } from 'got'

import logger from './logger'

export function outputRequest(options: NormalizedOptions): void {
  logger.debug('==>', options.method, options.url.href)

  if (options.json) {
    logger.debug('==> request json:', JSON.stringify(options.json))
  }
}

export function outputResponse(
  response: Response
): Response | Promise<Response> {
  logger.debug('<==', response.statusCode, response.statusMessage)
  logger.debug('<== response body:', JSON.stringify(response.body))

  return response
}

interface ErrorResponse {
  code: string
  message: string
  detail: {
    field: string
    value: any
    issue: string
    location: string
  }
}

export function parseError(
  err: RequestError
): RequestError | Promise<RequestError> {
  if (err.response) {
    let request = ''

    if (err.request) {
      const { options } = err.request

      request = JSON.stringify({
        method: options.method,
        url: options.url,
        authorization: options.headers.Authorization,
        json: options.json,
      })
    }

    let response = ''

    if (err.response.body) {
      const { code, message } = err.response.body as ErrorResponse

      response = JSON.stringify(err.response.body)

      err.name = code
      err.message = message
    }

    logger.error(
      `Error in response: ${err.response.statusCode} ${err.message}`,
      JSON.stringify({
        request,
        response,
      })
    )
  }

  return err
}
