"use strict";

var http = require("request");
var fs = require("fs");

var Execution = global.ExecutionClass;

class httpExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(values) {
    var _this = this;
    var endOptions = {end: "end"};

    if(values.agentOptions) {
      try {
        if (values.agentOptions.ca_file)   values.agentOptions.ca   = fs.readFileSync(values.agentOptions.ca_file);
        if (values.agentOptions.cert_file) values.agentOptions.cert = fs.readFileSync(values.agentOptions.cert_file);
        if (values.agentOptions.pfx_file)  values.agentOptions.pfx  = fs.readFileSync(values.agentOptions.pfx_file);
      }
      catch(err) {
        endOptions.end = "error";
        endOptions.messageLog = err;
        endOptions.execute_err_return = err;
        endOptions.execute_return = err;
        _this.end(endOptions);
      }
    }

    var req = http(values, function (err, response, body) {
      if (err) {
        endOptions.end = "error";
        endOptions.messageLog = err;
        endOptions.execute_err_return = err;
        endOptions.execute_return = err;
        _this.end(endOptions);
      }

      endOptions.end = "end";
      endOptions.execute_return = body;
      _this.end(endOptions);
    });

    if(values.method === "POST" || values.method === "PUT"){
      if(values.files){
        var form = req.form();
        let filesLength = values.files.length;
        for(let i=0; i < filesLength; i++){
          form.append(values.files[i].name, fs.createReadStream(values.files[i].path));
        }
      }
    }
  }

}

module.exports = httpExecutor;