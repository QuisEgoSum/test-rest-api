/**
 * @param {Object} options
 * @param {HttpClient} options.httpClient
 */
module.exports = function({
  httpClient
                          }) {
  httpClient.addRequests(require('./requests'))
  return function() {
    test('Test', async function() {
      await httpClient.request('login')
    })
  }
}