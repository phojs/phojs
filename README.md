<div align="center">

![phojs logo](https://user-images.githubusercontent.com/2085411/181236639-0d528c9a-141d-47c4-94a7-eef5677eb836.png)
# Phở
### <i>The super-tasty configuration framework</i>

Allows you to define configuration declaratively together with supercharged validation and flexability.
  
Inspired by the popular python libraries [flag](https://abseil.io/docs/python/guides/flags), and [cerberus](https://github.com/pyeve/cerberus).

</div>


## Installation

```shell
# Using NPM
npm install phojs

# If you fancy yarn
yarn add phojs
```

## Examples

#### Basic

```javascript
const pho = require('phojs')

pho.create(async (root) => {
  root.field('firstname', 'string', 'Your first name').required()
  root.field('lastname', 'string', 'Your last name').required()
  root.field('nickname', 'string', 'Your nickname')
    .required()
    .oneOf('Neo', 'Morpheus', 'Trinity')
  root.field('age', 'number', 'Your age')

  root.category('measurements', 'Body Measurements', (measurements) => {
    measurements.field('height', 'number', 'Your height in centimeters')
    measurements.field('weight', 'number', 'Your weight in kilograms')
  })
})

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

Fields can have validators and modifiers attached to them. 
pho provides some basic ones, but you can write your own of course :)

These validators/modifiers can depend on other fields to in order to work, so they we will called with their dependencies are arguments.
_Note_:
Modifiers are run before validators.

```javascript
const {pho, FieldValidationError} = require('phojs')

pho.create((root) => {
  root.field('first', 'number', 'First number').required()
  root.field('second', 'number', 'Second number').required()

  root.category('calculations', 'Calculation results', (calculations) => {
    calculations
      .field('sum', 'number', 'Sum of first and second')
      .modify('sum', (field, value, first, second) => first + second, ['first', 'second']) // sum field needs both first and second to make sense
      .validate('ensure upper bound', (field, value) => {
        if (value > 1000){
          throw new FieldValidationError(`Sum is too big (value=${value})`)
        }
      })
  })

  root.category('statistics', 'Number statistics', (stats) => {
    stats.field('avg', 'number', 'average of the first and second')
      .modify('avg', (field, value, sum) => sum / 2, ['calculations.sum'])
    })
  })
})


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
$ yarn test
```
