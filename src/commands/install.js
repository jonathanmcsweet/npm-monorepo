'use strict'

const path = require('path')
const npm = require('../lib/npm')
const getContext = require('../lib/getContext')
const glob = require('glob-promise')

module.exports = function install (args, flags, opts, cb) {
  try {
    const ctx = getContext(opts.cwd)

    console.log('opts', opts)
    console.log('ctx', ctx)

    Promise.all(
      ctx.config.packages.map(relativePackagesPattern => {
        const packagesPattern = path.resolve(
          ctx.rootPath,
          relativePackagesPattern
        )

        console.log('packagesPattern', packagesPattern)
        return glob(packagesPattern)
      })
    )
      .then(filesArr =>
        Promise.all(
          filesArr
            .reduce((arr, f) => arr.concat(f), [])
            .map(dirPath =>
              npm.cmd(dirPath, 'install', {}, { quiet: flags.quiet })
            )
        )
      )
      .then(() => {
        cb(null)
      })
      .catch(cb)
  } catch (err) {
    cb(err)
  }
}
