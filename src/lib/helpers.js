const path = require('path')
const glob = require('glob-promise')

const modelPackagesArray = packagesArr =>
  packagesArr
  .reduce((acc, srcPath, idx, arr) =>
    acc.concat(
      arr
      .filter(p => p !== srcPath)
      .map(p => {
        const repoPathArr = srcPath.split(path.sep)
        const repoName = repoPathArr[repoPathArr.length - 1]
        const modulesPath = path.resolve(p, 'node_modules/')
        return {
            srcPath,
            repoName,
            destPath: modulesPath,
            linkPath: path.resolve(modulesPath, repoName),
          }
      })
    ), [])


const mapPackagesPattern = ctx => relativePackagesPattern =>
  glob(path.resolve(
    ctx.rootPath,
    relativePackagesPattern))

module.exports = {
  modelPackagesArray,
  mapPackagesPattern
}
