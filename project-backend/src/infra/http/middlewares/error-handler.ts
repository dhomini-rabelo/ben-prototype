import {
  DangerErrors,
  DomainError,
  ValidationError,
} from '@/modules/domain/domain-errors'
import { HttpStatus } from '@/modules/utils/http'
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
      acc: {
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
          acc[fieldName] = errorBodyData._errors
        } else {
          const errorBodyData = errorBody as {
            [key: string]: { _errors: string[] }
          }

          acc[fieldName] = Object.fromEntries(
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
                    (acc, [arrayFieldName, errorBodyData]) => {
                      if (
                        '_errors' in errorBodyData &&
                        Array.isArray(errorBodyData._errors) &&
                        errorBodyData._errors.length > 0
                      ) {
                        acc[arrayFieldName] = errorBodyData._errors
                      }
                      return acc
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
        acc.body = errorBody
      }

      return acc
    },
    {},
  )
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,

  _next: NextFunction,
) {
  const response: { status: number; body: unknown } = {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: { message: 'Internal Server Error' },
  }

  console.error(err)

  if (err instanceof ZodError) {
    response.status = HttpStatus.BAD_REQUEST
    response.body = formatZodError(err.format())
  } else if (err instanceof ValidationError) {
    response.status = HttpStatus.BAD_REQUEST
    response.body = {
      [err.response.errorField]: [
        `${err.response.code}#${err.response.variables?.join(',')}`,
      ],
    }
  } else if (err instanceof DomainError) {
    response.status =
      domainErrorStatusCodeMap[err.response.errorType!] || HttpStatus.CONFLICT
    response.body = {
      message: err.response.code,
    }
  }

  return res.status(response.status).json(response.body)
}
