const Ajv = require('ajv')
const ajv = new Ajv({
  removeAdditional: false,
  useDefaults: false,
  coerceTypes: false,
  allErrors: true,
  allowUnionTypes: true
})


module.exports = ajv
