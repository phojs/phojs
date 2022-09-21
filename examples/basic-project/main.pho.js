const pho = require('phojs')

const main = pho.category('basic params', '')
main.field('name', 'string', 'project name')
main.field('version', 'number', 'project version(inc float)', 1)