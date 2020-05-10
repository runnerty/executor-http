'use strict';
const http = require('http');
const https = require('https');
const axios = require('axios');
const formData = require('form-data');
const qs = require('qs');
const fs = require('fs');

const Execution = global.ExecutionClass;

class httpExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(values) {
    let endOptions = { end: 'end' };

    // HTTPS-Agent
    if (values.httpsAgent) {
      try {
        const httpsAgentParams = values.httpsAgent;
        if (httpsAgentParams.key_file) httpsAgentParams.key = fs.readFileSync(httpsAgentParams.key_file);
        if (httpsAgentParams.ca_file) httpsAgentParams.ca = fs.readFileSync(httpsAgentParams.ca_file);
        if (httpsAgentParams.cert_file) httpsAgentParams.cert = fs.readFileSync(httpsAgentParams.cert_file);
        if (httpsAgentParams.pfx_file) httpsAgentParams.pfx = fs.readFileSync(httpsAgentParams.pfx_file);

        const httpsAgentOptions = {
          servername: httpsAgentParams.servername,
          passphrase: httpsAgentParams.passphrase,
          ca: httpsAgentParams.ca,
          cert: httpsAgentParams.cert,
          key: httpsAgentParams.key,
          pfx: httpsAgentParams.pfx,
          maxCachedSessions: httpsAgentParams.maxCachedSessions
        };
        values.httpsAgent = new https.Agent(httpsAgentOptions);
      } catch (err) {
        endOptions.end = 'error';
        endOptions.messageLog = err;
        endOptions.err_output = err;
        this.end(endOptions);
      }
    }

    // HTTP-Agent
    if (values.httpAgent) {
      try {
        values.httpAgent = new http.Agent(values.httpAgent);
      } catch (err) {
        endOptions.end = 'error';
        endOptions.messageLog = err;
        endOptions.err_output = err;
        this.end(endOptions);
      }
    }

    // FILES FORM
    if (values.files && (values.method === 'post' || values.method === 'put')) {
      const form = new formData();
      let filesLength = values.files.length;
      for (let i = 0; i < filesLength; i++) {
        form.append(values.files[i].name, fs.createReadStream(values.files[i].path));
      }
      values.data = form;
      const formHeaders = form.getHeaders();
      values.headers = { ...formHeaders, ...values.headers };
    }

    // PARAMS-SERIALIZER
    if (values.paramsSerializerOptions) {
      const paramsSerializerOptions = values.paramsSerializerOptions;
      values.paramsSerializer = params => {
        return qs.stringify(params, paramsSerializerOptions);
      };
    }

    axios(values)
      .then(response => {
        endOptions.end = 'end';
        endOptions.data_output = response.data;
        this.end(endOptions);
      })
      .catch(err => {
        endOptions.end = 'error';
        endOptions.messageLog = err;
        endOptions.err_output = err;
        this.end(endOptions);
      });
  }
}

module.exports = httpExecutor;
