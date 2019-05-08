'use strict'

const commands = require('./commands')

function printUsage () {
  // eslint-disable-next-line no-console
  console.log(`
  simple-monorepo [command] [options]

  Options:
  --access <public|restricted>
  --quiet

  Commands:

  - install
  - publish
  - run
  - test
  - clean
`)
}

module.exports = function simpleMonorepo (args, flags, opts, cb) {
  const command = args.shift()

  if (!command) {
    printUsage()
    cb(null)
  } else if (commands[command]) {
    commands[command](args, flags, opts, err => {
      if (err) {
        cb(err)
      } else {
        cb(null)
      }
    })
  } else {
    cb(new Error(`Unknown command: ${command}`))
  }
}
