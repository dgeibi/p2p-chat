#!/usr/bin/env node

const { writeFileSync, mkdirpSync } = require('fs-extra')
const { resolve, join } = require('path')
const { shellSync } = require('p2p-chat-utils/shell')
const commonConfig = require('../package').build

const createConfig = arch =>
  Object.assign({}, commonConfig, {
    win: {
      target: [
        {
          arch,
          target: 'portable',
        },
      ],
    },
    portable: {
      artifactName: `\${productName}-portable-win-\${version}-${arch}.\${ext}`,
    },
  })

const createFile = (arch) => {
  const distDir = resolve(__dirname, '../dist')
  mkdirpSync(distDir)

  const config = createConfig(arch)
  const filename = join(distDir, `/win-${arch}.json`)
  writeFileSync(filename, JSON.stringify(config))
  return filename
}

const arch = process.argv[2] || 'ia32'
const buildBin = resolve(__dirname, '../node_modules/.bin/build')
shellSync(`${buildBin} -w -c ${createFile(arch)}`)
