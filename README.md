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

# Executor for [Runnerty]: HTTP

### Configuration sample:
```json
{
  "id": "http_default",
  "type": "@runnerty-executor-http"
}
```

### Plan sample:
```json
{
  "id": "http_default",
  "headers": {"User-Agent": "runnerty"},
  "method": "get",
  "url": "https://api.github.com/search/repositories",
  "params":{"q": "runnerty"},
  "responseType": "json"
}
```

```json
{
  "id": "http_default",
  "headers": {"User-Agent": "runnerty"},
  "url": "http://www.sample.com/form",
  "method":"post",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "responseType": "json"
}
```

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty" },
  "url": "http://www.sample.com/uploadfile",
  "method": "post",
  "files":[{"name":"fileOne", "path":"/var/myfile.txt"},
           {"name":"fileTwo", "path":"/var/www/runnerty.jpg"}],
  "responseType": "json"
}
```

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty", "Content-Type": "application/xml" },
  "method": "post",
  "url": "https://sample.com/api-sample",
  "auth": {
    "user": "@GV(MY_USER_AUTH)",
    "pass": "@GV(MY_PASS_AUTH)"
  },
  "data": "@GV(SAMPLE_BODY)"
}
```

### Output (Process values):
* `PROCESS_EXEC_DATA_OUTPUT`: Response output data.
* `PROCESS_EXEC_ERR_OUTPUT`: Error output message.

### Other considerations

If the result is very large, you should consider using the "noReturnDataOutput" (boolean) property to prevent a large amount of data from entering memory and being interpreted by Runnerty, which could cause performance problems.

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty" },
  "method": "get",
  "url": "http://host.com/big_file.zip",
  "responseToFile": "/etc/runnerty/big_file.zip",
  "noReturnDataOutput": true
}
```

[Runnerty]: http://www.runnerty.io
[downloads-image]: https://img.shields.io/npm/dm/@runnerty/executor-http.svg
[npm-url]: https://www.npmjs.com/package/@runnerty/executor-http
[npm-image]: https://img.shields.io/npm/v/@runnerty/executor-http.svg
[david-badge]: https://david-dm.org/runnerty/executor-http.svg
[david-badge-url]: https://david-dm.org/runnerty/executor-http
