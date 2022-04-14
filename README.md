<p align="center">
  <a href="http://runnerty.io">
    <img height="257" src="https://runnerty.io/assets/header/logo-stroked.png">
  </a>
  <p align="center">Smart Processes Management</p>
</p>

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]
<a href="#badge">
<img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
</a>

# Executor for [Runnerty]: HTTP

### Installation:

Through NPM

```bash
npm i @runnerty/executor-http
```

You can also add modules to your project with [runnerty]

```bash
npx runnerty add @runnerty/executor-http
```

This command installs the module in your project, adds example configuration in your [config.json] and creates an example plan of use.

If you have installed [runnerty] globally you can include the module with this command:

```bash
runnerty add @runnerty/executor-http
```

### Configuration sample:

Add in [config.json]:

```json
{
  "id": "http_default",
  "type": "@runnerty-executor-http"
}
```

### Plan sample:

Add in [plan.json]:

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty" },
  "method": "get",
  "url": "https://api.github.com/search/repositories",
  "params": { "q": "runnerty" },
  "responseType": "json"
}
```

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty" },
  "url": "http://www.sample.com/form",
  "method": "post",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "responseType": "json",
  "withCredentials": true
}
```

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty" },
  "url": "http://www.sample.com/uploadfile",
  "method": "post",
  "files": [
    { "name": "fileOne", "path": "/var/myfile.txt" },
    { "name": "fileTwo", "path": "/var/www/runnerty.jpg" }
  ],
  "responseType": "json",
  "returnHeaderDataOutput": true
}
```

```json
{
  "id": "http_default",
  "headers": { "User-Agent": "runnerty", "Content-Type": "application/xml" },
  "method": "post",
  "url": "https://sample.com/api-sample",
  "auth": {
    "username": "@GV(MY_USER_AUTH)",
    "password": "@GV(MY_PASS_AUTH)"
  },
  "data": "@GV(SAMPLE_BODY)"
}
```

### Pagination:

It is possible to make calls to APIs that return `JSON` data that requires paging. The parameters available for paging are.

| Parameter                      | Description                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| start                          | page from which the query is initiated, by default 1                                                 |
| limit                          | maximum elements per page                                                                            |
| pages                          | total pages to consult                                                                               |
| total                          | total items for automatic page calculation                                                           |
| total_from_header              | header from which to get the total of items for automatic page calculation                           |
| total_from_response            | params path of the response data from which to get the total of items for automatic page calculation |
| next_page_url_from_response    | params path of the response data from which to get the url for the next page                         |
| token.query_param_name         | name of parameter to send in url query with token of next page                                       |
| token.data_param_name          | name of the parameter to be sent in the body with the token of next page                             |
| token.next_token_from_response | params path of the response data from which to get the next page token                               |
| token.next_token_from_header   | params path of the header data from which to get the next page token                                 |

Some paginations examples:

```json
{
  "id": "http_default",
  "method": "get",
  "url": "https://endpoint.sample.com/items",
  "pagination": {
    "limit": "2000",
    "total_from_header": "x-total-items"
  },
  "responseType": "json",
  "responseToFile": "/var/www/data/sample.json",
  "noReturnDataOutput": true
}
```

```json
{
  "id": "http_default",
  "method": "get",
  "url": "https://endpoint.sample.com/items",
  "pagination": {
    "limit": "2000",
    "next_page_url_from_response": "paging.nextPage"
  },
  "responseType": "json",
  "responseToFile": "/var/www/data/sample.json",
  "noReturnDataOutput": true
}
```

```json
{
  "id": "http_default",
  "method": "get",
  "url": "https://endpoint.sample.com/items",
  "pagination": {
    "limit": "2000",
    "token": {
      "next_token_from_response": "paging.continuationToken",
      "query_param_name": "nextPageToken"
    }
  },
  "responseType": "json",
  "responseToFile": "/var/www/data/sample.json",
  "noReturnDataOutput": true
}
```

### Output (Process values):

- `PROCESS_EXEC_DATA_OUTPUT`: Response output data.
  It is possible to return the header response in dataoutput by activating the `returnHeaderDataOutput (boolean)` parameter
- `EXTRA_DATA`: If the response is a `JSON` it is possible to work with the parsed values of the response using the `"responseType": "json"` parameter. If we receive for example:

```json
{
  "planet": {
    "name": "Mars",
    "satellites": [
      {
        "name": "phobos"
      },
      {
        "name": "deimos"
      }
    ]
  }
}
```

It is possible to access the values by ([GETVALUE] function):
`PROCESS_EXEC_PLANET_NAME`: "Mars", `PROCESS_EXEC_PLANET_NAME_SATELLITES_1_NAME`:"phobos"

- `PROCESS_EXEC_ERR_OUTPUT`: Error output message.

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

[runnerty]: https://www.runnerty.io
[downloads-image]: https://img.shields.io/npm/dm/@runnerty/executor-http.svg
[npm-url]: https://www.npmjs.com/package/@runnerty/executor-http
[npm-image]: https://img.shields.io/npm/v/@runnerty/executor-http.svg
[david-badge]: https://david-dm.org/runnerty/executor-http.svg
[david-badge-url]: https://david-dm.org/runnerty/executor-http
[getvalue]: http://docs.runnerty.io/functions/
[config.json]: http://docs.runnerty.io/config/
[plan.json]: http://docs.runnerty.io/plan/
