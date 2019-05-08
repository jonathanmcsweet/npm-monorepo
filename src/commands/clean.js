'use strict'
const rimraf = require('rimraf')
const { modelPackagesArray, mapPackagesPattern } = require('../lib/helpers')
const getContext = require('../lib/getContext')

module.exports = async function clean (args, flags, opts, cb) {
  try {
    const ctx = getContext(opts.cwd)
    Promise.all(
      ctx.config.packages
      .map(mapPackagesPattern(ctx)))
      .then(packagesArr => {

        const create =
          modelPackagesArray(packagesArr[0])
          .map(list => {
            rimraf.sync(list.destPath, {}, e =>
              console.log('node_modules delete failed! >>> ', e))
          })

        return Promise.all(create)

      })
      .then(() => console.log('successfully deleted node_modules'))
      .catch(e => console.error('uh oh, cleaning node_modules failed... ', e))
  } catch (err) {
    cb(err)
  }
}
