import rootLogger from './root-logger'
import { Field } from './field'
import { ArrayField } from './array-field'
import { InvalidFieldNameError, CategoryIsFieldError } from './errors'
import { PhoContext } from './context'
import debug from 'debug'
import { TypeName } from './types'

function ensureValidName(name: string) {
  if (name.indexOf('.') !== -1) {
    throw new InvalidFieldNameError(`Dots ('.') are not allowed in field names`)
  }
}

function createFullPath(parentFullPath: string | null, name: string): string {
  if (parentFullPath) {
    return `${parentFullPath}.${name}`
  }
  return name
}

export class Category {
  phoContext: PhoContext
  name: string | null
  fullPath: string | null
  description: null | string
  log: debug.Debugger

  constructor(
    phoContext: null | PhoContext = null,
    name: string | null = null,
    fullPath: string | null = null,
    description: string | null = null
  ) {
    this.phoContext = phoContext ?? new PhoContext()
    this.name = name // null means root
    this.fullPath = fullPath
    this.description = description // null means root

    this.log = rootLogger.extend(fullPath ?? 'Pho')
  }

  field<T>(name: string, type: TypeName, description: string, defaultValue: T) {
    ensureValidName(name)
    const childFullPath = createFullPath(this.fullPath, name)
    if (this.phoContext.definitions[childFullPath]) {
      return this.phoContext.definitions[childFullPath]
    }
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

  category(name: string, description: string, cb: ((cat: Category) => void) | null = null) {
    ensureValidName(name)
    const childFullPath = createFullPath(this.fullPath, name)

    if (this.phoContext.definitions[childFullPath]) {
      if (!(this.phoContext.definitions[childFullPath] instanceof Category)) {
        throw new CategoryIsFieldError(
          `Tried to define ${childFullPath} as category, but is already defined as something else`
        )
      }
      if (!this.phoContext.definitions[childFullPath].description && description) {
        this.phoContext.definitions[childFullPath].description = description
      }
    } else {
      this.log('Adding new Category(', name, ',', childFullPath, ',', description, ')')
      this.phoContext.definitions[childFullPath] = new Category(this.phoContext, name, childFullPath, description)
      this.phoContext.schema.addEdge(this.fullPath ?? '__root', childFullPath)
    }
    if (cb) {
      cb(this.phoContext.definitions[childFullPath])
    }

    return this.phoContext.definitions[childFullPath]
  }

  array(name: string, description: string, defaultValue: any[]) {
    ensureValidName(name)
    const childFullPath = createFullPath(this.fullPath, name)
    if (this.phoContext.definitions[childFullPath]) {
      return this.phoContext.definitions[childFullPath]
    }
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

  flattenByDefinitions(config: Record<string, any>): Record<string, any> {
    const fetchField = (fullPath: string) => {
      let current: Field<any> | Record<string, any> = config
      for (const part of fullPath.split('.')) {
        if (current === undefined) {
          break
        }
        current = (current as Record<string, any>)[part]
      }
      return current as any
    }

    let flattenConfig: Record<string, Field<any>> = {}
    for (const fieldFullPath of this.phoContext.schema.topologicalSort([this.fullPath ?? '__root'], false)) {
      flattenConfig[fieldFullPath] = fetchField(fieldFullPath)
    }
    return flattenConfig
  }

  unflattenByDefinitions() {
    let result: any = {}

    const setField = (fullPath: string, definition: any, value: any) => {
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

  parse(config: object) {
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
  describe(): Record<string, DecriptionRow> {
    let result: Record<string, DecriptionRow> = {}
    for (const [fieldName, fieldDefinition] of Object.entries(this.phoContext.definitions)) {
      const row: DecriptionRow = {
        description: fieldDefinition.description,
        type: fieldDefinition.type,
      }
      if (fieldDefinition.defaultValue !== undefined) {
        row.defaultValue = fieldDefinition
      }
      result[fieldName] = row
    }
    return result
  }

  serializeDependencyGraph() {
    return this.phoContext.serialize()
  }
}

export type DecriptionRow = { description: string; type: TypeName; defaultValue?: any }
