#!/usr/bin/env node

const process = require('process')
const yargs = require('yargs/yargs')

async function main() {
  const res = await yargs(process.argv.slice(2))
    .commandDir('./commands/')
    .example('$0 describe ~/git/project', 'Load all .pho.js files and output a detailed description')
    .example(
      '$0 validate config.json',
      'Load all .pho.js files starting from CWD and then validate config.json file against it'
    )
    .demandCommand(1)
    .strict()
    .help()
    .wrap(null).argv

  return res
}

main().catch((error) => {
  console.error(error)
})
