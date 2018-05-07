const apiGen = require('./apigen')

module.exports = Testnet

const API_VERSION = 'v0'

Testnet.api = require('xmaxjs-json/src/api/v0')
Testnet.schema = require('xmaxjs-json/src/schema')

//Repalce with remote testnet address later
const configDefaults = {httpEndpoint: 'http://127.0.0.1:18888'}

/**
  @arg {object} config
*/
function Testnet (config) {
  config = Object.assign({}, configDefaults, config)
  return apiGen(API_VERSION, Testnet.api, config)
}
