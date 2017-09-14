#!/usr/bin/env node

const { renameSync, existsSync } = require('fs')
const { resolve, join } = require('path')
const commonConfig = require('../package').build
const builder = require('electron-builder')

const Platform = builder.Platform

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

const ensureOld = (BASE_DIR, name) => {
  const oldPath = join(BASE_DIR, name)
  if (existsSync(oldPath)) {
    renameSync(oldPath, join(BASE_DIR, `${name}.old`))
  }
}

const DIST_DIR = resolve(__dirname, '../dist')
if (existsSync(DIST_DIR)) {
  ensureOld(DIST_DIR, 'linux-unpacked')
  ensureOld(DIST_DIR, 'win-ia32-unpacked')
  ensureOld(DIST_DIR, 'win-ia32')
}

const arch = process.argv[2] || 'ia32'

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: createConfig(arch),
})
