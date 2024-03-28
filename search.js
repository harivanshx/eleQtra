const https = require('https')
// const SUBSCRIPTION_KEY = process.env['AZURE_SUBSCRIPTION_KEY']
const SUBSCRIPTION_KEY = '680531e54bd24bd6bdcfaa55cccffb11'
if (!SUBSCRIPTION_KEY) {
    throw new Error('Missing the AZURE_SUBSCRIPTION_KEY environment variable')
}
function bingWebSearch(query) {
    https.get({
        hostname: 'api.bing.microsoft.com',
        path: '/v7.0/search?q=' + encodeURIComponent(query),
        headers: { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY },
    }, res => {
        let body = ''
        res.on('data', part => body += part)
        res.on('end', () => {
            for (var header in res.headers) {
                if (header.startsWith("bingapis-") || header.startsWith("x-msedge-")) {
                    console.log(header + ": " + res.headers[header])
                }
            }
            console.log('\nJSON Response:\n')
            console.dir(JSON.parse(body), { colors: false, depth: null })
        })
        res.on('error', e => {
            console.log('Error: ' + e.message)
            throw e
        })
    })
}
// const query = process.argv[2] || 'Microsoft Bing Search Services'
const query = "Give some latest news"
bingWebSearch(query)