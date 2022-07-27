const { Category } = require('./category')
const { FieldLogic } = require('./field-logic')
const { FieldType } = require('./field-type')
const { loadDefinitions } = require('./definition-loader')
const { FieldValidationError, DependencyCycleError } = require('./errors')

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
