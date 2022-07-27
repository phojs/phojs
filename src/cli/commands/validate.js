const fs = require('fs')
const yargs = require('yargs')

const { FSDefinitionLoader } = require('../../definition-loader')
const pho = require('../../../')

exports.command = 'validate <config_file>'
exports.describe = 'Validate a configuration file'

exports.builder = (yargs) => {
  yargs.positional('config_file', {
    describe: 'configuration file path',
    type: 'string',
  })
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

  const config = JSON.parse(fs.readFileSync(argv.config_file, 'utf8'))
  const parsed = pho.parse(config)

  console.log('Configuration')
  console.log(parsed)
  yargs.exit(1)
}
