const makeWorker = require('web-worker')

module.exports = makeWorker(`
  export function fetchJson(config = {}) {
    const withoutTheseKeys = ['url', 'data', 'token', 'query', 'params', 'baseURL', 'baseUrl', 'endpoint']

    if (!config.url) {
      return Promise.reject('No URL was provided')
    }

    let fullUrl = config.url || config.baseURL || config.baseUrl
    if (config.endpoint && typeof config.endpoint === 'string') {
      fullUrl += config.endpoint.replace(/ /g, '-')
    }

    if (config.params) {
      let queryString = '?'
      for (let key in config.params) {
        const val = config.params[key]
        queryString += key + '=' + val
      }
      if (queryString !== '?') {
        fullUrl += queryString
      }
    }

    const options = { headers: {} }
    for (let key in config) {
      if (withoutTheseKeys.indexOf(key) === -1) {
        options[key] = config[key]
      }
    }
    delete options.headers['Content-Type']
    options.headers['content-type'] = 'application/json' 
    if (config.token) {
      options.headers.authorization = 'Bearer ' + config.token
    }

    if (/get/i.test(options.method)) {
      options.body = config.body || config.data || {}
    }
    if (options.body) {
      if (config.query) {
        options.body.query = config.query
      }
      options.body = JSON.stringify(options.body)
    }

    return fetch(fullUrl, options).then(response => response.json())
  }
`, {type: 'module'})
