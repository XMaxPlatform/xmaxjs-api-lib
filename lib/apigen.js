'use strict';

require('isomorphic-fetch');
var camelCase = require('camel-case');
var helpers = require('./exported-helpers');
var processArgs = require('./process-args');

module.exports = apiGen;

var configDefaults = {
  httpEndpoint: 'http://127.0.0.1:18888',
  debug: false
};

function apiGen(version, definitions, config) {
  config = Object.assign({}, configDefaults, config);
  var api = {};
  var _config = config,
      httpEndpoint = _config.httpEndpoint;

  for (var apiGroup in definitions) {
    for (var apiMethod in definitions[apiGroup]) {
      var methodName = camelCase(apiMethod);
      var url = httpEndpoint + '/' + version + '/' + apiGroup + '/' + apiMethod;
      api[methodName] = fetchMethod(methodName, url, definitions[apiGroup][apiMethod], config);
    }
  }

  var _loop = function _loop(helper) {
    // Insert `api` as the first parameter to all API helpers
    api[helper] = function () {
      var _helpers$api;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_helpers$api = helpers.api)[helper].apply(_helpers$api, [api].concat(args));
    };
  };

  for (var helper in helpers.api) {
    _loop(helper);
  }
  return Object.assign(api, helpers);
}

function fetchMethod(methodName, url, definition, _ref) {
  var debug = _ref.debug,
      apiLog = _ref.apiLog;

  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length === 0) {
      console.error(usage(methodName, definition));
      return;
    }

    var optionsFormatter = function optionsFormatter(option) {
      if (typeof option === 'boolean') {
        return { broadcast: option };
      }
    };

    var processedArgs = processArgs(args, Object.keys(definition.params || []), methodName, optionsFormatter);

    var params = processedArgs.params,
        options = processedArgs.options,
        returnPromise = processedArgs.returnPromise;
    var callback = processedArgs.callback;


    if (apiLog) {
      // wrap the callback with the logger
      var superCallback = callback;
      callback = function callback(error, tr) {
        if (error) {
          apiLog(error, methodName);
        } else {
          apiLog(null, tr, methodName);
        }
        superCallback(error, tr);
      };
    }

    var body = JSON.stringify(params);
    if (debug) {
      console.error('api >', url, body);
    }
    fetch(url, { body: body, method: 'POST' }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        return response.text().then(function (bodyResp) {
          var error = new Error(bodyResp);
          error.status = response.status;
          error.statusText = response.statusText;
          throw error;
        });
      }
    }).then(function (objectResp) {
      if (debug) {
        console.error('api <', objectResp);
      }
      try {
        callback(null, objectResp);
      } catch (callbackError) {
        console.error(callbackError);
      }
    }).catch(function (error) {
      if (debug) {
        console.error('api error =>', url, body, error);
      }
      try {
        callback(error);
      } catch (callbackError) {
        console.error(callbackError);
      }
    });

    return returnPromise;
  };
}

function usage(methodName, definition) {
  var usage = '';
  var out = function out(str) {
    usage += str + '\n';
  };

  out('USAGE');
  out(methodName + ' - ' + definition.brief);

  out('\nPARAMETERS');
  if (definition.params) {
    out(JSON.stringify(definition.params, null, 2));
  } else {
    out('none');
  }

  out('\nRETURNS');
  if (definition.results) {
    out('' + JSON.stringify(definition.results, null, 2));
  } else {
    out('no data');
  }

  out('\nERRORS');
  if (definition.errors) {
    for (var error in definition.errors) {
      var errorDesc = definition.errors[error];
      out('' + error + (errorDesc ? ' - ' + errorDesc : ''));
    }
  } else {
    out('nothing special');
  }

  return usage;
}