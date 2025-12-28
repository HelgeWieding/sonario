import { H3Error } from 'h3'

export function notFound(message = 'Resource not found'): never {
  throw createError({
    statusCode: 404,
    message,
  })
}

export function badRequest(message = 'Bad request'): never {
  throw createError({
    statusCode: 400,
    message,
  })
}

export function forbidden(message = 'Forbidden'): never {
  throw createError({
    statusCode: 403,
    message,
  })
}

export function handleDbError(error: unknown): never {
  console.error('Database error:', error)

  if (error instanceof H3Error) {
    throw error
  }

  throw createError({
    statusCode: 500,
    message: 'Internal server error',
  })
}
