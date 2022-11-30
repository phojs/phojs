const pho = require('pho')

const types = ['integer', 'number', 'string', 'hostname', 'ip', 'array', 'object']
const customTypes = [pho.IPv4, pho.Array, pho.Hostname, pho.Port]

const validationFn = (field, fieldValue, ..dependencies) => {}
const modificationFn = (field, fieldValue, ...dependencies) => { /* return new value */ }

pho.field(name, type, description, default, validators=[pho.FieldLogic('logic name', validationFunc, [dependsOn])], modifiers=[])
  .required(cb)
  .choices('a','b','c')
  .validate('checkName', validationFn, dependsOn=['a.foo'])
  .modify('modifiernName', modificationFn, dependsOn=['a.foo']) // function that changes the field value
  .excludes('a.bar')

pho.category(name, description)
  .field(name, type, description, required, [pho.Func(validationFunc, [dependsOn])])

pho.serialize('json')
pho.loadDefinitions(extensions='pho.js')
pho.load('filename', type='json')
pho.loads('')
pho.help()


// TODO
// change phojs to work like this
pho.create(async (root) => {

  root.field('firstname', 'string', 'Your first name')
  root.field('lastname', 'string', 'Your last name')
  root.field('age', 'number', 'Your age')

  root.category('measurements', 'Body Measurements', async (measurements) =>{
    measurements.field('height', 'number', 'Your height in centimeters')
    measurements.field('weight', 'number', 'Your weight in kilograms')
  })

})
