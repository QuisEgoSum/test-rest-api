module.exports = class HttpClient {
  /**
   * @param {HttpClientOptions} options
   */
  constructor(options) {
    this.baseUrl = options.baseUrl
    this.ajv = options.ajv
    this.axios = options.axios
    /**
     * @type {Map<string, ConfiguredRequest>}
     */
    this.requests = new Map()
    /**
     * @type {Map<Number, ValidateFunction>}
     */
    this.defaultSchemas = new Map()

    Object.entries(options.defaultSchemas)
      .map(
        /**
         * @param {String} code
         * @param {SchemaObject} schema
         * @returns {Map<Number, ValidateFunction>}
         */
        ([code, schema]) => this.defaultSchemas.set(Number(code), this.ajv.compile(schema))
      )

    this.addRequests(options.requests || [])
  }

  /**
   *
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
            }, {})
        }
      )
    }
  }

  /**
   * @param {String | SendRequestOptions} id
   * @param {SendRequestOptions} options
   */
  async request(id, options) {
    if (typeof id !== 'string') {
      options = id
      id = options.id
    }
    if (!this.requests.has(id)) {
      throw new Error(`Request '${id}' not exists`)
    }
    const requestSettings = this.requests.get(id)
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosOptions = {
      method: requestSettings.method
    }
  }
}