const apiGen = require('./apigen')

module.exports = Localnet

const API_VERSION = 'v0'

Localnet.api = require('xmaxjs-json/src/api/v0')
Localnet.schema = require('xmaxjs-json/src/schema')

// Change httpEndpoint to public localnet when available
const configDefaults = {httpEndpoint: 'http://127.0.0.1:18888'}

/**
  @arg {object} config
*/
function Localnet (config) {
  config = Object.assign({}, configDefaults, config)
  return apiGen(API_VERSION, Localnet.api, config)
}
