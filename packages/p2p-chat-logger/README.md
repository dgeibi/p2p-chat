# logger

a wrapper of `chalk`

## Install

```
$ npm install -S dgeibi/logger
```

## Usage

``` js
const logger = require('logger');

logger.error(Error('something wrong'));
```

## Methods

- `logger.log`: `console.log`
- `logger.warn`: yellow
- `logger.error`: red
- `logger.err`: red
- `logger.info`: green
- `logger.debug`: blue
- `logger.verbose`: cyan

## LICENSE

[MIT](LICENSE)
