const { Field } = require('./field')
const { FieldValidationError } = require('./errors')
const { FieldType } = require('./field-type')

class ArrayFieldType extends FieldType {
  constructor() {
    super('ArrayField', (field, fieldValue) => {
      if (!Array.isArray(fieldValue)) {
        throw new InvalidFieldTypeError(`Expected ${field.fullPath} to be an array, but its ${typeof fieldValue}`)
      }
    })
  }
}

class ArrayField extends Field {
  constructor(phoContext = null, name = null, fullPath = null, description = null, defaultValue) {
    super(phoContext, name, fullPath, new ArrayFieldType(), description, defaultValue)
  }

  minimumLength(minLength) {
    this.validate('minimum length', (field, fieldValue) => {
      if (fieldValue.length < minLength) {
        throw new FieldValidationError(`Expected minimum length of ${minLength} but got ${fieldValue.length}`)
      }
    })
  }

  exclusiveMinimumLength(minLength) {
    this.validate('exclusive minimum length', (field, fieldValue) => {
      if (fieldValue.length <= minLength) {
        throw new FieldValidationError(`Expected exclusive minimum length of ${minLength} but got ${fieldValue.length}`)
      }
    })
  }

  maximumLength(maxLength) {
    this.validate('maximum length', (field, fieldValue) => {
      if (fieldValue.length > maxLength) {
        throw new FieldValidationError(`Expected maximum length of ${maxLength} but got ${fieldValue.length}`)
      }
    })
  }

  exclusiveMaximumLength(maxLength) {
    this.validate('exclusive maximum length', (field, fieldValue) => {
      if (fieldValue.length >= maxLength) {
        throw new FieldValidationError(`Expected exclusive maximum length of ${maxLength} but got ${fieldValue.length}`)
      }
    })
  }
}

module.exports = {
  ArrayField,
}
