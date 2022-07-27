const { Pho, FieldValidationError, DependencyCycleError } = require('../')

describe('Builtin Field validators tests', function () {
  it('should fail parsing when a required field is missing', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()

    expect(() => {
      const result = pho.parse({
        foo: 10,
      })
    }).toThrow()

    expect(
      pho.parse({
        first: 10,
      })
    ).toStrictEqual({ first: 10 })
  })

  it('should fail parsing when a wrong choice is given when "oneOf" validator is used', function () {
    const pho = new Pho()

    pho.field('name', 'string', 'The name').required().oneOf('Neo', 'Trinity')
    pho.field('optional', 'string', 'Optional name').oneOf('Luke', 'Anakin')

    expect(() => {
      const result = pho.parse({
        name: 'Mr Smith',
      })
    }).toThrow()

    expect(() => {
      const result = pho.parse({
        name: 'Mr Smith',
        optional: 'Darth Vader',
      })
    }).toThrow()

    expect(
      pho.parse({
        name: 'Neo',
      })
    ).toStrictEqual({ name: 'Neo' })
    expect(
      pho.parse({
        name: 'Neo',
        optional: 'Luke',
      })
    ).toStrictEqual({ name: 'Neo', optional: 'Luke' })
  })

  it('should fail parsing when an excluded field exists', function () {
    const pho = new Pho()

    pho.field('name', 'string', 'The name').oneOf('Neo', 'Trinity')
    pho.field('age', 'integer', 'The Age')
    pho.field('snob', 'string', 'Excluder field name').excludes('name', 'age')

    expect(() => {
      const result = pho.parse({
        name: 'Neo',
        snob: 'snobby',
      })
    }).toThrow()

    expect(() => {
      const result = pho.parse({
        age: 20,
        snob: 'snobby',
      })
    }).toThrow()
    expect(() => {
      const result = pho.parse({
        name: 'Trinity',
        age: 20,
        snob: 'snobby',
      })
    }).toThrow()
    expect(
      pho.parse({
        snob: 'snobby',
      })
    ).toStrictEqual({ snob: 'snobby' })
    expect(
      pho.parse({
        name: 'Neo',
        age: 20,
      })
    ).toStrictEqual({ name: 'Neo', age: 20 })
  })

  it('should fail parsing when a dependsOn field is missing', function () {
    const pho = new Pho()

    pho.field('name', 'string', 'The name').oneOf('Neo', 'Trinity')
    pho.field('age', 'integer', 'The Age')
    pho.field('dependor', 'string', 'Depend field name').dependsOn('name', 'age')

    expect(() => {
      const result = pho.parse({
        dependor: 'i depend on 2 fields',
      })
    }).toThrow()

    expect(() => {
      const result = pho.parse({
        name: 'Neo',
        dependor: 'i depend on 2 fields',
      })
    }).toThrow()

    expect(() => {
      const result = pho.parse({
        age: 20,
        dependor: 'i depend on 2 fields',
      })
    }).toThrow()

    expect(
      pho.parse({
        name: 'Trinity',
        age: 10,
        dependor: 'this is valid',
      })
    ).toStrictEqual({
      name: 'Trinity',
      age: 10,
      dependor: 'this is valid',
    })
  })

  it('should fail parsing when a custom validator throws an error', function () {
    const pho = new Pho()

    function tweetLengthMatch(field, fieldValue, tweet) {
      if (tweet.length !== fieldValue) {
        throw new FieldValidationError(`The tweetLength field should match the length of text in the 'tweet' field`)
      }
    }

    pho.field('tweet', 'string', 'the tweet text').required()
    pho
      .field('tweetLength', 'integer', 'The length of the tweet')
      .validate('tweet should match tweet field length', tweetLengthMatch, ['tweet'])

    const TEST = 'i am a test tweet'
    expect(() => {
      const result = pho.parse({
        tweet: TEST,
        tweetLength: TEST.length + 1,
      })
    }).toThrow(FieldValidationError)

    const result = pho.parse({
      tweet: TEST,
      tweetLength: TEST.length,
    })
  })

  it('should output a deprecation message when deprecated field is passed', function () {
    const pho = new Pho()

    function tweetLengthMatch(field, fieldValue, tweet) {
      if (tweet.length !== fieldValue) {
        throw new FieldValidationError(`The tweetLength field should match the length of text in the 'tweet' field`)
      }
    }

    let msg = null
    pho.field('oldField', 'string', 'an old field').deprecated({
      alternativeFieldName: 'newField',
      output: (...text) => {
        msg = text
      },
    })
    pho.field('newField', 'string', 'a new field')

    const result = pho.parse({
      oldField: 'old field value',
    })
    expect(msg).not.toBe(null)
    expect(msg.includes('oldField')).toBe(true)
    expect(msg.includes('newField')).toBe(true)
  })
})

describe('Field dependency tests', function () {
  it('should correctly parse when field modifier depends on sibling fields', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()
    pho.field('second', 'number', 'Second number').required()
    pho
      .field('sum', 'number', 'Sum of first and second')
      .modify('sum', (field, value, first, second) => first + second, ['first', 'second'])
    pho
      .field('difference', 'number', 'Difference between second and first')
      .modify('difference', (field, value, first, second) => second - first, ['first', 'second'])

    const result = pho.parse({
      first: 10,
      second: 20,
    })

    expect(result).toStrictEqual({
      first: 10,
      second: 20,
      sum: 30,
      difference: 20 - 10,
    })
  })

  it('should correctly parse when field modifier depends on parent fields', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()
    pho.field('second', 'number', 'Second number').required()

    const calcs = pho.category('calculations', 'Calculation results')
    calcs
      .field('multiply', 'number', 'multiplication result of first and second')
      .modify('multiply', (field, value, first, second) => first * second, ['first', 'second'])
    calcs
      .field('product', 'number', 'product of first divided by second')
      .modify('product', (field, value, first, second) => first / second, ['first', 'second'])

    const result = pho.parse({
      first: 10,
      second: 20,
    })

    expect(result).toStrictEqual({
      first: 10,
      second: 20,
      calculations: {
        multiply: 20 * 10,
        product: 10 / 20,
      },
    })
  })

  it('should correctly parse when field modifier depends on common ancestor fields', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()
    pho.field('second', 'number', 'Second number').required()

    const calcs = pho.category('calculations', 'Calculation results')
    calcs
      .field('sum', 'number', 'Sum of first and second')
      .modify('sum', (field, value, first, second) => first + second, ['first', 'second'])

    const stats = pho.category('statistics', 'Number statistics')
    stats
      .field('avg', 'number', 'average of the first and second')
      .modify('avg', (field, value, sum) => sum / 2, ['calculations.sum'])

    const result = pho.parse({
      first: 10,
      second: 20,
    })

    expect(result).toStrictEqual({
      first: 10,
      second: 20,
      calculations: {
        sum: 20 + 10,
      },
      statistics: {
        avg: (20 + 10) / 2,
      },
    })
  })

  it('should fail if two fields depend on each other', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').dependsOn('second')
    pho.field('second', 'number', 'Second number').dependsOn('first')

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 20,
      })
    }).toThrow(DependencyCycleError)
  })

  it('should fail if there is a dependency cycle between more than 2 fields', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').greaterThan('second')
    pho.field('second', 'number', 'Second number').greaterThan('third')
    pho.field('third', 'number', 'Third number').greaterThan('first')

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 20,
        third: 30,
      })
    }).toThrow(DependencyCycleError)
  })
})

describe('Field bultiin range validator tests', function () {
  it('should fail to parse if lowerThan is used and value is greater than constant', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()
    pho.field('second', 'number', 'Second number').lowerThan(10)

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 20,
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 10,
      })
    }).toThrow(FieldValidationError)
  })

  it('should fail to parse if lowerThanOrEqualTo is used and value is greater than constant', function () {
    const pho = new Pho()

    pho.field('value', 'number', 'value number').lowerThanOrEqualTo(10)

    expect(() => {
      const result = pho.parse({
        value: 20,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: 10,
      })
    ).toStrictEqual({ value: 10 })

    expect(
      pho.parse({
        value: 5,
      })
    ).toStrictEqual({ value: 5 })
  })

  it('should fail to parse if greaterThan is used and value is lower than constant', function () {
    const pho = new Pho()

    pho.field('value', 'number', 'value number').greaterThan(10)

    expect(() => {
      const result = pho.parse({
        value: 5,
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        value: 10,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: 20,
      })
    ).toStrictEqual({ value: 20 })
  })

  it('should fail to parse if greaterThanOrEqualTo is used and value is lower than constant', function () {
    const pho = new Pho()

    pho.field('value', 'number', 'value number').greaterThanOrEqualTo(10)

    expect(() => {
      const result = pho.parse({
        value: 5,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: 10,
      })
    ).toStrictEqual({ value: 10 })

    expect(
      pho.parse({
        value: 20,
      })
    ).toStrictEqual({ value: 20 })
  })

  it('should fail to parse if inRangeOf is used and value is outside the range in constants', function () {
    const pho = new Pho()

    pho.field('value', 'number', 'value in range').inRangeOf(10, 20)

    expect(() => {
      const result = pho.parse({
        value: 25,
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        value: 5,
      })
    }).toThrow(FieldValidationError)

    // check upper bound exclusivity
    expect(() => {
      const result = pho.parse({
        value: 20,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        value: 15,
      })
    ).toStrictEqual({ value: 15 })
  })

  it('should fail to parse if lowerThan is used and value is greater than other field', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()
    pho.field('second', 'number', 'Second number').lowerThan('first')

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 20,
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 10,
      })
    }).toThrow(FieldValidationError)
  })

  it('should fail to parse if lowerThanOrEqualTo is used and value is greater than other field', function () {
    const pho = new Pho()

    pho.field('second', 'number', 'Second number').lowerThanOrEqualTo('first')
    pho.field('first', 'number', 'First number').required()

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 20,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        first: 10,
        second: 10,
      })
    ).toStrictEqual({ first: 10, second: 10 })
  })

  it('should fail to parse if greaterThan is used and value is lower than other field', function () {
    const pho = new Pho()

    pho.field('first', 'number', 'First number').required()
    pho.field('second', 'number', 'Second number').greaterThan('first')

    expect(() => {
      const result = pho.parse({
        first: 20,
        second: 10,
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        first: 10,
        second: 10,
      })
    }).toThrow(FieldValidationError)
  })

  it('should fail to parse if greaterThanOrEqualTo is used and value is lower than other field', function () {
    const pho = new Pho()

    pho.field('second', 'number', 'Second number').greaterThanOrEqualTo('first')
    pho.field('first', 'number', 'First number').required()

    expect(() => {
      const result = pho.parse({
        first: 20,
        second: 10,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        first: 10,
        second: 10,
      })
    ).toStrictEqual({ first: 10, second: 10 })
  })

  it('should fail to parse if inRangeOf is used and value is outside the range given by other fields', function () {
    const pho = new Pho()

    pho.field('lower', 'number', 'lower bound').required()
    pho.field('upper', 'number', 'upper bound').greaterThan('lower')
    pho.field('value', 'number', 'value in range').inRangeOf('lower', 'upper')

    expect(() => {
      const result = pho.parse({
        lower: 10,
        upper: 20,
        value: 25,
      })
    }).toThrow(FieldValidationError)

    expect(() => {
      const result = pho.parse({
        lower: 10,
        upper: 20,
        value: 5,
      })
    }).toThrow(FieldValidationError)

    expect(
      pho.parse({
        lower: 10,
        upper: 20,
        value: 15,
      })
    ).toStrictEqual({ lower: 10, upper: 20, value: 15 })
  })
})
