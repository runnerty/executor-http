# HTTP executor for [Runnerty]:

### Configuration sample:
```json
{
  "id": "shell_default",
  "type": "runnerty-executor-http"
}
```

### Plan sample:
```json
{
  "id":"http_default",
  "headers":{"User-Agent": "runnerty"},
  "method":"GET",
  "uri":"https://api.github.com/search/repositories",
  "qs":{"q": "runnerty"},
  "json": true
}
```

```json
{
  "id":"http_default",
  "headers":{"User-Agent": "runnerty"},
  "method":"GET",
  "uri":"https://api.twitter.com/1.1/users/show.json",
  "oauth":
    { "consumer_key": "...",
      "consumer_secret": "...",
      "token": "...",
      "token_secret": "..."
    },
  "qs":{"screen_name": "runnerty"},
  "json": true
}
```

```json
{
  "id":"http_default",
  "headers":{"User-Agent": "runnerty"},
  "uri":"http://www.sample.com/form",
  "method":"POST",
  "form": {
    "key1": "value1",
    "key2": "value2"
  },
  "json": true
}
```

```json
{
  "id":"http_default",
  "headers":{"User-Agent": "runnerty"},
  "uri":"http://www.sample.com/uploadfile",
  "method":"POST",
  "files":[{"name":"fileOne", "path":"/var/myfile.txt"},
           {"name":"fileTwo", "path":"/var/www/runnerty.jpg"}],
  "json": true
}
```


[Runnerty]: http://www.runnerty.io