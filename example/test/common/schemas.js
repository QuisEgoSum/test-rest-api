

module.exports.messageResponseSchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string'
    }
  },
  additionalProperties: false,
  required: ['message']
}