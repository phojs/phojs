import { Category } from './category'
import { FieldLogic } from './field-logic'
import { FieldType } from './field-type'
import { loadDefinitions } from './definition-loader'
import { FieldValidationError, DependencyCycleError } from './errors'
import { TypeName } from './types'

const _globalRootInstance = new Category()

function create(cb: (root: Category) => void): Category {
  const root = new Category()
  cb(root)
  return root
}

const category = (name: string, description: string, cb: ((cat: Category) => void) | null = null) =>
  _globalRootInstance.category(name, description, cb)
function field<T>(name: string, type: TypeName, description: string, defaultValue: T) {
  return _globalRootInstance.field(name, type, description, defaultValue)
}
const array = (name: string, description: string, defaultValue: any[]) =>
  _globalRootInstance.array(name, description, defaultValue)
const describe = () => _globalRootInstance.describe()
const parse = (config: object) => _globalRootInstance.parse(config)

export {
  category,
  field,
  array,
  describe,
  parse,
  create,
  FieldLogic,
  FieldType,
  loadDefinitions,
  FieldValidationError,
  DependencyCycleError,
}
