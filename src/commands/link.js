'use strict'
const lnk = require('lnk')
const rimraf = require('rimraf')

const path = require('path')
const getContext = require('../lib/getContext')
const glob = require('glob-promise')

module.exports = async function install (args, flags, opts, cb) {
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
      .then(packagesArr => {
        const symLinkList = packagesArr[0].reduce(
          (acc, linkPath, idx, arr) =>
            acc.concat(
              arr.filter(p => p !== linkPath).map(p => {
                const repoPathArr = linkPath.split(path.sep)
                const repoName = repoPathArr[repoPathArr.length - 1]
                return [
                  {
                    fullPath: linkPath,
                    repoName
                  },
                  {
                    fullPath: path.resolve(p, 'node_modules/'),
                    repoName
                  }
                ]
              })
            ),
          []
        )

        const create = symLinkList.map(list => {
          rimraf.sync(path.resolve(list[1].fullPath, list[1].repoName), {}, e =>
            console.log('path delete failed >>> ', e)
          )
          lnk(list[0].fullPath, list[1].fullPath, e =>
            console.log('lnk symlink failed >>> ', e)
          )
        })

        return Promise.all(create)
          .then(() => console.log('successfully created symlinks'))
          .catch(e => console.error('uh oh, symlinking failed... ', e))
      })
      .then(() => {
        cb(null)
      })
      .catch(cb)
  } catch (err) {
    cb(err)
  }
}
