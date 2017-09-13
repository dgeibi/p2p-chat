#!/usr/bin/env node

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

const arch = process.argv[2] || 'ia32'
createConfig(arch)

// Promise is returned
builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: createConfig(arch),
})
