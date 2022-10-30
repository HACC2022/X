//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Random = Package.random.Random;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var getClientArchVersion, Kadira, Monti, BaseErrorModel, Retry, Ntp, getBrowserInfo, getResolution, getErrorStack, getInfoArray, getTime, getClientArch, checkSizeAndPickFields, httpRequest, ErrorModel;

var require = meteorInstall({"node_modules":{"meteor":{"montiapm:agent":{"lib":{"common":{"utils.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/common/utils.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  getErrorParameters: () => getErrorParameters
});

getClientArchVersion = function (arch) {
  const autoupdate = __meteor_runtime_config__.autoupdate;

  if (autoupdate) {
    return autoupdate.versions[arch] ? autoupdate.versions[arch].version : 'none';
  } // Meteor 1.7 and older did not have an `autoupdate` object.


  switch (arch) {
    case 'cordova.web':
      return __meteor_runtime_config__.autoupdateVersionCordova;

    case 'web.browser':
    case 'web.browser.legacy':
      // Meteor 1.7 always used the web.browser.legacy version
      return __meteor_runtime_config__.autoupdateVersion;

    default:
      return 'none';
  }
};

const createStackTrace = () => {
  if (Error.captureStackTrace) {
    let err = {};
    Error.captureStackTrace(err, Kadira.trackError);
    return err.stack;
  }

  const stack = new Error().stack.split('\n');
  let toRemove = 0; // Remove frames starting from when trackError was called

  for (; toRemove < stack.length; toRemove++) {
    if (stack[toRemove].indexOf('trackError') > -1) {
      toRemove += 1;
      break;
    }
  }

  return stack.slice(toRemove).join('\n');
};

const getErrorParameters = function (args) {
  let type = null;
  let message = null;
  let subType = null;
  let stack = null;

  if (!(args[0] instanceof Error) && typeof args[0] === 'string' && typeof args[1] === 'string') {
    // Old usage:
    // Monti.trackError(
    //   'type', 'error message', { stacks: 'error stack', subType: 'sub type }
    // );
    const options = args[2] || {};
    type = args[0];
    subType = Meteor.isClient ? args[0] : options.subType;
    message = args[1];
    stack = options.stacks || createStackTrace();
  } else {
    // New usage:
    // Monti.trackError(error, { type: 'type', subType: 'subType' });
    const error = args[0];
    const options = args[1] || {};
    const isErrorObject = typeof error === 'object' && error !== null;
    message = isErrorObject ? error.message : error;
    stack = isErrorObject && error.stack || createStackTrace();
    type = options.type;
    subType = options.subType;
  }

  return {
    type,
    message,
    subType,
    stack
  };
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"unify.js":function module(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/common/unify.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Kadira = {};
Kadira.options = {};
Monti = Kadira;

if (Meteor.wrapAsync) {
  Kadira._wrapAsync = Meteor.wrapAsync;
} else {
  Kadira._wrapAsync = Meteor._wrapAsync;
}

if (Meteor.isServer) {
  var EventEmitter = Npm.require('events').EventEmitter;

  var eventBus = new EventEmitter();
  eventBus.setMaxListeners(0);

  var buildArgs = function (args) {
    var eventName = args[0] + '-' + args[1];
    var args = args.slice(2);
    args.unshift(eventName);
    return args;
  };

  Kadira.EventBus = {};
  ['on', 'emit', 'removeListener', 'removeAllListeners'].forEach(function (m) {
    Kadira.EventBus[m] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var args = buildArgs(args);
      return eventBus[m].apply(eventBus, args);
    };
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"default_error_filters.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/common/default_error_filters.js                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var commonErrRegExps = [/connection timeout\. no (\w*) heartbeat received/i, /INVALID_STATE_ERR/i];
Kadira.errorFilters = {
  filterValidationErrors: function (type, message, err) {
    if (err && err instanceof Meteor.Error) {
      return false;
    } else {
      return true;
    }
  },
  filterCommonMeteorErrors: function (type, message) {
    for (var lc = 0; lc < commonErrRegExps.length; lc++) {
      var regExp = commonErrRegExps[lc];

      if (regExp.test(message)) {
        return false;
      }
    }

    return true;
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"send.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/common/send.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Kadira.send = function (payload, path, callback) {
  if (!Kadira.connected) {
    throw new Error("You need to connect with Kadira first, before sending messages!");
  }

  path = path.substr(0, 1) != '/' ? "/" + path : path;
  var endpoint = Kadira.options.endpoint + path;
  var retryCount = 0;
  var retry = new Retry({
    minCount: 1,
    minTimeout: 0,
    baseTimeout: 1000 * 5,
    maxTimeout: 1000 * 60
  });

  var sendFunction = Kadira._getSendFunction();

  tryToSend();

  function tryToSend(err) {
    if (retryCount < 5) {
      retry.retryLater(retryCount++, send);
    } else {
      console.warn('Error sending error traces to Monti APM server');
      if (callback) callback(err);
    }
  }

  function send() {
    sendFunction(endpoint, payload, function (err, res) {
      if (err && !res) {
        tryToSend(err);
      } else if (res.statusCode == 200) {
        if (callback) callback(null, res.data);
      } else {
        if (callback) callback(new Meteor.Error(res.statusCode, res.content));
      }
    });
  }
};

Kadira._getSendFunction = function () {
  return Meteor.isServer ? Kadira._serverSend : Kadira._clientSend;
};

Kadira._clientSend = function (endpoint, payload, callback) {
  httpRequest('POST', endpoint, {
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(payload)
  }, callback);
};

Kadira._serverSend = function () {
  throw new Error('Kadira._serverSend is not supported. Use coreApi instead.');
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"models":{"base_error.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/models/base_error.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
BaseErrorModel = function (options) {
  this._filters = [];
};

BaseErrorModel.prototype.addFilter = function (filter) {
  if (typeof filter === 'function') {
    this._filters.push(filter);
  } else {
    throw new Error("Error filter must be a function");
  }
};

BaseErrorModel.prototype.removeFilter = function (filter) {
  var index = this._filters.indexOf(filter);

  if (index >= 0) {
    this._filters.splice(index, 1);
  }
};

BaseErrorModel.prototype.applyFilters = function (type, message, error, subType) {
  for (var lc = 0; lc < this._filters.length; lc++) {
    var filter = this._filters[lc];

    try {
      var validated = filter(type, message, error, subType);
      if (!validated) return false;
    } catch (ex) {
      // we need to remove this filter
      // we may ended up in a error cycle
      this._filters.splice(lc, 1);

      throw new Error("an error thrown from a filter you've suplied", ex.message);
    }
  }

  return true;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"retry.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/retry.js                                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Retry logic with an exponential backoff.
//
// options:
//  baseTimeout: time for initial reconnect attempt (ms).
//  exponent: exponential factor to increase timeout each attempt.
//  maxTimeout: maximum time between retries (ms).
//  minCount: how many times to reconnect "instantly".
//  minTimeout: time to wait for the first `minCount` retries (ms).
//  fuzz: factor to randomize retry times by (to avoid retry storms).
//TODO: remove this class and use Meteor Retry in a later version of meteor.
Retry = class {
  constructor() {
    let {
      baseTimeout = 1000,
      // 1 second
      exponent = 2.2,
      // The default is high-ish to ensure a server can recover from a
      // failure caused by load.
      maxTimeout = 5 * 60000,
      // 5 minutes
      minTimeout = 10,
      minCount = 2,
      fuzz = 0.5 // +- 25%

    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.baseTimeout = baseTimeout;
    this.exponent = exponent;
    this.maxTimeout = maxTimeout;
    this.minTimeout = minTimeout;
    this.minCount = minCount;
    this.fuzz = fuzz;
    this.retryTimer = null;
  } // Reset a pending retry, if any.


  clear() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  } // Calculate how long to wait in milliseconds to retry, based on the
  // `count` of which retry this is.


  _timeout(count) {
    if (count < this.minCount) return this.minTimeout;
    let timeout = Math.min(this.maxTimeout, this.baseTimeout * Math.pow(this.exponent, count)); // fuzz the timeout randomly, to avoid reconnect storms when a
    // server goes down.

    timeout = timeout * (Random.fraction() * this.fuzz + (1 - this.fuzz / 2));
    return Math.ceil(timeout);
  } // Call `fn` after a delay, based on the `count` of which retry this is.


  retryLater(count, fn) {
    const timeout = this._timeout(count);

    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(fn, timeout);
    return timeout;
  }

};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ntp.js":function module(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/ntp.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var logger = getLogger();

Ntp = function (endpoint) {
  this.path = '/simplentp/sync';
  this.setEndpoint(endpoint);
  this.diff = 0;
  this.synced = false;
  this.reSyncCount = 0;
  this.reSync = new Retry({
    baseTimeout: 1000 * 60,
    maxTimeout: 1000 * 60 * 10,
    minCount: 0
  });
};

Ntp._now = function () {
  var now = Date.now();

  if (typeof now == 'number') {
    return now;
  } else if (now instanceof Date) {
    // some extenal JS libraries override Date.now and returns a Date object
    // which directly affect us. So we need to prepare for that
    return now.getTime();
  } else {
    // trust me. I've seen now === undefined
    return new Date().getTime();
  }
};

Ntp.prototype.setEndpoint = function (endpoint) {
  this.endpoint = endpoint ? endpoint + this.path : null;
};

Ntp.prototype.getTime = function () {
  return Ntp._now() + Math.round(this.diff);
};

Ntp.prototype.syncTime = function (localTime) {
  return localTime + Math.ceil(this.diff);
};

Ntp.prototype.sync = function () {
  if (this.endpoint === null) {
    return;
  }

  logger('init sync');
  var self = this;
  var retryCount = 0;
  var retry = new Retry({
    baseTimeout: 1000 * 20,
    maxTimeout: 1000 * 60,
    minCount: 1,
    minTimeout: 0
  });
  syncTime();

  function syncTime() {
    if (retryCount < 5) {
      logger('attempt time sync with server', retryCount); // if we send 0 to the retryLater, cacheDns will run immediately

      retry.retryLater(retryCount++, cacheDns);
    } else {
      logger('maximum retries reached');
      self.reSync.retryLater(self.reSyncCount++, function () {
        var args = [].slice.call(arguments);
        self.sync.apply(self, args);
      });
    }
  } // first attempt is to cache dns. So, calculation does not
  // include DNS resolution time


  function cacheDns() {
    self.getServerTime(function (err) {
      if (!err) {
        calculateTimeDiff();
      } else {
        syncTime();
      }
    });
  }

  function calculateTimeDiff() {
    var clientStartTime = new Date().getTime();
    self.getServerTime(function (err, serverTime) {
      if (!err && serverTime) {
        // (Date.now() + clientStartTime)/2 : Midpoint between req and res
        var networkTime = (new Date().getTime() - clientStartTime) / 2;
        var serverStartTime = serverTime - networkTime;
        self.diff = serverStartTime - clientStartTime;
        self.synced = true; // we need to send 1 into retryLater.

        self.reSync.retryLater(self.reSyncCount++, function () {
          var args = [].slice.call(arguments);
          self.sync.apply(self, args);
        });
        logger('successfully updated diff value', self.diff);
      } else {
        syncTime();
      }
    });
  }
};

Ntp.prototype.getServerTime = function (callback) {
  var self = this;

  if (self.endpoint === null) {
    throw new Error('getServerTime requires the endpoint to be set');
  }

  if (Meteor.isServer) {
    Kadira.coreApi.get(self.path, {
      noRetries: true
    }).then(content => {
      var serverTime = parseInt(content);
      callback(null, serverTime);
    }).catch(err => {
      callback(err);
    });
  } else {
    httpRequest('GET', self.endpoint + "?noCache=".concat(new Date().getTime(), "-").concat(Math.random()), function (err, res) {
      if (err) {
        callback(err);
      } else {
        var serverTime = parseInt(res.content);
        callback(null, serverTime);
      }
    });
  }
};

function getLogger() {
  if (Meteor.isServer) {
    return Npm.require('debug')("kadira:ntp");
  } else {
    return function (message) {
      try {
        var canLogKadira = global.localStorage.getItem('LOG_KADIRA') !== null && typeof console !== 'undefined';
      } catch (e) {} //older browsers can sometimes throw because of getItem


      if (canLogKadira) {
        if (message) {
          message = "kadira:ntp " + message;
          arguments[0] = message;
        }

        console.log.apply(console, arguments);
      }
    };
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"client":{"utils.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/utils.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
getBrowserInfo = function () {
  return {
    browser: window.navigator.userAgent,
    userId: Meteor.userId && Meteor.userId(),
    url: location.href,
    resolution: getResolution(),
    clientArch: getClientArch()
  };
};

getResolution = function () {
  if (screen && screen.width && screen.height) {
    var resolution = screen.width + 'x' + screen.height;
    return resolution;
  }
};

const toArray = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args;
};

getErrorStack = function (zone, callback) {
  var trace = [];
  var eventMap = zone.eventMap || {};
  var infoMap = zone.infoMap || {};
  trace.push({
    at: new Date().getTime(),
    stack: zone.erroredStack.get()
  });
  processZone();

  function processZone() {
    // we assume, first two zones are not interesting
    // bacause, they are some internal meteor loading stuffs
    if (zone && zone.depth > 2) {
      var stack = "";

      if (zone.currentStack) {
        stack = zone.currentStack.get();
      }

      var events = eventMap[zone.id] || [];
      var info = getInfoArray(infoMap[zone.id]);
      var ownerArgsEvent = events && events[0] && events[0].type == 'owner-args' && events.shift();
      var runAt = ownerArgsEvent ? ownerArgsEvent.at : zone.runAt;
      var ownerArgs = ownerArgsEvent ? toArray.apply(null, ownerArgsEvent.args) : []; // limiting

      events = events.slice(-5).map(checkSizeAndPickFields(100));
      info = info.slice(-5).map(checkSizeAndPickFields(100));
      ownerArgs = checkSizeAndPickFields(200)(ownerArgs.slice(0, 5));
      zone.owner && delete zone.owner.zoneId;
      trace.push({
        createdAt: zone.createdAt,
        runAt: runAt,
        stack: stack,
        owner: zone.owner,
        ownerArgs: ownerArgs,
        events: events,
        info: info,
        zoneId: zone.id
      });
      zone = zone.parent;
      setTimeout(processZone, 0);
    } else {
      callback(trace);
    }
  }
};

getInfoArray = function () {
  let info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.keys(info).map(function (key, type) {
    const value = info[key];
    value.type = type;
    return value;
  });
};

getTime = function () {
  if (Kadira && Kadira.syncedDate) {
    return Kadira.syncedDate.getTime();
  } else {
    return new Date().getTime();
  }
};

getClientArch = function () {
  if (Meteor.isCordova) {
    return 'cordova.web';
  } else if (typeof Meteor.isModern === 'undefined' || Meteor.isModern) {
    return 'web.browser';
  } else {
    return 'web.browser.legacy';
  }
};

checkSizeAndPickFields = function (maxFieldSize) {
  return function (obj) {
    maxFieldSize = maxFieldSize || 100;

    for (var key in obj) {
      var value = obj[key];

      try {
        var valueStringified = JSON.stringify(value);

        if (valueStringified.length > maxFieldSize) {
          obj[key] = valueStringified.substr(0, maxFieldSize) + " ...";
        } else {
          obj[key] = value;
        }
      } catch (ex) {
        obj[key] = 'Error: cannot stringify value';
      }
    }

    return obj;
  };
};

httpRequest = function (method, url, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  /**
   * IE8 and IE9 does not support CORS with the usual XMLHttpRequest object
   * If XDomainRequest exists, use it to send errors.
   * XDR can POST data to HTTPS endpoints only if current page uses HTTPS
   */


  if (window.XDomainRequest) {
    var xdr = new XDomainRequest();
    url = matchPageProtocol(url);

    xdr.onload = function () {
      var headers = {
        'Content-Type': xdr.contentType
      };
      var data = {};

      try {
        data = JSON.parse(xdr.responseText);
      } catch (e) {}

      callback(null, {
        content: xdr.responseText,
        data: data,
        headers: headers,
        statusCode: 200
      });
    };

    xdr.onerror = function () {
      callback({
        statusCode: 404
      });
    };

    xdr.onprogress = function () {// onprogress must be set. Otherwise, ie doesn't handle duplicate requests
      // correctly.
    };

    xdr.open(method, url);
    setTimeout(() => {
      var content = options.content;

      if (typeof content === 'object') {
        content = JSON.stringify(content);
      } // delaying send fixes issues when multiple xdr requests are made
      // at the same time.


      xdr.send(options.content || null);
    }, 0);

    function matchPageProtocol(endpoint) {
      var withoutProtocol = endpoint.substr(endpoint.indexOf(':') + 1);
      return window.location.protocol + withoutProtocol;
    }
  } else {
    // Based on Meteor's HTTP package. Uses XMLHttpRequest
    var content = options.content; // wrap callback to add a 'response' property on an error, in case
    // we have both (http 4xx/5xx error, which has a response payload)

    callback = function (callback) {
      var called = false;
      return function (error, response) {
        if (!called) {
          called = true;

          if (error && response) {
            error.response = response;
          }

          callback(error, response);
        }
      };
    }(callback);

    try {
      if (typeof XMLHttpRequest === "undefined") {
        throw new Error("Can't create XMLHttpRequest");
      }

      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);

      if (options.headers) {
        Object.keys(options.headers).forEach(function (key) {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          // COMPLETE
          if (!xhr.status) {
            // no HTTP response
            callback(new Error("Connection lost"));
          } else {
            var response = {};
            response.statusCode = xhr.status;
            response.content = xhr.responseText; // Read Content-Type header, up to a ';' if there is one.
            // A typical header might be "application/json; charset=utf-8"
            // or just "application/json".

            var contentType = (xhr.getResponseHeader('content-type') || ';').split(';')[0]; // Only try to parse data as JSON if server sets correct content type.

            if (['application/json', 'text/javascript', 'application/javascript', 'application/x-javascript'].indexOf(contentType) >= 0) {
              try {
                response.data = JSON.parse(response.content);
              } catch (err) {
                response.data = null;
              }
            } else {
              response.data = null;
            }

            var error = null;

            if (response.statusCode >= 400) {
              var message = "failed [" + response.statusCode + "]";

              if (response.content) {
                var stringContent = typeof response.content == "string" ? response.content : response.content.toString();
                stringContent = stringContent.replace(/\n/g, ' ');
                stringContent = stringContent.length > 500 ? stringContent.slice(0, length) + '...' : stringContent;
                message += ' ' + stringContent;
              }

              error = new Error(message);
            }

            callback(error, response);
          }
        }
      };

      xhr.send(content);
    } catch (err) {
      callback(err);
    }
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"models":{"errors.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/models/errors.js                                                               //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);

ErrorModel = function (options) {
  BaseErrorModel.call(this);
  options = options || {};
  options.maxErrorsPerInterval = options.maxErrorsPerInterval || 10;
  options.intervalInMillis = options.intervalInMillis || 1000 * 60 * 2; //2 mins

  options.waitForNtpSyncInterval = options.waitForNtpSyncInterval || 0;
  var self = this;
  self.options = options; // errorsSentCount will be reseted at the start of the interval

  self.errorsSentCount = 0;
  self.errorsSent = Object.create(null);
  self.intervalTimeoutHandler = setInterval(function () {
    self.errorsSentCount = 0;

    self._flushErrors();
  }, self.options.intervalInMillis);
};

Object.assign(ErrorModel.prototype, BaseErrorModel.prototype);

ErrorModel.prototype.sendError = function (errorDef, err, force) {
  var self = this;

  if (!this.applyFilters('client', errorDef.name, err, errorDef.subType)) {
    return;
  }

  ;

  if (!this.canSendErrors()) {
    // reached maximum error count for this interval (1 min)
    return;
  }

  if (force) {
    sendError();
  } else {
    if (Kadira.syncedDate.synced || self.options.waitForNtpSyncInterval == 0) {
      sendError();
    } else {
      setTimeout(forceSendError, self.options.waitForNtpSyncInterval);
    }
  }

  function forceSendError() {
    self.sendError(errorDef, err, true);
  }

  function sendError() {
    if (!self.errorsSent[errorDef.name]) {
      // sync time with the server
      if (errorDef.startTime) {
        errorDef.startTime = Kadira.syncedDate.syncTime(errorDef.startTime);
      }

      errorDef.count = 1;

      var payload = self._buildPayload([errorDef]);

      Kadira.send(payload, '/errors');
      self.errorsSent[errorDef.name] = _objectSpread({}, errorDef);
      self.errorsSent[errorDef.name].count = 0;
      self.errorsSentCount++;
    } else {
      self.increamentErrorCount(errorDef.name);
    }
  }
};

ErrorModel.prototype._buildPayload = function (errors) {
  var arch = getClientArch();
  return {
    host: Kadira.options.hostname,
    recordIPAddress: Kadira.options.recordIPAddress,
    errors: errors,
    arch: arch,
    archVersion: getClientArchVersion(arch)
  };
};

ErrorModel.prototype._flushErrors = function () {
  const errors = Object.values(this.errorsSent).filter(e => e.count > 0);

  if (errors.length > 0) {
    Kadira.send(this._buildPayload(errors), '/errors');
  }

  this.errorsSent = Object.create(null);
};

ErrorModel.prototype.isErrorExists = function (name) {
  return !!this.errorsSent[name];
};

ErrorModel.prototype.increamentErrorCount = function (name) {
  var error = this.errorsSent[name];

  if (error) {
    error.count++;
  }
};

ErrorModel.prototype.canSendErrors = function () {
  return this.errorsSentCount < this.options.maxErrorsPerInterval;
};

ErrorModel.prototype.close = function () {
  clearTimeout(this.intervalTimeoutHandler);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"error_reporters":{"zone.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/error_reporters/zone.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
if (window.Zone && Zone.inited) {
  Zone.Reporters.add('kadira', kadiraZoneReporter);
}

function kadiraZoneReporter(zone) {
  // track only if error tracking is enabled
  if (!Kadira.options.enableErrorTracking) {
    return;
  }

  var errorName = Zone.Reporters.getErrorMessage(zone.erroredStack._e);

  if (Kadira.errors.isErrorExists(errorName)) {
    Kadira.errors.increamentErrorCount(errorName);
  } else if (Kadira.errors.canSendErrors()) {
    getErrorStack(zone, function (stacks) {
      Kadira.errors.sendError({
        appId: Kadira.options.appId,
        name: errorName,
        type: 'client',
        startTime: zone.runAt,
        subType: 'zone',
        info: getBrowserInfo(),
        stacks: JSON.stringify(stacks)
      });
    });
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"window_error.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/error_reporters/window_error.js                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var prevWindowOnError = window.onerror || Function.prototype;

function handleOnError(message, url, line, col, error) {
  // track only if error tracking is enabled
  if (!Kadira.options.enableErrorTracking) {
    return prevWindowOnError(message, url, line, col, error);
  }

  url = url || '<anonymous>';
  line = line || 0;
  col = col || 0;

  if (error) {
    var stack = error.stack;
  } else {
    var stack = 'Error:\n    at window.onerror (' + url + ':' + line + ':' + col + ')';
  }

  var now = new Date().getTime();
  Kadira.errors.sendError({
    appId: Kadira.options.appId,
    name: message,
    type: 'client',
    startTime: now,
    subType: 'window.onerror',
    info: getBrowserInfo(),
    _internalDetails: {
      origError: {
        message,
        url,
        line,
        col,
        error
      }
    },
    stacks: JSON.stringify([{
      at: now,
      events: [],
      stack: stack
    }])
  });
  return prevWindowOnError(message, url, line, col, error);
  ;
}

Kadira._setupOnErrorReporter = function setupOnError() {
  if (window.onerror !== handleOnError) {
    prevWindowOnError = window.onerror || prevWindowOnError;
    window.onerror = handleOnError;
  }
};

Kadira._setupOnErrorReporter();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meteor_debug.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/error_reporters/meteor_debug.js                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var originalMeteorDebug = Meteor._debug;
let lastMessageToIgnore = null;
let messagesToIgnore = 0; // Sometimes one of the other error reporter tracks an error, but Meteor also
// sends the details to Meteor._debug. In some places, Meteor splits the
// information across multiple Meteor._debug calls.
//
// Does not report Meteor._debug errors until it sees the given message
// or it has ignored maxMessages.

Kadira._ignoreDebugMessagesUntil = function (message, maxMessages) {
  lastMessageToIgnore = message;
  messagesToIgnore = maxMessages;
};

Meteor._debug = function (m, s) {
  // We need to assign variables like this. Otherwise, 
  // we can't see proper error messages.
  // See: https://github.com/meteorhacks/kadira/issues/193
  var message = m;
  var stack = s;
  var args = arguments;

  function runOriginal() {
    return originalMeteorDebug.apply(Meteor, args);
  } // track only if error tracking is enabled


  if (!Kadira.options.enableErrorTracking) {
    return runOriginal();
  } // do not track if a zone is available (let zone handle the error)


  if (window.zone) {
    return runOriginal();
  } // Do not report messages until either we see the
  // lastMessageToIgnore or we have ignored the number of
  // messages in messagesToIgnore


  if (lastMessageToIgnore) {
    if (message === lastMessageToIgnore || messagesToIgnore === 1) {
      lastMessageToIgnore = null;
      messagesToIgnore = 0;
    } else {
      messagesToIgnore -= 1;
    }

    return runOriginal();
  } // We hate Meteor._debug (no single usage pattern)


  if (message instanceof Error) {
    stack = message.stack;
    message = message.message;
  } else if (typeof message == 'string' && stack === undefined) {
    stack = getStackFromMessage(message);
    message = firstLine(message);
  } else if (typeof message == 'string' && stack instanceof Error) {
    const separator = message.endsWith(':') ? '' : ':';
    message = "".concat(message).concat(separator, " ").concat(stack.message);
    stack = getStackFromMessage(stack.stack);
  } // sometimes Meteor._debug is called with the stack concat to the message
  // FIXME Meteor._debug can be called in many ways


  if (message && stack === undefined) {
    stack = getStackFromMessage(message);
    message = firstLine(message);
  }

  var now = new Date().getTime();
  Kadira.errors.sendError({
    appId: Kadira.options.appId,
    name: message,
    type: 'client',
    startTime: now,
    subType: 'meteor._debug',
    info: getBrowserInfo(),
    stacks: JSON.stringify([{
      at: now,
      events: [],
      stack: stack
    }])
  });
  return runOriginal();
}; // Identifies lines that are a stack trace frame:
// 1. Has "at" proceeded and followed by at least one space
// 2. Or has an "@" symbol


var stackRegex = /(^.*@.*$|^\s+at\s.+$)/gm;

function getStackFromMessage(message) {
  // add empty string to add the empty line at start
  var stack = [''];
  var match;

  while (match = stackRegex.exec(message)) {
    stack.push(match[0]);
  }

  return stack.join('\n');
}

function firstLine(message) {
  return message.split('\n')[0];
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"unhandled_rejection.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/error_reporters/unhandled_rejection.js                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
window.addEventListener("unhandledrejection", function (e) {
  if (!Kadira.options.enableErrorTracking) {
    return;
  }

  var message = e.reason;
  var stack = '';

  if (typeof message === 'object' && message !== null) {
    stack = message.stack;
    message = message.message;
  }

  var now = new Date().getTime();
  Kadira.errors.sendError({
    appId: Kadira.options.appId,
    name: message,
    type: 'client',
    startTime: now,
    subType: 'window.onunhandledrejection',
    info: getBrowserInfo(),
    _internalDetails: {
      origError: {
        reason: e.reason
      }
    },
    stacks: JSON.stringify([{
      at: now,
      events: [],
      stack: stack
    }])
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"tracker.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/error_reporters/tracker.js                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
const origCompute = Tracker.Computation.prototype._compute;
const origAfterFlush = Tracker.afterFlush;
const origRunFlush = Tracker._runFlush; // Internal variable in the Tracker package set during Tracker._runFlush
// If it is true, Tracker throws the error instead of using Meteor._debug
// In that case, we should not report the error in afterFlush and
// instead let another reporter handle it

let throwFirstError = false;

Tracker._runFlush = function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  throwFirstError = !!options.throwFirstError;
  return origRunFlush.apply(this, arguments);
};

Tracker.afterFlush = function (func) {
  return origAfterFlush(function () {
    try {
      return func();
    } catch (e) {
      if (Kadira.options.enableErrorTracking && !throwFirstError) {
        var message = e.message;
        var stack = e.stack;
        var now = new Date().getTime();
        Kadira.errors.sendError({
          appId: Kadira.options.appId,
          name: message,
          type: 'client',
          startTime: now,
          subType: 'tracker.afterFlush',
          info: getBrowserInfo(),
          stacks: JSON.stringify([{
            at: now,
            events: [],
            stack
          }])
        }); // Once the error is thrown, Tracker will call
        // Meteor._debug 2 or 3 times. The last time will
        // have the stack trace.

        Kadira._ignoreDebugMessagesUntil(stack, 3);
      }

      throw e;
    }
  });
};

Tracker.Computation.prototype._compute = function () {
  try {
    return origCompute.apply(this, arguments);
  } catch (e) {
    // During the first run, Tracker throws the error
    // It will be handled by a different error reporter
    if (Kadira.options.enableErrorTracking && !this.firstRun) {
      var message = e.message;
      var stack = e.stack;
      var now = new Date().getTime();
      Kadira.errors.sendError({
        appId: Kadira.options.appId,
        name: message,
        type: 'client',
        startTime: now,
        subType: 'tracker.compute',
        info: getBrowserInfo(),
        stacks: JSON.stringify([{
          at: now,
          events: [],
          stack
        }])
      }); // Once the error is thrown, Tracker will call
      // Meteor._debug 2 or 3 times. The last time will
      // have the stack trace.

      Kadira._ignoreDebugMessagesUntil(stack, 3);
    }

    throw e;
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"kadira.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/client/kadira.js                                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let getErrorParameters;
module.link("../common/utils", {
  getErrorParameters(v) {
    getErrorParameters = v;
  }

}, 0);

Kadira.enableErrorTracking = function () {
  Kadira.options.enableErrorTracking = true;
};

Kadira.disableErrorTracking = function () {
  Kadira.options.enableErrorTracking = false;
};

Kadira.trackError = function () {
  if (!Kadira.options.enableErrorTracking) {
    return;
  }

  const {
    message,
    subType,
    stack
  } = getErrorParameters(arguments);

  if (message) {
    var now = new Date().getTime();
    Kadira.errors.sendError({
      appId: Kadira.options.appId,
      name: message,
      startTime: now,
      type: 'client',
      subType: subType || 'Monti.trackError',
      info: getBrowserInfo(),
      stacks: JSON.stringify([{
        at: now,
        events: [],
        stack
      }])
    });
  }
}; // Create new NTP object and error model immediately so it can be used
// endpoints is set later using __meteor_runtime_config__ or publication


Kadira.syncedDate = new Ntp(null);
Kadira.errors = new ErrorModel({
  waitForNtpSyncInterval: 1000 * 5,
  // 5 secs
  intervalInMillis: 1000 * 60 * 1,
  // 1minutes
  maxErrorsPerInterval: 5
}); // __meteor_runtime_config__ cannot be dynamically set for cordova apps
// using a null subscription to send required options to client

if (Meteor.isCordova) {
  var SettingsCollection = new Meteor.Collection('kadira_settings');
  SettingsCollection.find().observe({
    added: initialize
  });
} else {
  initialize(__meteor_runtime_config__.kadira);
}

var initialized = false;

function initialize() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (initialized) {
    return;
  }

  initialized = true;
  Kadira.options = _objectSpread({
    errorDumpInterval: 1000 * 60,
    maxErrorsPerInterval: 10,
    collectAllStacks: false,
    enableErrorTracking: false
  }, options);

  if (Kadira.options.appId && Kadira.options.endpoint) {
    // update endpoint after receiving correct data
    Kadira.syncedDate.setEndpoint(Kadira.options.endpoint);
    Kadira.connected = true;
    Meteor.startup(function () {
      // if we don't do this this might block the initial rendering
      // or, it will show up bottom of the page, which is not cool
      setTimeout(function () {
        Kadira.syncedDate.sync();
      }, Kadira.options.clientEngineSyncDelay);
    });
  }

  if (Kadira.connected && Kadira.options.enableErrorTracking) {
    Kadira.enableErrorTracking();
  }

  if (window.Zone && Zone.inited) {
    Zone.collectAllStacks = Kadira.options.collectAllStacks;
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"profiler":{"client.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/montiapm_agent/lib/profiler/client.js                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// For just making a notice
// montiapm:profiler will override this method to add
// actual functionality
Kadira.profileCpu = function profileCpu() {
  var message = "Please install montiapm:profiler" + " to take a CPU profile.";
  console.log(message);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/montiapm:agent/lib/common/utils.js");
require("/node_modules/meteor/montiapm:agent/lib/common/unify.js");
require("/node_modules/meteor/montiapm:agent/lib/models/base_error.js");
require("/node_modules/meteor/montiapm:agent/lib/retry.js");
require("/node_modules/meteor/montiapm:agent/lib/ntp.js");
require("/node_modules/meteor/montiapm:agent/lib/client/utils.js");
require("/node_modules/meteor/montiapm:agent/lib/client/models/errors.js");
require("/node_modules/meteor/montiapm:agent/lib/client/error_reporters/zone.js");
require("/node_modules/meteor/montiapm:agent/lib/client/error_reporters/window_error.js");
require("/node_modules/meteor/montiapm:agent/lib/client/error_reporters/meteor_debug.js");
require("/node_modules/meteor/montiapm:agent/lib/client/error_reporters/unhandled_rejection.js");
require("/node_modules/meteor/montiapm:agent/lib/client/error_reporters/tracker.js");
require("/node_modules/meteor/montiapm:agent/lib/client/kadira.js");
require("/node_modules/meteor/montiapm:agent/lib/profiler/client.js");
require("/node_modules/meteor/montiapm:agent/lib/common/default_error_filters.js");
require("/node_modules/meteor/montiapm:agent/lib/common/send.js");

/* Exports */
Package._define("montiapm:agent", {
  Kadira: Kadira,
  Monti: Monti
});

})();
