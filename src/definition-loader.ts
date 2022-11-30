import process from 'process'
import { fdir } from 'fdir'
import rootLogger from './root-logger'

export class FSDefinitionLoader {
  appRoot: any
  extensions: string[]
  log: any
  constructor(appRoot: null | string = null, extensions = ['pho.js']) {
    this.appRoot = appRoot ?? process.env.PHO_APP_ROOT
    this.extensions = Array.isArray(extensions) ? extensions : [extensions]
    this.log = rootLogger.extend(this.constructor.name)
  }

  loadSync() {
    const crawler = new fdir()
      .withFullPaths()
      .filter((path, isDirectory) => !isDirectory)
      .filter((path, isDirectory) => {
        for (const ext of this.extensions) {
          if (path.endsWith(ext)) {
            return true
          }
        }
        this.log('skipping', path)
        return false
      })
      .crawl(this.appRoot)

    let total = 0
    // for (const filename of crawler.sync()) {
    //   this.log('Loading module', filename)
    //   const module = require(filename)
    //   total += 1
    // }
    return total
  }
}

export function loadDefinitions() {
  const fsLoader = new FSDefinitionLoader()
  fsLoader.loadSync()
}