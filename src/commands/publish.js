'use strict'

const findConfig = require('find-config')
const path = require('path')
const npm = require('../lib/npm')
const getContext = require('../lib/getContext')
const glob = require('glob-promise')

module.exports = function publish (args, flags, opts, cb) {
  const pkgPath = findConfig('package.json', { cwd: opts.cwd })

  if (!pkgPath) return cb(new Error('Could not find package.json'))

  try {
    const ctx = getContext(opts.cwd)

    Promise.all(
      ctx.config.packages.map(relativePackagesPattern => {
        const packagesPattern = path.resolve(
          ctx.rootPath,
          relativePackagesPattern
        )

        return glob(packagesPattern)
      })
    )
      .then(filesArr => {
        const files = filesArr.reduce((arr, f) => arr.concat(f), [])

        return Promise.all(
          files.map(dirPath => {
            return npm.cmd(dirPath, 'publish')
          })
        )
      })
      .then(() => {
        cb(null)
      })
      .catch(cb)
  } catch (err) {
    cb(err)
  }
}
