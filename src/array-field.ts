import { Field } from './field'
import { FieldValidationError, InvalidFieldTypeError } from './errors'
import { FieldType } from './field-type'
import { IField } from './types'
import { PhoContext } from './context'

export class ArrayFieldType extends FieldType {
  constructor() {
    super('ArrayField', (field: IField, fieldValue: any) => {
      if (!Array.isArray(fieldValue)) {
        throw new InvalidFieldTypeError(`Expected ${field.fullPath} to be an array, but its ${typeof fieldValue}`)
      }
    })
  }
}

export class ArrayField extends Field<any> {
  constructor(phoContext: PhoContext, name: string, fullPath: string, description: string , defaultValue: any[]) {
    super(phoContext, name, fullPath, new ArrayFieldType(), description, defaultValue)
  }

  minimumLength(minLength: number) {
    this.validate('minimum length', (field: Field<any>, fieldValue: any[]) => {
      if (fieldValue.length < minLength) {
        throw new FieldValidationError(`Expected minimum length of ${minLength} but got ${fieldValue.length}`)
      }
    })
  }

  exclusiveMinimumLength(minLength: number) {
    this.validate('exclusive minimum length', (field: Field<any>, fieldValue: any[]) => {
      if (fieldValue.length <= minLength) {
        throw new FieldValidationError(`Expected exclusive minimum length of ${minLength} but got ${fieldValue.length}`)
      }
    })
  }

  maximumLength(maxLength: number) {
    this.validate('maximum length', (field: Field<any>, fieldValue: any) => {
      if (fieldValue.length > maxLength) {
        throw new FieldValidationError(`Expected maximum length of ${maxLength} but got ${fieldValue.length}`)
      }
    })
  }

  exclusiveMaximumLength(maxLength: number) {
    this.validate('exclusive maximum length', (field: Field<any>, fieldValue: any) => {
      if (fieldValue.length >= maxLength) {
        throw new FieldValidationError(`Expected exclusive maximum length of ${maxLength} but got ${fieldValue.length}`)
      }
    })
  }
}
