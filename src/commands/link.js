'use strict'
const lnk = require('lnk')
const rimraf = require('rimraf')
const { modelPackagesArray, mapPackagesPattern } = require('../lib/helpers')
const getContext = require('../lib/getContext')
const fs = require('fs')

module.exports = async function link (args, flags, opts, cb) {

  const eitherFilterPred = args.includes('--all')

  const eitherFilter =
    eitherFilterPred
    ?
    // Filter nothing
    x => x
    :
    // Filter only items already found in node_modules
    links =>
      fs.readdirSync(links.destPath).includes(links.repoName)

  try {
    const ctx = getContext(opts.cwd)
    Promise.all(
      ctx.config.packages
      .map(mapPackagesPattern(ctx)))
      .then(packagesArr => {
        const symLinkList =
          modelPackagesArray(packagesArr[0])
          .filter(eitherFilter)

        const create = symLinkList.map(list => {
          rimraf.sync(list.linkPath, {}, e =>
            console.log('path delete failed! >>> ', e))

          lnk(list.srcPath, list.destPath, e =>
            console.log('lnk symlink failed! >>> ', e))
        })

        return Promise.all(create)
      })
      .then(() => {
        eitherFilterPred && console.warn('forcing symlinks for all packages, beware of unusual behavior...')
        console.log('successfully created symlinks')
      })
      .catch(cb)
  } catch (err) {
    cb(err)
  }
}
