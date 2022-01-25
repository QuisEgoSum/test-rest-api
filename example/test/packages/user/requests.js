/**
 * @type {HttpClientRequestOptions[]}
 */
module.exports = [
  {
    id: 'login',
    path: '/login',
    method: 'POST',
    schemas: {
      [200]: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                minimum: 1,
                maximum: Number.MAX_SAFE_INTEGER
              },
              username: {
                type: 'string',
                minLength:  3,
                maxLength: 16
              }
            },
            additionalProperties: false,
            required: ['id']
          }
        },
        additionalProperties: false,
        required: ['user']
      }
    }
  }
]