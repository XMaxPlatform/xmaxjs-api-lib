'use strict';

var Testnet = require('./testnet');
var Localnet = require('./localnet');
var processArgs = require('./process-args');

module.exports = {
    Testnet: Testnet,
    Localnet: Localnet,
    processArgs: processArgs
};