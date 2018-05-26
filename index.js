const workerize = require('workerize')

module.exports = workerize(`
    export function fetchJson(config) {
        const {
            url,
            token,
            query,
            params,
            endpoint,
            headers = {},
            method = 'get',
            ...restOfConfig
        } = config || {}
        if (!url) {
            return Promise.reject('No URL was provided')
        }
        if (token) {
            headers.authorization = 'Bearer ' + token
        }
        let fullUrl = url || restOfConfig.baseURL || restOfConfig.baseUrl
        if (endpoint && typeof endpoint === 'string') {
            fullUrl += endpoint.replace(/ /g, '-')
        }
        if (params) {
            let queryString = '?'
            for (let key in params) {
                const val = params[key]
                queryString += key + '=' + val
            }
            if (queryString !== '?') {
                fullUrl += queryString
            }
        }
        const options = {
            ...restOfConfig,
            method,
            headers: {
                ...headers,
                'content-type': 'application/json'
            }
        }
        delete options.headers['Content-Type']
        if (/get/i.test(options.method)) {
            options.body = config.body || config.data || {}
        }
        if (query) {
            options.body = {
                ...(options.body || {}),
                query
            }
        }
        if (options.body) {
            options.body = JSON.stringify(options.body)
        }
        return fetch(fullUrl, options).then(response => response.json())
    }
`, {type: 'module'})
