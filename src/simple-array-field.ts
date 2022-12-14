import { Field } from './field'
import { FieldValidationError, InvalidFieldTypeError } from './errors'
import { FieldType } from './field-type'
import { IField, TypeName} from './types'
import { PhoContext } from './context'
import {typeValidation} from "./validation-functions";
import {Category} from "./category";


export class ArrayFieldType extends FieldType {
  constructor(type: TypeName | Category | null) {
    const isCategory = type instanceof Category
    const arrayType = isCategory ? 'Category' : 'Simple'
    const name = arrayType + 'ArrayField'

    super(name, (field: IField, fieldValue: any) => {
      if (!Array.isArray(fieldValue)) {
        throw new InvalidFieldTypeError(`Expected ${field.fullPath} to be an array, but its ${typeof fieldValue}`)
      }

      if (isCategory || type == null) {
        return
      }

      for (const arrayEntry of fieldValue) {
        typeValidation(field, arrayEntry, type as TypeName)
      }
    })
  }
}

export class SimpleArrayField extends Field<any> {
  constructor(phoContext: PhoContext, name: string, fullPath: string, description: string, typeName: TypeName | null, defaultValue?: any[]) {
    super(phoContext, name, fullPath, new ArrayFieldType(typeName), description, defaultValue)
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

export class CategoryArrayField extends SimpleArrayField {
  category: Category
  constructor(phoContext: PhoContext, name: string, fullPath: string, description: string, type: Category, defaultValue?: any[]) {
    super(phoContext, name, fullPath, description, null, defaultValue)
    this.category = type
  }

  parse(value) {
    const parsedArray: any[] = []
    for (const entry of value) {
      parsedArray.push(this.category.parse(entry))
    }
    return parsedArray
  }
}