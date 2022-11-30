import { FieldLogic } from './field-logic'

export class FieldType extends FieldLogic {
  toString() {
    return this.constructor.name
  }
}
