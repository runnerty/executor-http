'use strict';

const http = require('request-promise-native');
const fs = require('fs');

const Execution = global.ExecutionClass;

class httpExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(values) {
    let _this = this;
    let endOptions = { end: 'end' };

    if (values.agentOptions) {
      try {
        if (values.agentOptions.ca_file)
          values.agentOptions.ca = fs.readFileSync(values.agentOptions.ca_file);
        if (values.agentOptions.cert_file)
          values.agentOptions.cert = fs.readFileSync(
            values.agentOptions.cert_file
          );
        if (values.agentOptions.pfx_file)
          values.agentOptions.pfx = fs.readFileSync(
            values.agentOptions.pfx_file
          );
      } catch (err) {
        endOptions.end = 'error';
        endOptions.messageLog = err;
        endOptions.err_output = err;
        _this.end(endOptions);
      }
    }

    if (values.files) {
      values.formData = {};
      for (const file of values.files) {
        values.formData[file.name] = {
          value: fs.createReadStream(file.path),
          options: {
            filename: file.name
          }
        };
      }
    }

    if (values.responseToFile) {
      values.encoding = values.encoding || 'binary';
    }

    http(values)
      .then(body => {
        if (values.json) {
          endOptions.extra_output = body;
        }

        if (values.responseToFile) {
          let writeStream = fs.createWriteStream(values.responseToFile);
          writeStream.write(body, 'binary');
          writeStream
            .on('finish', () => {
              endOptions.end = 'end';
              endOptions.data_output = !values.noReturnDataOutput ? body : '';
              _this.end(endOptions);
            })
            .on('error', err => {
              endOptions.end = 'error';
              endOptions.messageLog = err;
              endOptions.err_output = err;
              _this.end(endOptions);
            });
          writeStream.end();
        } else {
          endOptions.end = 'end';
          endOptions.data_output = !values.noReturnDataOutput ? body : '';
          _this.end(endOptions);
        }
      })
      .catch(err => {
        endOptions.end = 'error';
        endOptions.messageLog = err;
        endOptions.err_output = err;
        _this.end(endOptions);
      });
  }
}

module.exports = httpExecutor;
