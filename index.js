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
    this.pagination;
    this.dataResponse;
    this.values;
    this.endOptions = { end: 'end' };
  }

  async exec(values) {
    this.values = values;
    const httpParams = {
      url: values.url,
      method: values.method,
      headers: values.headers,
      params: values.params || {},
      data: values.data,
      timeout: values.timeout,
      withCredentials: values.withCredentials,
      auth: values.auth,
      responseType: values.responseType,
      responseEncoding: values.responseEncoding,
      xsrfCookieName: values.xsrfCookieName,
      xsrfHeaderName: values.xsrfHeaderName,
      maxContentLength: values.maxContentLength,
      maxBodyLength: values.maxBodyLength,
      maxRedirects: values.maxRedirects,
      socketPath: values.socketPath,
      proxy: values.proxy,
      decompress: values.decompress,
      files: values.files
    };

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
          maxCachedSessions: httpsAgentParams.maxCachedSessions,
          withCredentials: httpsAgentParams.withCredentials
        };
        httpParams.httpsAgent = new https.Agent(httpsAgentOptions);
      } catch (err) {
        this.endOptions.end = 'error';
        this.endOptions.messageLog = err;
        this.endOptions.err_output = err;
        this.end(this.endOptions);
      }
    }

    // HTTP-Agent
    if (values.httpAgent) {
      try {
        httpParams.httpAgent = new http.Agent(values.httpAgent);
      } catch (err) {
        this.endOptions.end = 'error';
        this.endOptions.messageLog = err;
        this.endOptions.err_output = err;
        this.end(this.endOptions);
      }
    }

    // FILES FORM
    if (values.files && (values.method === 'post' || values.method === 'put')) {
      const form = new formData();
      let filesLength = values.files.length;
      for (let i = 0; i < filesLength; i++) {
        form.append(values.files[i].name, fs.createReadStream(values.files[i].path));
      }
      httpParams.data = form;
      const formHeaders = form.getHeaders();
      httpParams.headers = { ...formHeaders, ...values.headers };
    }

    // PARAMS-SERIALIZER
    if (values.paramsSerializerOptions) {
      const paramsSerializerOptions = values.paramsSerializerOptions;
      httpParams.paramsSerializer = params => {
        return qs.stringify(params, paramsSerializerOptions);
      };
    }

    // RESPONSE TO FILE
    if (values.responseToFile && !values.pagination) {
      httpParams.responseEncoding = values.responseEncoding || 'binary';
      httpParams.responseType = 'stream';
    }

    // PAGINATION
    if (values.pagination) {
      // Initial page:
      httpParams.params.page = values.pagination.start || 1;
      // Limit items per page:
      if (values.pagination.limit) httpParams.params.limit = values.pagination.limit;
      this.pagination.pages = values.pagination.pages || 1;
      // If the total is indicated, the number of pages is calculated automatically:
      if (values.pagination.total) {
        this.pagination.total = values.pagination.total;
        if (values.pagination.limit && values.pagination.limit > 0) {
          this.pagination.pages = Math.ceil(this.pagination.total / values.pagination.limit);
        }
      }
      let latest = true;
      for (httpParams.params.page; httpParams.params.page <= this.pagination.pages; httpParams.params.page++) {
        latest = httpParams.params.page >= this.pagination.pages;
        await this.runHTTPAction(httpParams, latest);
      }
    } else {
      const latest = true;
      await this.runHTTPAction(httpParams, latest);
    }
  }

  getObjectValueFromPath(object, path) {
    try {
      return path.split('.').reduce((o, i) => o[i], object);
    } catch (error) {
      return undefined;
    }
  }

  async runHTTPAction(values, latest) {
    try {
      // HTTP call:
      const response = await axios(values);

      // Pagination:
      if (this.values.pagination) {
        if (!this.values.pagination.limit) this.values.pagination.limit = 100;

        // Total items from response:
        if (this.values.pagination.total_from_response) {
          const pages = Math.ceil(
            this.getObjectValueFromPath(response.data, this.values.pagination.total_from_response) ||
              1 / this.values.pagination.limit
          );
          if (this.pagination.pages < pages) {
            this.pagination.pages = pages;
            latest = false;
          }
        }

        // Total items from header:
        if (this.values.pagination.total_from_header) {
          const pages = Math.ceil(
            response.headers[this.values.pagination.total_from_header] / this.values.pagination.limit
          );
          if (this.pagination.pages < pages) {
            this.pagination.pages = pages;
            latest = false;
          }
        }

        // Next page URL from response:
        if (this.values.pagination.next_page_url_from_response) {
          values.url = this.getObjectValueFromPath(response.data, this.values.pagination.next_page_url_from_response);
          if (!values.url) latest = true;
        }

        // Next token:
        if (
          (this.values.pagination.token.query_param_name || this.values.pagination.token.data_param_name) &&
          (this.values.pagination.token.next_token_from_response || this.values.pagination.token.next_token_from_header)
        ) {
          let token = '';
          if (this.values.pagination.token.next_token_from_response)
            token = this.getObjectValueFromPath(response.data, this.values.pagination.token.next_token_from_response);

          if (this.values.pagination.token.next_token_from_header)
            token = this.getObjectValueFromPath(response.headers, this.values.pagination.token.next_token_from_header);

          if (this.values.pagination.token.data_param_name)
            values.data[this.values.pagination.token.query_param_name] = token;

          if (this.values.pagination.token.query_param_name)
            values.params[this.values.pagination.token.query_param_name] = token;
        }

        if (this.dataResponse) {
          this.dataResponse.data.concat(response.data);
        } else {
          this.dataResponse = response;
        }
      } else {
        this.dataResponse = response;
      }

      if (latest) {
        if (this.values.responseToFile) {
          const streamWrite = values.responseType === 'stream';
          await this.writeResponseToFile(this.dataResponse, streamWrite);
        } else {
          this.writeResponseToDataOutput(this.dataResponse);
        }
      }
    } catch (err) {
      this.endOptions.end = 'error';
      this.endOptions.messageLog = err.message;
      this.endOptions.err_output = err.message;
      this.end(this.endOptions);
    }
  }

  writeResponseToFile(dataResponse, streamWrite) {
    return new Promise(async (resolve, reject) => {
      try {
        if (streamWrite) {
          const writeStream = fs.createWriteStream(this.values.responseToFile);
          dataResponse.data.pipe(writeStream);
          writeStream
            .on('finish', () => {
              writeStream.end();
              this.writeResponseToFileFinish(dataResponse);
              resolve();
            })
            .on('error', err => {
              throw err;
            });
        } else {
          if (this.values.responseType === 'json') {
            await fs.promises.writeFile(this.values.responseToFile, JSON.stringify(dataResponse.data));
          } else {
            await fs.promises.writeFile(this.values.responseToFile, dataResponse.data);
          }
          this.writeResponseToFileFinish(dataResponse);
          resolve();
        }
      } catch (err) {
        this.endOptions.messageLog = err.message;
        this.endOptions.err_output = err.message;
        this.endOptions.end = 'error';
        writeStream.end();
        this.end(this.endOptions);
        resolve();
      }
    });
  }

  writeResponseToFileFinish(dataResponse) {
    if (!this.values.noReturnDataOutput) {
      this.endOptions.data_output = dataResponse.data;
      if (this.values.returnHeaderDataOutput) this.endOptions.data_output.headers = dataResponse.headers;
      if (this.values.responseType === 'json') {
        this.endOptions.extra_output = dataResponse.data;
        if (this.values.returnHeaderDataOutput) this.endOptions.extra_output.headers = dataResponse.headers;
      }
    }
    this.endOptions.end = 'end';
    this.end(this.endOptions);
  }

  writeResponseToDataOutput(dataResponse) {
    if (!this.values.noReturnDataOutput) {
      this.endOptions.data_output = dataResponse.data;
      if (this.values.responseType === 'json') {
        if (this.endOptions.extra_output) {
          this.endOptions.extra_output = dataResponse.data;
        } else {
          this.endOptions.extra_output = dataResponse.data;
        }

        if (this.values.returnHeaderDataOutput) this.endOptions.extra_output.headers = dataResponse.headers;
      }
    }
    this.endOptions.end = 'end';
    this.end(this.endOptions);
  }
}

module.exports = httpExecutor;
