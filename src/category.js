const rootLogger = require('./root-logger')
const { Field } = require('./field')
const { ArrayField } = require('./array-field')
const { InvalidFieldNameError, DuplicateDefinitionError } = require('./errors')
const { FSDefinitionLoader } = require('./definition-loader')
const { PhoContext } = require('./context')


function ensureValidName(name) {
  if (name.indexOf('.') !== -1) {
    throw new InvalidFieldNameError(`Dots ('.') are not allowed in field names`)
  }
}

function ensureNameNotDuplicate(obj, name, typeName) {
  if (obj) {
    throw new DuplicateDefinitionError(
        `Tried to define ${name} as ${typeName}, but it is already defined as something else`
    )
  }
}

function createFullPath(parentFullPath, name) {
  if (parentFullPath) {
    return `${parentFullPath}.${name}`
  }
  return name
}

class Category {
  constructor(phoContext = null, name = null, fullPath = null, description = null) {
    this.phoContext = phoContext ?? new PhoContext()
    this.name = name // null means root
    this.fullPath = fullPath
    this.description = description // null means root

    this.log = rootLogger.extend(fullPath ?? 'Pho')
  }

  field(name, type, description, defaultValue) {
    ensureValidName(name)
    const childFullPath = createFullPath(this.fullPath, name)

    ensureNameNotDuplicate(this.phoContext.definitions[childFullPath], name, Field)

    this.log('Adding new Field(', name, ',', childFullPath, ',', type, ',', description, ',', defaultValue, ')')
    this.phoContext.definitions[childFullPath] = new Field(
      this.phoContext,
      name,
      childFullPath,
      type,
      description,
      defaultValue
    )
    this.phoContext.schema.addEdge(this.fullPath ?? '__root', childFullPath)
    return this.phoContext.definitions[childFullPath]
  }

  category(name, description, cb = null) {
    ensureValidName(name)
    const childFullPath = createFullPath(this.fullPath, name)
    ensureNameNotDuplicate(this.phoContext.definitions[childFullPath], name, Category)

    this.log('Adding new Category(', name, ',', childFullPath, ',', description, ')')
    this.phoContext.definitions[childFullPath] = new Category(this.phoContext, name, childFullPath, description)
    this.phoContext.schema.addEdge(this.fullPath ?? '__root', childFullPath)

    if (cb) {
      cb(this.phoContext.definitions[childFullPath])
    }

    return this.phoContext.definitions[childFullPath]
  }

  array(name, description, defaultValue) {
    ensureValidName(name)
    const childFullPath = createFullPath(this.fullPath, name)
    ensureNameNotDuplicate(this.phoContext.definitions[childFullPath], name, ArrayField)

    this.log('Adding new Array(', name, ',', childFullPath, ',', description, ',', defaultValue, ')')
    this.phoContext.definitions[childFullPath] = new ArrayField(
      this.phoContext,
      name,
      childFullPath,
      description,
      defaultValue
    )
    this.phoContext.schema.addEdge(this.fullPath ?? '__root', childFullPath)
    return this.phoContext.definitions[childFullPath]
  }

  flattenByDefinitions(config) {
    const fetchField = (fullPath) => {
      let current = config
      for (const part of fullPath.split('.')) {
        if (current === undefined) {
          break
        }
        current = current[part]
      }
      return current
    }

    let flattenConfig = {}
    for (const fieldFullPath of this.phoContext.schema.topologicalSort([this.fullPath ?? '__root'], false)) {
      flattenConfig[fieldFullPath] = fetchField(fieldFullPath)
    }
    return flattenConfig
  }

  unflattenByDefinitions() {
    let result = {}

    const setField = (fullPath, definition, value) => {
      let current = result
      const parts = fullPath.split('.')
      const lastPart = parts.slice(-1)[0]
      for (const part of parts.slice(0, -1)) {
        if (current === undefined) {
          break
        }
        current = current[part]
      }
      if (definition instanceof Category) {
        current[lastPart] = {}
      } else {
        if (value !== undefined) {
          current[lastPart] = value
        }
      }
    }

    for (const fieldFullPath of this.phoContext.schema.topologicalSort([this.fullPath ?? '__root'], false)) {
      setField(fieldFullPath, this.phoContext.definitions[fieldFullPath], this.phoContext.getFieldValue(fieldFullPath))
    }
    return result
  }

  parse(config) {
    this.log('Parsing', config)
    this.phoContext.ensureNoDependencyCycles()

    const flatKeyValueData = this.flattenByDefinitions(config)
    this.log('Flattened', flatKeyValueData)

    const parsingLogger = this.log.extend('parser')
    for (const fieldName of this.phoContext.dependencyGraph.topologicalSort([this.fullPath ?? '__root'], false)) {
      if (this.phoContext.definitions[fieldName] instanceof Field) {
        parsingLogger('Parsing', fieldName, flatKeyValueData[fieldName])
        const result = this.phoContext.definitions[fieldName].parse(flatKeyValueData[fieldName])
        this.phoContext.setFieldValue(fieldName, result) // make the field available to other field's validators / modifiers
        parsingLogger('Got', result)
      }
    }

    return this.unflattenByDefinitions()
  }

  /**
   * Returns an object filled with field definitions full paths and their descriptions with default values
   */

  describe() {
    let result = {}
    for (const [fieldName, fieldDefinition] of Object.entries(this.phoContext.definitions)) {
      const row = {
        description: fieldDefinition.description,
      }
      if (fieldDefinition.type !== undefined) { // currently, category has no type
        row.type = fieldDefinition.type
      }
      if (fieldDefinition.defaultValue !== undefined) {
        row.defaultValue = fieldDefinition.defaultValue
      }
      result[fieldName] = row
    }
    return result
  }

  serializeDependencyGraph() {
    return this.phoContext.serialize()
  }
}

module.exports = {
  Category,
}
