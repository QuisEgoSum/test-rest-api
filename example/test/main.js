const Test = require('../../src')


const httpClient = new Test.HttpClient(
  {
    baseUrl: 'http://localhost:8080'
  }
)


describe('User', require('./packages/user')({httpClient}))
