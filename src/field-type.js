const { FieldLogic } = require('./field-logic')

class FieldType extends FieldLogic {
  toString() {
    return this.constructor.name
  }
}

module.exports = {
  FieldType,
}
