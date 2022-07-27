const {
  MissingRequiredFieldError,
  InvalidChoiceSelectedError,
  ExcludedFieldError,
  InvalidFieldTypeError,
  FieldValidationError,
} = require('./errors')

function required(field, fieldValue, isRequired) {
  if (isRequired && fieldValue === undefined) {
    throw new MissingRequiredFieldError(`Missing required field '${field.fullPath}'`)
  }
}

function oneOf(field, fieldValue, supportedChoices) {
  if (fieldValue === undefined) {
    // we need to support undefined fields
    return
  }
  if (!supportedChoices.includes(fieldValue)) {
    throw new InvalidChoiceSelectedError(
      `Field '${field.fullPath}' has value ${fieldValue} but only ${supportedChoices} are accepted`
    )
  }
}

function excludeFields(field, fieldValue, excludedFields) {
  if (fieldValue === undefined) {
    // means value was not given
    return
  }
  for (const excludedField of excludedFields) {
    const value = field.phoContext.getFieldValue(excludedField)
    if (value !== undefined) {
      throw new ExcludedFieldError(`Field '${field.fullPath}' excludes field '${excludedField}' (${value})`)
    }
  }
}

function deprecated(field, fieldValue, { alternativeFieldName, output }) {
  if (fieldValue === undefined) {
    return
  }
  if (alternativeFieldName) {
    output("Field '", field.fullPath, "' is DEPRECATED! use '", alternativeFieldName, "' instead")
    return
  }
  output("Field '", field.fullPath, "' is DEPRECATED")
}

function typeValidation(field, fieldValue, typeName) {
  if (fieldValue === undefined) {
    return
  }
  if (typeName.toLowerCase() === 'integer') {
    if (!Number.isInteger(fieldValue)) {
      throw new InvalidFieldTypeError(
        `Expected field '${field.fullPath}' to be 'integer', but it isnt (value=${fieldValue})`
      )
    }
  } else {
    if (typeName !== typeof fieldValue) {
      throw new InvalidFieldTypeError(
        `Expected field '${field.fullPath}' to be '${typeName}', but it is a '${typeof fieldValue}'`
      )
    }
  }
}

function dependsOn(field, fieldValue, fieldNames) {
  if (fieldValue !== undefined) {
    for (const fieldName of fieldNames) {
      const value = field.phoContext.getFieldValue(fieldName)
      if (value === undefined) {
        throw new FieldValidationError(`Field '${field.fullPath}' depends on field '${fieldName}' but its undefined`)
      }
    }
  }
}

function lowerThanOrEqualTo(field, fieldValue, inclusiveUpperBound) {
  if (fieldValue > inclusiveUpperBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be lower or equal to ${inclusiveUpperBound}`)
  }
}

function lowerThan(field, fieldValue, exclusiveUpperBound) {
  if (fieldValue >= exclusiveUpperBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be lower than ${exclusiveUpperBound}`)
  }
}

function greaterThanOrEqualTo(field, fieldValue, inclusiveLowerBound) {
  if (fieldValue < inclusiveLowerBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be greater or equal to ${inclusiveLowerBound}`)
  }
}

function greaterThan(field, fieldValue, exclusiveLowerBound) {
  if (fieldValue <= exclusiveLowerBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be greater than ${exclusiveLowerBound}`)
  }
}

module.exports = {
  required,
  oneOf,
  dependsOn,
  excludeFields,
  typeValidation,
  deprecated,
  lowerThan,
  greaterThanOrEqualTo,
  greaterThan,
  lowerThanOrEqualTo,
}
