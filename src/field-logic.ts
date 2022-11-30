import type { Field } from "./field"

export type FieldFunc = (field: Field<any>, fieldValue: any, args?: any[], ...dependencies: any[]) => void

export class FieldLogic {
  name: string
  dependenciesRequired: boolean
  fn: FieldFunc 
  args: any[]
  dependsOn: string[]

  constructor(name: string, fn: FieldFunc, args: any[] = [], dependsOn: string[] = [], dependenciesRequired = false) {
    this.name = name
    this.fn = fn
    this.args = args

    this.dependsOn = dependsOn
    this.dependenciesRequired = dependenciesRequired
  }

  run(field: Field<any>, fieldValue: any, ...dependencies:any[]) {
    if (Array.isArray(this.args) && this.args.length === 0) {
      return this.fn(field, fieldValue, ...dependencies)
    }
    return this.fn(field, fieldValue, this.args, ...dependencies)
  }
}