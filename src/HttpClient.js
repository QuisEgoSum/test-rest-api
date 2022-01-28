const ajv = require('./ajv.config')
const axios = require('./axios.config')


const asserts = {
  expectValidationErrors: (validationErrors) => expect(validationErrors).toEqual(null),
  expectEqualStatus: (response, options) => expect(response.status).toEqual(options.expected.status),
  expectEqualBody: (response, options) => expect(response.data).toContainEqual(options.expected.body),
  expectPartialEqualBody: (response, options) => expect(response.data).toMatchObject(options.expected.partialBody),
  expectEqualHeaders: (response, options) => expect(response.headers).toContainEqual(options.expected.headers),
  expectPartialEqualHeaders: (response, options) => expect(response.headers).toMatchObject(options.expected.partialHeaders)
}


module.exports = class HttpClient {
  /**
   * @param {HttpClientOptions} options
   */
  constructor(options) {
    this.baseUrl = options.baseUrl
    /**
     * @type {Map<string, ConfiguredRequest>}
     */
    this.requests = new Map()
    /**
     * @type {Map<Number, ValidateFunction>}
     */
    this.defaultValidation = new Map()

    this.ajv = ajv
    this.axios = axios

    Object.entries(options.defaultSchemas || {})
      .map(
        /**
         * @param {String} code
         * @param {SchemaObject} schema
         * @returns {Map<Number, ValidateFunction>}
         */
        ([code, schema]) => this.defaultValidation.set(Number(code), this.ajv.compile(schema))
      )

    this.defaultHeaders = options.defaultHeaders || {}

    this.addRequests(options.requests || [])
  }

  setAjvInstance(instance) {
    this.ajv = instance
  }

  setAxiosInstance(instance) {
    this.axios = instance
  }

  /**
   * @param {HttpClientRequestOptions[]} requests
   */
  addRequests(requests) {
    for (const request of requests) {
      if (this.requests.has(request.id)) {
        throw new Error(`Request '${request.id}' already added`)
      }
      this.requests.set(
        request.id,
        {
          path: request.path,
          method: request.method,
          validation: Object.keys(request.schemas)
            .reduce((acc, code) => {
              acc[code] = this.ajv.compile(request.schemas[code])
              return acc
            }, {}) || {}
        }
      )
    }
  }

  /**
   * @param {String | SendRequestOptions} id
   * @param {SendRequestOptions} options
   */
  async request(id, options = {}) {
    if (typeof id !== 'string') {
      options = id
      id = options.id
    }
    if (!this.requests.has(id)) {
      throw new Error(`Request '${id}' not exists`)
    }

    const requestSettings = this.requests.get(id)

    const validationOptions = {
      ...this.defaultValidation,
      ...requestSettings.validation,
      ...(options.schemas
        ? Object.keys(options.schemas)
          .reduce((acc, code) => {
            acc[code] = this.ajv.compile(options.schemas[code])
            return acc
          }, {})
        : {})
    }

    /**
     * @type {AxiosRequestConfig}
     */
    const axiosOptions = {
      method: requestSettings.method,
      headers: {
        ...this.defaultHeaders,
        ...options.headers || {}
      },
      url: this.joinUrl(this.baseUrl, requestSettings.path, options.params, options.query),
      data: options.body
    }

    /**
     * @type {HttpClientResponse | HttpClientError}
     */
    const axiosResponse = await axios.request(axiosOptions)
      .catch(error => error)

    if (axiosResponse.isAxiosError && typeof axiosResponse.code === 'string') {
      // Network error
      throw axiosResponse
    }

    const response = axiosResponse.isAxiosError ? axiosResponse.response : axiosResponse

    if (response.status in validationOptions) {
      validationOptions[response.status](response.data)
      asserts.expectValidationErrors(validationOptions[response.status].errors)
    }

    if (!options.expected) {
      return axiosResponse
    }

    if ('status' in options.expected) asserts.expectEqualStatus(response, options)
    if ('body' in options.expected) asserts.expectEqualBody(response, options)
    if ('partialBody' in options.expected) asserts.expectPartialEqualBody(response, options)
    if ('headers' in options.expected) asserts.expectEqualHeaders(response, options)
    if ('partialHeaders' in options.expected) asserts.expectPartialEqualHeaders(response, options)

    return  response
  }

  /**
   * @param {String} baseUrl
   * @param {String} path
   * @param {Object<string, string>} params
   * @param {Object<string, string>} query
   */
  joinUrl(baseUrl, path, params, query) {
    if (params) {
      const pathParts = path.split('/')
      Object.entries(params)
        .forEach(([key, value]) => {
            const pattern = ':' + key
            const paramIndex = pathParts.findIndex(item => item === pattern)
            if (paramIndex !== -1) {
              pathParts[paramIndex] = value
            }
          }
        )
      path = pathParts.join('/')
    }
    const url = new URL(baseUrl + path)
    if (query) {
      Object.entries(query)
        .forEach(([name, value]) => url.searchParams.set(name, value))
    }
    return url.toString()
  }
}
