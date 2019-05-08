'use strict'
// const createSymlink = require('create-symlink')
// const {realpath} = require('fs').promises;
// const symlinkDir = require('symlink-dir')

// const Lnf = require('lnf')
const rimraf = require('rimraf')
const { symlink } = require('fs')

const path = require('path')
// const npm = require('../lib/npm')
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

        console.log('symLinkList >>', symLinkList)

        const create = symLinkList.map(list => {
          // IO side effects
          // console.log(`deleting >>> ${path.resolve(list[1].fullPath, list[1].repoName)}`)
          console.log('deleting folder before creating symlinks')
          rimraf.sync(path.resolve(list[1].fullPath, list[1].repoName), {}, e =>
            console.log('path delete failed >>>', e)
          )
          symlink(list[0].fullPath, list[1].fullPath, e =>
            console.log('symlink', e)
          )
        })

        return Promise.all(create)
      })
      .then(() => {
        cb(null)
      })
      .catch(cb)
  } catch (err) {
    cb(err)
  }

  // await createSymlink('/where/file/exists', 'where/to/create/symlink')
  // await realpath('where/to/create/symlink')
}
