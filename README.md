# Pho

## Overview

Pho allows you to define you configuration field declaratively alongside supercharged validation and flexability.
Inspired by the popular python library [flag](https://abseil.io/docs/python/guides/flags), and [cerberus](https://github.com/pyeve/cerberus).
Each module declares the configuration fields and categories it uses, which are registered to the global pho instance when they are imported.

## Installation

```shell
# Using NPM
npm install phojs

# If you fancy yarn
yarn add phojs
```

## Examples

#### Basic

Each module should require the 'phojs' and define the categories and fields it uses.

```javascript
const pho = require('phojs')

pho.field('firstname', 'string', 'Your first name').required()
pho.field('lastname', 'string', 'Your last name').required()
pho.field('nickname', 'string, 'Your nickname')
  .required().
  .oneOf('Neo', 'Morpheus', 'Trinity')
pho.field('age', 'number', 'Your age')

const measurements = pho.category('measurements', 'Body Measurements')
measurements.field('height', 'number', 'Your height in centimeters')
measurements.field('weight', 'number', 'Your weight in kilograms')

const validatedConfig = pho.parse({
  firstname: 'Kaladin',
  lastname: 'Stormblessed',
  nickname: 'Neo',
  measurements: {
    height: 170,
    weight: 70,
  },
})
```

#### Field Dependencies

Fields can have validators and modifiers attached to them. pho provides some basic ones,
but of course custom validators / modifiers are supported.
These validators/modifiers can depend on other fields to work, so they we will called with their dependencies are arguments.
_Note_:
Modifiers are run before validators.

```
const {pho, FieldValidationError} = require('phojs')

pho.field('first', 'number', 'First number').required()
pho.field('second', 'number', 'Second number').required()

const calcs = pho.category('calculations', 'Calculation results')
calcs
.field('sum', 'number', 'Sum of first and second')
  .modify('sum', (field, value, first, second) => first + second, ['first', 'second']) // sum needs both first and second to work
  .validate('ensure upper bound', (field, value) => {
    if (value > 1000){
      throw new FieldValidationError(`Sum is too big (value=${value})`)
    }
  })

const stats = pho.category('statistics', 'Number statistics')
stats.field('avg', 'number', 'average of the first and second')
  .modify('avg', (field, value, sum) => sum / 2, ['calculations.sum'])

const result = pho.parse({
  first: 10,
  second: 20,
})

// result will be
// {
//   first: 10,
//   second: 20,
//   calculations: {
//     sum: 20 + 10,
//   },
//   statistics: {
//     avg: (20 + 10) / 2,
//   },
// }
```

## Testing

```
# Clone the repo

# install dependencies
$ npm install

# or
$ yarn

# run tests
$ npm test
```
