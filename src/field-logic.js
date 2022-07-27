class FieldLogic {
  constructor(name, fn, args = [], dependsOn = [], dependenciesRequired = false) {
    this.name = name
    this.fn = fn
    this.args = args
    this.dependsOn = dependsOn
    this.dependenciesRequired = dependenciesRequired
  }

  run(field, fieldValue, ...dependencies) {
    if (Array.isArray(this.args) && this.args.length === 0) {
      return this.fn(field, fieldValue, ...dependencies)
    }
    return this.fn(field, fieldValue, this.args, ...dependencies)
  }
}

module.exports = {
  FieldLogic,
}
