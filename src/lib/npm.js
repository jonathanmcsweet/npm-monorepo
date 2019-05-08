'use strict'
// const path = require('path')
const findConfig = require('find-config')
const spawn = require('./spawn')

const SUPPORTED_COMMANDS = ['install', 'publish', 'link']

exports.cmd = function cmd (dirPath, command, flags, opts) {
  if (SUPPORTED_COMMANDS.indexOf(command) === -1) {
    return Promise.reject(new Error(`Unsupported npm command: ${command}`))
  }

  const pkgPath = findConfig('package.json', { cwd: dirPath })

  if (!pkgPath) {
    return Promise.resolve() // not a package
  }

  const pkg = findConfig.require('package.json', { cwd: dirPath })

  const params = Object.keys(flags).reduce((arr, key) => {
    arr.push(`--${key}`, flags[key])
    return arr
  }, [])

  console.log('cmd spawn', dirPath)
  return spawn(pkg.name, 'npm', [command].concat(params), {
    cwd: dirPath,
    quiet: opts.quiet
  })
}

exports.run = function run (script, dirPath, opts) {
  const pkgPath = findConfig('package.json', { cwd: dirPath })

  if (!pkgPath) return Promise.resolve() // not a package

  const pkg = findConfig.require('package.json', { cwd: dirPath })

  if (!pkg.scripts || !pkg.scripts[script]) return Promise.resolve() // not a script

  console.log('run spawn')
  return spawn(pkg.name, 'npm', ['run', script], {
    cwd: dirPath,
    quiet: opts.quiet
  })
}

exports.test = function test (dirPath, opts) {
  const pkgPath = findConfig('package.json', { cwd: dirPath })

  if (!pkgPath) return Promise.resolve() // not a package

  const pkg = findConfig.require('package.json', { cwd: dirPath })

  if (!pkg.scripts || !pkg.scripts.test) return Promise.resolve() // not a script

  console.log('test spawn')
  return spawn(pkg.name, 'npm', ['test'], {
    cwd: dirPath,
    quiet: opts.quiet
  })
}
