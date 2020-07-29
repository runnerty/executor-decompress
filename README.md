<p align="center">
  <a href="http://runnerty.io">
    <img height="257" src="https://runnerty.io/assets/header/logo-stroked.png">
  </a>
  <p align="center">A new way for processes managing</p>
</p>

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Dependency Status][david-badge]][david-badge-url]
<a href="#badge">
  <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
</a>

# Decompress executor for [Runnerty]:
Requires `tar`, `unzip`, `gunzip`, `7z` and `rar` CLI tools to be installed in the SO.

### Installation:
```bash
npm i @runnerty/executor-decompress
```

### Configuration sample:
Add in [config.json]:
```json
{
  "id": "decompress_default",
  "type": "@runnerty-executor-decompress"
}
```

### Plan sample:
Add in [plan.json]:
```json
{
  "id": "decompress_default",
  "compress_file": "./input.zip",
  "decompress_dir": "./"
}
```

```json
{
  "id": "decompress_default",
  "compress_file": "./input.7z",
  "decompress_dir": "./"
}
```

[Runnerty]: http://www.runnerty.io
[downloads-image]: https://img.shields.io/npm/dm/@runnerty/executor-decompress.svg
[npm-url]: https://www.npmjs.com/package/@runnerty/executor-decompress
[npm-image]: https://img.shields.io/npm/v/@runnerty/executor-decompress.svg
[david-badge]: https://david-dm.org/runnerty/executor-decompress.svg
[david-badge-url]: https://david-dm.org/runnerty/executor-decompress
[config.json]: http://docs.runnerty.io/config/
[plan.json]: http://docs.runnerty.io/plan/