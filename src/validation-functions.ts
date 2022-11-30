import {
  MissingRequiredFieldError,
  InvalidChoiceSelectedError,
  ExcludedFieldError,
  InvalidFieldTypeError,
  FieldValidationError,
} from './errors'
import type {Field} from './field'

export type TypeName = 'string' | 'number' | 'integer'

export function required<T>(field: Field, fieldValue: T, isRequired: boolean) {
  if (isRequired && fieldValue === undefined) {
    throw new MissingRequiredFieldError(`Missing required field '${field.fullPath}'`)
  }
}

export function oneOf<T>(field: Field, fieldValue: T, supportedChoices: T[]) {
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

export function excludeFields<T>(field: Field, fieldValue:T, excludedFields: string[]) {
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

export function deprecated<T>(field: Field, fieldValue: T, { alternativeFieldName, output } : {alternativeFieldName: string, output: (...msg: any[]) => void}) {
  if (fieldValue === undefined) {
    return
  }
  if (alternativeFieldName) {
    output("Field '", field.fullPath, "' is DEPRECATED! use '", alternativeFieldName, "' instead")
    return
  }
  output("Field '", field.fullPath, "' is DEPRECATED")
}

export function typeValidation<T>(field: Field, fieldValue: T, typeName: TypeName) {
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

export function dependsOn<T>(field: Field, fieldValue: T, fieldNames: string[]) {
  if (fieldValue !== undefined) {
    for (const fieldName of fieldNames) {
      const value = field.phoContext.getFieldValue(fieldName)
      if (value === undefined) {
        throw new FieldValidationError(`Field '${field.fullPath}' depends on field '${fieldName}' but its undefined`)
      }
    }
  }
}

export function lowerThanOrEqualTo<T>(field: Field, fieldValue: T, inclusiveUpperBound: T) {
  if (fieldValue > inclusiveUpperBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be lower or equal to ${inclusiveUpperBound}`)
  }
}

export function lowerThan<T>(field:Field, fieldValue: T , exclusiveUpperBound: T) {
  if (fieldValue >= exclusiveUpperBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be lower than ${exclusiveUpperBound}`)
  }
}

export function greaterThanOrEqualTo<T>(field: Field, fieldValue:T, inclusiveLowerBound: T) {
  if (fieldValue < inclusiveLowerBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be greater or equal to ${inclusiveLowerBound}`)
  }
}

export function greaterThan<T>(field:Field, fieldValue: T, exclusiveLowerBound:T) {
  if (fieldValue <= exclusiveLowerBound) {
    throw new FieldValidationError(`Field ${field.fullPath} needs to be greater than ${exclusiveLowerBound}`)
  }
}