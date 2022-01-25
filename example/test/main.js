const Test = require('../../src')


const httpClient = new Test.HttpClient(
  {
    baseUrl: 'http://localhost:8080'
  }
)


test('User', require('./packages/user')({httpClient}))