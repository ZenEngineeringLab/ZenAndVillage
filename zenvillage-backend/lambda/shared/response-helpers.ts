import type { APIGatewayProxyResultV2 } from 'aws-lambda'

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export const ok = (data: unknown): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  headers: HEADERS,
  body: JSON.stringify({ data }),
})

export const created = (data: unknown): APIGatewayProxyResultV2 => ({
  statusCode: 201,
  headers: HEADERS,
  body: JSON.stringify({ data }),
})

export const noContent = (): APIGatewayProxyResultV2 => ({
  statusCode: 204,
  headers: HEADERS,
  body: '',
})

export const badRequest = (message: string, requestId: string): APIGatewayProxyResultV2 => ({
  statusCode: 400,
  headers: HEADERS,
  body: JSON.stringify({
    error: {
      code: 'BAD_REQUEST',
      message,
      requestId,
      timestamp: new Date().toISOString(),
    },
  }),
})

export const notFound = (entity: string, id: string, requestId: string): APIGatewayProxyResultV2 => ({
  statusCode: 404,
  headers: HEADERS,
  body: JSON.stringify({
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `${entity} with id '${id}' not found.`,
      requestId,
      timestamp: new Date().toISOString(),
    },
  }),
})

export const forbidden = (message: string, requestId: string): APIGatewayProxyResultV2 => ({
  statusCode: 403,
  headers: HEADERS,
  body: JSON.stringify({
    error: {
      code: 'FORBIDDEN',
      message,
      requestId,
      timestamp: new Date().toISOString(),
    },
  }),
})

export const internalError = (message: string, requestId: string): APIGatewayProxyResultV2 => ({
  statusCode: 500,
  headers: HEADERS,
  body: JSON.stringify({
    error: {
      code: 'INTERNAL_ERROR',
      message,
      requestId,
      timestamp: new Date().toISOString(),
    },
  }),
})
