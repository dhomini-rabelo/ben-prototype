import { DangerErrors, DomainError, ValidationError } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { ZodError, ZodFormattedError } from 'zod'

const domainErrorStatusCodeMap: Record<DangerErrors, HttpStatus> = {
  [DangerErrors.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DangerErrors.DATA_INTEGRITY]: HttpStatus.CONFLICT,
  [DangerErrors.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [DangerErrors.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
}

export function formatZodError<Schema>(payload: ZodFormattedError<Schema>) {
  return Object.entries(payload).reduce(
    (
      accumulator: {
        [key: string]: string[] | { [key: string]: string[] }
      },
      entryData,
    ) => {
      const [fieldName, errorBody] = entryData as [
        string,
        (
          | string[]
          | { _errors: string[] }
          | { [key: string]: { _errors: string[] } }
        ),
      ]

      if (!Array.isArray(errorBody)) {
        if (Object.keys(errorBody).length === 1 && '_errors' in errorBody) {
          const errorBodyData = errorBody as { _errors: string[] }
          accumulator[fieldName] = errorBodyData._errors
        } else {
          const errorBodyData = errorBody as {
            [key: string]: { _errors: string[] }
          }

          accumulator[fieldName] = Object.fromEntries(
            Object.entries(errorBodyData).map((entryData) => {
              const [subFieldName, errorBodyData] = entryData as [
                string,
                (
                  | { _errors: string[] }
                  | {
                      [arrayFieldNameWithError: string]: { _errors: string[] }
                    }
                ),
              ]

              if (
                !isNaN(parseInt(subFieldName)) &&
                ((errorBodyData._errors || []) as string[]).length === 0
              ) {
                const errorData = errorBodyData as {
                  [arrayFieldNameWithError: string]: { _errors: string[] }
                }

                return [
                  subFieldName,
                  Object.entries(errorData).reduce(
                    (accumulator, [arrayFieldName, errorBodyData]) => {
                      if (
                        '_errors' in errorBodyData &&
                        Array.isArray(errorBodyData._errors) &&
                        errorBodyData._errors.length > 0
                      ) {
                        accumulator[arrayFieldName] = errorBodyData._errors
                      }
                      return accumulator
                    },
                    {} as { [arrayFieldNameWithError: string]: string[] },
                  ),
                ]
              }

              return [subFieldName, errorBodyData._errors as string[]]
            }),
          )
        }
      } else if (errorBody.length > 0) {
        accumulator.body = errorBody
      }

      return accumulator
    },
    {},
  )
}

export function errorHandler(
  error: Error,
  _req: Request,
  httpResponse: Response,

  _next: NextFunction,
) {
  const response: { status: number; body: unknown } = {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: { message: 'Internal Server Error' },
  }

  console.error(error)

  if (error instanceof ZodError) {
    response.status = HttpStatus.BAD_REQUEST
    response.body = formatZodError(error.format())
  } else if (error instanceof ValidationError) {
    response.status = HttpStatus.BAD_REQUEST
    response.body = {
      [error.response.errorField]: [
        `${error.response.code}#${error.response.variables?.join(',')}`,
      ],
    }
  } else if (error instanceof DomainError) {
    response.status =
      domainErrorStatusCodeMap[error.response.errorType!] || HttpStatus.CONFLICT
    response.body = {
      message: error.response.code,
    }
  } else if (error instanceof ResourceNotFoundError) {
    response.status = HttpStatus.NOT_FOUND
    response.body = {
      message: 'RESOURCE_NOT_FOUND',
    }
  }

  return httpResponse.status(response.status).json(response.body)
}
