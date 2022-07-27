const { Category } = require('./src/category')
const { FieldLogic } = require('./src/field-logic')
const { FieldType } = require('./src/field-type')
const { loadDefinitions } = require('./src/definition-loader')
const { FieldValidationError, DependencyCycleError } = require('./src/errors')

const _globalRootInstance = new Category()

function create(cb) {
  const root = new Category()
  cb(root)
  return root
}

module.exports = {
  Pho: Category,
  category: (...args) => _globalRootInstance.category(...args),
  field: (...args) => _globalRootInstance.field(...args),
  array: (...args) => _globalRootInstance.array(...args),
  describe: (...args) => _globalRootInstance.describe(...args),
  parse: (...args) => _globalRootInstance.parse(...args),
  create,
  FieldLogic,
  FieldType,
  loadDefinitions,
  FieldValidationError,
  DependencyCycleError,
}
