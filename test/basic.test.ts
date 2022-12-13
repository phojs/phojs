import { Pho } from '../src'
import { TypeName } from '../src/types'


describe('Basic Tests', function () {
  test('should parse a simple, single level configuration with fields only', function () {
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

  test.each([
    ['string' as TypeName, 123],
    ['number' as TypeName, 'foo'],
    ['boolean' as TypeName, 444],
    ['integer' as TypeName, 'bla'],
    ['integer' as TypeName, 123.4],
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

  test('should successfuly parse a config file with a category', function () {
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

  test('should parse a simple with default value', function () {
    const pho = new Pho()

    pho.field('firstname', 'string', 'Your first name', 'Anakin')
    pho.field('lastname', 'string', 'Your last name', 'Skywalker')
    pho.field('age', 'number', 'Your age', 20)
    pho.array('hobbies', 'Your hobbies', 'string', ['the force', 'lightsabers', 'death stars'])

    const expected = {
      firstname: 'Anakin',
      lastname: 'Skywalker',
      age: 20,
      hobbies: ['the force', 'lightsabers', 'death stars'],
    }

    expect(pho.parse({})).toStrictEqual(expected)
    expect(pho.parse({ firstname: 'Luke' })).toStrictEqual({ ...expected, firstname: 'Luke' })
  })

  test('should parse a an array with a given schema', function () {
    const pho = new Pho()

    pho.field('name', 'string', 'Your name')
    pho.field('age', 'number', 'Your age', 30)
    pho.categoryArray('hobbies', 'Your hobbies', (hobbies) => {
      hobbies.field('name', 'string', 'Hobby name').required().oneOf('dancing', 'running', 'fishing')
      hobbies.field('type', 'string', 'Hobby type', 'light')
    })

    const test = {
      name: 'anton',
      hobbies: [{ name: 'running', type: 'physical'},{ name: 'dancing', type: 'physical'}, {name: 'fishing'}],
    }
    const expected = {
      name: 'anton',
      age: 30,
      hobbies: [{ name: 'running', type: 'physical'},{ name: 'dancing', type: 'physical'}, {name: 'fishing', type: 'light'}],
    }
    expect(pho.parse(test)).toStrictEqual(expected)
  })
})
