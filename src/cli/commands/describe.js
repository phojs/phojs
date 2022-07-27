const yargs = require('yargs')
const pho = require('../../../')

const { FSDefinitionLoader } = require('../../definition-loader')

exports.command = 'describe'
exports.describe = 'Outputs a description of all registered configuration fields'

exports.builder = (yargs) => {
  yargs.option('d', {
    alias: 'rootDir',
    describe: 'Path to root directory to search for .pho.js files',
    default: process.cwd(),
  })
}

exports.handler = (argv) => {
  console.log('Loading .pho.js files from', argv.rootDir)
  const loader = new FSDefinitionLoader(argv.rootDir)
  const loadedModulesAmount = loader.loadSync()
  console.log('Loaded', loadedModulesAmount, 'template files')

  console.log(pho.describe())
  yargs.exit(1)
}
