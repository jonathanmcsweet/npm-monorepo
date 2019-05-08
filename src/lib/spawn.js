'use strict'

const chalk = require('chalk')
const { spawn } = require('child_process')
const prefixedStream = require('./prefixedStream')

module.exports = function spawner (scope, script, args, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(script, args, { cwd: opts.cwd })

    if (!opts.quiet) {
      const stderr = prefixedStream.create({ prefix: chalk.red(scope) + ' ' })
      const stdout = prefixedStream.create({ prefix: chalk.green(scope) + ' ' })

      child.stderr.pipe(stderr).pipe(process.stderr)
      child.stdout.pipe(stdout).pipe(process.stdout)
    }

    child.on('exit', code => {
      console.log('child exit')

      if (code === 0) {
        if (!opts.quiet) {
          console.log(chalk.green(scope) + ' OK')
        }
        resolve()
      } else {
        const err = new Error(`Script failure`)
        if (!opts.quiet) {
          console.error(chalk.red(scope) + ' exit code #' + code)
        }
        err.code = code
        err.scope = scope
        reject(err)
      }
    })
  })
}
