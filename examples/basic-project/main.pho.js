const pho = require('phojs')

const main = pho.category('basic', '')
main.field('name', 'string', 'project name').required()
main.field('version', 'number', 'project version(inc float)', 1)