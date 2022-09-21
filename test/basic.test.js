const { Pho } = require('../')

describe('Basic Tests', function () {
  it('should parse a simple, single level configuration with fields only', function () {
    const pho = new Pho()

    pho.field('firstname', 'string', 'Your first name')
    pho.field('lastname', 'string', 'Your last name')
    pho.field('age', 'number', 'Your age')
    pho.array('hobbies', 'Your hobbies')

    const validConfig = {
      firstname: 'Kaladin',
      lastname: 'Stormblessed',
      age: 20,
      hobbies: ['fighting', 'stormlight', 'flying', 'sticking things'],
    }

    const result = pho.parse(validConfig)
    expect(result).toStrictEqual(validConfig)
  })

  it.each([
    ['string', 123],
    ['number', 'foo'],
    ['boolean', 444],
    ['integer', 'bla'],
    ['integer', 123.4],
  ])('should fail if given an wrong type value in field with type "%s"', function (builtinType, fieldValue) {
    const pho = new Pho()
    pho.field('test-field', builtinType, 'test field')

    const validConfig = {
      'test-field': fieldValue,
    }

    expect(() => {
      const result = pho.parse(validConfig)
    }).toThrow()
  })

  it('should successfuly parse a config file with a category', function () {
    const pho = new Pho()

    pho.field('firstname', 'string', 'Your first name')
    pho.field('lastname', 'string', 'Your last name')
    pho.field('age', 'number', 'Your age')

    const measurements = pho.category('measurements', 'Body Measurements')
    measurements.field('height', 'number', 'Your height in centimeters')
    measurements.field('weight', 'number', 'Your weight in kilograms')

    const validConfig = {
      firstname: 'Kaladin',
      lastname: 'Stormblessed',
      age: 20,
      measurements: {
        height: 170,
        weight: 70,
      },
    }

    const result = pho.parse(validConfig)
    expect(result).toStrictEqual(validConfig)
  })

  it('should parse a simple with default value', function () {
    const pho = new Pho()

    pho.field('firstname', 'string', 'Your first name', 'Anakin')
    pho.field('lastname', 'string', 'Your last name', 'Skywalker')
    pho.field('age', 'number', 'Your age', 20)
    pho.array('hobbies', 'Your hobbies', ['the force', 'lightsabers', 'death stars'])

    const expected = {
      firstname: 'Anakin',
      lastname: 'Skywalker',
      age: 20,
      hobbies: ['the force', 'lightsabers', 'death stars'],
    }

    expect(pho.parse({})).toStrictEqual(expected)
    expect(pho.parse({ firstname: 'Luke' })).toStrictEqual({ ...expected, firstname: 'Luke' })
  })

  test('field and category cannot have the same name', () => {
    const pho = new Pho()

    pho.field('a')
    expect(() => pho.category('a')).toThrow()

    pho.category('b')
    expect(() => pho.field('b')).toThrow()

    pho.array('c')
    expect(() => pho.field('c')).toThrow()

    // sanity
    pho.field('d')
    expect(() => pho.array('e')).not.toThrow()
  })
})
