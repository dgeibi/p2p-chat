#!/usr/bin/env node

const builder = require('electron-builder')
const commonConfig = require('../package').build

const { Platform } = builder

const createConfig = arch =>
  Object.assign({}, commonConfig, {
    win: {
      target: [
        {
          arch,
          target: 'portable',
        },
        {
          arch,
          target: 'nsis',
        },
      ],
    },
    portable: {
      artifactName: `\${productName}-portable-win-\${version}-${arch}.\${ext}`,
    },
    nsis: {
      artifactName: `\${productName}-win-installer-\${version}-${arch}.\${ext}`,
    },
  })

const arch = process.argv[2] || 'ia32'

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: createConfig(arch),
})
