import { Category } from './category'
import { FieldLogic } from './field-logic'
import { FieldType } from './field-type'
import { loadDefinitions } from './definition-loader'
import { FieldValidationError, DependencyCycleError } from './errors'

const _globalRootInstance = new Category()

function create(cb: (root: Category) => void): Category {
  const root = new Category()
  cb(root)
  return root
}

const category= (...args: any[]) => _globalRootInstance.category(...args)
const field= (...args: any[]) => _globalRootInstance.field(...args)
const array= (...args: any[]) => _globalRootInstance.array(...args)
const describe= () => _globalRootInstance.describe()
const parse= (...args: any[]) => _globalRootInstance.parse(...args)

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
