import {SchemaObject} from 'openapi-typescript'
import Ajv from 'ajv'
import {Axios, Method as AxiosMethod, AxiosRequestConfig as AxiosRequestOptions, AxiosResponse, AxiosError} from 'axios'
import {ValidateFunction as AjvVF} from 'ajv/lib/types'


type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | number
export type RequestSchemas = Record<StatusCode, SchemaObject>
/**
 * Reexport for support jsdoc import types in project
 */
export type AxiosRequestConfig = AxiosRequestOptions
export type ValidateFunction = AjvVF
export type Method = AxiosMethod
export type HttpClientResponse<T> = AxiosResponse<T>
export type HttpClientError<T> = AxiosError<T>

export interface HttpClientRequestOptions {
  id: string,
  method: Method,
  path: string,
  schemas: RequestSchemas
}

export interface HttpClientOptions {
  baseUrl: string,
  requests?: HttpClientRequestOptions[],
  defaultHeaders?: Record<string, string>,
  defaultSchemas?: RequestSchemas
}

export interface SendRequestOptions {
  id?: string,
  schemas?: RequestSchemas,
  body?: any,
  expected?: {
    status?: StatusCode,
    body?: any,
    partialBody?: any,
    headers?: any,
    partialHeaders?: any
  },
  headers?: Record<string, string>,
  params?: Record<string, string | number>,
  query?: Record<string, string | number>
}

export interface ConfiguredRequest {
  path: string,
  method: Method,
  validation: Record<number, ValidateFunction> | {}
}

export declare class HttpClient {
  constructor(options: HttpClientOptions)

  request<T>(id: string | SendRequestOptions, options?: SendRequestOptions): Promise<HttpClientResponse<T>>

  addRequests(requests: HttpClientRequestOptions[])

  setAjvInstance(instance: Ajv)

  setAxiosInstance(instance: Axios)
}

