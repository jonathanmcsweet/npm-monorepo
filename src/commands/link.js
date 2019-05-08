'use strict'
const lnk = require('lnk')
const rimraf = require('rimraf')
const { modelPackagesArray, mapPackagesPattern } = require('../lib/helpers')
const getContext = require('../lib/getContext')

module.exports = async function install (args, flags, opts, cb) {
  try {
    const ctx = getContext(opts.cwd)
    Promise.all(
      ctx.config.packages
      .map(mapPackagesPattern(ctx)))
      .then(packagesArr => {
        const symLinkList = modelPackagesArray(packagesArr[0])

        const create = symLinkList.map(list => {
          rimraf.sync(list.linkPath, {}, e =>
            console.log('path delete failed! >>> ', e))

          lnk(list.srcPath, list.destPath, e =>
            console.log('lnk symlink failed! >>> ', e))
        })

        return Promise.all(create)
      })
      .then(() => console.log('successfully created symlinks'))
      .catch(cb)
  } catch (err) {
    cb(err)
  }
}
