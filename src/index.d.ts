import {SchemaObject} from 'openapi-typescript'
import Ajv from 'ajv'
import {Axios, Method, AxiosRequestConfig as AxiosRequestOptions} from 'axios'
import {ValidateFunction as AjvVF} from 'ajv/lib/types'


type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | number
export type RequestSchemas = Record<StatusCode, SchemaObject>
export type AxiosRequestConfig = AxiosRequestOptions
export type ValidateFunction = AjvVF

export interface HttpClientRequestOptions {
  id: string,
  method: Method,
  path: string,
  schemas: RequestSchemas
}

export interface HttpClientOptions {
  baseUrl: string,
  ajv: Ajv,
  axios: Axios;
  requests: HttpClientRequestOptions[],
  defaultHeaders: Record<string, string>,
  defaultSchemas: RequestSchemas
}

export interface SendRequestOptions {
  id?: string,
  schemas: RequestSchemas,
  body: any,
  status: StatusCode
}

export interface ConfiguredRequest {
  path: string,
  method: Method,
  validation: Record<number, ValidateFunction>
}

export declare class HttpClient {
  constructor(options: HttpClientOptions)

  request<R>(id: string, options?: SendRequestOptions): Promise<R>

  addRequests(requests: HttpClientRequestOptions[])
}
