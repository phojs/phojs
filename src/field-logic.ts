import type { Field } from './field'

export type FieldFuncWithArgs = (field: Field<any>, fieldValue: any, args: any[], ...dependencies: any[]) => any
export type FieldFuncNoArgs = (field: Field<any>, fieldValue: any, ...dependencies: any[]) => any
export type FieldFunc = FieldFuncWithArgs | FieldFuncNoArgs

export class FieldLogic {
  name: string
  fn: FieldFunc
  args: any[]
  dependsOn: string[]
  dependenciesRequired: boolean

  constructor(
    name: string,
    fn: FieldFunc,
    args: any[] = [],
    dependantFieldNames: string[] = [],
    dependenciesRequired = false
  ) {
    this.name = name
    this.fn = fn
    this.args = args

    this.dependsOn = dependantFieldNames
    this.dependenciesRequired = dependenciesRequired
  }

  run(field: Field<any>, fieldValue: any, ...dependencies: any[]): any {
    if (Array.isArray(this.args) && this.args.length === 0) {
      return (this.fn as FieldFuncNoArgs)(field, fieldValue, ...dependencies)
    }
    return (this.fn as FieldFuncWithArgs)(field, fieldValue, this.args, ...dependencies)
  }
}
