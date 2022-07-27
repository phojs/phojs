const { Pho, FieldValidationError } = require('../')

describe('Builtin ArrayField validators tests', function () {
  it('should fail parsing when a array length is higher than maximumLength', function () {
    const pho = new Pho()
    pho.array('value', 'our test array').required().maximumLength(3)
    expect(() => {
      const result = pho.parse({
        value: [1, 2, 3, 4],
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: [1, 2],
      })
    ).toStrictEqual({ value: [1, 2] })
    expect(
      pho.parse({
        value: [1, 2, 3],
      })
    ).toStrictEqual({ value: [1, 2, 3] })
  })

  it('should fail parsing when a array length is higher or equal to exclusiveMaximumLength', function () {
    const pho = new Pho()
    pho.array('value', 'our test array').required().exclusiveMaximumLength(3)
    expect(() => {
      const result = pho.parse({
        value: [1, 2, 3, 4],
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        value: [1, 2, 3],
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: [1, 2],
      })
    ).toStrictEqual({ value: [1, 2] })
  })

  it('should fail parsing when a array length is lower than minimumLength', function () {
    const pho = new Pho()
    pho.array('value', 'our test array').required().minimumLength(5)
    expect(() => {
      const result = pho.parse({
        value: [1, 2, 3, 4],
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: [1, 2, 3, 4, 5],
      })
    ).toStrictEqual({ value: [1, 2, 3, 4, 5] })
    expect(
      pho.parse({
        value: [1, 2, 3, 4, 5, 6],
      })
    ).toStrictEqual({ value: [1, 2, 3, 4, 5, 6] })
  })

  it('should fail parsing when a array length is lower or equal to exclusiveMinimumLength', function () {
    const pho = new Pho()
    pho.array('value', 'our test array').required().exclusiveMinimumLength(5)
    expect(() => {
      const result = pho.parse({
        value: [1, 2, 3, 4],
      })
    }).toThrow(FieldValidationError)
    expect(() => {
      const result = pho.parse({
        value: [1, 2, 3, 4, 5],
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: [1, 2, 3, 4, 5, 6],
      })
    ).toStrictEqual({ value: [1, 2, 3, 4, 5, 6] })
  })
})
