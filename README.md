# DECOMPRESS executor for [Runnerty]:

Requires tar, unzip, gunzip, 7z and rar CLI tools to be installed in the SO.

### Configuration sample:
```json
{
  "id": "decompress_default",
  "type": "@runnerty-executor-decompress"
}
```

### Plan sample:
```json
{
  "id": "decompress_default",
  "compress_file": "./input.zip",
  "decompress_dir": "./"
}
```


[Runnerty]: http://www.runnerty.io
