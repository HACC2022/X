(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MeteorX = Package['montiapm:meteorx'].MeteorX;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var EJSON = Package.ejson.EJSON;
var DDPCommon = Package['ddp-common'].DDPCommon;
var _ = Package.underscore._;
var Random = Package.random.Random;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var getClientArchVersion, Kadira, Monti, BaseErrorModel, Retry, HaveAsyncCallback, UniqueId, DefaultUniqueId, CreateUserStack, OptimizedApply, getClientVersions, countKeys, iterate, getProperty, Ntp, handleApiResponse, OplogCheck, Tracer, TracerStore, kind, KadiraModel, MethodsModel, PubsubModel, SystemModel, ErrorModel, DocSzCache, DocSzCacheItem, wrapServer, wrapSession, wrapSubscription, wrapOplogObserveDriver, wrapPollingObserveDriver, wrapMultiplexer, wrapForCountingObservers, wrapStringifyDDP, hijackDBOps, TrackUncaughtExceptions, TrackUnhandledRejections, TrackMeteorDebug, setLabels, MAX_BODY_SIZE, MAX_STRINGIFIED_BODY_SIZE;

var require = meteorInstall({"node_modules":{"meteor":{"montiapm:agent":{"lib":{"common":{"utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/utils.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"unify.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/unify.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"default_error_filters.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/default_error_filters.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"send.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/send.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"models":{"base_error.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/base_error.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"0model.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/0model.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
KadiraModel = function () {};

KadiraModel.prototype._getDateId = function (timestamp) {
  var remainder = timestamp % (1000 * 60);
  var dateId = timestamp - remainder;
  return dateId;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/methods.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const {
  DDSketch
} = require('monti-apm-sketches-js');

var METHOD_METRICS_FIELDS = ['wait', 'db', 'http', 'email', 'async', 'compute', 'total'];

MethodsModel = function (metricsThreshold) {
  this.methodMetricsByMinute = Object.create(null);
  this.errorMap = Object.create(null);
  this._metricsThreshold = _.extend({
    "wait": 100,
    "db": 100,
    "http": 1000,
    "email": 100,
    "async": 100,
    "compute": 100,
    "total": 200
  }, metricsThreshold || Object.create(null)); //store max time elapsed methods for each method, event(metrics-field)

  this.maxEventTimesForMethods = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 60,
    //process traces every minute
    maxTotalPoints: 30,
    //for 30 minutes
    archiveEvery: 5 //always trace for every 5 minutes,

  });
  this.tracerStore.start();
};

_.extend(MethodsModel.prototype, KadiraModel.prototype);

MethodsModel.prototype._getMetrics = function (timestamp, method) {
  var dateId = this._getDateId(timestamp);

  if (!this.methodMetricsByMinute[dateId]) {
    this.methodMetricsByMinute[dateId] = {
      methods: Object.create(null)
    };
  }

  var methods = this.methodMetricsByMinute[dateId].methods; //initialize method

  if (!methods[method]) {
    methods[method] = {
      count: 0,
      errors: 0,
      fetchedDocSize: 0,
      sentMsgSize: 0,
      histogram: new DDSketch({
        alpha: 0.02
      })
    };
    METHOD_METRICS_FIELDS.forEach(function (field) {
      methods[method][field] = 0;
    });
  }

  return this.methodMetricsByMinute[dateId].methods[method];
};

MethodsModel.prototype.setStartTime = function (timestamp) {
  this.metricsByMinute[dateId].startTime = timestamp;
};

MethodsModel.prototype.processMethod = function (methodTrace) {
  var dateId = this._getDateId(methodTrace.at); //append metrics to previous values


  this._appendMetrics(dateId, methodTrace);

  if (methodTrace.errored) {
    this.methodMetricsByMinute[dateId].methods[methodTrace.name].errors++;
  }

  this.tracerStore.addTrace(methodTrace);
};

MethodsModel.prototype._appendMetrics = function (id, methodTrace) {
  var methodMetrics = this._getMetrics(id, methodTrace.name); // startTime needs to be converted into serverTime before sending


  if (!this.methodMetricsByMinute[id].startTime) {
    this.methodMetricsByMinute[id].startTime = methodTrace.at;
  } //merge


  METHOD_METRICS_FIELDS.forEach(function (field) {
    var value = methodTrace.metrics[field];

    if (value > 0) {
      methodMetrics[field] += value;
    }
  });
  methodMetrics.count++;
  methodMetrics.histogram.add(methodTrace.metrics.total);
  this.methodMetricsByMinute[id].endTime = methodTrace.metrics.at;
};

MethodsModel.prototype.trackDocSize = function (method, size) {
  var timestamp = Ntp._now();

  var dateId = this._getDateId(timestamp);

  var methodMetrics = this._getMetrics(dateId, method);

  methodMetrics.fetchedDocSize += size;
};

MethodsModel.prototype.trackMsgSize = function (method, size) {
  var timestamp = Ntp._now();

  var dateId = this._getDateId(timestamp);

  var methodMetrics = this._getMetrics(dateId, method);

  methodMetrics.sentMsgSize += size;
};
/*
  There are two types of data

  1. methodMetrics - metrics about the methods (for every 10 secs)
  2. methodRequests - raw method request. normally max, min for every 1 min and errors always
*/


MethodsModel.prototype.buildPayload = function (buildDetailedInfo) {
  var payload = {
    methodMetrics: [],
    methodRequests: []
  }; //handling metrics

  var methodMetricsByMinute = this.methodMetricsByMinute;
  this.methodMetricsByMinute = Object.create(null); //create final paylod for methodMetrics

  for (var key in methodMetricsByMinute) {
    var methodMetrics = methodMetricsByMinute[key]; // converting startTime into the actual serverTime

    var startTime = methodMetrics.startTime;
    methodMetrics.startTime = Kadira.syncedDate.syncTime(startTime);

    for (var methodName in methodMetrics.methods) {
      METHOD_METRICS_FIELDS.forEach(function (field) {
        methodMetrics.methods[methodName][field] /= methodMetrics.methods[methodName].count;
      });
    }

    payload.methodMetrics.push(methodMetricsByMinute[key]);
  } //collect traces and send them with the payload


  payload.methodRequests = this.tracerStore.collectTraces();
  return payload;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pubsub.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/pubsub.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var logger = Npm.require('debug')('kadira:pubsub');

const {
  DDSketch
} = require('monti-apm-sketches-js');

PubsubModel = function () {
  this.metricsByMinute = Object.create(null);
  this.subscriptions = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 60,
    //process traces every minute
    maxTotalPoints: 30,
    //for 30 minutes
    archiveEvery: 5 //always trace for every 5 minutes,

  });
  this.tracerStore.start();
};

PubsubModel.prototype._trackSub = function (session, msg) {
  logger('SUB:', session.id, msg.id, msg.name, msg.params);

  var publication = this._getPublicationName(msg.name);

  var subscriptionId = msg.id;

  var timestamp = Ntp._now();

  var metrics = this._getMetrics(timestamp, publication);

  metrics.subs++;
  this.subscriptions[msg.id] = {
    // We use localTime here, because when we used synedTime we might get
    // minus or more than we've expected
    //   (before serverTime diff changed overtime)
    startTime: timestamp,
    publication: publication,
    params: msg.params,
    id: msg.id
  }; //set session startedTime

  session._startTime = session._startTime || timestamp;
};

_.extend(PubsubModel.prototype, KadiraModel.prototype);

PubsubModel.prototype._trackUnsub = function (session, sub) {
  logger('UNSUB:', session.id, sub._subscriptionId);

  var publication = this._getPublicationName(sub._name);

  var subscriptionId = sub._subscriptionId;
  var subscriptionState = this.subscriptions[subscriptionId];
  var startTime = null; //sometime, we don't have these states

  if (subscriptionState) {
    startTime = subscriptionState.startTime;
  } else {
    //if this is null subscription, which is started automatically
    //hence, we don't have a state
    startTime = session._startTime;
  } //in case, we can't get the startTime


  if (startTime) {
    var timestamp = Ntp._now();

    var metrics = this._getMetrics(timestamp, publication); //track the count


    if (sub._name != null) {
      // we can't track subs for `null` publications.
      // so we should not track unsubs too
      metrics.unsubs++;
    } //use the current date to get the lifeTime of the subscription


    metrics.lifeTime += timestamp - startTime; //this is place we can clean the subscriptionState if exists

    delete this.subscriptions[subscriptionId];
  }
};

PubsubModel.prototype._trackReady = function (session, sub, trace) {
  logger('READY:', session.id, sub._subscriptionId); //use the current time to track the response time

  var publication = this._getPublicationName(sub._name);

  var subscriptionId = sub._subscriptionId;

  var timestamp = Ntp._now();

  var metrics = this._getMetrics(timestamp, publication);

  var subscriptionState = this.subscriptions[subscriptionId];

  if (subscriptionState && !subscriptionState.readyTracked) {
    var resTime = timestamp - subscriptionState.startTime;
    metrics.resTime += resTime;
    subscriptionState.readyTracked = true;
    metrics.histogram.add(resTime);
  }

  if (trace) {
    this.tracerStore.addTrace(trace);
  }
};

PubsubModel.prototype._trackError = function (session, sub, trace) {
  logger('ERROR:', session.id, sub._subscriptionId); //use the current time to track the response time

  var publication = this._getPublicationName(sub._name);

  var subscriptionId = sub._subscriptionId;

  var timestamp = Ntp._now();

  var metrics = this._getMetrics(timestamp, publication);

  metrics.errors++;

  if (trace) {
    this.tracerStore.addTrace(trace);
  }
};

PubsubModel.prototype._getMetrics = function (timestamp, publication) {
  var dateId = this._getDateId(timestamp);

  if (!this.metricsByMinute[dateId]) {
    this.metricsByMinute[dateId] = {
      // startTime needs to be convert to serverTime before sending to the server
      startTime: timestamp,
      pubs: Object.create(null)
    };
  }

  if (!this.metricsByMinute[dateId].pubs[publication]) {
    this.metricsByMinute[dateId].pubs[publication] = {
      subs: 0,
      unsubs: 0,
      resTime: 0,
      activeSubs: 0,
      activeDocs: 0,
      lifeTime: 0,
      totalObservers: 0,
      cachedObservers: 0,
      createdObservers: 0,
      deletedObservers: 0,
      errors: 0,
      observerLifetime: 0,
      polledDocuments: 0,
      oplogUpdatedDocuments: 0,
      oplogInsertedDocuments: 0,
      oplogDeletedDocuments: 0,
      initiallyAddedDocuments: 0,
      liveAddedDocuments: 0,
      liveChangedDocuments: 0,
      liveRemovedDocuments: 0,
      polledDocSize: 0,
      fetchedDocSize: 0,
      initiallyFetchedDocSize: 0,
      liveFetchedDocSize: 0,
      initiallySentMsgSize: 0,
      liveSentMsgSize: 0,
      histogram: new DDSketch({
        alpha: 0.02
      })
    };
  }

  return this.metricsByMinute[dateId].pubs[publication];
};

PubsubModel.prototype._getPublicationName = function (name) {
  return name || "null(autopublish)";
};

PubsubModel.prototype._getSubscriptionInfo = function () {
  var self = this;
  var activeSubs = Object.create(null);
  var activeDocs = Object.create(null);
  var totalDocsSent = Object.create(null);
  var totalDataSent = Object.create(null);
  var totalObservers = Object.create(null);
  var cachedObservers = Object.create(null);
  iterate(Meteor.server.sessions, session => {
    iterate(session._namedSubs, countSubData);
    iterate(session._universalSubs, countSubData);
  });
  var avgObserverReuse = Object.create(null);

  _.each(totalObservers, function (value, publication) {
    avgObserverReuse[publication] = cachedObservers[publication] / totalObservers[publication];
  });

  return {
    activeSubs: activeSubs,
    activeDocs: activeDocs,
    avgObserverReuse: avgObserverReuse
  };

  function countSubData(sub) {
    var publication = self._getPublicationName(sub._name);

    countSubscriptions(sub, publication);
    countDocuments(sub, publication);
    countObservers(sub, publication);
  }

  function countSubscriptions(sub, publication) {
    activeSubs[publication] = activeSubs[publication] || 0;
    activeSubs[publication]++;
  }

  function countDocuments(sub, publication) {
    activeDocs[publication] = activeDocs[publication] || 0;
    iterate(sub._documents, collection => {
      activeDocs[publication] += countKeys(collection);
    });
  }

  function countObservers(sub, publication) {
    totalObservers[publication] = totalObservers[publication] || 0;
    cachedObservers[publication] = cachedObservers[publication] || 0;
    totalObservers[publication] += sub._totalObservers;
    cachedObservers[publication] += sub._cachedObservers;
  }
};

PubsubModel.prototype.buildPayload = function (buildDetailInfo) {
  var metricsByMinute = this.metricsByMinute;
  this.metricsByMinute = Object.create(null);
  var payload = {
    pubMetrics: []
  };

  var subscriptionData = this._getSubscriptionInfo();

  var activeSubs = subscriptionData.activeSubs;
  var activeDocs = subscriptionData.activeDocs;
  var avgObserverReuse = subscriptionData.avgObserverReuse; //to the averaging

  for (var dateId in metricsByMinute) {
    var dateMetrics = metricsByMinute[dateId]; // We need to convert startTime into actual serverTime

    dateMetrics.startTime = Kadira.syncedDate.syncTime(dateMetrics.startTime);

    for (var publication in metricsByMinute[dateId].pubs) {
      var singlePubMetrics = metricsByMinute[dateId].pubs[publication]; // We only calculate resTime for new subscriptions

      singlePubMetrics.resTime /= singlePubMetrics.subs;
      singlePubMetrics.resTime = singlePubMetrics.resTime || 0; // We only track lifeTime in the unsubs

      singlePubMetrics.lifeTime /= singlePubMetrics.unsubs;
      singlePubMetrics.lifeTime = singlePubMetrics.lifeTime || 0; // Count the average for observer lifetime

      if (singlePubMetrics.deletedObservers > 0) {
        singlePubMetrics.observerLifetime /= singlePubMetrics.deletedObservers;
      } // If there are two ore more dateIds, we will be using the currentCount for all of them.
      // We can come up with a better solution later on.


      singlePubMetrics.activeSubs = activeSubs[publication] || 0;
      singlePubMetrics.activeDocs = activeDocs[publication] || 0;
      singlePubMetrics.avgObserverReuse = avgObserverReuse[publication] || 0;
    }

    payload.pubMetrics.push(metricsByMinute[dateId]);
  } //collect traces and send them with the payload


  payload.pubRequests = this.tracerStore.collectTraces();
  return payload;
};

PubsubModel.prototype.incrementHandleCount = function (trace, isCached) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(trace.name);

  var publication = this._getMetrics(timestamp, publicationName);

  var session = getProperty(Meteor.server.sessions, trace.session);

  if (session) {
    var sub = getProperty(session._namedSubs, trace.id);

    if (sub) {
      sub._totalObservers = sub._totalObservers || 0;
      sub._cachedObservers = sub._cachedObservers || 0;
    }
  } // not sure, we need to do this? But I don't need to break the however


  sub = sub || {
    _totalObservers: 0,
    _cachedObservers: 0
  };
  publication.totalObservers++;
  sub._totalObservers++;

  if (isCached) {
    publication.cachedObservers++;
    sub._cachedObservers++;
  }
};

PubsubModel.prototype.trackCreatedObserver = function (info) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  publication.createdObservers++;
};

PubsubModel.prototype.trackDeletedObserver = function (info) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  publication.deletedObservers++;
  publication.observerLifetime += new Date().getTime() - info.startTime;
};

PubsubModel.prototype.trackDocumentChanges = function (info, op) {
  // It's possibel that info to be null
  // Specially when getting changes at the very begining.
  // This may be false, but nice to have a check
  if (!info) {
    return;
  }

  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (op.op === "d") {
    publication.oplogDeletedDocuments++;
  } else if (op.op === "i") {
    publication.oplogInsertedDocuments++;
  } else if (op.op === "u") {
    publication.oplogUpdatedDocuments++;
  }
};

PubsubModel.prototype.trackPolledDocuments = function (info, count) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  publication.polledDocuments += count;
};

PubsubModel.prototype.trackLiveUpdates = function (info, type, count) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (type === "_addPublished") {
    publication.liveAddedDocuments += count;
  } else if (type === "_removePublished") {
    publication.liveRemovedDocuments += count;
  } else if (type === "_changePublished") {
    publication.liveChangedDocuments += count;
  } else if (type === "_initialAdds") {
    publication.initiallyAddedDocuments += count;
  } else {
    throw new Error("Kadira: Unknown live update type");
  }
};

PubsubModel.prototype.trackDocSize = function (name, type, size) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (type === "polledFetches") {
    publication.polledDocSize += size;
  } else if (type === "liveFetches") {
    publication.liveFetchedDocSize += size;
  } else if (type === "cursorFetches") {
    publication.fetchedDocSize += size;
  } else if (type === "initialFetches") {
    publication.initiallyFetchedDocSize += size;
  } else {
    throw new Error("Kadira: Unknown docs fetched type");
  }
};

PubsubModel.prototype.trackMsgSize = function (name, type, size) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (type === "liveSent") {
    publication.liveSentMsgSize += size;
  } else if (type === "initialSent") {
    publication.initiallySentMsgSize += size;
  } else {
    throw new Error("Kadira: Unknown docs fetched type");
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"system.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/system.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let createHistogram;
module.link("../utils.js", {
  createHistogram(v) {
    createHistogram = v;
  }

}, 0);
let GCMetrics;
module.link("../hijack/gc.js", {
  default(v) {
    GCMetrics = v;
  }

}, 1);
let getFiberMetrics, resetFiberMetrics;
module.link("../hijack/async.js", {
  getFiberMetrics(v) {
    getFiberMetrics = v;
  },

  resetFiberMetrics(v) {
    resetFiberMetrics = v;
  }

}, 2);
let getMongoDriverStats, resetMongoDriverStats;
module.link("../hijack/mongo_driver_events.js", {
  getMongoDriverStats(v) {
    getMongoDriverStats = v;
  },

  resetMongoDriverStats(v) {
    resetMongoDriverStats = v;
  }

}, 3);

var EventLoopMonitor = Npm.require('evloop-monitor');

SystemModel = function () {
  this.startTime = Ntp._now();
  this.newSessions = 0;
  this.sessionTimeout = 1000 * 60 * 30; //30 min

  this.evloopHistogram = createHistogram();
  this.evloopMonitor = new EventLoopMonitor(200);
  this.evloopMonitor.start();
  this.evloopMonitor.on('lag', lag => {
    // store as microsecond
    this.evloopHistogram.add(lag * 1000);
  });
  this.gcMetrics = new GCMetrics();
  this.gcMetrics.start();
  this.cpuTime = process.hrtime();
  this.previousCpuUsage = process.cpuUsage();
  this.cpuHistory = [];
  this.currentCpuUsage = 0;
  setInterval(() => {
    this.cpuUsage();
  }, 2000);
};

_.extend(SystemModel.prototype, KadiraModel.prototype);

SystemModel.prototype.buildPayload = function () {
  var metrics = {};

  var now = Ntp._now();

  metrics.startTime = Kadira.syncedDate.syncTime(this.startTime);
  metrics.endTime = Kadira.syncedDate.syncTime(now);
  metrics.sessions = countKeys(Meteor.server.sessions);
  let memoryUsage = process.memoryUsage();
  metrics.memory = memoryUsage.rss / (1024 * 1024);
  metrics.memoryArrayBuffers = (memoryUsage.arrayBuffers || 0) / (1024 * 1024);
  metrics.memoryExternal = memoryUsage.external / (1024 * 1024);
  metrics.memoryHeapUsed = memoryUsage.heapUsed / (1024 * 1024);
  metrics.memoryHeapTotal = memoryUsage.heapTotal / (1024 * 1024);
  metrics.newSessions = this.newSessions;
  this.newSessions = 0;
  metrics.activeRequests = process._getActiveRequests().length;
  metrics.activeHandles = process._getActiveHandles().length; // track eventloop metrics

  metrics.pctEvloopBlock = this.evloopMonitor.status().pctBlock;
  metrics.evloopHistogram = this.evloopHistogram;
  this.evloopHistogram = createHistogram();
  metrics.gcMajorDuration = this.gcMetrics.metrics.gcMajor;
  metrics.gcMinorDuration = this.gcMetrics.metrics.gcMinor;
  metrics.gcIncrementalDuration = this.gcMetrics.metrics.gcIncremental;
  metrics.gcWeakCBDuration = this.gcMetrics.metrics.gcWeakCB;
  this.gcMetrics.reset();
  const driverMetrics = getMongoDriverStats();
  resetMongoDriverStats();
  metrics.mongoPoolSize = driverMetrics.poolSize;
  metrics.mongoPoolPrimaryCheckouts = driverMetrics.primaryCheckouts;
  metrics.mongoPoolOtherCheckouts = driverMetrics.otherCheckouts;
  metrics.mongoPoolCheckoutTime = driverMetrics.checkoutTime;
  metrics.mongoPoolMaxCheckoutTime = driverMetrics.maxCheckoutTime;
  metrics.mongoPoolPending = driverMetrics.pending;
  metrics.mongoPoolCheckedOutConnections = driverMetrics.checkedOut;
  metrics.mongoPoolCreatedConnections = driverMetrics.created;
  const fiberMetrics = getFiberMetrics();
  resetFiberMetrics();
  metrics.createdFibers = fiberMetrics.created;
  metrics.activeFibers = fiberMetrics.active;
  metrics.fiberPoolSize = fiberMetrics.poolSize;
  metrics.pcpu = 0;
  metrics.pcpuUser = 0;
  metrics.pcpuSystem = 0;

  if (this.cpuHistory.length > 0) {
    let lastCpuUsage = this.cpuHistory[this.cpuHistory.length - 1];
    metrics.pcpu = lastCpuUsage.usage * 100;
    metrics.pcpuUser = lastCpuUsage.user * 100;
    metrics.pcpuSystem = lastCpuUsage.sys * 100;
  }

  metrics.cpuHistory = this.cpuHistory.map(entry => {
    return {
      time: Kadira.syncedDate.syncTime(entry.time),
      usage: entry.usage,
      sys: entry.sys,
      user: entry.user
    };
  });
  this.cpuHistory = [];
  this.startTime = now;
  return {
    systemMetrics: [metrics]
  };
};

function hrtimeToMS(hrtime) {
  return hrtime[0] * 1000 + hrtime[1] / 1000000;
}

SystemModel.prototype.cpuUsage = function () {
  var elapTimeMS = hrtimeToMS(process.hrtime(this.cpuTime));
  var elapUsage = process.cpuUsage(this.previousCpuUsage);
  var elapUserMS = elapUsage.user / 1000;
  var elapSystMS = elapUsage.system / 1000;
  var totalUsageMS = elapUserMS + elapSystMS;
  var totalUsagePercent = totalUsageMS / elapTimeMS;
  this.cpuHistory.push({
    time: Ntp._now(),
    usage: totalUsagePercent,
    user: elapUserMS / elapTimeMS,
    sys: elapSystMS / elapUsage.system
  });
  this.currentCpuUsage = totalUsagePercent * 100;
  Kadira.docSzCache.setPcpu(this.currentCpuUsage);
  this.cpuTime = process.hrtime();
  this.previousCpuUsage = process.cpuUsage();
};

SystemModel.prototype.handleSessionActivity = function (msg, session) {
  if (msg.msg === 'connect' && !msg.session) {
    this.countNewSession(session);
  } else if (['sub', 'method'].indexOf(msg.msg) != -1) {
    if (!this.isSessionActive(session)) {
      this.countNewSession(session);
    }
  }

  session._activeAt = Date.now();
};

SystemModel.prototype.countNewSession = function (session) {
  if (!isLocalAddress(session.socket)) {
    this.newSessions++;
  }
};

SystemModel.prototype.isSessionActive = function (session) {
  var inactiveTime = Date.now() - session._activeAt;

  return inactiveTime < this.sessionTimeout;
}; // ------------------------------------------------------------------------- //
// http://regex101.com/r/iF3yR3/2


var isLocalHostRegex = /^(?:.*\.local|localhost)(?:\:\d+)?|127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/; // http://regex101.com/r/hM5gD8/1

var isLocalAddressRegex = /^127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/;

function isLocalAddress(socket) {
  var host = socket.headers['host'];
  if (host) return isLocalHostRegex.test(host);
  var address = socket.headers['x-forwarded-for'] || socket.remoteAddress;
  if (address) return isLocalAddressRegex.test(address);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"errors.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/errors.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
ErrorModel = function (appId) {
  BaseErrorModel.call(this);
  var self = this;
  this.appId = appId;
  this.errors = {};
  this.startTime = Date.now();
  this.maxErrors = 10;
};

Object.assign(ErrorModel.prototype, KadiraModel.prototype);
Object.assign(ErrorModel.prototype, BaseErrorModel.prototype);

ErrorModel.prototype.buildPayload = function () {
  var metrics = _.values(this.errors);

  this.startTime = Ntp._now();
  metrics.forEach(function (metric) {
    metric.startTime = Kadira.syncedDate.syncTime(metric.startTime);
  });
  this.errors = {};
  return {
    errors: metrics
  };
};

ErrorModel.prototype.errorCount = function () {
  return _.values(this.errors).length;
};

ErrorModel.prototype.trackError = function (ex, trace) {
  var key = trace.type + ':' + ex.message;

  if (this.errors[key]) {
    this.errors[key].count++;
  } else if (this.errorCount() < this.maxErrors) {
    var errorDef = this._formatError(ex, trace);

    if (this.applyFilters(errorDef.type, errorDef.name, ex, errorDef.subType)) {
      this.errors[key] = this._formatError(ex, trace);
    }
  }
};

ErrorModel.prototype._formatError = function (ex, trace) {
  var time = Date.now();
  var stack = ex.stack; // to get Meteor's Error details

  if (ex.details) {
    stack = "Details: " + ex.details + "\r\n" + stack;
  } // Update trace's error event with the next stack


  var errorEvent = trace.events && trace.events[trace.events.length - 1];
  var errorObject = errorEvent && errorEvent[2] && errorEvent[2].error;

  if (errorObject) {
    errorObject.stack = stack;
  }

  return {
    appId: this.appId,
    name: ex.message,
    type: trace.type,
    startTime: time,
    subType: trace.subType || trace.name,
    trace: trace,
    stacks: [{
      stack: stack
    }],
    count: 1
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"http.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/http.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const {
  DDSketch
} = require('monti-apm-sketches-js');

const METHOD_METRICS_FIELDS = ['db', 'http', 'email', 'async', 'compute', 'total', 'fs'];

const HttpModel = function () {
  this.metricsByMinute = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 10,
    maxTotalPoints: 30,
    archiveEvery: 10
  });
  this.tracerStore.start();
};

_.extend(HttpModel.prototype, KadiraModel.prototype);

HttpModel.prototype.processRequest = function (trace, req, res) {
  const dateId = this._getDateId(trace.at);

  this._appendMetrics(dateId, trace, res);

  this.tracerStore.addTrace(trace);
};

HttpModel.prototype._getMetrics = function (timestamp, routeId) {
  const dateId = this._getDateId(timestamp);

  if (!this.metricsByMinute[dateId]) {
    this.metricsByMinute[dateId] = {
      routes: Object.create(null)
    };
  }

  const routes = this.metricsByMinute[dateId].routes;

  if (!routes[routeId]) {
    routes[routeId] = {
      histogram: new DDSketch({
        alpha: 0.02
      }),
      count: 0,
      errors: 0,
      statusCodes: Object.create(null)
    };
    METHOD_METRICS_FIELDS.forEach(function (field) {
      routes[routeId][field] = 0;
    });
  }

  return this.metricsByMinute[dateId].routes[routeId];
};

HttpModel.prototype._appendMetrics = function (dateId, trace, res) {
  var requestMetrics = this._getMetrics(dateId, trace.name);

  if (!this.metricsByMinute[dateId].startTime) {
    this.metricsByMinute[dateId].startTime = trace.at;
  } // merge


  METHOD_METRICS_FIELDS.forEach(field => {
    var value = trace.metrics[field];

    if (value > 0) {
      requestMetrics[field] += value;
    }
  });
  const statusCode = res.statusCode;
  let statusMetric;

  if (statusCode < 200) {
    statusMetric = '1xx';
  } else if (statusCode < 300) {
    statusMetric = '2xx';
  } else if (statusCode < 400) {
    statusMetric = '3xx';
  } else if (statusCode < 500) {
    statusMetric = '4xx';
  } else if (statusCode < 600) {
    statusMetric = '5xx';
  }

  requestMetrics.statusCodes[statusMetric] = requestMetrics.statusCodes[statusMetric] || 0;
  requestMetrics.statusCodes[statusMetric] += 1;
  requestMetrics.count += 1;
  requestMetrics.histogram.add(trace.metrics.total);
  this.metricsByMinute[dateId].endTime = trace.metrics.at;
};

HttpModel.prototype.buildPayload = function () {
  var payload = {
    httpMetrics: [],
    httpRequests: []
  };
  var metricsByMinute = this.metricsByMinute;
  this.metricsByMinute = Object.create(null);

  for (var key in metricsByMinute) {
    var metrics = metricsByMinute[key]; // convert startTime into the actual serverTime

    var startTime = metrics.startTime;
    metrics.startTime = Kadira.syncedDate.syncTime(startTime);

    for (var requestName in metrics.routes) {
      METHOD_METRICS_FIELDS.forEach(function (field) {
        metrics.routes[requestName][field] /= metrics.routes[requestName].count;
      });
    }

    payload.httpMetrics.push(metricsByMinute[key]);
  }

  payload.httpRequests = this.tracerStore.collectTraces();
  return payload;
};

module.exportDefault(HttpModel);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"jobs.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/jobs.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Jobs = Kadira.Jobs = {};

Jobs.getAsync = function (id, callback) {
  Kadira.coreApi.getJob(id).then(function (data) {
    callback(null, data);
  }).catch(function (err) {
    callback(err);
  });
};

Jobs.setAsync = function (id, changes, callback) {
  Kadira.coreApi.updateJob(id, changes).then(function (data) {
    callback(null, data);
  }).catch(function (err) {
    callback(err);
  });
};

Jobs.set = Kadira._wrapAsync(Jobs.setAsync);
Jobs.get = Kadira._wrapAsync(Jobs.getAsync);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"retry.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/retry.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/utils.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  createHistogram: () => createHistogram
});

const {
  DDSketch
} = require('monti-apm-sketches-js');

HaveAsyncCallback = function (args) {
  var lastArg = args[args.length - 1];
  return typeof lastArg == 'function';
};

UniqueId = function (start) {
  this.id = 0;
};

UniqueId.prototype.get = function () {
  return "" + this.id++;
};

DefaultUniqueId = new UniqueId(); // creates a stack trace, removing frames in montiapm:agent's code

CreateUserStack = function (error) {
  const stack = (error || new Error()).stack.split('\n');
  let toRemove = 1; // Find how many frames need to be removed
  // to make the user's code the first frame

  for (; toRemove < stack.length; toRemove++) {
    if (stack[toRemove].indexOf('montiapm:agent') === -1) {
      break;
    }
  }

  return stack.slice(toRemove).join('\n');
}; // Optimized version of apply which tries to call as possible as it can
// Then fall back to apply
// This is because, v8 is very slow to invoke apply.


OptimizedApply = function OptimizedApply(context, fn, args) {
  var a = args;

  switch (a.length) {
    case 0:
      return fn.call(context);

    case 1:
      return fn.call(context, a[0]);

    case 2:
      return fn.call(context, a[0], a[1]);

    case 3:
      return fn.call(context, a[0], a[1], a[2]);

    case 4:
      return fn.call(context, a[0], a[1], a[2], a[3]);

    case 5:
      return fn.call(context, a[0], a[1], a[2], a[3], a[4]);

    default:
      return fn.apply(context, a);
  }
};

getClientVersions = function () {
  return {
    'web.cordova': getClientArchVersion('web.cordova'),
    'web.browser': getClientArchVersion('web.browser'),
    'web.browser.legacy': getClientArchVersion('web.browser.legacy')
  };
}; // Returns number of keys of an object, or size of a Map or Set


countKeys = function (obj) {
  if (obj instanceof Map || obj instanceof Set) {
    return obj.size;
  }

  return Object.keys(obj).length;
}; // Iterates objects and maps.
// Callback is called with a value and key


iterate = function (obj, callback) {
  if (obj instanceof Map) {
    return obj.forEach(callback);
  }

  for (var key in obj) {
    var value = obj[key];
    callback(value, key);
  }
}; // Returns a property from an object, or an entry from a map


getProperty = function (obj, key) {
  if (obj instanceof Map) {
    return obj.get(key);
  }

  return obj[key];
};

function createHistogram() {
  return new DDSketch({
    alpha: 0.02
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ntp.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/ntp.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sourcemaps.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/sourcemaps.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var url = Npm.require('url');

var path = Npm.require('path');

var fs = Npm.require('fs');

var logger = Npm.require('debug')('kadira:apm:sourcemaps'); // Meteor 1.7 and older used clientPaths


var clientPaths = __meteor_bootstrap__.configJson.clientPaths;
var clientArchs = __meteor_bootstrap__.configJson.clientArchs;
var serverDir = __meteor_bootstrap__.serverDir;
var absClientPaths;

if (clientArchs) {
  absClientPaths = clientArchs.reduce((result, arch) => {
    result[arch] = path.resolve(path.dirname(serverDir), arch);
    return result;
  }, {});
} else {
  absClientPaths = Object.keys(clientPaths).reduce((result, key) => {
    result[key] = path.resolve(serverDir, path.dirname(clientPaths[key]));
    return result;
  }, {});
}

handleApiResponse = function () {
  let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var unavailable = [];

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      logger('failed parsing body', e, body);
      return;
    }
  }

  var neededSourcemaps = body.neededSourcemaps || [];
  logger('body', neededSourcemaps);
  var promises = neededSourcemaps.map(sourcemap => {
    if (!Kadira.options.uploadSourceMaps) {
      return unavailable.push(sourcemap);
    }

    return getSourcemapPath(sourcemap.arch, sourcemap.file.path).then(function (sourceMapPath) {
      if (sourceMapPath === null) {
        unavailable.push(sourcemap);
      } else {
        sendSourcemap(sourcemap, sourceMapPath);
      }
    });
  });
  Promise.all(promises).then(function () {
    if (unavailable.length > 0) {
      logger('sending unavailable sourcemaps', unavailable);
      Kadira.coreApi.sendData({
        unavailableSourcemaps: unavailable
      }).then(function (body) {
        handleApiResponse(body);
      }).catch(function (err) {
        console.log('Monti APM: unable to send data', err);
      });
    }
  });
};

function sendSourcemap(sourcemap, sourcemapPath) {
  logger('Sending sourcemap', sourcemap, sourcemapPath);
  var stream = fs.createReadStream(sourcemapPath);
  stream.on('error', err => {
    console.log('Monti APM: error while uploading sourcemap', err);
  });
  var arch = sourcemap.arch;
  var archVersion = sourcemap.archVersion;
  var file = encodeURIComponent(sourcemap.file.path);
  Kadira.coreApi.sendStream("/sourcemap?arch=".concat(arch, "&archVersion=").concat(archVersion, "&file=").concat(file), stream).catch(function (err) {
    console.log('Monti APM: error uploading sourcemap', err);
  });
}

function preparePath(urlPath) {
  urlPath = path.posix.normalize(urlPath);

  if (urlPath[0] === '/') {
    urlPath = urlPath.slice(1);
  }

  return urlPath;
}

function checkForDynamicImport(arch, urlPath) {
  const filePath = preparePath(urlPath);
  return new Promise(function (resolve) {
    const archPath = absClientPaths[arch];
    const dynamicPath = path.join(archPath, 'dynamic', filePath) + '.map';
    fs.stat(dynamicPath, function (err) {
      resolve(err ? null : dynamicPath);
    });
  });
}

function getSourcemapPath(arch, urlPath) {
  return new Promise((resolve, reject) => {
    var clientProgram = WebApp.clientPrograms[arch];

    if (!clientProgram || !clientProgram.manifest) {
      return resolve(null);
    }

    var fileInfo = clientProgram.manifest.find(file => {
      return file.url && file.url.startsWith(urlPath);
    });

    if (fileInfo && fileInfo.sourceMap) {
      return resolve(path.join(absClientPaths[arch], fileInfo.sourceMap));
    }

    checkForDynamicImport(arch, urlPath).then(resolve).catch(reject);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wait_time_builder.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/wait_time_builder.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  WaitTimeBuilder: () => WaitTimeBuilder
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
const WAITON_MESSAGE_FIELDS = ['msg', 'id', 'method', 'name', 'waitTime']; // This is way how we can build waitTime and it's breakdown

class WaitTimeBuilder {
  constructor() {
    this._waitListStore = {};
    this._currentProcessingMessages = {};
    this._messageCache = {};
  }

  register(session, msgId) {
    const mainKey = this._getMessageKey(session.id, msgId);

    let inQueue = session.inQueue || [];

    if (typeof inQueue.toArray === 'function') {
      // latest version of Meteor uses a double-ended-queue for the inQueue
      // info: https://www.npmjs.com/package/double-ended-queue
      inQueue = inQueue.toArray();
    }

    const waitList = inQueue.map(msg => {
      const key = this._getMessageKey(session.id, msg.id);

      return this._getCacheMessage(key, msg);
    }) || []; // add currently processing ddp message if exists

    const currentlyProcessingMessage = this._currentProcessingMessages[session.id];

    if (currentlyProcessingMessage) {
      const key = this._getMessageKey(session.id, currentlyProcessingMessage.id);

      waitList.unshift(this._getCacheMessage(key, currentlyProcessingMessage));
    }

    this._waitListStore[mainKey] = waitList;
  }

  build(session, msgId) {
    const mainKey = this._getMessageKey(session.id, msgId);

    const waitList = this._waitListStore[mainKey] || [];
    delete this._waitListStore[mainKey];
    const filteredWaitList = waitList.map(this._cleanCacheMessage.bind(this));
    return filteredWaitList;
  }

  _getMessageKey(sessionId, msgId) {
    return "".concat(sessionId, "::").concat(msgId);
  }

  _getCacheMessage(key, msg) {
    let cachedMessage = this._messageCache[key];

    if (!cachedMessage) {
      this._messageCache[key] = cachedMessage = _.pick(msg, WAITON_MESSAGE_FIELDS);
      cachedMessage._key = key;
      cachedMessage._registered = 1;
    } else {
      cachedMessage._registered++;
    }

    return cachedMessage;
  }

  _cleanCacheMessage(msg) {
    msg._registered--;

    if (msg._registered == 0) {
      delete this._messageCache[msg._key];
    } // need to send a clean set of objects
    // otherwise register can go with this


    return _.pick(msg, WAITON_MESSAGE_FIELDS);
  }

  trackWaitTime(session, msg, unblock) {
    const started = Date.now();
    this._currentProcessingMessages[session.id] = msg;
    let unblocked = false;
    const self = this;

    const wrappedUnblock = function () {
      if (!unblocked) {
        const waitTime = Date.now() - started;

        const key = self._getMessageKey(session.id, msg.id);

        const cachedMessage = self._messageCache[key];

        if (cachedMessage) {
          cachedMessage.waitTime = waitTime;
        }

        delete self._currentProcessingMessages[session.id];
        unblocked = true;
        unblock();
      }
    };

    return wrappedUnblock;
  }

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"check_for_oplog.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/check_for_oplog.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// expose for testing purpose
OplogCheck = {};

OplogCheck._070 = function (cursorDescription) {
  var options = cursorDescription.options;

  if (options.limit) {
    return {
      code: "070_LIMIT_NOT_SUPPORTED",
      reason: "Meteor 0.7.0 does not support limit with oplog.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  ;

  var exists$ = _.any(cursorDescription.selector, function (value, field) {
    if (field.substr(0, 1) === '$') return true;
  });

  if (exists$) {
    return {
      code: "070_$_NOT_SUPPORTED",
      reason: "Meteor 0.7.0 supports only equal checks with oplog.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  ;

  var onlyScalers = _.all(cursorDescription.selector, function (value, field) {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null || value instanceof Meteor.Collection.ObjectID;
  });

  if (!onlyScalers) {
    return {
      code: "070_ONLY_SCALERS",
      reason: "Meteor 0.7.0 only supports scalers as comparators.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  return true;
};

OplogCheck._071 = function (cursorDescription) {
  var options = cursorDescription.options;
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (options.limit) {
    return {
      code: "071_LIMIT_NOT_SUPPORTED",
      reason: "Meteor 0.7.1 does not support limit with oplog.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  ;
  return true;
};

OplogCheck.env = function () {
  if (!process.env.MONGO_OPLOG_URL) {
    return {
      code: "NO_ENV",
      reason: "You haven't added oplog support for your the Meteor app.",
      solution: "Add oplog support for your Meteor app. see: http://goo.gl/Co1jJc"
    };
  } else {
    return true;
  }
};

OplogCheck.disableOplog = function (cursorDescription) {
  if (cursorDescription.options._disableOplog) {
    return {
      code: "DISABLE_OPLOG",
      reason: "You've disable oplog for this cursor explicitly with _disableOplog option."
    };
  } else {
    return true;
  }
}; // when creating Minimongo.Matcher object, if that's throws an exception
// meteor won't do the oplog support


OplogCheck.miniMongoMatcher = function (cursorDescription) {
  if (Minimongo.Matcher) {
    try {
      var matcher = new Minimongo.Matcher(cursorDescription.selector);
      return true;
    } catch (ex) {
      return {
        code: "MINIMONGO_MATCHER_ERROR",
        reason: "There's something wrong in your mongo query: " + ex.message,
        solution: "Check your selector and change it accordingly."
      };
    }
  } else {
    // If there is no Minimongo.Matcher, we don't need to check this
    return true;
  }
};

OplogCheck.miniMongoSorter = function (cursorDescription) {
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (Minimongo.Sorter && cursorDescription.options.sort) {
    try {
      var sorter = new Minimongo.Sorter(cursorDescription.options.sort, {
        matcher: matcher
      });
      return true;
    } catch (ex) {
      return {
        code: "MINIMONGO_SORTER_ERROR",
        reason: "Some of your sort specifiers are not supported: " + ex.message,
        solution: "Check your sort specifiers and chage them accordingly."
      };
    }
  } else {
    return true;
  }
};

OplogCheck.fields = function (cursorDescription) {
  var options = cursorDescription.options;

  if (options.fields) {
    try {
      LocalCollection._checkSupportedProjection(options.fields);

      return true;
    } catch (e) {
      if (e.name === "MinimongoError") {
        return {
          code: "NOT_SUPPORTED_FIELDS",
          reason: "Some of the field filters are not supported: " + e.message,
          solution: "Try removing those field filters."
        };
      } else {
        throw e;
      }
    }
  }

  return true;
};

OplogCheck.skip = function (cursorDescription) {
  if (cursorDescription.options.skip) {
    return {
      code: "SKIP_NOT_SUPPORTED",
      reason: "Skip does not support with oplog.",
      solution: "Try to avoid using skip. Use range queries instead: http://goo.gl/b522Av"
    };
  }

  return true;
};

OplogCheck.where = function (cursorDescription) {
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (matcher.hasWhere()) {
    return {
      code: "WHERE_NOT_SUPPORTED",
      reason: "Meteor does not support queries with $where.",
      solution: "Try to remove $where from your query. Use some alternative."
    };
  }

  ;
  return true;
};

OplogCheck.geo = function (cursorDescription) {
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (matcher.hasGeoQuery()) {
    return {
      code: "GEO_NOT_SUPPORTED",
      reason: "Meteor does not support queries with geo partial operators.",
      solution: "Try to remove geo partial operators from your query if possible."
    };
  }

  ;
  return true;
};

OplogCheck.limitButNoSort = function (cursorDescription) {
  var options = cursorDescription.options;

  if (options.limit && !options.sort) {
    return {
      code: "LIMIT_NO_SORT",
      reason: "Meteor oplog implementation does not support limit without a sort specifier.",
      solution: "Try adding a sort specifier."
    };
  }

  ;
  return true;
};

OplogCheck.olderVersion = function (cursorDescription, driver) {
  if (driver && !driver.constructor.cursorSupported) {
    return {
      code: "OLDER_VERSION",
      reason: "Your Meteor version does not have oplog support.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  return true;
};

OplogCheck.gitCheckout = function (cursorDescription, driver) {
  if (!Meteor.release) {
    return {
      code: "GIT_CHECKOUT",
      reason: "Seems like your Meteor version is based on a Git checkout and it doesn't have the oplog support.",
      solution: "Try to upgrade your Meteor version."
    };
  }

  return true;
};

var preRunningMatchers = [OplogCheck.env, OplogCheck.disableOplog, OplogCheck.miniMongoMatcher];
var globalMatchers = [OplogCheck.fields, OplogCheck.skip, OplogCheck.where, OplogCheck.geo, OplogCheck.limitButNoSort, OplogCheck.miniMongoSorter, OplogCheck.olderVersion, OplogCheck.gitCheckout];
var versionMatchers = [[/^0\.7\.1/, OplogCheck._071], [/^0\.7\.0/, OplogCheck._070]];

Kadira.checkWhyNoOplog = function (cursorDescription, observerDriver) {
  if (typeof Minimongo == 'undefined') {
    return {
      code: "CANNOT_DETECT",
      reason: "You are running an older Meteor version and Kadira can't check oplog state.",
      solution: "Try updating your Meteor app"
    };
  }

  var result = runMatchers(preRunningMatchers, cursorDescription, observerDriver);

  if (result !== true) {
    return result;
  }

  var meteorVersion = Meteor.release;

  for (var lc = 0; lc < versionMatchers.length; lc++) {
    var matcherInfo = versionMatchers[lc];

    if (matcherInfo[0].test(meteorVersion)) {
      var matched = matcherInfo[1](cursorDescription, observerDriver);

      if (matched !== true) {
        return matched;
      }
    }
  }

  result = runMatchers(globalMatchers, cursorDescription, observerDriver);

  if (result !== true) {
    return result;
  }

  return {
    code: "OPLOG_SUPPORTED",
    reason: "This query should support oplog. It's weird if it's not.",
    solution: "Please contact Kadira support and let's discuss."
  };
};

function runMatchers(matcherList, cursorDescription, observerDriver) {
  for (var lc = 0; lc < matcherList.length; lc++) {
    var matcher = matcherList[lc];
    var matched = matcher(cursorDescription, observerDriver);

    if (matched !== true) {
      return matched;
    }
  }

  return true;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"tracer":{"tracer.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/tracer/tracer.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var eventLogger = Npm.require('debug')('kadira:tracer');

var REPETITIVE_EVENTS = {
  'db': true,
  'http': true,
  'email': true,
  'wait': true,
  'async': true,
  'custom': true,
  'fs': true
};
var TRACE_TYPES = ['sub', 'method', 'http'];
var MAX_TRACE_EVENTS = 1500;

Tracer = function Tracer() {
  this._filters = [];
  this._filterFields = ['password'];
  this.maxArrayItemsToFilter = 20;
}; //In the future, we might wan't to track inner fiber events too.
//Then we can't serialize the object with methods
//That's why we use this method of returning the data


Tracer.prototype.start = function (name, type) {
  let {
    sessionId,
    msgId,
    userId
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // for backward compatibility
  if (typeof name === 'object' && typeof type === 'object') {
    let session = name;
    let msg = type;
    sessionId = session.id;
    msgId = msg.id;
    userId = session.userId;

    if (msg.msg == 'method') {
      type = 'method';
      name = msg.method;
    } else if (msg.msg == 'sub') {
      type = 'sub';
      name = msg.name;
    } else {
      return null;
    }
  }

  if (TRACE_TYPES.indexOf(type) === -1) {
    console.warn("Monti APM: unknown trace type \"".concat(type, "\""));
    return null;
  }

  var traceInfo = {
    _id: "".concat(sessionId, "::").concat(msgId || DefaultUniqueId.get()),
    type,
    name,
    session: sessionId,
    id: msgId,
    events: [],
    userId
  };
  return traceInfo;
};

Tracer.prototype.event = function (traceInfo, type, data, metaData) {
  // do not allow to proceed, if already completed or errored
  var lastEvent = this.getLastEvent(traceInfo);

  if ( // trace completed but has not been processed
  lastEvent && ['complete', 'error'].indexOf(lastEvent.type) >= 0 || // trace completed and processed.
  traceInfo.isEventsProcessed) {
    return false;
  }

  var event = {
    type,
    at: Ntp._now(),
    endAt: null,
    nested: []
  }; // special handling for events that are not repetitive

  if (!REPETITIVE_EVENTS[type]) {
    event.endAt = event.at;
  }

  if (data) {
    var info = _.pick(traceInfo, 'type', 'name');

    event.data = this._applyFilters(type, data, info, "start");
  }

  if (metaData && metaData.name) {
    event.name = metaData.name;
  }

  if (Kadira.options.eventStackTrace) {
    event.stack = CreateUserStack();
  }

  eventLogger("%s %s", type, traceInfo._id);

  if (lastEvent && !lastEvent.endAt) {
    if (!lastEvent.nested) {
      console.error('Monti: invalid trace. Please share the trace below at');
      console.error('Monti: https://github.com/monti-apm/monti-apm-agent/issues/14');
      console.dir(traceInfo, {
        depth: 10
      });
    }

    var lastNested = lastEvent.nested[lastEvent.nested.length - 1]; // Only nest one level

    if (!lastNested || lastNested.endAt) {
      lastEvent.nested.push(event);
      return event;
    }

    return false;
  }

  traceInfo.events.push(event);
  return event;
};

Tracer.prototype.eventEnd = function (traceInfo, event, data) {
  if (event.endAt) {
    // Event already ended or is not a repititive event
    return false;
  }

  event.endAt = Ntp._now();

  if (data) {
    var info = _.pick(traceInfo, 'type', 'name');

    event.data = Object.assign(event.data || {}, this._applyFilters("".concat(event.type, "end"), data, info, 'end'));
  }

  eventLogger("%s %s", event.type + 'end', traceInfo._id);
  return true;
};

Tracer.prototype.getLastEvent = function (traceInfo) {
  return traceInfo.events[traceInfo.events.length - 1];
};

Tracer.prototype.endLastEvent = function (traceInfo) {
  var lastEvent = this.getLastEvent(traceInfo);

  if (!lastEvent.endAt) {
    this.eventEnd(traceInfo, lastEvent);
    lastEvent.forcedEnd = true;
    return true;
  }

  return false;
}; // Most of the time, all of the nested events are async
// which is not helpful. This returns true if
// there are nested events other than async.


Tracer.prototype._hasUsefulNested = function (event) {
  return !event.nested.every(event => {
    return event.type === 'async';
  });
};

Tracer.prototype.buildEvent = function (event) {
  let depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  let trace = arguments.length > 2 ? arguments[2] : undefined;
  var elapsedTimeForEvent = event.endAt - event.at;
  var builtEvent = [event.type];
  var nested = [];
  builtEvent.push(elapsedTimeForEvent);
  builtEvent.push(event.data || {});

  if (event.nested.length && this._hasUsefulNested(event)) {
    let prevEnd = event.at;

    for (let i = 0; i < event.nested.length; i++) {
      var nestedEvent = event.nested[i];

      if (!nestedEvent.endAt) {
        this.eventEnd(trace, nestedEvent);
        nestedEvent.forcedEnd = true;
      }

      var computeTime = nestedEvent.at - prevEnd;

      if (computeTime > 0) {
        nested.push(['compute', computeTime]);
      }

      nested.push(this.buildEvent(nestedEvent, depth + 1, trace));
      prevEnd = nestedEvent.endAt;
    }
  }

  if (nested.length || event.stack || event.forcedEnd || event.name) {
    builtEvent.push({
      stack: event.stack,
      nested: nested.length ? nested : undefined,
      forcedEnd: event.forcedEnd,
      name: event.name
    });
  }

  return builtEvent;
};

Tracer.prototype.buildTrace = function (traceInfo) {
  var firstEvent = traceInfo.events[0];
  var lastEvent = traceInfo.events[traceInfo.events.length - 1];
  var processedEvents = [];

  if (firstEvent.type !== 'start') {
    console.warn('Monti APM: trace has not started yet');
    return null;
  } else if (lastEvent.type !== 'complete' && lastEvent.type !== 'error') {
    //trace is not completed or errored yet
    console.warn('Monti APM: trace has not completed or errored yet');
    return null;
  } else {
    //build the metrics
    traceInfo.errored = lastEvent.type === 'error';
    traceInfo.at = firstEvent.at;
    var metrics = {
      total: lastEvent.at - firstEvent.at
    };
    var totalNonCompute = 0;
    firstEvent = ['start', 0];

    if (traceInfo.events[0].data) {
      firstEvent.push(traceInfo.events[0].data);
    }

    processedEvents.push(firstEvent);

    for (var lc = 1; lc < traceInfo.events.length - 1; lc += 1) {
      var prevEvent = traceInfo.events[lc - 1];
      var event = traceInfo.events[lc];

      if (!event.endAt) {
        console.error('Monti APM: no end event for type: ', event.type);
        return null;
      }

      var computeTime = event.at - prevEvent.endAt;

      if (computeTime > 0) {
        processedEvents.push(['compute', computeTime]);
      }

      var builtEvent = this.buildEvent(event, 0, traceInfo);
      processedEvents.push(builtEvent);
      metrics[event.type] = metrics[event.type] || 0;
      metrics[event.type] += builtEvent[1];
      totalNonCompute += builtEvent[1];
    }
  }

  computeTime = lastEvent.at - traceInfo.events[traceInfo.events.length - 2].endAt;
  if (computeTime > 0) processedEvents.push(['compute', computeTime]);
  var lastEventData = [lastEvent.type, 0];
  if (lastEvent.data) lastEventData.push(lastEvent.data);
  processedEvents.push(lastEventData);

  if (processedEvents.length > MAX_TRACE_EVENTS) {
    const removeCount = processedEvents.length - MAX_TRACE_EVENTS;
    processedEvents.splice(MAX_TRACE_EVENTS, removeCount);
  }

  metrics.compute = metrics.total - totalNonCompute;
  traceInfo.metrics = metrics;
  traceInfo.events = processedEvents;
  traceInfo.isEventsProcessed = true;
  return traceInfo;
};

Tracer.prototype.addFilter = function (filterFn) {
  this._filters.push(filterFn);
};

Tracer.prototype.redactField = function (field) {
  this._filterFields.push(field);
};

Tracer.prototype._applyFilters = function (eventType, data, info) {
  this._filters.forEach(function (filterFn) {
    data = filterFn(eventType, _.clone(data), info);
  });

  return data;
};

Tracer.prototype._applyObjectFilters = function (toFilter) {
  const filterObject = obj => {
    let cloned;

    this._filterFields.forEach(function (field) {
      if (field in obj) {
        cloned = cloned || Object.assign({}, obj);
        cloned[field] = 'Monti: redacted';
      }
    });

    return cloned;
  };

  if (Array.isArray(toFilter)) {
    let cloned; // There could be thousands or more items in the array, and this usually runs
    // before the data is validated. For performance reasons we limit how
    // many to check

    let length = Math.min(toFilter.length, this.maxArrayItemsToFilter);

    for (let i = 0; i < length; i++) {
      if (typeof toFilter[i] === 'object' && toFilter[i] !== null) {
        let result = filterObject(toFilter[i]);

        if (result) {
          cloned = cloned || [...toFilter];
          cloned[i] = result;
        }
      }
    }

    return cloned || toFilter;
  }

  return filterObject(toFilter) || toFilter;
};

Kadira.tracer = new Tracer(); // need to expose Tracer to provide default set of filters

Kadira.Tracer = Tracer;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"default_filters.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/tracer/default_filters.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// strip sensitive data sent to Monti APM engine.
// possible to limit types by providing an array of types to strip
// possible types are: "start", "db", "http", "email"
Tracer.stripSensitive = function stripSensitive(typesToStrip, receiverType, name) {
  typesToStrip = typesToStrip || [];
  var strippedTypes = {};
  typesToStrip.forEach(function (type) {
    strippedTypes[type] = true;
  });
  return function (type, data, info) {
    if (typesToStrip.length > 0 && !strippedTypes[type]) return data;
    if (receiverType && receiverType != info.type) return data;
    if (name && name != info.name) return data;

    if (type == "start") {
      if (data.params) {
        data.params = "[stripped]";
      }

      if (data.headers) {
        data.headers = "[stripped]";
      }

      if (data.body) {
        data.body = "[stripped]";
      }
    } else if (type == "db") {
      data.selector = "[stripped]";
    } else if (type == "http") {
      data.url = "[stripped]";
    } else if (type == "email") {
      ["from", "to", "cc", "bcc", "replyTo"].forEach(function (item) {
        if (data[item]) {
          data[item] = "[stripped]";
        }
      });
    }

    return data;
  };
}; // Strip sensitive data sent to Monti APM engine.
// In contrast to stripSensitive, this one has an allow list of what to keep
// to guard against forgetting to strip new fields
// In the future this one might replace Tracer.stripSensitive
// options


Tracer.stripSensitiveThorough = function stripSensitive() {
  return function (type, data) {
    let fieldsToKeep = [];

    if (type == "start") {
      fieldsToKeep = ['userId'];
    } else if (type === 'waitend') {
      fieldsToKeep = ['waitOn'];
    } else if (type == "db") {
      fieldsToKeep = ['coll', 'func', 'cursor', 'limit', 'docsFetched', 'docSize', 'oplog', 'fields', 'projection', 'wasMultiplexerReady', 'queueLength', 'elapsedPollingTime', 'noOfCachedDocs'];
    } else if (type == "http") {
      fieldsToKeep = ['method', 'statusCode'];
    } else if (type == "email") {
      fieldsToKeep = [];
    } else if (type === 'custom') {
      // This is supplied by the user so we assume they are only giving data that can be sent
      fieldsToKeep = Object.keys(data);
    } else if (type === 'error') {
      fieldsToKeep = ['error'];
    }

    Object.keys(data).forEach(key => {
      if (fieldsToKeep.indexOf(key) === -1) {
        data[key] = '[stripped]';
      }
    });
    return data;
  };
}; // strip selectors only from the given list of collection names


Tracer.stripSelectors = function stripSelectors(collectionList, receiverType, name) {
  collectionList = collectionList || [];
  var collMap = {};
  collectionList.forEach(function (collName) {
    collMap[collName] = true;
  });
  return function (type, data, info) {
    if (type != "db" || data && !collMap[data.coll]) {
      return data;
    }

    if (receiverType && receiverType != info.type) return data;
    if (name && name != info.name) return data;
    data.selector = "[stripped]";
    return data;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"tracer_store.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/tracer/tracer_store.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var logger = Npm.require('debug')('kadira:ts');

TracerStore = function TracerStore(options) {
  options = options || {};
  this.maxTotalPoints = options.maxTotalPoints || 30;
  this.interval = options.interval || 1000 * 60;
  this.archiveEvery = options.archiveEvery || this.maxTotalPoints / 6; //store max total on the past 30 minutes (or past 30 items)

  this.maxTotals = Object.create(null); //store the max trace of the current interval

  this.currentMaxTrace = Object.create(null); //archive for the traces

  this.traceArchive = [];
  this.processedCnt = Object.create(null); //group errors by messages between an interval

  this.errorMap = Object.create(null);
};

TracerStore.prototype.addTrace = function (trace) {
  var kind = [trace.type, trace.name].join('::');

  if (!this.currentMaxTrace[kind]) {
    this.currentMaxTrace[kind] = EJSON.clone(trace);
  } else if (this.currentMaxTrace[kind].metrics.total < trace.metrics.total) {
    this.currentMaxTrace[kind] = EJSON.clone(trace);
  } else if (trace.errored) {
    this._handleErrors(trace);
  }
};

TracerStore.prototype.collectTraces = function () {
  var traces = this.traceArchive;
  this.traceArchive = []; // convert at(timestamp) into the actual serverTime

  traces.forEach(function (trace) {
    trace.at = Kadira.syncedDate.syncTime(trace.at);
  });
  return traces;
};

TracerStore.prototype.start = function () {
  this._timeoutHandler = setInterval(this.processTraces.bind(this), this.interval);
};

TracerStore.prototype.stop = function () {
  if (this._timeoutHandler) {
    clearInterval(this._timeoutHandler);
  }
};

TracerStore.prototype._handleErrors = function (trace) {
  // sending error requests as it is
  var lastEvent = trace.events[trace.events.length - 1];

  if (lastEvent && lastEvent[2]) {
    var error = lastEvent[2].error; // grouping errors occured (reset after processTraces)

    var errorKey = [trace.type, trace.name, error.message].join("::");

    if (!this.errorMap[errorKey]) {
      var erroredTrace = EJSON.clone(trace);
      this.errorMap[errorKey] = erroredTrace;
      this.traceArchive.push(erroredTrace);
    }
  } else {
    logger('last events is not an error: ', JSON.stringify(trace.events));
  }
};

TracerStore.prototype.processTraces = function () {
  var self = this;
  let kinds = new Set();
  Object.keys(this.maxTotals).forEach(key => {
    kinds.add(key);
  });
  Object.keys(this.currentMaxTrace).forEach(key => {
    kinds.add(key);
  });

  for (kind of kinds) {
    self.processedCnt[kind] = self.processedCnt[kind] || 0;
    var currentMaxTrace = self.currentMaxTrace[kind];
    var currentMaxTotal = currentMaxTrace ? currentMaxTrace.metrics.total : 0;
    self.maxTotals[kind] = self.maxTotals[kind] || []; //add the current maxPoint

    self.maxTotals[kind].push(currentMaxTotal);
    var exceedingPoints = self.maxTotals[kind].length - self.maxTotalPoints;

    if (exceedingPoints > 0) {
      self.maxTotals[kind].splice(0, exceedingPoints);
    }

    var archiveDefault = self.processedCnt[kind] % self.archiveEvery == 0;
    self.processedCnt[kind]++;

    var canArchive = archiveDefault || self._isTraceOutlier(kind, currentMaxTrace);

    if (canArchive && currentMaxTrace) {
      self.traceArchive.push(currentMaxTrace);
    } //reset currentMaxTrace


    self.currentMaxTrace[kind] = null;
  }

  ; //reset the errorMap

  self.errorMap = Object.create(null);
};

TracerStore.prototype._isTraceOutlier = function (kind, trace) {
  if (trace) {
    var dataSet = this.maxTotals[kind];
    return this._isOutlier(dataSet, trace.metrics.total, 3);
  } else {
    return false;
  }
};
/*
  Data point must exists in the dataSet
*/


TracerStore.prototype._isOutlier = function (dataSet, dataPoint, maxMadZ) {
  var median = this._getMedian(dataSet);

  var mad = this._calculateMad(dataSet, median);

  var madZ = this._funcMedianDeviation(median)(dataPoint) / mad;
  return madZ > maxMadZ;
};

TracerStore.prototype._getMedian = function (dataSet) {
  var sortedDataSet = _.clone(dataSet).sort(function (a, b) {
    return a - b;
  });

  return this._pickQuartile(sortedDataSet, 2);
};

TracerStore.prototype._pickQuartile = function (dataSet, num) {
  var pos = (dataSet.length + 1) * num / 4;

  if (pos % 1 == 0) {
    return dataSet[pos - 1];
  } else {
    pos = pos - pos % 1;
    return (dataSet[pos - 1] + dataSet[pos]) / 2;
  }
};

TracerStore.prototype._calculateMad = function (dataSet, median) {
  var medianDeviations = _.map(dataSet, this._funcMedianDeviation(median));

  var mad = this._getMedian(medianDeviations);

  return mad;
};

TracerStore.prototype._funcMedianDeviation = function (median) {
  return function (x) {
    return Math.abs(median - x);
  };
};

TracerStore.prototype._getMean = function (dataPoints) {
  if (dataPoints.length > 0) {
    var total = 0;
    dataPoints.forEach(function (point) {
      total += point;
    });
    return total / dataPoints.length;
  } else {
    return 0;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"docsize_cache.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/docsize_cache.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var LRU = Npm.require('lru-cache');

var crypto = Npm.require('crypto');

var jsonStringify = Npm.require('json-stringify-safe');

DocSzCache = function (maxItems, maxValues) {
  this.items = new LRU({
    max: maxItems
  });
  this.maxValues = maxValues;
  this.cpuUsage = 0;
}; // This is called from SystemModel.prototype.cpuUsage and saves cpu usage.


DocSzCache.prototype.setPcpu = function (pcpu) {
  this.cpuUsage = pcpu;
};

DocSzCache.prototype.getSize = function (coll, query, opts, data) {
  // If the dataset is null or empty we can't calculate the size
  // Do not process this data and return 0 as the document size.
  if (!(data && (data.length || typeof data.size === 'function' && data.size()))) {
    return 0;
  }

  var key = this.getKey(coll, query, opts);
  var item = this.items.get(key);

  if (!item) {
    item = new DocSzCacheItem(this.maxValues);
    this.items.set(key, item);
  }

  if (this.needsUpdate(item)) {
    var doc = {};

    if (typeof data.get === 'function') {
      // This is an IdMap
      data.forEach(function (element) {
        doc = element;
        return false; // return false to stop loop. We only need one doc.
      });
    } else {
      doc = data[0];
    }

    var size = Buffer.byteLength(jsonStringify(doc), 'utf8');
    item.addData(size);
  }

  return item.getValue();
};

DocSzCache.prototype.getKey = function (coll, query, opts) {
  return jsonStringify([coll, query, opts]);
}; // returns a score between 0 and 1 for a cache item
// this score is determined by:
//  * available cache item slots
//  * time since last updated
//  * cpu usage of the application


DocSzCache.prototype.getItemScore = function (item) {
  return [(item.maxValues - item.values.length) / item.maxValues, (Date.now() - item.updated) / 60000, (100 - this.cpuUsage) / 100].map(function (score) {
    return score > 1 ? 1 : score;
  }).reduce(function (total, score) {
    return (total || 0) + score;
  }) / 3;
};

DocSzCache.prototype.needsUpdate = function (item) {
  // handle newly made items
  if (!item.values.length) {
    return true;
  }

  var currentTime = Date.now();
  var timeSinceUpdate = currentTime - item.updated;

  if (timeSinceUpdate > 1000 * 60) {
    return true;
  }

  return this.getItemScore(item) > 0.5;
};

DocSzCacheItem = function (maxValues) {
  this.maxValues = maxValues;
  this.updated = 0;
  this.values = [];
};

DocSzCacheItem.prototype.addData = function (value) {
  this.values.push(value);
  this.updated = Date.now();

  if (this.values.length > this.maxValues) {
    this.values.shift();
  }
};

DocSzCacheItem.prototype.getValue = function () {
  function sortNumber(a, b) {
    return a - b;
  }

  var sorted = this.values.sort(sortNumber);
  var median = 0;

  if (sorted.length % 2 === 0) {
    var idx = sorted.length / 2;
    median = (sorted[idx] + sorted[idx - 1]) / 2;
  } else {
    var idx = Math.floor(sorted.length / 2);
    median = sorted[idx];
  }

  return median;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"kadira.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/kadira.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let HttpModel;
module.link("./models/http", {
  default(v) {
    HttpModel = v;
  }

}, 0);
let packageMap;
module.link("./.meteor-package-versions", {
  default(v) {
    packageMap = v;
  }

}, 1);
let getErrorParameters;
module.link("./common/utils", {
  getErrorParameters(v) {
    getErrorParameters = v;
  }

}, 2);
let WaitTimeBuilder;
module.link("./wait_time_builder", {
  WaitTimeBuilder(v) {
    WaitTimeBuilder = v;
  }

}, 3);

var hostname = Npm.require('os').hostname();

var logger = Npm.require('debug')('kadira:apm');

var Fibers = Npm.require('fibers');

var KadiraCore = Npm.require('monti-apm-core').Kadira;

Kadira.models = {};
Kadira.options = {};
Kadira.env = {
  currentSub: null,
  // keep current subscription inside ddp
  kadiraInfo: new Meteor.EnvironmentVariable()
};
Kadira.waitTimeBuilder = new WaitTimeBuilder();
Kadira.errors = [];
Kadira.errors.addFilter = Kadira.errors.push.bind(Kadira.errors);
Kadira.models.methods = new MethodsModel();
Kadira.models.pubsub = new PubsubModel();
Kadira.models.system = new SystemModel();
Kadira.models.http = new HttpModel();
Kadira.docSzCache = new DocSzCache(100000, 10);
Kadira.syncedDate = new Ntp(); // If the agent is not connected, we still want to build the payload occasionally
// since building the payload does some cleanup to prevent memory leaks
// Once connected, this interval is cleared

let buildInterval = Meteor.setInterval(() => {
  Kadira._buildPayload();
}, 1000 * 60);

Kadira.connect = function (appId, appSecret, options) {
  options = options || {};
  options.appId = appId;
  options.appSecret = appSecret;
  options.payloadTimeout = options.payloadTimeout || 1000 * 20;
  options.endpoint = options.endpoint || "https://engine.montiapm.com";
  options.clientEngineSyncDelay = options.clientEngineSyncDelay || 10000;
  options.thresholds = options.thresholds || {};
  options.isHostNameSet = !!options.hostname;
  options.hostname = options.hostname || hostname;
  options.proxy = options.proxy || null;
  options.recordIPAddress = options.recordIPAddress || 'full';
  options.eventStackTrace = options.eventStackTrace || false;

  if (options.documentSizeCacheSize) {
    Kadira.docSzCache = new DocSzCache(options.documentSizeCacheSize, 10);
  } // remove trailing slash from endpoint url (if any)


  if (_.last(options.endpoint) === '/') {
    options.endpoint = options.endpoint.substr(0, options.endpoint.length - 1);
  } // error tracking is enabled by default


  if (options.enableErrorTracking === undefined) {
    options.enableErrorTracking = true;
  } // uploading sourcemaps is enabled by default in production


  if (options.uploadSourceMaps === undefined && Meteor.isProduction) {
    options.uploadSourceMaps = true;
  }

  Kadira.options = options;
  Kadira.options.authHeaders = {
    'KADIRA-APP-ID': Kadira.options.appId,
    'KADIRA-APP-SECRET': Kadira.options.appSecret
  };

  if (appId && appSecret) {
    options.appId = options.appId.trim();
    options.appSecret = options.appSecret.trim();
    Kadira.coreApi = new KadiraCore({
      appId: options.appId,
      appSecret: options.appSecret,
      endpoint: options.endpoint,
      hostname: options.hostname,
      agentVersion: packageMap['montiapm:agent'] || '<unknown>'
    });

    Kadira.coreApi._checkAuth().then(function () {
      logger('connected to app: ', appId);
      console.log('Monti APM: Successfully connected');

      Kadira._sendAppStats();

      Kadira._schedulePayloadSend();
    }).catch(function (err) {
      if (err.message === "Unauthorized") {
        console.log('Monti APM: authentication failed - check your appId & appSecret');
      } else {
        console.log('Monti APM: unable to connect. ' + err.message);
      }
    });
  } else {
    throw new Error('Monti APM: required appId and appSecret');
  }

  Kadira.syncedDate = new Ntp(options.endpoint);
  Kadira.syncedDate.sync();
  Kadira.models.error = new ErrorModel(appId); // handle pre-added filters

  var addFilterFn = Kadira.models.error.addFilter.bind(Kadira.models.error);
  Kadira.errors.forEach(addFilterFn);
  Kadira.errors = Kadira.models.error; // setting runtime info, which will be sent to kadira

  __meteor_runtime_config__.kadira = {
    appId: appId,
    endpoint: options.endpoint,
    clientEngineSyncDelay: options.clientEngineSyncDelay,
    recordIPAddress: options.recordIPAddress
  };

  if (options.enableErrorTracking) {
    Kadira.enableErrorTracking();
  } else {
    Kadira.disableErrorTracking();
  } // start tracking errors


  Meteor.startup(function () {
    TrackUncaughtExceptions();
    TrackUnhandledRejections();
    TrackMeteorDebug();
  });
  Meteor.publish(null, function () {
    var options = __meteor_runtime_config__.kadira;
    this.added('kadira_settings', Random.id(), options);
    this.ready();
  }); // notify we've connected

  Kadira.connected = true;
}; //track how many times we've sent the data (once per minute)


Kadira._buildPayload = function () {
  var payload = {
    host: Kadira.options.hostname,
    clientVersions: getClientVersions()
  };

  var buildDetailedInfo = Kadira._isDetailedInfo();

  _.extend(payload, Kadira.models.methods.buildPayload(buildDetailedInfo));

  _.extend(payload, Kadira.models.pubsub.buildPayload(buildDetailedInfo));

  _.extend(payload, Kadira.models.system.buildPayload());

  _.extend(payload, Kadira.models.http.buildPayload());

  if (Kadira.options.enableErrorTracking) {
    _.extend(payload, Kadira.models.error.buildPayload());
  }

  return payload;
};

Kadira._countDataSent = 0;
Kadira._detailInfoSentInterval = Math.ceil(1000 * 60 / Kadira.options.payloadTimeout);

Kadira._isDetailedInfo = function () {
  return Kadira._countDataSent++ % Kadira._detailInfoSentInterval == 0;
};

Kadira._sendAppStats = function () {
  var appStats = {};
  appStats.release = Meteor.release;
  appStats.protocolVersion = '1.0.0';
  appStats.packageVersions = [];
  appStats.clientVersions = getClientVersions();

  _.each(Package, function (v, name) {
    appStats.packageVersions.push({
      name: name,
      version: packageMap[name] || null
    });
  });

  Kadira.coreApi.sendData({
    startTime: new Date(),
    appStats: appStats
  }).then(function (body) {
    handleApiResponse(body);
  }).catch(function (err) {
    console.error('Monti APM Error on sending appStats:', err.message);
  });
};

Kadira._schedulePayloadSend = function () {
  clearInterval(buildInterval);
  setTimeout(function () {
    Kadira._schedulePayloadSend();

    Kadira._sendPayload();
  }, Kadira.options.payloadTimeout);
};

Kadira._sendPayload = function () {
  new Fibers(function () {
    var payload = Kadira._buildPayload();

    Kadira.coreApi.sendData(payload).then(function (body) {
      handleApiResponse(body);
    }).catch(function (err) {
      console.log('Monti APM Error:', err.message);
    });
  }).run();
}; // this return the __kadiraInfo from the current Fiber by default
// if called with 2nd argument as true, it will get the kadira info from
// Meteor.EnvironmentVariable
//
// WARNNING: returned info object is the reference object.
//  Changing it might cause issues when building traces. So use with care


Kadira._getInfo = function (currentFiber, useEnvironmentVariable) {
  currentFiber = currentFiber || Fibers.current;

  if (currentFiber) {
    if (useEnvironmentVariable) {
      return Kadira.env.kadiraInfo.get();
    }

    return currentFiber.__kadiraInfo;
  }
}; // this does not clone the info object. So, use with care


Kadira._setInfo = function (info) {
  Fibers.current.__kadiraInfo = info;
};

Kadira.startContinuousProfiling = function () {
  MontiProfiler.startContinuous(function onProfile(_ref) {
    let {
      profile,
      startTime,
      endTime
    } = _ref;

    if (!Kadira.connected) {
      return;
    }

    Kadira.coreApi.sendData({
      profiles: [{
        profile,
        startTime,
        endTime
      }]
    }).catch(e => console.log('Monti: err sending cpu profile', e));
  });
};

Kadira.enableErrorTracking = function () {
  __meteor_runtime_config__.kadira.enableErrorTracking = true;
  Kadira.options.enableErrorTracking = true;
};

Kadira.disableErrorTracking = function () {
  __meteor_runtime_config__.kadira.enableErrorTracking = false;
  Kadira.options.enableErrorTracking = false;
};

Kadira.trackError = function () {
  if (!Kadira.options.enableErrorTracking) {
    return;
  }

  const {
    message,
    subType,
    stack,
    type
  } = getErrorParameters(arguments);

  if (message) {
    var trace = {
      type: type || 'server-internal',
      subType: subType || 'server',
      name: message,
      errored: true,
      at: Kadira.syncedDate.getTime(),
      events: [['start', 0, {}], ['error', 0, {
        error: {
          message,
          stack
        }
      }]],
      metrics: {
        total: 0
      }
    };
    Kadira.models.error.trackError({
      message,
      stack
    }, trace);
  }
};

Kadira.ignoreErrorTracking = function (err) {
  err._skipKadira = true;
};

Kadira.startEvent = function (name) {
  let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var kadiraInfo = Kadira._getInfo();

  if (kadiraInfo) {
    return Kadira.tracer.event(kadiraInfo.trace, 'custom', data, {
      name
    });
  }

  return false;
};

Kadira.endEvent = function (event, data) {
  var kadiraInfo = Kadira._getInfo(); // The event could be false if it could not be started.
  // Handle it here instead of requiring the app to.


  if (kadiraInfo && event) {
    Kadira.tracer.eventEnd(kadiraInfo.trace, event, data);
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hijack":{"wrap_server.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_server.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Fiber = Npm.require('fibers');

wrapServer = function (serverProto) {
  var originalHandleConnect = serverProto._handleConnect;

  serverProto._handleConnect = function (socket, msg) {
    originalHandleConnect.call(this, socket, msg);
    var session = socket._meteorSession; // sometimes it is possible for _meteorSession to be undefined
    // one such reason would be if DDP versions are not matching
    // if then, we should not process it

    if (!session) {
      return;
    }

    Kadira.EventBus.emit('system', 'createSession', msg, socket._meteorSession);

    if (Kadira.connected) {
      Kadira.models.system.handleSessionActivity(msg, socket._meteorSession);
    }
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_session.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_session.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let MeteorDebugIgnore;
module.link("./error", {
  MeteorDebugIgnore(v) {
    MeteorDebugIgnore = v;
  }

}, 0);
const MAX_PARAMS_LENGTH = 4000;

wrapSession = function (sessionProto) {
  var originalProcessMessage = sessionProto.processMessage;

  sessionProto.processMessage = function (msg) {
    if (true) {
      var kadiraInfo = {
        session: this.id,
        userId: this.userId
      };

      if (msg.msg == 'method' || msg.msg == 'sub') {
        kadiraInfo.trace = Kadira.tracer.start(this, msg);
        Kadira.waitTimeBuilder.register(this, msg.id);

        let params = Kadira.tracer._applyObjectFilters(msg.params || []); // use JSON instead of EJSON to save the CPU


        let stringifiedParams = JSON.stringify(params); // The params could be several mb or larger.
        // Truncate if it is large

        if (stringifiedParams.length > MAX_PARAMS_LENGTH) {
          stringifiedParams = "Monti APM: params are too big. First ".concat(MAX_PARAMS_LENGTH, " characters: ").concat(stringifiedParams.slice(0, MAX_PARAMS_LENGTH));
        }

        var startData = {
          userId: this.userId,
          params: stringifiedParams
        };
        Kadira.tracer.event(kadiraInfo.trace, 'start', startData);
        var waitEventId = Kadira.tracer.event(kadiraInfo.trace, 'wait', {}, kadiraInfo);
        msg._waitEventId = waitEventId;
        msg.__kadiraInfo = kadiraInfo;

        if (msg.msg == 'sub') {
          // start tracking inside processMessage allows us to indicate
          // wait time as well
          Kadira.EventBus.emit('pubsub', 'subReceived', this, msg);

          Kadira.models.pubsub._trackSub(this, msg);
        }
      } // Update session last active time


      Kadira.EventBus.emit('system', 'ddpMessageReceived', this, msg);
      Kadira.models.system.handleSessionActivity(msg, this);
    }

    return originalProcessMessage.call(this, msg);
  }; // adding the method context to the current fiber


  var originalMethodHandler = sessionProto.protocol_handlers.method;

  sessionProto.protocol_handlers.method = function (msg, unblock) {
    var self = this; //add context

    var kadiraInfo = msg.__kadiraInfo;

    if (kadiraInfo) {
      Kadira._setInfo(kadiraInfo); // end wait event


      var waitList = Kadira.waitTimeBuilder.build(this, msg.id);
      Kadira.tracer.eventEnd(kadiraInfo.trace, msg._waitEventId, {
        waitOn: waitList
      });
      unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);
      var response = Kadira.env.kadiraInfo.withValue(kadiraInfo, function () {
        return originalMethodHandler.call(self, msg, unblock);
      });
      unblock();
    } else {
      var response = originalMethodHandler.call(self, msg, unblock);
    }

    return response;
  }; //to capture the currently processing message


  var orginalSubHandler = sessionProto.protocol_handlers.sub;

  sessionProto.protocol_handlers.sub = function (msg, unblock) {
    var self = this; //add context

    var kadiraInfo = msg.__kadiraInfo;

    if (kadiraInfo) {
      Kadira._setInfo(kadiraInfo); // end wait event


      var waitList = Kadira.waitTimeBuilder.build(this, msg.id);
      Kadira.tracer.eventEnd(kadiraInfo.trace, msg._waitEventId, {
        waitOn: waitList
      });
      unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);
      var response = Kadira.env.kadiraInfo.withValue(kadiraInfo, function () {
        return orginalSubHandler.call(self, msg, unblock);
      });
      unblock();
    } else {
      var response = orginalSubHandler.call(self, msg, unblock);
    }

    return response;
  }; //to capture the currently processing message


  var orginalUnSubHandler = sessionProto.protocol_handlers.unsub;

  sessionProto.protocol_handlers.unsub = function (msg, unblock) {
    unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);
    var response = orginalUnSubHandler.call(this, msg, unblock);
    unblock();
    return response;
  }; //track method ending (to get the result of error)


  var originalSend = sessionProto.send;

  sessionProto.send = function (msg) {
    if (msg.msg == 'result') {
      var kadiraInfo = Kadira._getInfo();

      if (kadiraInfo) {
        if (msg.error) {
          var error = _.pick(msg.error, ['message', 'stack', 'details']); // pick the error from the wrapped method handler


          if (kadiraInfo && kadiraInfo.currentError) {
            // the error stack is wrapped so Meteor._debug can identify
            // this as a method error.
            error = _.pick(kadiraInfo.currentError, ['message', 'stack', 'details']); // see wrapMethodHanderForErrors() method def for more info

            if (error.stack && error.stack.stack) {
              error.stack = error.stack.stack;
            }
          }

          Kadira.tracer.endLastEvent(kadiraInfo.trace);
          Kadira.tracer.event(kadiraInfo.trace, 'error', {
            error: error
          });
        } else {
          Kadira.tracer.endLastEvent(kadiraInfo.trace);
          Kadira.tracer.event(kadiraInfo.trace, 'complete');
        } //processing the message


        var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);
        Kadira.EventBus.emit('method', 'methodCompleted', trace, this);
        Kadira.models.methods.processMethod(trace); // error may or may not exist and error tracking can be disabled

        if (error && Kadira.options.enableErrorTracking) {
          Kadira.models.error.trackError(error, trace);
        } //clean and make sure, fiber is clean
        //not sure we need to do this, but a preventive measure


        Kadira._setInfo(null);
      }
    }

    return originalSend.call(this, msg);
  };
}; // wrap existing method handlers for capturing errors


_.each(Meteor.server.method_handlers, function (handler, name) {
  wrapMethodHanderForErrors(name, handler, Meteor.server.method_handlers);
}); // wrap future method handlers for capturing errors


var originalMeteorMethods = Meteor.methods;

Meteor.methods = function (methodMap) {
  _.each(methodMap, function (handler, name) {
    wrapMethodHanderForErrors(name, handler, methodMap);
  });

  originalMeteorMethods(methodMap);
};

function wrapMethodHanderForErrors(name, originalHandler, methodMap) {
  methodMap[name] = function () {
    try {
      return originalHandler.apply(this, arguments);
    } catch (ex) {
      if (ex && Kadira._getInfo()) {
        // sometimes error may be just an string or a primitive
        // in that case, we need to make it a psuedo error
        if (typeof ex !== 'object') {
          ex = {
            message: ex,
            stack: ex
          };
        } // Now we are marking this error to get tracked via methods
        // But, this also triggers a Meteor.debug call and
        // it only gets the stack
        // We also track Meteor.debug errors and want to stop
        // tracking this error. That's why we do this
        // See Meteor.debug error tracking code for more
        // If error tracking is disabled, we do not modify the stack since
        // it would be shown as an object in the logs


        if (Kadira.options.enableErrorTracking) {
          ex.stack = {
            stack: ex.stack,
            source: 'method',
            [MeteorDebugIgnore]: true
          };
          Kadira._getInfo().currentError = ex;
        }
      }

      throw ex;
    }
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_subscription.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_subscription.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let MeteorDebugIgnore;
module.link("./error", {
  MeteorDebugIgnore(v) {
    MeteorDebugIgnore = v;
  }

}, 0);

wrapSubscription = function (subscriptionProto) {
  // If the ready event runs outside the Fiber, Kadira._getInfo() doesn't work.
  // we need some other way to store kadiraInfo so we can use it at ready hijack.
  var originalRunHandler = subscriptionProto._runHandler;

  subscriptionProto._runHandler = function () {
    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo) {
      this.__kadiraInfo = kadiraInfo;
    }

    ;
    originalRunHandler.call(this);
  };

  var originalReady = subscriptionProto.ready;

  subscriptionProto.ready = function () {
    // meteor has a field called `_ready` which tracks this
    // but we need to make it future proof
    if (!this._apmReadyTracked) {
      var kadiraInfo = Kadira._getInfo() || this.__kadiraInfo;

      delete this.__kadiraInfo; //sometime .ready can be called in the context of the method
      //then we have some problems, that's why we are checking this
      //eg:- Accounts.createUser
      // Also, when the subscription is created by fast render, _subscriptionId and
      // the trace.id are both undefined but we don't want to complete the HTTP trace here

      if (kadiraInfo && this._subscriptionId && this._subscriptionId == kadiraInfo.trace.id) {
        Kadira.tracer.endLastEvent(kadiraInfo.trace);
        Kadira.tracer.event(kadiraInfo.trace, 'complete');
        var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);
      }

      Kadira.EventBus.emit('pubsub', 'subCompleted', trace, this._session, this);

      Kadira.models.pubsub._trackReady(this._session, this, trace);

      this._apmReadyTracked = true;
    } // we still pass the control to the original implementation
    // since multiple ready calls are handled by itself


    originalReady.call(this);
  };

  var originalError = subscriptionProto.error;

  subscriptionProto.error = function (err) {
    if (typeof err === 'string') {
      err = {
        message: err
      };
    }

    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo && this._subscriptionId && this._subscriptionId == kadiraInfo.trace.id) {
      Kadira.tracer.endLastEvent(kadiraInfo.trace);

      var errorForApm = _.pick(err, 'message', 'stack');

      Kadira.tracer.event(kadiraInfo.trace, 'error', {
        error: errorForApm
      });
      var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);

      Kadira.models.pubsub._trackError(this._session, this, trace); // error tracking can be disabled and if there is a trace
      // trace should be available all the time, but it won't
      // if something wrong happened on the trace building


      if (Kadira.options.enableErrorTracking && trace) {
        Kadira.models.error.trackError(err, trace);
      }
    } // wrap error stack so Meteor._debug can identify and ignore it
    // it is not wrapped when error tracking is disabled since it
    // would be shown as an object in the logs


    if (Kadira.options.enableErrorTracking) {
      err.stack = {
        stack: err.stack,
        source: 'subscription',
        [MeteorDebugIgnore]: true
      };
    }

    originalError.call(this, err);
  };

  var originalDeactivate = subscriptionProto._deactivate;

  subscriptionProto._deactivate = function () {
    Kadira.EventBus.emit('pubsub', 'subDeactivated', this._session, this);

    Kadira.models.pubsub._trackUnsub(this._session, this);

    originalDeactivate.call(this);
  }; //adding the currenSub env variable


  ['added', 'changed', 'removed'].forEach(function (funcName) {
    var originalFunc = subscriptionProto[funcName];

    subscriptionProto[funcName] = function (collectionName, id, fields) {
      var self = this; // we need to run this code in a fiber and that's how we track
      // subscription info. May be we can figure out, some other way to do this
      // We use this currently to get the publication info when tracking message
      // sizes at wrap_ddp_stringify.js

      Kadira.env.currentSub = self;
      var res = originalFunc.call(self, collectionName, id, fields);
      Kadira.env.currentSub = null;
      return res;
    };
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_observers.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_observers.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
wrapOplogObserveDriver = function (proto) {
  // Track the polled documents. This is reflect to the RAM size and
  // for the CPU usage directly
  var originalPublishNewResults = proto._publishNewResults;

  proto._publishNewResults = function (newResults, newBuffer) {
    var coll = this._cursorDescription.collectionName;
    var query = this._cursorDescription.selector;
    var opts = this._cursorDescription.options;
    var docSize = Kadira.docSzCache.getSize(coll, query, opts, newResults);
    var docSize = Kadira.docSzCache.getSize(coll, query, opts, newBuffer);
    var count = newResults.size() + newBuffer.size();

    if (this._ownerInfo) {
      Kadira.models.pubsub.trackPolledDocuments(this._ownerInfo, count);
      Kadira.models.pubsub.trackDocSize(this._ownerInfo.name, "polledFetches", docSize * count);
    } else {
      this._polledDocuments = count;
      this._docSize = {
        polledFetches: docSize * count
      };
    }

    return originalPublishNewResults.call(this, newResults, newBuffer);
  };

  var originalHandleOplogEntryQuerying = proto._handleOplogEntryQuerying;

  proto._handleOplogEntryQuerying = function (op) {
    Kadira.models.pubsub.trackDocumentChanges(this._ownerInfo, op);
    return originalHandleOplogEntryQuerying.call(this, op);
  };

  var originalHandleOplogEntrySteadyOrFetching = proto._handleOplogEntrySteadyOrFetching;

  proto._handleOplogEntrySteadyOrFetching = function (op) {
    Kadira.models.pubsub.trackDocumentChanges(this._ownerInfo, op);
    return originalHandleOplogEntrySteadyOrFetching.call(this, op);
  }; // track live updates


  ['_addPublished', '_removePublished', '_changePublished'].forEach(function (fnName) {
    var originalFn = proto[fnName];

    proto[fnName] = function (a, b, c) {
      if (this._ownerInfo) {
        Kadira.models.pubsub.trackLiveUpdates(this._ownerInfo, fnName, 1);

        if (fnName === "_addPublished") {
          var coll = this._cursorDescription.collectionName;
          var query = this._cursorDescription.selector;
          var opts = this._cursorDescription.options;
          var docSize = Kadira.docSzCache.getSize(coll, query, opts, [b]);
          Kadira.models.pubsub.trackDocSize(this._ownerInfo.name, "liveFetches", docSize);
        }
      } else {
        // If there is no ownerInfo, that means this is the initial adds
        if (!this._liveUpdatesCounts) {
          this._liveUpdatesCounts = {
            _initialAdds: 0
          };
        }

        this._liveUpdatesCounts._initialAdds++;

        if (fnName === "_addPublished") {
          if (!this._docSize) {
            this._docSize = {
              initialFetches: 0
            };
          }

          if (!this._docSize.initialFetches) {
            this._docSize.initialFetches = 0;
          }

          var coll = this._cursorDescription.collectionName;
          var query = this._cursorDescription.selector;
          var opts = this._cursorDescription.options;
          var docSize = Kadira.docSzCache.getSize(coll, query, opts, [b]);
          this._docSize.initialFetches += docSize;
        }
      }

      return originalFn.call(this, a, b, c);
    };
  });
  var originalStop = proto.stop;

  proto.stop = function () {
    if (this._ownerInfo && this._ownerInfo.type === 'sub') {
      Kadira.EventBus.emit('pubsub', 'observerDeleted', this._ownerInfo);
      Kadira.models.pubsub.trackDeletedObserver(this._ownerInfo);
    }

    return originalStop.call(this);
  };
};

wrapPollingObserveDriver = function (proto) {
  var originalPollMongo = proto._pollMongo;

  proto._pollMongo = function () {
    var start = Date.now();
    originalPollMongo.call(this); // Current result is stored in the following variable.
    // So, we can use that
    // Sometimes, it's possible to get size as undefined.
    // May be something with different version. We don't need to worry about
    // this now

    var count = 0;
    var docSize = 0;

    if (this._results && this._results.size) {
      count = this._results.size() || 0;
      var coll = this._cursorDescription.collectionName;
      var query = this._cursorDescription.selector;
      var opts = this._cursorDescription.options;
      docSize = Kadira.docSzCache.getSize(coll, query, opts, this._results._map) * count;
    }

    if (this._ownerInfo) {
      Kadira.models.pubsub.trackPolledDocuments(this._ownerInfo, count);
      Kadira.models.pubsub.trackDocSize(this._ownerInfo.name, "polledFetches", docSize);
    } else {
      this._polledDocuments = count;
      this._polledDocSize = docSize;
    }
  };

  var originalStop = proto.stop;

  proto.stop = function () {
    if (this._ownerInfo && this._ownerInfo.type === 'sub') {
      Kadira.EventBus.emit('pubsub', 'observerDeleted', this._ownerInfo);
      Kadira.models.pubsub.trackDeletedObserver(this._ownerInfo);
    }

    return originalStop.call(this);
  };
};

wrapMultiplexer = function (proto) {
  var originalInitalAdd = proto.addHandleAndSendInitialAdds;

  proto.addHandleAndSendInitialAdds = function (handle) {
    if (!this._firstInitialAddTime) {
      this._firstInitialAddTime = Date.now();
    }

    handle._wasMultiplexerReady = this._ready();
    handle._queueLength = this._queue._taskHandles.length;

    if (!handle._wasMultiplexerReady) {
      handle._elapsedPollingTime = Date.now() - this._firstInitialAddTime;
    }

    return originalInitalAdd.call(this, handle);
  };
};

wrapForCountingObservers = function () {
  // to count observers
  var mongoConnectionProto = MeteorX.MongoConnection.prototype;
  var originalObserveChanges = mongoConnectionProto._observeChanges;

  mongoConnectionProto._observeChanges = function (cursorDescription, ordered, callbacks) {
    var ret = originalObserveChanges.call(this, cursorDescription, ordered, callbacks); // get the Kadira Info via the Meteor.EnvironmentalVariable

    var kadiraInfo = Kadira._getInfo(null, true);

    if (kadiraInfo && ret._multiplexer) {
      if (!ret._multiplexer.__kadiraTracked) {
        // new multiplexer
        ret._multiplexer.__kadiraTracked = true;
        Kadira.EventBus.emit('pubsub', 'newSubHandleCreated', kadiraInfo.trace);
        Kadira.models.pubsub.incrementHandleCount(kadiraInfo.trace, false);

        if (kadiraInfo.trace.type == 'sub') {
          var ownerInfo = {
            type: kadiraInfo.trace.type,
            name: kadiraInfo.trace.name,
            startTime: new Date().getTime()
          };
          var observerDriver = ret._multiplexer._observeDriver;
          observerDriver._ownerInfo = ownerInfo;
          Kadira.EventBus.emit('pubsub', 'observerCreated', ownerInfo);
          Kadira.models.pubsub.trackCreatedObserver(ownerInfo); // We need to send initially polled documents if there are

          if (observerDriver._polledDocuments) {
            Kadira.models.pubsub.trackPolledDocuments(ownerInfo, observerDriver._polledDocuments);
            observerDriver._polledDocuments = 0;
          } // We need to send initially polled documents if there are


          if (observerDriver._polledDocSize) {
            Kadira.models.pubsub.trackDocSize(ownerInfo.name, "polledFetches", observerDriver._polledDocSize);
            observerDriver._polledDocSize = 0;
          } // Process _liveUpdatesCounts


          _.each(observerDriver._liveUpdatesCounts, function (count, key) {
            Kadira.models.pubsub.trackLiveUpdates(ownerInfo, key, count);
          }); // Process docSize


          _.each(observerDriver._docSize, function (count, key) {
            Kadira.models.pubsub.trackDocSize(ownerInfo.name, key, count);
          });
        }
      } else {
        Kadira.EventBus.emit('pubsub', 'cachedSubHandleCreated', kadiraInfo.trace);
        Kadira.models.pubsub.incrementHandleCount(kadiraInfo.trace, true);
      }
    }

    return ret;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_ddp_stringify.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_ddp_stringify.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
wrapStringifyDDP = function () {
  var originalStringifyDDP = DDPCommon.stringifyDDP;

  DDPCommon.stringifyDDP = function (msg) {
    var msgString = originalStringifyDDP(msg);
    var msgSize = Buffer.byteLength(msgString, 'utf8');

    var kadiraInfo = Kadira._getInfo(null, true);

    if (kadiraInfo && !Kadira.env.currentSub) {
      if (kadiraInfo.trace.type === 'method') {
        Kadira.models.methods.trackMsgSize(kadiraInfo.trace.name, msgSize);
      }

      return msgString;
    } // 'currentSub' is set when we wrap Subscription object and override
    // handlers for 'added', 'changed', 'removed' events. (see lib/hijack/wrap_subscription.js)


    if (Kadira.env.currentSub) {
      if (Kadira.env.currentSub.__kadiraInfo) {
        Kadira.models.pubsub.trackMsgSize(Kadira.env.currentSub._name, "initialSent", msgSize);
        return msgString;
      }

      Kadira.models.pubsub.trackMsgSize(Kadira.env.currentSub._name, "liveSent", msgSize);
      return msgString;
    }

    Kadira.models.methods.trackMsgSize("<not-a-method-or-a-pub>", msgSize);
    return msgString;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"instrument.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/instrument.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let wrapWebApp;
module.link("./wrap_webapp.js", {
  wrapWebApp(v) {
    wrapWebApp = v;
  }

}, 0);
let wrapFastRender;
module.link("./fast_render.js", {
  wrapFastRender(v) {
    wrapFastRender = v;
  }

}, 1);
let wrapFs;
module.link("./fs.js", {
  wrapFs(v) {
    wrapFs = v;
  }

}, 2);
let wrapPicker;
module.link("./picker.js", {
  wrapPicker(v) {
    wrapPicker = v;
  }

}, 3);
let wrapRouters;
module.link("./wrap_routers.js", {
  wrapRouters(v) {
    wrapRouters = v;
  }

}, 4);
let wrapFibers;
module.link("./async.js", {
  wrapFibers(v) {
    wrapFibers = v;
  }

}, 5);
var instrumented = false;

Kadira._startInstrumenting = function (callback) {
  if (instrumented) {
    callback();
    return;
  }

  instrumented = true;
  wrapFibers();
  wrapStringifyDDP();
  wrapWebApp();
  wrapFastRender();
  wrapPicker();
  wrapFs();
  wrapRouters();
  MeteorX.onReady(function () {
    //instrumenting session
    wrapServer(MeteorX.Server.prototype);
    wrapSession(MeteorX.Session.prototype);
    wrapSubscription(MeteorX.Subscription.prototype);

    if (MeteorX.MongoOplogDriver) {
      wrapOplogObserveDriver(MeteorX.MongoOplogDriver.prototype);
    }

    if (MeteorX.MongoPollingDriver) {
      wrapPollingObserveDriver(MeteorX.MongoPollingDriver.prototype);
    }

    if (MeteorX.Multiplexer) {
      wrapMultiplexer(MeteorX.Multiplexer.prototype);
    }

    wrapForCountingObservers();
    hijackDBOps();
    setLabels();
    callback();
  });
}; // We need to instrument this right away and it's okay
// One reason for this is to call `setLables()` function
// Otherwise, CPU profile can't see all our custom labeling


Kadira._startInstrumenting(function () {
  console.log('Monti APM: completed instrumenting the app');
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"db.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/db.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// This hijack is important to make sure, collections created before
// we hijack dbOps, even gets tracked.
//  Meteor does not simply expose MongoConnection object to the client
//  It picks methods which are necessory and make a binded object and
//  assigned to the Mongo.Collection
//  so, even we updated prototype, we can't track those collections
//  but, this will fix it.
var originalOpen = MongoInternals.RemoteCollectionDriver.prototype.open;

MongoInternals.RemoteCollectionDriver.prototype.open = function open(name) {
  var self = this;
  var ret = originalOpen.call(self, name);

  _.each(ret, function (fn, m) {
    // make sure, it's in the actual mongo connection object
    // meteorhacks:mongo-collection-utils package add some arbitary methods
    // which does not exist in the mongo connection
    if (self.mongo[m]) {
      ret[m] = function () {
        Array.prototype.unshift.call(arguments, name);
        return OptimizedApply(self.mongo, self.mongo[m], arguments);
      };
    }
  });

  return ret;
}; // TODO: this should be added to Meteorx


function getSyncronousCursor() {
  const MongoColl = typeof Mongo !== "undefined" ? Mongo.Collection : Meteor.Collection;
  const coll = new MongoColl("__dummy_coll_" + Random.id()); // we need to wait until the db is connected with meteor. findOne does that

  coll.findOne();
  const cursor = coll.find();
  cursor.fetch();
  return cursor._synchronousCursor.constructor;
}

hijackDBOps = function hijackDBOps() {
  var mongoConnectionProto = MeteorX.MongoConnection.prototype; //findOne is handled by find - so no need to track it
  //upsert is handles by update
  //2.4 replaced _ensureIndex with createIndex

  ['find', 'update', 'remove', 'insert', '_ensureIndex', '_dropIndex', 'createIndex'].forEach(function (func) {
    var originalFunc = mongoConnectionProto[func];

    if (!originalFunc) {
      return;
    }

    mongoConnectionProto[func] = function (collName, selector, mod, options) {
      var payload = {
        coll: collName,
        func: func
      };

      if (func == 'insert') {//add nothing more to the payload
      } else if (func == '_ensureIndex' || func == '_dropIndex' || func === 'createIndex') {
        //add index
        payload.index = JSON.stringify(selector);
      } else if (func == 'update' && options && options.upsert) {
        payload.func = 'upsert';
        payload.selector = JSON.stringify(selector);
      } else {
        //all the other functions have selectors
        payload.selector = JSON.stringify(selector);
      }

      var kadiraInfo = Kadira._getInfo();

      if (kadiraInfo) {
        var eventId = Kadira.tracer.event(kadiraInfo.trace, 'db', payload);
      } //this cause V8 to avoid any performance optimizations, but this is must to use
      //otherwise, if the error adds try catch block our logs get messy and didn't work
      //see: issue #6


      try {
        var ret = originalFunc.apply(this, arguments); //handling functions which can be triggered with an asyncCallback

        var endOptions = {};

        if (HaveAsyncCallback(arguments)) {
          endOptions.async = true;
        }

        if (func == 'update') {
          // upsert only returns an object when called `upsert` directly
          // otherwise it only act an update command
          if (options && options.upsert && typeof ret == 'object') {
            endOptions.updatedDocs = ret.numberAffected;
            endOptions.insertedId = ret.insertedId;
          } else {
            endOptions.updatedDocs = ret;
          }
        } else if (func == 'remove') {
          endOptions.removedDocs = ret;
        }

        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endOptions);
        }
      } catch (ex) {
        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
            err: ex.message
          });
        }

        throw ex;
      }

      return ret;
    };
  });
  var cursorProto = MeteorX.MongoCursor.prototype;
  ['forEach', 'map', 'fetch', 'count', 'observeChanges', 'observe'].forEach(function (type) {
    var originalFunc = cursorProto[type];

    cursorProto[type] = function () {
      var cursorDescription = this._cursorDescription;
      var payload = Object.assign(Object.create(null), {
        coll: cursorDescription.collectionName,
        selector: JSON.stringify(cursorDescription.selector),
        func: type,
        cursor: true
      });

      if (cursorDescription.options) {
        var cursorOptions = _.pick(cursorDescription.options, ['fields', 'projection', 'sort', 'limit']);

        for (var field in cursorOptions) {
          var value = cursorOptions[field];

          if (typeof value == 'object') {
            value = JSON.stringify(value);
          }

          payload[field] = value;
        }
      }

      var kadiraInfo = Kadira._getInfo();

      var previousTrackNextObject;

      if (kadiraInfo) {
        var eventId = Kadira.tracer.event(kadiraInfo.trace, 'db', payload);
        previousTrackNextObject = kadiraInfo.trackNextObject;

        if (type === 'forEach' || type === 'map') {
          kadiraInfo.trackNextObject = true;
        }
      }

      try {
        var ret = originalFunc.apply(this, arguments);
        var endData = {};

        if (type == 'observeChanges' || type == 'observe') {
          var observerDriver;
          endData.oplog = false; // get data written by the multiplexer

          endData.wasMultiplexerReady = ret._wasMultiplexerReady;
          endData.queueLength = ret._queueLength;
          endData.elapsedPollingTime = ret._elapsedPollingTime;

          if (ret._multiplexer) {
            // older meteor versions done not have an _multiplexer value
            observerDriver = ret._multiplexer._observeDriver;

            if (observerDriver) {
              observerDriver = ret._multiplexer._observeDriver;
              var observerDriverClass = observerDriver.constructor;
              var usesOplog = typeof observerDriverClass.cursorSupported == 'function';
              endData.oplog = usesOplog;
              var size = 0;

              ret._multiplexer._cache.docs.forEach(function () {
                size++;
              });

              endData.noOfCachedDocs = size; // if multiplexerWasNotReady, we need to get the time spend for the polling

              if (!ret._wasMultiplexerReady) {
                endData.initialPollingTime = observerDriver._lastPollTime;
              }
            }
          }

          if (!endData.oplog) {
            // let's try to find the reason
            var reasonInfo = Kadira.checkWhyNoOplog(cursorDescription, observerDriver);
            endData.noOplogCode = reasonInfo.code;
            endData.noOplogReason = reasonInfo.reason;
            endData.noOplogSolution = reasonInfo.solution;
          }
        } else if (type == 'fetch' || type == 'map') {
          //for other cursor operation
          endData.docsFetched = ret.length;

          if (type == 'fetch') {
            var coll = cursorDescription.collectionName;
            var query = cursorDescription.selector;
            var opts = cursorDescription.options;
            var docSize = Kadira.docSzCache.getSize(coll, query, opts, ret) * ret.length;
            endData.docSize = docSize;

            if (kadiraInfo) {
              if (kadiraInfo.trace.type === 'method') {
                Kadira.models.methods.trackDocSize(kadiraInfo.trace.name, docSize);
              } else if (kadiraInfo.trace.type === 'sub') {
                Kadira.models.pubsub.trackDocSize(kadiraInfo.trace.name, "cursorFetches", docSize);
              }

              kadiraInfo.trackNextObject = previousTrackNextObject;
            } else {
              // Fetch with no kadira info are tracked as from a null method
              Kadira.models.methods.trackDocSize("<not-a-method-or-a-pub>", docSize);
            } // TODO: Add doc size tracking to `map` as well.

          }
        }

        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endData);
        }

        return ret;
      } catch (ex) {
        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
            err: ex.message
          });
        }

        throw ex;
      }
    };
  });
  const SyncronousCursor = getSyncronousCursor();
  var origNextObject = SyncronousCursor.prototype._nextObject;

  SyncronousCursor.prototype._nextObject = function () {
    var kadiraInfo = Kadira._getInfo();

    var shouldTrack = kadiraInfo && kadiraInfo.trackNextObject;

    if (shouldTrack) {
      var event = Kadira.tracer.event(kadiraInfo.trace, 'db', {
        func: '_nextObject',
        coll: this._cursorDescription.collectionName
      });
    }

    var result = origNextObject.call(this);

    if (shouldTrack) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, event);
    }

    return result;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"http.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/http.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
if (Package['http']) {
  const HTTP = Package['http'].HTTP;
  var originalCall = HTTP.call;

  HTTP.call = function (method, url) {
    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo) {
      var eventId = Kadira.tracer.event(kadiraInfo.trace, 'http', {
        method: method,
        url: url
      });
    }

    try {
      var response = originalCall.apply(this, arguments); //if the user supplied an asynCallback, we don't have a response object and it handled asynchronously
      //we need to track it down to prevent issues like: #3

      var endOptions = HaveAsyncCallback(arguments) ? {
        async: true
      } : {
        statusCode: response.statusCode
      };

      if (eventId) {
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endOptions);
      }

      return response;
    } catch (ex) {
      if (eventId) {
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
          err: ex.message
        });
      }

      throw ex;
    }
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/email.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
if (Package['email']) {
  const Email = Package['email'].Email;
  var originalSend = Email.send;

  Email.send = function (options) {
    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo) {
      var data = _.pick(options, 'from', 'to', 'cc', 'bcc', 'replyTo');

      var eventId = Kadira.tracer.event(kadiraInfo.trace, 'email', data);
    }

    try {
      var ret = originalSend.call(this, options);

      if (eventId) {
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId);
      }

      return ret;
    } catch (ex) {
      if (eventId) {
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
          err: ex.message
        });
      }

      throw ex;
    }
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"async.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/async.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapFibers: () => wrapFibers,
  getFiberMetrics: () => getFiberMetrics,
  resetFiberMetrics: () => resetFiberMetrics
});

var Fibers = Npm.require('fibers');

var EventSymbol = Symbol();
var StartTracked = Symbol();
var activeFibers = 0;
var wrapped = false;

function wrapFibers() {
  if (wrapped) {
    return;
  }

  wrapped = true;
  var originalYield = Fibers.yield;

  Fibers.yield = function () {
    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo) {
      var eventId = Kadira.tracer.event(kadiraInfo.trace, 'async');

      if (eventId) {
        // The event unique to this fiber
        // Using a symbol since Meteor doesn't copy symbols to new fibers created
        // for promises. This is needed so the correct event is ended when a fiber runs after being yielded.
        Fibers.current[EventSymbol] = eventId;
      }
    }

    return originalYield();
  };

  var originalRun = Fibers.prototype.run;
  var originalThrowInto = Fibers.prototype.throwInto;

  function ensureFiberCounted(fiber) {
    // If fiber.started is true, and StartTracked is false
    // then the fiber was probably initially ran before we wrapped Fibers.run
    if (!fiber.started || !fiber[StartTracked]) {
      activeFibers += 1;
      fiber[StartTracked] = true;
    }
  }

  Fibers.prototype.run = function (val) {
    ensureFiberCounted(this);

    if (this[EventSymbol]) {
      var kadiraInfo = Kadira._getInfo(this);

      if (kadiraInfo) {
        Kadira.tracer.eventEnd(kadiraInfo.trace, this[EventSymbol]);
        this[EventSymbol] = null;
      }
    } else if (!this.__kadiraInfo && Fibers.current && Fibers.current.__kadiraInfo) {
      // Copy kadiraInfo when packages or user code creates a new fiber
      // Done by many apps and packages in connect middleware since older
      // versions of Meteor did not do it automatically
      this.__kadiraInfo = Fibers.current.__kadiraInfo;
    }

    let result;

    try {
      result = originalRun.call(this, val);
    } finally {
      if (!this.started) {
        activeFibers -= 1;
        this[StartTracked] = false;
      }
    }

    return result;
  };

  Fibers.prototype.throwInto = function (val) {
    ensureFiberCounted(this); // TODO: this should probably end the current async event since in some places
    // Meteor calls throwInto instead of run after a fiber is yielded. For example,
    // when a promise is awaited and rejects an error.

    let result;

    try {
      result = originalThrowInto.call(this, val);
    } finally {
      if (!this.started) {
        activeFibers -= 1;
        this[StartTracked] = false;
      }
    }

    return result;
  };
}

let activeFiberTotal = 0;
let activeFiberCount = 0;
let previousTotalCreated = 0;
setInterval(() => {
  activeFiberTotal += activeFibers;
  activeFiberCount += 1;
}, 1000);

function getFiberMetrics() {
  return {
    created: Fibers.fibersCreated - previousTotalCreated,
    active: activeFiberTotal / activeFiberCount,
    poolSize: Fibers.poolSize
  };
}

function resetFiberMetrics() {
  activeFiberTotal = 0;
  activeFiberCount = 0;
  previousTotalCreated = Fibers.fibersCreated;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"error.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/error.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  MeteorDebugIgnore: () => MeteorDebugIgnore
});
const MeteorDebugIgnore = Symbol();

TrackUncaughtExceptions = function () {
  process.on('uncaughtException', function (err) {
    // skip errors with `_skipKadira` flag
    if (err._skipKadira) {
      return;
    } // let the server crash normally if error tracking is disabled


    if (!Kadira.options.enableErrorTracking) {
      printErrorAndKill(err);
    } // looking for already tracked errors and throw them immediately
    // throw error immediately if kadira is not ready


    if (err._tracked || !Kadira.connected) {
      printErrorAndKill(err);
    }

    var trace = getTrace(err, 'server-crash', 'uncaughtException');
    Kadira.models.error.trackError(err, trace);

    Kadira._sendPayload(function () {
      clearTimeout(timer);
      throwError(err);
    });

    var timer = setTimeout(function () {
      throwError(err);
    }, 1000 * 10);

    function throwError(err) {
      // sometimes error came back from a fiber.
      // But we don't fibers to track that error for us
      // That's why we throw the error on the nextTick
      process.nextTick(function () {
        // we need to mark this error where we really need to throw
        err._tracked = true;
        printErrorAndKill(err);
      });
    }
  });

  function printErrorAndKill(err) {
    // since we are capturing error, we are also on the error message.
    // so developers think we are also reponsible for the error.
    // But we are not. This will fix that.
    console.error(err.stack);
    process.exit(7);
  }
};

TrackUnhandledRejections = function () {
  process.on('unhandledRejection', function (reason) {
    // skip errors with `_skipKadira` flag
    if (reason._skipKadira || !Kadira.options.enableErrorTracking) {
      return;
    }

    var trace = getTrace(reason, 'server-internal', 'unhandledRejection');
    Kadira.models.error.trackError(reason, trace); // TODO: we should respect the --unhandled-rejections option
    // message taken from 
    // https://github.com/nodejs/node/blob/f4797ff1ef7304659d747d181ec1e7afac408d50/lib/internal/process/promises.js#L243-L248

    const message = 'This error originated either by ' + 'throwing inside of an async function without a catch block, ' + 'or by rejecting a promise which was not handled with .catch().' + ' The promise rejected with the reason: '; // We could emit a warning instead like Node does internally
    // but it requires Node 8 or newer

    console.warn(message);
    console.error(reason && reason.stack ? reason.stack : reason);
  });
};

TrackMeteorDebug = function () {
  var originalMeteorDebug = Meteor._debug;

  Meteor._debug = function (message, stack) {
    // Sometimes Meteor calls Meteor._debug with no arguments
    // to log an empty line
    const isArgs = message !== undefined || stack !== undefined; // We've changed `stack` into an object at method and sub handlers so we can
    // detect the error here. These errors are already tracked so don't track them again.

    var alreadyTracked = false; // Some Meteor versions pass the error, and other versions pass the error stack
    // Restore so origionalMeteorDebug shows the stack as a string instead as an object

    if (stack && stack[MeteorDebugIgnore]) {
      alreadyTracked = true;
      arguments[1] = stack.stack;
    } else if (stack && stack.stack && stack.stack[MeteorDebugIgnore]) {
      alreadyTracked = true;
      arguments[1] = stack.stack.stack;
    } // only send to the server if connected to kadira


    if (Kadira.options.enableErrorTracking && isArgs && !alreadyTracked && Kadira.connected) {
      let errorMessage = message;

      if (typeof message == 'string' && stack instanceof Error) {
        const separator = message.endsWith(':') ? '' : ':';
        errorMessage = "".concat(message).concat(separator, " ").concat(stack.message);
      }

      let error = new Error(errorMessage);

      if (stack instanceof Error) {
        error.stack = stack.stack;
      } else if (stack) {
        error.stack = stack;
      } else {
        error.stack = CreateUserStack(error);
      }

      var trace = getTrace(error, 'server-internal', 'Meteor._debug');
      Kadira.models.error.trackError(error, trace);
    }

    return originalMeteorDebug.apply(this, arguments);
  };
};

function getTrace(err, type, subType) {
  return {
    type: type,
    subType: subType,
    name: err.message,
    errored: true,
    at: Kadira.syncedDate.getTime(),
    events: [['start', 0, {}], ['error', 0, {
      error: {
        message: err.message,
        stack: err.stack
      }
    }]],
    metrics: {
      total: 0
    }
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"set_labels.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/set_labels.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
setLabels = function () {
  // name Session.prototype.send
  var originalSend = MeteorX.Session.prototype.send;

  MeteorX.Session.prototype.send = function kadira_Session_send(msg) {
    return originalSend.call(this, msg);
  }; // name Multiplexer initial adds
  // Multiplexer is undefined in rocket chat


  if (MeteorX.Multiplexer) {
    var originalSendAdds = MeteorX.Multiplexer.prototype._sendAdds;

    MeteorX.Multiplexer.prototype._sendAdds = function kadira_Multiplexer_sendAdds(handle) {
      return originalSendAdds.call(this, handle);
    };
  } // name MongoConnection insert


  var originalMongoInsert = MeteorX.MongoConnection.prototype._insert;

  MeteorX.MongoConnection.prototype._insert = function kadira_MongoConnection_insert(coll, doc, cb) {
    return originalMongoInsert.call(this, coll, doc, cb);
  }; // name MongoConnection update


  var originalMongoUpdate = MeteorX.MongoConnection.prototype._update;

  MeteorX.MongoConnection.prototype._update = function kadira_MongoConnection_update(coll, selector, mod, options, cb) {
    return originalMongoUpdate.call(this, coll, selector, mod, options, cb);
  }; // name MongoConnection remove


  var originalMongoRemove = MeteorX.MongoConnection.prototype._remove;

  MeteorX.MongoConnection.prototype._remove = function kadira_MongoConnection_remove(coll, selector, cb) {
    return originalMongoRemove.call(this, coll, selector, cb);
  }; // name Pubsub added


  var originalPubsubAdded = MeteorX.Session.prototype.sendAdded;

  MeteorX.Session.prototype.sendAdded = function kadira_Session_sendAdded(coll, id, fields) {
    return originalPubsubAdded.call(this, coll, id, fields);
  }; // name Pubsub changed


  var originalPubsubChanged = MeteorX.Session.prototype.sendChanged;

  MeteorX.Session.prototype.sendChanged = function kadira_Session_sendChanged(coll, id, fields) {
    return originalPubsubChanged.call(this, coll, id, fields);
  }; // name Pubsub removed


  var originalPubsubRemoved = MeteorX.Session.prototype.sendRemoved;

  MeteorX.Session.prototype.sendRemoved = function kadira_Session_sendRemoved(coll, id) {
    return originalPubsubRemoved.call(this, coll, id);
  }; // name MongoCursor forEach


  var originalCursorForEach = MeteorX.MongoCursor.prototype.forEach;

  MeteorX.MongoCursor.prototype.forEach = function kadira_Cursor_forEach() {
    return originalCursorForEach.apply(this, arguments);
  }; // name MongoCursor map


  var originalCursorMap = MeteorX.MongoCursor.prototype.map;

  MeteorX.MongoCursor.prototype.map = function kadira_Cursor_map() {
    return originalCursorMap.apply(this, arguments);
  }; // name MongoCursor fetch


  var originalCursorFetch = MeteorX.MongoCursor.prototype.fetch;

  MeteorX.MongoCursor.prototype.fetch = function kadira_Cursor_fetch() {
    return originalCursorFetch.apply(this, arguments);
  }; // name MongoCursor count


  var originalCursorCount = MeteorX.MongoCursor.prototype.count;

  MeteorX.MongoCursor.prototype.count = function kadira_Cursor_count() {
    return originalCursorCount.apply(this, arguments);
  }; // name MongoCursor observeChanges


  var originalCursorObserveChanges = MeteorX.MongoCursor.prototype.observeChanges;

  MeteorX.MongoCursor.prototype.observeChanges = function kadira_Cursor_observeChanges() {
    return originalCursorObserveChanges.apply(this, arguments);
  }; // name MongoCursor observe


  var originalCursorObserve = MeteorX.MongoCursor.prototype.observe;

  MeteorX.MongoCursor.prototype.observe = function kadira_Cursor_observe() {
    return originalCursorObserve.apply(this, arguments);
  }; // name CrossBar listen


  var originalCrossbarListen = DDPServer._Crossbar.prototype.listen;

  DDPServer._Crossbar.prototype.listen = function kadira_Crossbar_listen(trigger, callback) {
    return originalCrossbarListen.call(this, trigger, callback);
  }; // name CrossBar fire


  var originalCrossbarFire = DDPServer._Crossbar.prototype.fire;

  DDPServer._Crossbar.prototype.fire = function kadira_Crossbar_fire(notification) {
    return originalCrossbarFire.call(this, notification);
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fast_render.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/fast_render.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapFastRender: () => wrapFastRender
});

function wrapFastRender() {
  Meteor.startup(() => {
    if (Package['staringatlights:fast-render']) {
      const FastRender = Package['staringatlights:fast-render'].FastRender; // Flow Router doesn't call FastRender.route until after all
      // Meteor.startup callbacks finish

      let origRoute = FastRender.route;

      FastRender.route = function (path, _callback) {
        let callback = function () {
          const info = Kadira._getInfo();

          if (info) {
            info.suggestedRouteName = path;
          }

          return _callback.apply(this, arguments);
        };

        return origRoute.call(FastRender, path, callback);
      };
    }
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fs.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/fs.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  handleErrorEvent: () => handleErrorEvent,
  wrapFs: () => wrapFs
});
let fs;
module.link("fs", {
  default(v) {
    fs = v;
  }

}, 0);

const Fibers = require('fibers');

function wrapCallback(args, createWrapper) {
  if (typeof args[args.length - 1] === 'function') {
    args[args.length - 1] = createWrapper(args[args.length - 1]);
  }
}

function handleErrorEvent(eventEmitter, trace, event) {
  function handler(error) {
    if (trace && event) {
      Kadira.tracer.eventEnd(trace, event, {
        error: error
      });
    } // Node throws the error if there are no listeners
    // We want it to behave as if we are not listening to it


    if (eventEmitter.listenerCount('error') === 1) {
      eventEmitter.removeListener('error', handler);
      eventEmitter.emit('error', error);
    }
  }

  eventEmitter.on('error', handler);
}

function wrapFs() {
  // Some npm packages will do fs calls in the
  // callback of another fs call.
  // This variable is set with the kadiraInfo while
  // a callback is run so we can track other fs calls
  let fsKadiraInfo = null;
  let originalStat = fs.stat;

  fs.stat = function () {
    const kadiraInfo = Kadira._getInfo() || fsKadiraInfo;

    if (kadiraInfo) {
      let event = Kadira.tracer.event(kadiraInfo.trace, 'fs', {
        func: 'stat',
        path: arguments[0],
        options: typeof arguments[1] === 'object' ? arguments[1] : undefined
      });
      wrapCallback(arguments, cb => {
        return function () {
          Kadira.tracer.eventEnd(kadiraInfo.trace, event);

          if (!Fibers.current) {
            fsKadiraInfo = kadiraInfo;
          }

          try {
            cb.apply(null, arguments);
          } finally {
            fsKadiraInfo = null;
          }
        };
      });
    }

    return originalStat.apply(fs, arguments);
  };

  let originalCreateReadStream = fs.createReadStream;

  fs.createReadStream = function () {
    const kadiraInfo = Kadira._getInfo() || fsKadiraInfo;
    let stream = originalCreateReadStream.apply(this, arguments);

    if (kadiraInfo) {
      const event = Kadira.tracer.event(kadiraInfo.trace, 'fs', {
        func: 'createReadStream',
        path: arguments[0],
        options: JSON.stringify(arguments[1])
      });
      stream.on('end', () => {
        Kadira.tracer.eventEnd(kadiraInfo.trace, event);
      });
      handleErrorEvent(stream, kadiraInfo.trace, event);
    }

    return stream;
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"gc.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/gc.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => GCMetrics
});
let PerformanceObserver;
let constants;
let performance;

try {
  // Only available in Node 8.5 and newer
  ({
    PerformanceObserver,
    constants,
    performance
  } = require('perf_hooks'));
} catch (e) {}

class GCMetrics {
  constructor() {
    this._observer = null;
    this.started = false;
    this.metrics = {};
    this.reset();
  }

  start() {
    if (this.started) {
      return false;
    }

    if (!PerformanceObserver || !constants) {
      // The node version is too old to have PerformanceObserver
      return false;
    }

    this.started = true;
    this.observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        let metric = this._mapKindToMetric(entry.kind);

        this.metrics[metric] += entry.duration;
      }); // The function was removed in Node 10 since it stopped storing old
      // entries

      if (typeof performance.clearGC === 'function') {
        performance.clearGC();
      }
    });
    this.observer.observe({
      entryTypes: ['gc'],
      buffered: false
    });
  }

  _mapKindToMetric(gcKind) {
    switch (gcKind) {
      case constants.NODE_PERFORMANCE_GC_MAJOR:
        return 'gcMajor';

      case constants.NODE_PERFORMANCE_GC_MINOR:
        return 'gcMinor';

      case constants.NODE_PERFORMANCE_GC_INCREMENTAL:
        return 'gcIncremental';

      case constants.NODE_PERFORMANCE_GC_WEAKCB:
        return 'gcWeakCB';

      default:
        console.log("Monti APM: Unrecognized GC Kind: ".concat(gcKind));
    }
  }

  reset() {
    this.metrics = {
      gcMajor: 0,
      gcMinor: 0,
      gcIncremental: 0,
      gcWeakCB: 0
    };
  }

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_driver_events.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/mongo_driver_events.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  getMongoDriverStats: () => getMongoDriverStats,
  resetMongoDriverStats: () => resetMongoDriverStats
});
var client;
var serverStatus = Object.create(null);
var otherCheckouts = 0; // These metrics are only for the mongo pool for the primary Mongo server

var primaryCheckouts = 0;
var totalCheckoutTime = 0;
var maxCheckoutTime = 0;
var created = 0;
var measurementCount = 0;
var pendingTotal = 0;
var checkedOutTotal = 0;
setInterval(() => {
  let status = getServerStatus(getPrimary(), true);

  if (status) {
    pendingTotal += status.pending.length;
    checkedOutTotal += status.checkedOut.size;
    measurementCount += 1;
  }
}, 1000); // Version 4 of the driver defaults to 100. Older versions used 10.

var DEFAULT_MAX_POOL_SIZE = 100;

function getPoolSize() {
  if (client && client.topology && client.topology.s && client.topology.s.options) {
    return client.topology.s.options.maxPoolSize || DEFAULT_MAX_POOL_SIZE;
  }

  return 0;
}

function getMongoDriverStats() {
  return {
    poolSize: getPoolSize(),
    primaryCheckouts,
    otherCheckouts,
    checkoutTime: totalCheckoutTime,
    maxCheckoutTime,
    pending: pendingTotal ? pendingTotal / measurementCount : 0,
    checkedOut: checkedOutTotal ? checkedOutTotal / measurementCount : 0,
    created
  };
}

;

function resetMongoDriverStats() {
  primaryCheckouts = 0;
  otherCheckouts = 0;
  totalCheckoutTime = 0;
  maxCheckoutTime = 0;
  pendingTotal = 0;
  checkedOutTotal = 0;
  measurementCount = 0;
  primaryCheckouts = 0;
  created = 0;
}

Meteor.startup(() => {
  let _client = MongoInternals.defaultRemoteCollectionDriver().mongo.client;

  if (!_client || !_client.s) {
    // Old version of agent
    return;
  }

  let options = _client.s.options || {};
  let versionParts = MongoInternals.NpmModules.mongodb.version.split('.').map(part => parseInt(part, 10)); // Version 4 of the driver removed the option and enabled it by default

  if (!options.useUnifiedTopology && versionParts[0] < 4) {
    // CMAP and topology monitoring requires useUnifiedTopology
    return;
  } // Meteor 1.9 enabled useUnifiedTopology, but CMAP events were only added
  // in version 3.5 of the driver.


  if (versionParts[0] === 3 && versionParts[1] < 5) {
    return;
  }

  client = _client; // Get the number of connections already created

  let primaryDescription = getServerDescription(getPrimary());

  if (primaryDescription && primaryDescription.s && primaryDescription.s.pool) {
    let pool = primaryDescription.s.pool;
    let totalConnections = pool.totalConnectionCount;
    let availableConnections = pool.availableConnectionCount; // totalConnectionCount counts available connections twice

    created += totalConnections - availableConnections;
  }

  client.on('connectionCreated', event => {
    let primary = getPrimary();

    if (primary === event.address) {
      created += 1;
    }
  });
  client.on('connectionClosed', event => {
    let status = getServerStatus(event.address, true);

    if (status) {
      status.checkedOut.delete(event.connectionId);
    }
  });
  client.on('connectionCheckOutStarted', event => {
    let status = getServerStatus(event.address);
    status.pending.push(event.time);
  });
  client.on('connectionCheckOutFailed', event => {
    let status = getServerStatus(event.address, true);

    if (status) {
      status.pending.shift();
    }
  });
  client.on('connectionCheckedOut', event => {
    let status = getServerStatus(event.address);
    let start = status.pending.shift();
    let primary = getPrimary();

    if (start && primary === event.address) {
      let checkoutDuration = event.time.getTime() - start.getTime();
      primaryCheckouts += 1;
      totalCheckoutTime += checkoutDuration;

      if (checkoutDuration > maxCheckoutTime) {
        maxCheckoutTime = checkoutDuration;
      }
    } else {
      otherCheckouts += 1;
    }

    status.checkedOut.add(event.connectionId);
  });
  client.on('connectionCheckedIn', event => {
    let status = getServerStatus(event.address, true);

    if (status) {
      status.checkedOut.delete(event.connectionId);
    }
  });
  client.on('serverClosed', function (event) {
    delete serverStatus[event.address];
  });
});

function getServerStatus(address, disableCreate) {
  if (typeof address !== 'string') {
    return null;
  }

  if (address in serverStatus) {
    return serverStatus[address];
  }

  if (disableCreate) {
    return null;
  }

  serverStatus[address] = {
    pending: [],
    checkedOut: new Set()
  };
  return serverStatus[address];
}

function getPrimary() {
  if (!client || !client.topology) {
    return null;
  } // The driver renamed lastIsMaster in version 4.3.1 to lastHello


  let server = client.topology.lastIsMaster ? client.topology.lastIsMaster() : client.topology.lastHello();

  if (server.type === 'Standalone') {
    return server.address;
  }

  if (!server || !server.primary) {
    return null;
  }

  return server.primary;
}

function getServerDescription(address) {
  if (!client || !client.topology || !client.topology.s || !client.topology.s.servers) {
    return null;
  }

  let description = client.topology.s.servers.get(address);
  return description || null;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"picker.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/picker.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapPicker: () => wrapPicker
});
let Fiber;
module.link("fibers", {
  default(v) {
    Fiber = v;
  }

}, 0);

function wrapPicker() {
  Meteor.startup(() => {
    if (!Package['meteorhacks:picker']) {
      return;
    }

    const Picker = Package['meteorhacks:picker'].Picker; // Wrap Picker._processRoute to make sure it runs the
    // handler in a Fiber with __kadiraInfo set
    // Needed if any previous middleware called `next` outside of a fiber.

    const origProcessRoute = Picker.constructor.prototype._processRoute;

    Picker.constructor.prototype._processRoute = function (callback, params, req) {
      const args = arguments;

      if (!Fiber.current) {
        return new Fiber(() => {
          Kadira._setInfo(req.__kadiraInfo);

          return origProcessRoute.apply(this, args);
        }).run();
      }

      if (req.__kadiraInfo) {
        Kadira._setInfo(req.__kadiraInfo);
      }

      return origProcessRoute.apply(this, args);
    };
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_routers.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_routers.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapRouters: () => wrapRouters
});
let Fibers;
module.link("fibers", {
  default(v) {
    Fibers = v;
  }

}, 0);

function wrapRouters() {
  let connectRoutes = [];

  try {
    connectRoutes.push(require('connect-route'));
  } catch (e) {// We can ignore errors
  }

  try {
    if (Package['simple:json-routes']) {
      // Relative from .npm/node_modules/meteor/montiapm_agent/node_modules
      // Npm.require is less strict on what paths you use than require
      connectRoutes.push(Npm.require('../../simple_json-routes/node_modules/connect-route'));
    }
  } catch (e) {// we can ignore errors
  }

  connectRoutes.forEach(connectRoute => {
    if (typeof connectRoute !== 'function') {
      return;
    }

    connectRoute(router => {
      const oldAdd = router.constructor.prototype.add;

      router.constructor.prototype.add = function (method, route, handler) {
        // Unlike most routers, connect-route doesn't look at the arguments length
        oldAdd.call(this, method, route, function () {
          if (arguments[0] && arguments[0].__kadiraInfo) {
            arguments[0].__kadiraInfo.suggestedRouteName = route;
          }

          handler.apply(null, arguments);
        });
      };
    });
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_webapp.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_webapp.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  checkHandlersInFiber: () => checkHandlersInFiber,
  wrapWebApp: () => wrapWebApp
});
let WebAppInternals, WebApp;
module.link("meteor/webapp", {
  WebAppInternals(v) {
    WebAppInternals = v;
  },

  WebApp(v) {
    WebApp = v;
  }

}, 0);
let Fibers;
module.link("fibers", {
  default(v) {
    Fibers = v;
  }

}, 1);
// Maximum content-length size
MAX_BODY_SIZE = 8000; // Maximum characters for stringified body

MAX_STRINGIFIED_BODY_SIZE = 4000;
const canWrapStaticHandler = !!WebAppInternals.staticFilesByArch; // This checks if running on a version of Meteor that
// wraps connect handlers in a fiber.
// This check is dependant on Meteor's implementation of `use`,
// which wraps every handler in a new fiber.
// This will need to be updated if Meteor starts reusing
// fibers when they exist.

function checkHandlersInFiber() {
  const handlersLength = WebApp.rawConnectHandlers.stack.length;
  let inFiber = false;
  let outsideFiber = Fibers.current;
  WebApp.rawConnectHandlers.use((_req, _res, next) => {
    inFiber = Fibers.current && Fibers.current !== outsideFiber; // in case we didn't successfully remove this handler
    // and it is a real request

    next();
  });

  if (WebApp.rawConnectHandlers.stack[handlersLength]) {
    let handler = WebApp.rawConnectHandlers.stack[handlersLength].handle; // remove the newly added handler
    // We remove it immediately so there is no opportunity for
    // other code to add handlers first if the current fiber is yielded
    // while running the handler

    while (WebApp.rawConnectHandlers.stack.length > handlersLength) {
      WebApp.rawConnectHandlers.stack.pop();
    }

    handler({}, {}, () => {});
  }

  return inFiber;
}

const InfoSymbol = Symbol();

function wrapWebApp() {
  return Promise.asyncApply(() => {
    if (!checkHandlersInFiber() || !canWrapStaticHandler) {
      return;
    }

    const parseUrl = require('parseurl');

    WebAppInternals.registerBoilerplateDataCallback('__montiApmRouteName', function (request) {
      // TODO: record in trace which arch is used
      if (request[InfoSymbol]) {
        request[InfoSymbol].isAppRoute = true;
      } // Let WebApp know we didn't make changes
      // so it can use a cache


      return false;
    }); // We want the request object returned by categorizeRequest to have
    // __kadiraInfo

    let origCategorizeRequest = WebApp.categorizeRequest;

    WebApp.categorizeRequest = function (req) {
      let result = origCategorizeRequest.apply(this, arguments);

      if (result && req.__kadiraInfo) {
        result[InfoSymbol] = req.__kadiraInfo;
      }

      return result;
    }; // Adding the handler directly to the stack
    // to force it to be the first one to run


    WebApp.rawConnectHandlers.stack.unshift({
      route: '',
      handle: (req, res, next) => {
        const name = parseUrl(req).pathname;
        const trace = Kadira.tracer.start("".concat(req.method, "-").concat(name), 'http');

        const headers = Kadira.tracer._applyObjectFilters(req.headers);

        Kadira.tracer.event(trace, 'start', {
          url: req.url,
          method: req.method,
          headers: JSON.stringify(headers)
        });
        req.__kadiraInfo = {
          trace
        };
        res.on('finish', () => {
          if (req.__kadiraInfo.asyncEvent) {
            Kadira.tracer.eventEnd(trace, req.__kadiraInfo.asyncEvent);
          }

          Kadira.tracer.endLastEvent(trace);

          if (req.__kadiraInfo.isStatic) {
            trace.name = "".concat(req.method, "-<static file>");
          } else if (req.__kadiraInfo.suggestedRouteName) {
            trace.name = "".concat(req.method, "-").concat(req.__kadiraInfo.suggestedRouteName);
          } else if (req.__kadiraInfo.isAppRoute) {
            trace.name = "".concat(req.method, "-<app>");
          }

          const isJson = req.headers['content-type'] === 'application/json';
          const hasSmallBody = req.headers['content-length'] > 0 && req.headers['content-length'] < MAX_BODY_SIZE; // Check after all middleware have run to see if any of them
          // set req.body
          // Technically bodies can be used with any method, but since many load balancers and
          // other software only support bodies for POST requests, we are
          // not recording the body for other methods.

          if (req.method === 'POST' && req.body && isJson && hasSmallBody) {
            try {
              let body = JSON.stringify(req.body); // Check the body size again in case it is much
              // larger than what was in the content-length header

              if (body.length < MAX_STRINGIFIED_BODY_SIZE) {
                trace.events[0].data.body = body;
              }
            } catch (e) {// It is okay if this fails
            }
          } // TODO: record status code


          Kadira.tracer.event(trace, 'complete');
          let built = Kadira.tracer.buildTrace(trace);
          Kadira.models.http.processRequest(built, req, res);
        });
        next();
      }
    });

    function wrapHandler(handler) {
      // connect identifies error handles by them accepting
      // four arguments
      let errorHandler = handler.length === 4;

      function wrapper(req, res, next) {
        let error;

        if (errorHandler) {
          error = req;
          req = res;
          res = next;
          next = arguments[3];
        }

        const kadiraInfo = req.__kadiraInfo;

        Kadira._setInfo(kadiraInfo);

        let nextCalled = false; // TODO: track errors passed to next or thrown

        function wrappedNext() {
          if (kadiraInfo && kadiraInfo.asyncEvent) {
            Kadira.tracer.eventEnd(req.__kadiraInfo.trace, req.__kadiraInfo.asyncEvent);
            req.__kadiraInfo.asyncEvent = null;
          }

          nextCalled = true;
          next(...arguments);
        }

        let potentialPromise;

        if (errorHandler) {
          potentialPromise = handler.call(this, error, req, res, wrappedNext);
        } else {
          potentialPromise = handler.call(this, req, res, wrappedNext);
        }

        if (potentialPromise && typeof potentialPromise.then === 'function') {
          potentialPromise.then(() => {
            // res.finished is depreciated in Node 13, but it is the only option
            // for Node 12.9 and older.
            if (kadiraInfo && !res.finished && !nextCalled) {
              const lastEvent = Kadira.tracer.getLastEvent(kadiraInfo.trace);

              if (lastEvent.endAt) {
                // req is not done, and next has not been called
                // create an async event that will end when either of those happens
                kadiraInfo.asyncEvent = Kadira.tracer.event(kadiraInfo.trace, 'async');
              }
            }
          });
        }

        return potentialPromise;
      }

      if (errorHandler) {
        return function (error, req, res, next) {
          return wrapper(error, req, res, next);
        };
      } else {
        return function (req, res, next) {
          return wrapper(req, res, next);
        };
      }
    }

    function wrapConnect(app, wrapStack) {
      let oldUse = app.use;

      if (wrapStack) {
        // We need to set kadiraInfo on the Fiber the handler will run in.
        // Meteor has already wrapped the handler to run it in a new Fiber
        // by using Promise.asyncApply so we are not able to directly set it
        // on that Fiber. 
        // Meteor's promise library copies properties from the current fiber to
        // the new fiber, so we can wrap it in another Fiber with kadiraInfo set
        // and Meteor will copy kadiraInfo to the new Fiber.
        // It will only create the additional Fiber if it isn't already running in a Fiber
        app.stack.forEach(entry => {
          let wrappedHandler = wrapHandler(entry.handle);

          if (entry.handle.length >= 4) {
            entry.handle = function (error, req, res, next) {
              return Promise.asyncApply(wrappedHandler, this, arguments, true);
            };
          } else {
            entry.handle = function (req, res, next) {
              return Promise.asyncApply(wrappedHandler, this, arguments, true);
            };
          }
        });
      }

      app.use = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        args[args.length - 1] = wrapHandler(args[args.length - 1]);
        return oldUse.apply(app, args);
      };
    }

    wrapConnect(WebApp.rawConnectHandlers, false);
    wrapConnect(WebAppInternals.meteorInternalHandlers, false); // The oauth package and other core packages might have already added their middleware,
    // so we need to wrap the existing middleware

    wrapConnect(WebApp.connectHandlers, true);
    wrapConnect(WebApp.connectApp, false);
    let oldStaticFilesMiddleware = WebAppInternals.staticFilesMiddleware;
    const staticHandler = wrapHandler(oldStaticFilesMiddleware.bind(WebAppInternals, WebAppInternals.staticFilesByArch));

    WebAppInternals.staticFilesMiddleware = function (_staticFiles, req, res, next) {
      if (req.__kadiraInfo) {
        req.__kadiraInfo.isStatic = true;
      }

      return staticHandler(req, res, function () {
        // if the request is for a static file, the static handler will end the response
        // instead of calling next
        req.__kadiraInfo.isStatic = false;
        return next.apply(this, arguments);
      });
    };
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"environment_variables.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/environment_variables.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
function normalizedPrefix(name) {
  return name.replace('KADIRA_', 'MONTI_');
}

Kadira._parseEnv = function (env) {
  var options = {};

  for (var name in env) {
    var value = env[name];
    var normalizedName = normalizedPrefix(name);
    var info = Kadira._parseEnv._options[normalizedName];

    if (info && value) {
      options[info.name] = info.parser(value);
    }
  }

  return options;
};

Kadira._parseEnv.parseInt = function (str) {
  var num = parseInt(str);
  if (num || num === 0) return num;
  throw new Error('Kadira: Match Error: "' + num + '" is not a number');
};

Kadira._parseEnv.parseBool = function (str) {
  str = str.toLowerCase();
  if (str === 'true') return true;
  if (str === 'false') return false;
  throw new Error('Kadira: Match Error: ' + str + ' is not a boolean');
};

Kadira._parseEnv.parseUrl = function (str) {
  return str;
};

Kadira._parseEnv.parseString = function (str) {
  return str;
};

Kadira._parseEnv._options = {
  // auth
  MONTI_APP_ID: {
    name: 'appId',
    parser: Kadira._parseEnv.parseString
  },
  MONTI_APP_SECRET: {
    name: 'appSecret',
    parser: Kadira._parseEnv.parseString
  },
  // delay to send the initial ping to the kadira engine after page loads
  MONTI_OPTIONS_CLIENT_ENGINE_SYNC_DELAY: {
    name: 'clientEngineSyncDelay',
    parser: Kadira._parseEnv.parseInt
  },
  // time between sending errors to the engine
  MONTI_OPTIONS_ERROR_DUMP_INTERVAL: {
    name: 'errorDumpInterval',
    parser: Kadira._parseEnv.parseInt
  },
  // no of errors allowed in a given interval
  MONTI_OPTIONS_MAX_ERRORS_PER_INTERVAL: {
    name: 'maxErrorsPerInterval',
    parser: Kadira._parseEnv.parseInt
  },
  // a zone.js specific option to collect the full stack trace(which is not much useful)
  MONTI_OPTIONS_COLLECT_ALL_STACKS: {
    name: 'collectAllStacks',
    parser: Kadira._parseEnv.parseBool
  },
  // enable error tracking (which is turned on by default)
  MONTI_OPTIONS_ENABLE_ERROR_TRACKING: {
    name: 'enableErrorTracking',
    parser: Kadira._parseEnv.parseBool
  },
  // kadira engine endpoint
  MONTI_OPTIONS_ENDPOINT: {
    name: 'endpoint',
    parser: Kadira._parseEnv.parseUrl
  },
  // define the hostname of the current running process
  MONTI_OPTIONS_HOSTNAME: {
    name: 'hostname',
    parser: Kadira._parseEnv.parseString
  },
  // interval between sending data to the kadira engine from the server
  MONTI_OPTIONS_PAYLOAD_TIMEOUT: {
    name: 'payloadTimeout',
    parser: Kadira._parseEnv.parseInt
  },
  // set HTTP/HTTPS proxy
  MONTI_OPTIONS_PROXY: {
    name: 'proxy',
    parser: Kadira._parseEnv.parseUrl
  },
  // number of items cached for tracking document size
  MONTI_OPTIONS_DOCUMENT_SIZE_CACHE_SIZE: {
    name: 'documentSizeCacheSize',
    parser: Kadira._parseEnv.parseInt
  },
  // enable uploading sourcemaps
  MONTI_UPLOAD_SOURCE_MAPS: {
    name: 'uploadSourceMaps',
    parser: Kadira._parseEnv.parseBool
  },
  MONTI_RECORD_IP_ADDRESS: {
    name: 'recordIPAddress',
    parser: Kadira._parseEnv.parseString
  },
  MONTI_EVENT_STACK_TRACE: {
    name: 'eventStackTrace',
    parser: Kadira._parseEnv.parseBool
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"auto_connect.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/auto_connect.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Kadira._connectWithEnv = function () {
  var options = Kadira._parseEnv(process.env);

  if (options.appId && options.appSecret) {
    Kadira.connect(options.appId, options.appSecret, options);

    Kadira.connect = function () {
      throw new Error('Kadira has been already connected using credentials from Environment Variables');
    };
  }
};

Kadira._connectWithSettings = function () {
  var montiSettings = Meteor.settings.monti || Meteor.settings.kadira;

  if (montiSettings && montiSettings.appId && montiSettings.appSecret) {
    Kadira.connect(montiSettings.appId, montiSettings.appSecret, montiSettings.options || {});

    Kadira.connect = function () {
      throw new Error('Kadira has been already connected using credentials from Meteor.settings');
    };
  }
}; // Try to connect automatically


Kadira._connectWithEnv();

Kadira._connectWithSettings();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"conflicting_agents.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/conflicting_agents.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const conflictingPackages = ['mdg:meteor-apm-agent', 'lmachens:kadira', 'meteorhacks:kadira'];
Meteor.startup(() => {
  conflictingPackages.forEach(name => {
    if (name in Package) {
      console.log("Monti APM: your app is using the ".concat(name, " package. Using more than one APM agent in an app can cause unexpected problems."));
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},".meteor-package-versions":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/.meteor-package-versions                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {"accounts-base":"2.2.3","accounts-password":"2.3.1","alanning:roles":"3.4.0","aldeed:collection2":"3.5.0","aldeed:schema-index":"3.0.0","allow-deny":"1.1.1","autoupdate":"1.8.0","babel-compiler":"7.9.0","babel-runtime":"1.5.1","base64":"1.0.12","binary-heap":"1.0.11","blaze-tools":"1.1.3","boilerplate-generator":"1.7.1","caching-compiler":"1.2.2","caching-html-compiler":"1.2.1","callback-hook":"1.4.0","check":"1.3.1","ddp":"1.4.0","ddp-client":"2.5.0","ddp-common":"1.4.0","ddp-rate-limiter":"1.1.0","ddp-server":"2.5.0","dev-error-overlay":"0.1.1","diff-sequence":"1.1.1","dynamic-import":"0.7.2","ecmascript":"0.16.2","ecmascript-runtime":"0.8.0","ecmascript-runtime-client":"0.12.1","ecmascript-runtime-server":"0.11.0","ejson":"1.1.2","email":"2.2.1","es5-shim":"4.8.0","fetch":"0.1.1","geojson-utils":"1.0.10","hot-code-push":"1.0.4","hot-module-replacement":"0.5.1","html-tools":"1.1.3","htmljs":"1.1.1","id-map":"1.1.1","insecure":"1.0.7","inter-process-messaging":"0.1.1","launch-screen":"1.3.0","localstorage":"1.2.0","logging":"1.3.1","meteor":"1.10.0","meteor-base":"1.5.1","minifier-css":"1.6.0","minifier-js":"2.7.4","minimongo":"1.8.0","mobile-experience":"1.1.0","mobile-status-bar":"1.1.0","modern-browsers":"0.1.8","modules":"0.18.0","modules-runtime":"0.13.0","modules-runtime-hot":"0.14.0","mongo":"1.15.0","mongo-decimal":"0.1.3","mongo-dev-server":"1.1.0","mongo-id":"1.0.8","montiapm:agent":"2.45.1","montiapm:meteorx":"2.2.0","npm-mongo":"4.3.1","ordered-dict":"1.1.0","promise":"0.12.0","raix:eventemitter":"1.0.0","random":"1.2.0","rate-limit":"1.0.9","react-fast-refresh":"0.2.3","react-meteor-data":"2.5.1","reactive-var":"1.0.11","reload":"1.3.1","retry":"1.1.0","routepolicy":"1.1.1","service-configuration":"1.3.0","sha":"1.0.9","shell-server":"0.5.0","socket-stream-client":"0.5.0","spacebars-compiler":"1.3.1","standard-minifier-css":"1.8.1","standard-minifier-js":"2.8.0","static-html":"1.3.2","templating-tools":"1.2.2","tmeasday:check-npm-versions":"1.0.2","tracker":"1.2.0","typescript":"4.5.4","underscore":"1.0.10","url":"1.3.2","webapp":"1.13.1","webapp-hashing":"1.1.0","zodern:hide-production-sourcemaps":"1.2.0","zodern:meteor-package-versions":"0.2.1"}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"monti-apm-sketches-js":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/monti-apm-sketches-js/package.json                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "monti-apm-sketches-js",
  "version": "0.0.3",
  "main": "index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/monti-apm-sketches-js/index.js                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"parseurl":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/parseurl/package.json                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "parseurl",
  "version": "1.3.3"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/parseurl/index.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/montiapm:agent/lib/common/utils.js");
require("/node_modules/meteor/montiapm:agent/lib/common/unify.js");
require("/node_modules/meteor/montiapm:agent/lib/models/base_error.js");
require("/node_modules/meteor/montiapm:agent/lib/jobs.js");
require("/node_modules/meteor/montiapm:agent/lib/retry.js");
require("/node_modules/meteor/montiapm:agent/lib/utils.js");
require("/node_modules/meteor/montiapm:agent/lib/ntp.js");
require("/node_modules/meteor/montiapm:agent/lib/sourcemaps.js");
require("/node_modules/meteor/montiapm:agent/lib/wait_time_builder.js");
require("/node_modules/meteor/montiapm:agent/lib/check_for_oplog.js");
require("/node_modules/meteor/montiapm:agent/lib/tracer/tracer.js");
require("/node_modules/meteor/montiapm:agent/lib/tracer/default_filters.js");
require("/node_modules/meteor/montiapm:agent/lib/tracer/tracer_store.js");
require("/node_modules/meteor/montiapm:agent/lib/models/0model.js");
require("/node_modules/meteor/montiapm:agent/lib/models/methods.js");
require("/node_modules/meteor/montiapm:agent/lib/models/pubsub.js");
require("/node_modules/meteor/montiapm:agent/lib/models/system.js");
require("/node_modules/meteor/montiapm:agent/lib/models/errors.js");
require("/node_modules/meteor/montiapm:agent/lib/docsize_cache.js");
require("/node_modules/meteor/montiapm:agent/lib/kadira.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_server.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_session.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_subscription.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_observers.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_ddp_stringify.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/instrument.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/db.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/http.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/email.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/async.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/error.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/set_labels.js");
require("/node_modules/meteor/montiapm:agent/lib/environment_variables.js");
require("/node_modules/meteor/montiapm:agent/lib/auto_connect.js");
require("/node_modules/meteor/montiapm:agent/lib/conflicting_agents.js");
require("/node_modules/meteor/montiapm:agent/lib/common/default_error_filters.js");
require("/node_modules/meteor/montiapm:agent/lib/common/send.js");

/* Exports */
Package._define("montiapm:agent", {
  Kadira: Kadira,
  Monti: Monti
});

})();

//# sourceURL=meteor://💻app/packages/montiapm_agent.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NvbW1vbi91dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NvbW1vbi91bmlmeS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NvbW1vbi9kZWZhdWx0X2Vycm9yX2ZpbHRlcnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9jb21tb24vc2VuZC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL21vZGVscy9iYXNlX2Vycm9yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvbW9kZWxzLzBtb2RlbC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL21vZGVscy9tZXRob2RzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvbW9kZWxzL3B1YnN1Yi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL21vZGVscy9zeXN0ZW0uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9tb2RlbHMvZXJyb3JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvbW9kZWxzL2h0dHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9qb2JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvcmV0cnkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi91dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL250cC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL3NvdXJjZW1hcHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi93YWl0X3RpbWVfYnVpbGRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NoZWNrX2Zvcl9vcGxvZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL3RyYWNlci90cmFjZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi90cmFjZXIvZGVmYXVsdF9maWx0ZXJzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvdHJhY2VyL3RyYWNlcl9zdG9yZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2RvY3NpemVfY2FjaGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9rYWRpcmEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svd3JhcF9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svd3JhcF9zZXNzaW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3dyYXBfc3Vic2NyaXB0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3dyYXBfb2JzZXJ2ZXJzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3dyYXBfZGRwX3N0cmluZ2lmeS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9pbnN0cnVtZW50LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL2RiLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL2h0dHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svZW1haWwuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svYXN5bmMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svZXJyb3IuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svc2V0X2xhYmVscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9mYXN0X3JlbmRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9mcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9nYy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9tb25nb19kcml2ZXJfZXZlbnRzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3BpY2tlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay93cmFwX3JvdXRlcnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svd3JhcF93ZWJhcHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9lbnZpcm9ubWVudF92YXJpYWJsZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9hdXRvX2Nvbm5lY3QuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9jb25mbGljdGluZ19hZ2VudHMuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiZ2V0RXJyb3JQYXJhbWV0ZXJzIiwiZ2V0Q2xpZW50QXJjaFZlcnNpb24iLCJhcmNoIiwiYXV0b3VwZGF0ZSIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJ2ZXJzaW9ucyIsInZlcnNpb24iLCJhdXRvdXBkYXRlVmVyc2lvbkNvcmRvdmEiLCJhdXRvdXBkYXRlVmVyc2lvbiIsImNyZWF0ZVN0YWNrVHJhY2UiLCJFcnJvciIsImNhcHR1cmVTdGFja1RyYWNlIiwiZXJyIiwiS2FkaXJhIiwidHJhY2tFcnJvciIsInN0YWNrIiwic3BsaXQiLCJ0b1JlbW92ZSIsImxlbmd0aCIsImluZGV4T2YiLCJzbGljZSIsImpvaW4iLCJhcmdzIiwidHlwZSIsIm1lc3NhZ2UiLCJzdWJUeXBlIiwib3B0aW9ucyIsIk1ldGVvciIsImlzQ2xpZW50Iiwic3RhY2tzIiwiZXJyb3IiLCJpc0Vycm9yT2JqZWN0IiwiTW9udGkiLCJ3cmFwQXN5bmMiLCJfd3JhcEFzeW5jIiwiaXNTZXJ2ZXIiLCJFdmVudEVtaXR0ZXIiLCJOcG0iLCJyZXF1aXJlIiwiZXZlbnRCdXMiLCJzZXRNYXhMaXN0ZW5lcnMiLCJidWlsZEFyZ3MiLCJldmVudE5hbWUiLCJ1bnNoaWZ0IiwiRXZlbnRCdXMiLCJmb3JFYWNoIiwibSIsImFwcGx5IiwiY29tbW9uRXJyUmVnRXhwcyIsImVycm9yRmlsdGVycyIsImZpbHRlclZhbGlkYXRpb25FcnJvcnMiLCJmaWx0ZXJDb21tb25NZXRlb3JFcnJvcnMiLCJsYyIsInJlZ0V4cCIsInRlc3QiLCJzZW5kIiwicGF5bG9hZCIsInBhdGgiLCJjYWxsYmFjayIsImNvbm5lY3RlZCIsInN1YnN0ciIsImVuZHBvaW50IiwicmV0cnlDb3VudCIsInJldHJ5IiwiUmV0cnkiLCJtaW5Db3VudCIsIm1pblRpbWVvdXQiLCJiYXNlVGltZW91dCIsIm1heFRpbWVvdXQiLCJzZW5kRnVuY3Rpb24iLCJfZ2V0U2VuZEZ1bmN0aW9uIiwidHJ5VG9TZW5kIiwicmV0cnlMYXRlciIsImNvbnNvbGUiLCJ3YXJuIiwicmVzIiwic3RhdHVzQ29kZSIsImRhdGEiLCJjb250ZW50IiwiX3NlcnZlclNlbmQiLCJfY2xpZW50U2VuZCIsImh0dHBSZXF1ZXN0IiwiaGVhZGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJCYXNlRXJyb3JNb2RlbCIsIl9maWx0ZXJzIiwicHJvdG90eXBlIiwiYWRkRmlsdGVyIiwiZmlsdGVyIiwicHVzaCIsInJlbW92ZUZpbHRlciIsImluZGV4Iiwic3BsaWNlIiwiYXBwbHlGaWx0ZXJzIiwidmFsaWRhdGVkIiwiZXgiLCJLYWRpcmFNb2RlbCIsIl9nZXREYXRlSWQiLCJ0aW1lc3RhbXAiLCJyZW1haW5kZXIiLCJkYXRlSWQiLCJERFNrZXRjaCIsIk1FVEhPRF9NRVRSSUNTX0ZJRUxEUyIsIk1ldGhvZHNNb2RlbCIsIm1ldHJpY3NUaHJlc2hvbGQiLCJtZXRob2RNZXRyaWNzQnlNaW51dGUiLCJPYmplY3QiLCJjcmVhdGUiLCJlcnJvck1hcCIsIl9tZXRyaWNzVGhyZXNob2xkIiwiXyIsImV4dGVuZCIsIm1heEV2ZW50VGltZXNGb3JNZXRob2RzIiwidHJhY2VyU3RvcmUiLCJUcmFjZXJTdG9yZSIsImludGVydmFsIiwibWF4VG90YWxQb2ludHMiLCJhcmNoaXZlRXZlcnkiLCJzdGFydCIsIl9nZXRNZXRyaWNzIiwibWV0aG9kIiwibWV0aG9kcyIsImNvdW50IiwiZXJyb3JzIiwiZmV0Y2hlZERvY1NpemUiLCJzZW50TXNnU2l6ZSIsImhpc3RvZ3JhbSIsImFscGhhIiwiZmllbGQiLCJzZXRTdGFydFRpbWUiLCJtZXRyaWNzQnlNaW51dGUiLCJzdGFydFRpbWUiLCJwcm9jZXNzTWV0aG9kIiwibWV0aG9kVHJhY2UiLCJhdCIsIl9hcHBlbmRNZXRyaWNzIiwiZXJyb3JlZCIsIm5hbWUiLCJhZGRUcmFjZSIsImlkIiwibWV0aG9kTWV0cmljcyIsInZhbHVlIiwibWV0cmljcyIsImFkZCIsInRvdGFsIiwiZW5kVGltZSIsInRyYWNrRG9jU2l6ZSIsInNpemUiLCJOdHAiLCJfbm93IiwidHJhY2tNc2dTaXplIiwiYnVpbGRQYXlsb2FkIiwiYnVpbGREZXRhaWxlZEluZm8iLCJtZXRob2RSZXF1ZXN0cyIsImtleSIsInN5bmNlZERhdGUiLCJzeW5jVGltZSIsIm1ldGhvZE5hbWUiLCJjb2xsZWN0VHJhY2VzIiwibG9nZ2VyIiwiUHVic3ViTW9kZWwiLCJzdWJzY3JpcHRpb25zIiwiX3RyYWNrU3ViIiwic2Vzc2lvbiIsIm1zZyIsInBhcmFtcyIsInB1YmxpY2F0aW9uIiwiX2dldFB1YmxpY2F0aW9uTmFtZSIsInN1YnNjcmlwdGlvbklkIiwic3VicyIsIl9zdGFydFRpbWUiLCJfdHJhY2tVbnN1YiIsInN1YiIsIl9zdWJzY3JpcHRpb25JZCIsIl9uYW1lIiwic3Vic2NyaXB0aW9uU3RhdGUiLCJ1bnN1YnMiLCJsaWZlVGltZSIsIl90cmFja1JlYWR5IiwidHJhY2UiLCJyZWFkeVRyYWNrZWQiLCJyZXNUaW1lIiwiX3RyYWNrRXJyb3IiLCJwdWJzIiwiYWN0aXZlU3VicyIsImFjdGl2ZURvY3MiLCJ0b3RhbE9ic2VydmVycyIsImNhY2hlZE9ic2VydmVycyIsImNyZWF0ZWRPYnNlcnZlcnMiLCJkZWxldGVkT2JzZXJ2ZXJzIiwib2JzZXJ2ZXJMaWZldGltZSIsInBvbGxlZERvY3VtZW50cyIsIm9wbG9nVXBkYXRlZERvY3VtZW50cyIsIm9wbG9nSW5zZXJ0ZWREb2N1bWVudHMiLCJvcGxvZ0RlbGV0ZWREb2N1bWVudHMiLCJpbml0aWFsbHlBZGRlZERvY3VtZW50cyIsImxpdmVBZGRlZERvY3VtZW50cyIsImxpdmVDaGFuZ2VkRG9jdW1lbnRzIiwibGl2ZVJlbW92ZWREb2N1bWVudHMiLCJwb2xsZWREb2NTaXplIiwiaW5pdGlhbGx5RmV0Y2hlZERvY1NpemUiLCJsaXZlRmV0Y2hlZERvY1NpemUiLCJpbml0aWFsbHlTZW50TXNnU2l6ZSIsImxpdmVTZW50TXNnU2l6ZSIsIl9nZXRTdWJzY3JpcHRpb25JbmZvIiwic2VsZiIsInRvdGFsRG9jc1NlbnQiLCJ0b3RhbERhdGFTZW50IiwiaXRlcmF0ZSIsInNlcnZlciIsInNlc3Npb25zIiwiX25hbWVkU3VicyIsImNvdW50U3ViRGF0YSIsIl91bml2ZXJzYWxTdWJzIiwiYXZnT2JzZXJ2ZXJSZXVzZSIsImVhY2giLCJjb3VudFN1YnNjcmlwdGlvbnMiLCJjb3VudERvY3VtZW50cyIsImNvdW50T2JzZXJ2ZXJzIiwiX2RvY3VtZW50cyIsImNvbGxlY3Rpb24iLCJjb3VudEtleXMiLCJfdG90YWxPYnNlcnZlcnMiLCJfY2FjaGVkT2JzZXJ2ZXJzIiwiYnVpbGREZXRhaWxJbmZvIiwicHViTWV0cmljcyIsInN1YnNjcmlwdGlvbkRhdGEiLCJkYXRlTWV0cmljcyIsInNpbmdsZVB1Yk1ldHJpY3MiLCJwdWJSZXF1ZXN0cyIsImluY3JlbWVudEhhbmRsZUNvdW50IiwiaXNDYWNoZWQiLCJwdWJsaWNhdGlvbk5hbWUiLCJnZXRQcm9wZXJ0eSIsInRyYWNrQ3JlYXRlZE9ic2VydmVyIiwiaW5mbyIsInRyYWNrRGVsZXRlZE9ic2VydmVyIiwiRGF0ZSIsImdldFRpbWUiLCJ0cmFja0RvY3VtZW50Q2hhbmdlcyIsIm9wIiwidHJhY2tQb2xsZWREb2N1bWVudHMiLCJ0cmFja0xpdmVVcGRhdGVzIiwiY3JlYXRlSGlzdG9ncmFtIiwibGluayIsInYiLCJHQ01ldHJpY3MiLCJkZWZhdWx0IiwiZ2V0RmliZXJNZXRyaWNzIiwicmVzZXRGaWJlck1ldHJpY3MiLCJnZXRNb25nb0RyaXZlclN0YXRzIiwicmVzZXRNb25nb0RyaXZlclN0YXRzIiwiRXZlbnRMb29wTW9uaXRvciIsIlN5c3RlbU1vZGVsIiwibmV3U2Vzc2lvbnMiLCJzZXNzaW9uVGltZW91dCIsImV2bG9vcEhpc3RvZ3JhbSIsImV2bG9vcE1vbml0b3IiLCJvbiIsImxhZyIsImdjTWV0cmljcyIsImNwdVRpbWUiLCJwcm9jZXNzIiwiaHJ0aW1lIiwicHJldmlvdXNDcHVVc2FnZSIsImNwdVVzYWdlIiwiY3B1SGlzdG9yeSIsImN1cnJlbnRDcHVVc2FnZSIsInNldEludGVydmFsIiwibm93IiwibWVtb3J5VXNhZ2UiLCJtZW1vcnkiLCJyc3MiLCJtZW1vcnlBcnJheUJ1ZmZlcnMiLCJhcnJheUJ1ZmZlcnMiLCJtZW1vcnlFeHRlcm5hbCIsImV4dGVybmFsIiwibWVtb3J5SGVhcFVzZWQiLCJoZWFwVXNlZCIsIm1lbW9yeUhlYXBUb3RhbCIsImhlYXBUb3RhbCIsImFjdGl2ZVJlcXVlc3RzIiwiX2dldEFjdGl2ZVJlcXVlc3RzIiwiYWN0aXZlSGFuZGxlcyIsIl9nZXRBY3RpdmVIYW5kbGVzIiwicGN0RXZsb29wQmxvY2siLCJzdGF0dXMiLCJwY3RCbG9jayIsImdjTWFqb3JEdXJhdGlvbiIsImdjTWFqb3IiLCJnY01pbm9yRHVyYXRpb24iLCJnY01pbm9yIiwiZ2NJbmNyZW1lbnRhbER1cmF0aW9uIiwiZ2NJbmNyZW1lbnRhbCIsImdjV2Vha0NCRHVyYXRpb24iLCJnY1dlYWtDQiIsInJlc2V0IiwiZHJpdmVyTWV0cmljcyIsIm1vbmdvUG9vbFNpemUiLCJwb29sU2l6ZSIsIm1vbmdvUG9vbFByaW1hcnlDaGVja291dHMiLCJwcmltYXJ5Q2hlY2tvdXRzIiwibW9uZ29Qb29sT3RoZXJDaGVja291dHMiLCJvdGhlckNoZWNrb3V0cyIsIm1vbmdvUG9vbENoZWNrb3V0VGltZSIsImNoZWNrb3V0VGltZSIsIm1vbmdvUG9vbE1heENoZWNrb3V0VGltZSIsIm1heENoZWNrb3V0VGltZSIsIm1vbmdvUG9vbFBlbmRpbmciLCJwZW5kaW5nIiwibW9uZ29Qb29sQ2hlY2tlZE91dENvbm5lY3Rpb25zIiwiY2hlY2tlZE91dCIsIm1vbmdvUG9vbENyZWF0ZWRDb25uZWN0aW9ucyIsImNyZWF0ZWQiLCJmaWJlck1ldHJpY3MiLCJjcmVhdGVkRmliZXJzIiwiYWN0aXZlRmliZXJzIiwiYWN0aXZlIiwiZmliZXJQb29sU2l6ZSIsInBjcHUiLCJwY3B1VXNlciIsInBjcHVTeXN0ZW0iLCJsYXN0Q3B1VXNhZ2UiLCJ1c2FnZSIsInVzZXIiLCJzeXMiLCJtYXAiLCJlbnRyeSIsInRpbWUiLCJzeXN0ZW1NZXRyaWNzIiwiaHJ0aW1lVG9NUyIsImVsYXBUaW1lTVMiLCJlbGFwVXNhZ2UiLCJlbGFwVXNlck1TIiwiZWxhcFN5c3RNUyIsInN5c3RlbSIsInRvdGFsVXNhZ2VNUyIsInRvdGFsVXNhZ2VQZXJjZW50IiwiZG9jU3pDYWNoZSIsInNldFBjcHUiLCJoYW5kbGVTZXNzaW9uQWN0aXZpdHkiLCJjb3VudE5ld1Nlc3Npb24iLCJpc1Nlc3Npb25BY3RpdmUiLCJfYWN0aXZlQXQiLCJpc0xvY2FsQWRkcmVzcyIsInNvY2tldCIsImluYWN0aXZlVGltZSIsImlzTG9jYWxIb3N0UmVnZXgiLCJpc0xvY2FsQWRkcmVzc1JlZ2V4IiwiaG9zdCIsImFkZHJlc3MiLCJyZW1vdGVBZGRyZXNzIiwiRXJyb3JNb2RlbCIsImFwcElkIiwiY2FsbCIsIm1heEVycm9ycyIsImFzc2lnbiIsInZhbHVlcyIsIm1ldHJpYyIsImVycm9yQ291bnQiLCJlcnJvckRlZiIsIl9mb3JtYXRFcnJvciIsImRldGFpbHMiLCJlcnJvckV2ZW50IiwiZXZlbnRzIiwiZXJyb3JPYmplY3QiLCJIdHRwTW9kZWwiLCJwcm9jZXNzUmVxdWVzdCIsInJlcSIsInJvdXRlSWQiLCJyb3V0ZXMiLCJzdGF0dXNDb2RlcyIsInJlcXVlc3RNZXRyaWNzIiwic3RhdHVzTWV0cmljIiwiaHR0cE1ldHJpY3MiLCJodHRwUmVxdWVzdHMiLCJyZXF1ZXN0TmFtZSIsImV4cG9ydERlZmF1bHQiLCJKb2JzIiwiZ2V0QXN5bmMiLCJjb3JlQXBpIiwiZ2V0Sm9iIiwidGhlbiIsImNhdGNoIiwic2V0QXN5bmMiLCJjaGFuZ2VzIiwidXBkYXRlSm9iIiwic2V0IiwiZ2V0IiwiY29uc3RydWN0b3IiLCJleHBvbmVudCIsImZ1enoiLCJyZXRyeVRpbWVyIiwiY2xlYXIiLCJjbGVhclRpbWVvdXQiLCJfdGltZW91dCIsInRpbWVvdXQiLCJNYXRoIiwibWluIiwicG93IiwiUmFuZG9tIiwiZnJhY3Rpb24iLCJjZWlsIiwiZm4iLCJzZXRUaW1lb3V0IiwiSGF2ZUFzeW5jQ2FsbGJhY2siLCJsYXN0QXJnIiwiVW5pcXVlSWQiLCJEZWZhdWx0VW5pcXVlSWQiLCJDcmVhdGVVc2VyU3RhY2siLCJPcHRpbWl6ZWRBcHBseSIsImNvbnRleHQiLCJhIiwiZ2V0Q2xpZW50VmVyc2lvbnMiLCJvYmoiLCJNYXAiLCJTZXQiLCJrZXlzIiwiZ2V0TG9nZ2VyIiwic2V0RW5kcG9pbnQiLCJkaWZmIiwic3luY2VkIiwicmVTeW5jQ291bnQiLCJyZVN5bmMiLCJyb3VuZCIsImxvY2FsVGltZSIsInN5bmMiLCJjYWNoZURucyIsImFyZ3VtZW50cyIsImdldFNlcnZlclRpbWUiLCJjYWxjdWxhdGVUaW1lRGlmZiIsImNsaWVudFN0YXJ0VGltZSIsInNlcnZlclRpbWUiLCJuZXR3b3JrVGltZSIsInNlcnZlclN0YXJ0VGltZSIsIm5vUmV0cmllcyIsInBhcnNlSW50IiwicmFuZG9tIiwiY2FuTG9nS2FkaXJhIiwiZ2xvYmFsIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImUiLCJsb2ciLCJ1cmwiLCJmcyIsImNsaWVudFBhdGhzIiwiX19tZXRlb3JfYm9vdHN0cmFwX18iLCJjb25maWdKc29uIiwiY2xpZW50QXJjaHMiLCJzZXJ2ZXJEaXIiLCJhYnNDbGllbnRQYXRocyIsInJlZHVjZSIsInJlc3VsdCIsInJlc29sdmUiLCJkaXJuYW1lIiwiaGFuZGxlQXBpUmVzcG9uc2UiLCJib2R5IiwidW5hdmFpbGFibGUiLCJwYXJzZSIsIm5lZWRlZFNvdXJjZW1hcHMiLCJwcm9taXNlcyIsInNvdXJjZW1hcCIsInVwbG9hZFNvdXJjZU1hcHMiLCJnZXRTb3VyY2VtYXBQYXRoIiwiZmlsZSIsInNvdXJjZU1hcFBhdGgiLCJzZW5kU291cmNlbWFwIiwiUHJvbWlzZSIsImFsbCIsInNlbmREYXRhIiwidW5hdmFpbGFibGVTb3VyY2VtYXBzIiwic291cmNlbWFwUGF0aCIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJhcmNoVmVyc2lvbiIsImVuY29kZVVSSUNvbXBvbmVudCIsInNlbmRTdHJlYW0iLCJwcmVwYXJlUGF0aCIsInVybFBhdGgiLCJwb3NpeCIsIm5vcm1hbGl6ZSIsImNoZWNrRm9yRHluYW1pY0ltcG9ydCIsImZpbGVQYXRoIiwiYXJjaFBhdGgiLCJkeW5hbWljUGF0aCIsInN0YXQiLCJyZWplY3QiLCJjbGllbnRQcm9ncmFtIiwiV2ViQXBwIiwiY2xpZW50UHJvZ3JhbXMiLCJtYW5pZmVzdCIsImZpbGVJbmZvIiwiZmluZCIsInN0YXJ0c1dpdGgiLCJzb3VyY2VNYXAiLCJXYWl0VGltZUJ1aWxkZXIiLCJXQUlUT05fTUVTU0FHRV9GSUVMRFMiLCJfd2FpdExpc3RTdG9yZSIsIl9jdXJyZW50UHJvY2Vzc2luZ01lc3NhZ2VzIiwiX21lc3NhZ2VDYWNoZSIsInJlZ2lzdGVyIiwibXNnSWQiLCJtYWluS2V5IiwiX2dldE1lc3NhZ2VLZXkiLCJpblF1ZXVlIiwidG9BcnJheSIsIndhaXRMaXN0IiwiX2dldENhY2hlTWVzc2FnZSIsImN1cnJlbnRseVByb2Nlc3NpbmdNZXNzYWdlIiwiYnVpbGQiLCJmaWx0ZXJlZFdhaXRMaXN0IiwiX2NsZWFuQ2FjaGVNZXNzYWdlIiwiYmluZCIsInNlc3Npb25JZCIsImNhY2hlZE1lc3NhZ2UiLCJwaWNrIiwiX2tleSIsIl9yZWdpc3RlcmVkIiwidHJhY2tXYWl0VGltZSIsInVuYmxvY2siLCJzdGFydGVkIiwidW5ibG9ja2VkIiwid3JhcHBlZFVuYmxvY2siLCJ3YWl0VGltZSIsIk9wbG9nQ2hlY2siLCJfMDcwIiwiY3Vyc29yRGVzY3JpcHRpb24iLCJsaW1pdCIsImNvZGUiLCJyZWFzb24iLCJzb2x1dGlvbiIsImV4aXN0cyQiLCJhbnkiLCJzZWxlY3RvciIsIm9ubHlTY2FsZXJzIiwiQ29sbGVjdGlvbiIsIk9iamVjdElEIiwiXzA3MSIsIm1hdGNoZXIiLCJNaW5pbW9uZ28iLCJNYXRjaGVyIiwiZW52IiwiTU9OR09fT1BMT0dfVVJMIiwiZGlzYWJsZU9wbG9nIiwiX2Rpc2FibGVPcGxvZyIsIm1pbmlNb25nb01hdGNoZXIiLCJtaW5pTW9uZ29Tb3J0ZXIiLCJTb3J0ZXIiLCJzb3J0Iiwic29ydGVyIiwiZmllbGRzIiwiTG9jYWxDb2xsZWN0aW9uIiwiX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbiIsInNraXAiLCJ3aGVyZSIsImhhc1doZXJlIiwiZ2VvIiwiaGFzR2VvUXVlcnkiLCJsaW1pdEJ1dE5vU29ydCIsIm9sZGVyVmVyc2lvbiIsImRyaXZlciIsImN1cnNvclN1cHBvcnRlZCIsImdpdENoZWNrb3V0IiwicmVsZWFzZSIsInByZVJ1bm5pbmdNYXRjaGVycyIsImdsb2JhbE1hdGNoZXJzIiwidmVyc2lvbk1hdGNoZXJzIiwiY2hlY2tXaHlOb09wbG9nIiwib2JzZXJ2ZXJEcml2ZXIiLCJydW5NYXRjaGVycyIsIm1ldGVvclZlcnNpb24iLCJtYXRjaGVySW5mbyIsIm1hdGNoZWQiLCJtYXRjaGVyTGlzdCIsImV2ZW50TG9nZ2VyIiwiUkVQRVRJVElWRV9FVkVOVFMiLCJUUkFDRV9UWVBFUyIsIk1BWF9UUkFDRV9FVkVOVFMiLCJUcmFjZXIiLCJfZmlsdGVyRmllbGRzIiwibWF4QXJyYXlJdGVtc1RvRmlsdGVyIiwidXNlcklkIiwidHJhY2VJbmZvIiwiX2lkIiwiZXZlbnQiLCJtZXRhRGF0YSIsImxhc3RFdmVudCIsImdldExhc3RFdmVudCIsImlzRXZlbnRzUHJvY2Vzc2VkIiwiZW5kQXQiLCJuZXN0ZWQiLCJfYXBwbHlGaWx0ZXJzIiwiZXZlbnRTdGFja1RyYWNlIiwiZGlyIiwiZGVwdGgiLCJsYXN0TmVzdGVkIiwiZXZlbnRFbmQiLCJlbmRMYXN0RXZlbnQiLCJmb3JjZWRFbmQiLCJfaGFzVXNlZnVsTmVzdGVkIiwiZXZlcnkiLCJidWlsZEV2ZW50IiwiZWxhcHNlZFRpbWVGb3JFdmVudCIsImJ1aWx0RXZlbnQiLCJwcmV2RW5kIiwiaSIsIm5lc3RlZEV2ZW50IiwiY29tcHV0ZVRpbWUiLCJ1bmRlZmluZWQiLCJidWlsZFRyYWNlIiwiZmlyc3RFdmVudCIsInByb2Nlc3NlZEV2ZW50cyIsInRvdGFsTm9uQ29tcHV0ZSIsInByZXZFdmVudCIsImxhc3RFdmVudERhdGEiLCJyZW1vdmVDb3VudCIsImNvbXB1dGUiLCJmaWx0ZXJGbiIsInJlZGFjdEZpZWxkIiwiZXZlbnRUeXBlIiwiY2xvbmUiLCJfYXBwbHlPYmplY3RGaWx0ZXJzIiwidG9GaWx0ZXIiLCJmaWx0ZXJPYmplY3QiLCJjbG9uZWQiLCJBcnJheSIsImlzQXJyYXkiLCJ0cmFjZXIiLCJzdHJpcFNlbnNpdGl2ZSIsInR5cGVzVG9TdHJpcCIsInJlY2VpdmVyVHlwZSIsInN0cmlwcGVkVHlwZXMiLCJpdGVtIiwic3RyaXBTZW5zaXRpdmVUaG9yb3VnaCIsImZpZWxkc1RvS2VlcCIsInN0cmlwU2VsZWN0b3JzIiwiY29sbGVjdGlvbkxpc3QiLCJjb2xsTWFwIiwiY29sbE5hbWUiLCJjb2xsIiwibWF4VG90YWxzIiwiY3VycmVudE1heFRyYWNlIiwidHJhY2VBcmNoaXZlIiwicHJvY2Vzc2VkQ250Iiwia2luZCIsIkVKU09OIiwiX2hhbmRsZUVycm9ycyIsInRyYWNlcyIsIl90aW1lb3V0SGFuZGxlciIsInByb2Nlc3NUcmFjZXMiLCJzdG9wIiwiY2xlYXJJbnRlcnZhbCIsImVycm9yS2V5IiwiZXJyb3JlZFRyYWNlIiwia2luZHMiLCJjdXJyZW50TWF4VG90YWwiLCJleGNlZWRpbmdQb2ludHMiLCJhcmNoaXZlRGVmYXVsdCIsImNhbkFyY2hpdmUiLCJfaXNUcmFjZU91dGxpZXIiLCJkYXRhU2V0IiwiX2lzT3V0bGllciIsImRhdGFQb2ludCIsIm1heE1hZFoiLCJtZWRpYW4iLCJfZ2V0TWVkaWFuIiwibWFkIiwiX2NhbGN1bGF0ZU1hZCIsIm1hZFoiLCJfZnVuY01lZGlhbkRldmlhdGlvbiIsInNvcnRlZERhdGFTZXQiLCJiIiwiX3BpY2tRdWFydGlsZSIsIm51bSIsInBvcyIsIm1lZGlhbkRldmlhdGlvbnMiLCJ4IiwiYWJzIiwiX2dldE1lYW4iLCJkYXRhUG9pbnRzIiwicG9pbnQiLCJMUlUiLCJjcnlwdG8iLCJqc29uU3RyaW5naWZ5IiwiRG9jU3pDYWNoZSIsIm1heEl0ZW1zIiwibWF4VmFsdWVzIiwiaXRlbXMiLCJtYXgiLCJnZXRTaXplIiwicXVlcnkiLCJvcHRzIiwiZ2V0S2V5IiwiRG9jU3pDYWNoZUl0ZW0iLCJuZWVkc1VwZGF0ZSIsImRvYyIsImVsZW1lbnQiLCJCdWZmZXIiLCJieXRlTGVuZ3RoIiwiYWRkRGF0YSIsImdldFZhbHVlIiwiZ2V0SXRlbVNjb3JlIiwidXBkYXRlZCIsInNjb3JlIiwiY3VycmVudFRpbWUiLCJ0aW1lU2luY2VVcGRhdGUiLCJzaGlmdCIsInNvcnROdW1iZXIiLCJzb3J0ZWQiLCJpZHgiLCJmbG9vciIsInBhY2thZ2VNYXAiLCJob3N0bmFtZSIsIkZpYmVycyIsIkthZGlyYUNvcmUiLCJtb2RlbHMiLCJjdXJyZW50U3ViIiwia2FkaXJhSW5mbyIsIkVudmlyb25tZW50VmFyaWFibGUiLCJ3YWl0VGltZUJ1aWxkZXIiLCJwdWJzdWIiLCJodHRwIiwiYnVpbGRJbnRlcnZhbCIsIl9idWlsZFBheWxvYWQiLCJjb25uZWN0IiwiYXBwU2VjcmV0IiwicGF5bG9hZFRpbWVvdXQiLCJjbGllbnRFbmdpbmVTeW5jRGVsYXkiLCJ0aHJlc2hvbGRzIiwiaXNIb3N0TmFtZVNldCIsInByb3h5IiwicmVjb3JkSVBBZGRyZXNzIiwiZG9jdW1lbnRTaXplQ2FjaGVTaXplIiwibGFzdCIsImVuYWJsZUVycm9yVHJhY2tpbmciLCJpc1Byb2R1Y3Rpb24iLCJhdXRoSGVhZGVycyIsInRyaW0iLCJhZ2VudFZlcnNpb24iLCJfY2hlY2tBdXRoIiwiX3NlbmRBcHBTdGF0cyIsIl9zY2hlZHVsZVBheWxvYWRTZW5kIiwiYWRkRmlsdGVyRm4iLCJrYWRpcmEiLCJkaXNhYmxlRXJyb3JUcmFja2luZyIsInN0YXJ0dXAiLCJUcmFja1VuY2F1Z2h0RXhjZXB0aW9ucyIsIlRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyIsIlRyYWNrTWV0ZW9yRGVidWciLCJwdWJsaXNoIiwiYWRkZWQiLCJyZWFkeSIsImNsaWVudFZlcnNpb25zIiwiX2lzRGV0YWlsZWRJbmZvIiwiX2NvdW50RGF0YVNlbnQiLCJfZGV0YWlsSW5mb1NlbnRJbnRlcnZhbCIsImFwcFN0YXRzIiwicHJvdG9jb2xWZXJzaW9uIiwicGFja2FnZVZlcnNpb25zIiwiUGFja2FnZSIsIl9zZW5kUGF5bG9hZCIsInJ1biIsIl9nZXRJbmZvIiwiY3VycmVudEZpYmVyIiwidXNlRW52aXJvbm1lbnRWYXJpYWJsZSIsImN1cnJlbnQiLCJfX2thZGlyYUluZm8iLCJfc2V0SW5mbyIsInN0YXJ0Q29udGludW91c1Byb2ZpbGluZyIsIk1vbnRpUHJvZmlsZXIiLCJzdGFydENvbnRpbnVvdXMiLCJvblByb2ZpbGUiLCJwcm9maWxlIiwicHJvZmlsZXMiLCJpZ25vcmVFcnJvclRyYWNraW5nIiwiX3NraXBLYWRpcmEiLCJzdGFydEV2ZW50IiwiZW5kRXZlbnQiLCJGaWJlciIsIndyYXBTZXJ2ZXIiLCJzZXJ2ZXJQcm90byIsIm9yaWdpbmFsSGFuZGxlQ29ubmVjdCIsIl9oYW5kbGVDb25uZWN0IiwiX21ldGVvclNlc3Npb24iLCJlbWl0IiwiTWV0ZW9yRGVidWdJZ25vcmUiLCJNQVhfUEFSQU1TX0xFTkdUSCIsIndyYXBTZXNzaW9uIiwic2Vzc2lvblByb3RvIiwib3JpZ2luYWxQcm9jZXNzTWVzc2FnZSIsInByb2Nlc3NNZXNzYWdlIiwic3RyaW5naWZpZWRQYXJhbXMiLCJzdGFydERhdGEiLCJ3YWl0RXZlbnRJZCIsIl93YWl0RXZlbnRJZCIsIm9yaWdpbmFsTWV0aG9kSGFuZGxlciIsInByb3RvY29sX2hhbmRsZXJzIiwid2FpdE9uIiwicmVzcG9uc2UiLCJ3aXRoVmFsdWUiLCJvcmdpbmFsU3ViSGFuZGxlciIsIm9yZ2luYWxVblN1YkhhbmRsZXIiLCJ1bnN1YiIsIm9yaWdpbmFsU2VuZCIsImN1cnJlbnRFcnJvciIsIm1ldGhvZF9oYW5kbGVycyIsImhhbmRsZXIiLCJ3cmFwTWV0aG9kSGFuZGVyRm9yRXJyb3JzIiwib3JpZ2luYWxNZXRlb3JNZXRob2RzIiwibWV0aG9kTWFwIiwib3JpZ2luYWxIYW5kbGVyIiwic291cmNlIiwid3JhcFN1YnNjcmlwdGlvbiIsInN1YnNjcmlwdGlvblByb3RvIiwib3JpZ2luYWxSdW5IYW5kbGVyIiwiX3J1bkhhbmRsZXIiLCJvcmlnaW5hbFJlYWR5IiwiX2FwbVJlYWR5VHJhY2tlZCIsIl9zZXNzaW9uIiwib3JpZ2luYWxFcnJvciIsImVycm9yRm9yQXBtIiwib3JpZ2luYWxEZWFjdGl2YXRlIiwiX2RlYWN0aXZhdGUiLCJmdW5jTmFtZSIsIm9yaWdpbmFsRnVuYyIsImNvbGxlY3Rpb25OYW1lIiwid3JhcE9wbG9nT2JzZXJ2ZURyaXZlciIsInByb3RvIiwib3JpZ2luYWxQdWJsaXNoTmV3UmVzdWx0cyIsIl9wdWJsaXNoTmV3UmVzdWx0cyIsIm5ld1Jlc3VsdHMiLCJuZXdCdWZmZXIiLCJfY3Vyc29yRGVzY3JpcHRpb24iLCJkb2NTaXplIiwiX293bmVySW5mbyIsIl9wb2xsZWREb2N1bWVudHMiLCJfZG9jU2l6ZSIsInBvbGxlZEZldGNoZXMiLCJvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlRdWVyeWluZyIsIl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmciLCJvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nIiwiX2hhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nIiwiZm5OYW1lIiwib3JpZ2luYWxGbiIsImMiLCJfbGl2ZVVwZGF0ZXNDb3VudHMiLCJfaW5pdGlhbEFkZHMiLCJpbml0aWFsRmV0Y2hlcyIsIm9yaWdpbmFsU3RvcCIsIndyYXBQb2xsaW5nT2JzZXJ2ZURyaXZlciIsIm9yaWdpbmFsUG9sbE1vbmdvIiwiX3BvbGxNb25nbyIsIl9yZXN1bHRzIiwiX21hcCIsIl9wb2xsZWREb2NTaXplIiwid3JhcE11bHRpcGxleGVyIiwib3JpZ2luYWxJbml0YWxBZGQiLCJhZGRIYW5kbGVBbmRTZW5kSW5pdGlhbEFkZHMiLCJoYW5kbGUiLCJfZmlyc3RJbml0aWFsQWRkVGltZSIsIl93YXNNdWx0aXBsZXhlclJlYWR5IiwiX3JlYWR5IiwiX3F1ZXVlTGVuZ3RoIiwiX3F1ZXVlIiwiX3Rhc2tIYW5kbGVzIiwiX2VsYXBzZWRQb2xsaW5nVGltZSIsIndyYXBGb3JDb3VudGluZ09ic2VydmVycyIsIm1vbmdvQ29ubmVjdGlvblByb3RvIiwiTWV0ZW9yWCIsIk1vbmdvQ29ubmVjdGlvbiIsIm9yaWdpbmFsT2JzZXJ2ZUNoYW5nZXMiLCJfb2JzZXJ2ZUNoYW5nZXMiLCJvcmRlcmVkIiwiY2FsbGJhY2tzIiwicmV0IiwiX211bHRpcGxleGVyIiwiX19rYWRpcmFUcmFja2VkIiwib3duZXJJbmZvIiwiX29ic2VydmVEcml2ZXIiLCJ3cmFwU3RyaW5naWZ5RERQIiwib3JpZ2luYWxTdHJpbmdpZnlERFAiLCJERFBDb21tb24iLCJzdHJpbmdpZnlERFAiLCJtc2dTdHJpbmciLCJtc2dTaXplIiwid3JhcFdlYkFwcCIsIndyYXBGYXN0UmVuZGVyIiwid3JhcEZzIiwid3JhcFBpY2tlciIsIndyYXBSb3V0ZXJzIiwid3JhcEZpYmVycyIsImluc3RydW1lbnRlZCIsIl9zdGFydEluc3RydW1lbnRpbmciLCJvblJlYWR5IiwiU2VydmVyIiwiU2Vzc2lvbiIsIlN1YnNjcmlwdGlvbiIsIk1vbmdvT3Bsb2dEcml2ZXIiLCJNb25nb1BvbGxpbmdEcml2ZXIiLCJNdWx0aXBsZXhlciIsImhpamFja0RCT3BzIiwic2V0TGFiZWxzIiwib3JpZ2luYWxPcGVuIiwiTW9uZ29JbnRlcm5hbHMiLCJSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIiwib3BlbiIsIm1vbmdvIiwiZ2V0U3luY3Jvbm91c0N1cnNvciIsIk1vbmdvQ29sbCIsIk1vbmdvIiwiZmluZE9uZSIsImN1cnNvciIsImZldGNoIiwiX3N5bmNocm9ub3VzQ3Vyc29yIiwiZnVuYyIsIm1vZCIsInVwc2VydCIsImV2ZW50SWQiLCJlbmRPcHRpb25zIiwiYXN5bmMiLCJ1cGRhdGVkRG9jcyIsIm51bWJlckFmZmVjdGVkIiwiaW5zZXJ0ZWRJZCIsInJlbW92ZWREb2NzIiwiY3Vyc29yUHJvdG8iLCJNb25nb0N1cnNvciIsImN1cnNvck9wdGlvbnMiLCJwcmV2aW91c1RyYWNrTmV4dE9iamVjdCIsInRyYWNrTmV4dE9iamVjdCIsImVuZERhdGEiLCJvcGxvZyIsIndhc011bHRpcGxleGVyUmVhZHkiLCJxdWV1ZUxlbmd0aCIsImVsYXBzZWRQb2xsaW5nVGltZSIsIm9ic2VydmVyRHJpdmVyQ2xhc3MiLCJ1c2VzT3Bsb2ciLCJfY2FjaGUiLCJkb2NzIiwibm9PZkNhY2hlZERvY3MiLCJpbml0aWFsUG9sbGluZ1RpbWUiLCJfbGFzdFBvbGxUaW1lIiwicmVhc29uSW5mbyIsIm5vT3Bsb2dDb2RlIiwibm9PcGxvZ1JlYXNvbiIsIm5vT3Bsb2dTb2x1dGlvbiIsImRvY3NGZXRjaGVkIiwiU3luY3Jvbm91c0N1cnNvciIsIm9yaWdOZXh0T2JqZWN0IiwiX25leHRPYmplY3QiLCJzaG91bGRUcmFjayIsIkhUVFAiLCJvcmlnaW5hbENhbGwiLCJFbWFpbCIsIkV2ZW50U3ltYm9sIiwiU3ltYm9sIiwiU3RhcnRUcmFja2VkIiwid3JhcHBlZCIsIm9yaWdpbmFsWWllbGQiLCJ5aWVsZCIsIm9yaWdpbmFsUnVuIiwib3JpZ2luYWxUaHJvd0ludG8iLCJ0aHJvd0ludG8iLCJlbnN1cmVGaWJlckNvdW50ZWQiLCJmaWJlciIsInZhbCIsImFjdGl2ZUZpYmVyVG90YWwiLCJhY3RpdmVGaWJlckNvdW50IiwicHJldmlvdXNUb3RhbENyZWF0ZWQiLCJmaWJlcnNDcmVhdGVkIiwicHJpbnRFcnJvckFuZEtpbGwiLCJfdHJhY2tlZCIsImdldFRyYWNlIiwidGltZXIiLCJ0aHJvd0Vycm9yIiwibmV4dFRpY2siLCJleGl0Iiwib3JpZ2luYWxNZXRlb3JEZWJ1ZyIsIl9kZWJ1ZyIsImlzQXJncyIsImFscmVhZHlUcmFja2VkIiwiZXJyb3JNZXNzYWdlIiwic2VwYXJhdG9yIiwiZW5kc1dpdGgiLCJrYWRpcmFfU2Vzc2lvbl9zZW5kIiwib3JpZ2luYWxTZW5kQWRkcyIsIl9zZW5kQWRkcyIsImthZGlyYV9NdWx0aXBsZXhlcl9zZW5kQWRkcyIsIm9yaWdpbmFsTW9uZ29JbnNlcnQiLCJfaW5zZXJ0Iiwia2FkaXJhX01vbmdvQ29ubmVjdGlvbl9pbnNlcnQiLCJjYiIsIm9yaWdpbmFsTW9uZ29VcGRhdGUiLCJfdXBkYXRlIiwia2FkaXJhX01vbmdvQ29ubmVjdGlvbl91cGRhdGUiLCJvcmlnaW5hbE1vbmdvUmVtb3ZlIiwiX3JlbW92ZSIsImthZGlyYV9Nb25nb0Nvbm5lY3Rpb25fcmVtb3ZlIiwib3JpZ2luYWxQdWJzdWJBZGRlZCIsInNlbmRBZGRlZCIsImthZGlyYV9TZXNzaW9uX3NlbmRBZGRlZCIsIm9yaWdpbmFsUHVic3ViQ2hhbmdlZCIsInNlbmRDaGFuZ2VkIiwia2FkaXJhX1Nlc3Npb25fc2VuZENoYW5nZWQiLCJvcmlnaW5hbFB1YnN1YlJlbW92ZWQiLCJzZW5kUmVtb3ZlZCIsImthZGlyYV9TZXNzaW9uX3NlbmRSZW1vdmVkIiwib3JpZ2luYWxDdXJzb3JGb3JFYWNoIiwia2FkaXJhX0N1cnNvcl9mb3JFYWNoIiwib3JpZ2luYWxDdXJzb3JNYXAiLCJrYWRpcmFfQ3Vyc29yX21hcCIsIm9yaWdpbmFsQ3Vyc29yRmV0Y2giLCJrYWRpcmFfQ3Vyc29yX2ZldGNoIiwib3JpZ2luYWxDdXJzb3JDb3VudCIsImthZGlyYV9DdXJzb3JfY291bnQiLCJvcmlnaW5hbEN1cnNvck9ic2VydmVDaGFuZ2VzIiwib2JzZXJ2ZUNoYW5nZXMiLCJrYWRpcmFfQ3Vyc29yX29ic2VydmVDaGFuZ2VzIiwib3JpZ2luYWxDdXJzb3JPYnNlcnZlIiwib2JzZXJ2ZSIsImthZGlyYV9DdXJzb3Jfb2JzZXJ2ZSIsIm9yaWdpbmFsQ3Jvc3NiYXJMaXN0ZW4iLCJERFBTZXJ2ZXIiLCJfQ3Jvc3NiYXIiLCJsaXN0ZW4iLCJrYWRpcmFfQ3Jvc3NiYXJfbGlzdGVuIiwidHJpZ2dlciIsIm9yaWdpbmFsQ3Jvc3NiYXJGaXJlIiwiZmlyZSIsImthZGlyYV9Dcm9zc2Jhcl9maXJlIiwibm90aWZpY2F0aW9uIiwiRmFzdFJlbmRlciIsIm9yaWdSb3V0ZSIsInJvdXRlIiwiX2NhbGxiYWNrIiwic3VnZ2VzdGVkUm91dGVOYW1lIiwiaGFuZGxlRXJyb3JFdmVudCIsIndyYXBDYWxsYmFjayIsImNyZWF0ZVdyYXBwZXIiLCJldmVudEVtaXR0ZXIiLCJsaXN0ZW5lckNvdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJmc0thZGlyYUluZm8iLCJvcmlnaW5hbFN0YXQiLCJvcmlnaW5hbENyZWF0ZVJlYWRTdHJlYW0iLCJQZXJmb3JtYW5jZU9ic2VydmVyIiwiY29uc3RhbnRzIiwicGVyZm9ybWFuY2UiLCJfb2JzZXJ2ZXIiLCJvYnNlcnZlciIsImxpc3QiLCJnZXRFbnRyaWVzIiwiX21hcEtpbmRUb01ldHJpYyIsImR1cmF0aW9uIiwiY2xlYXJHQyIsImVudHJ5VHlwZXMiLCJidWZmZXJlZCIsImdjS2luZCIsIk5PREVfUEVSRk9STUFOQ0VfR0NfTUFKT1IiLCJOT0RFX1BFUkZPUk1BTkNFX0dDX01JTk9SIiwiTk9ERV9QRVJGT1JNQU5DRV9HQ19JTkNSRU1FTlRBTCIsIk5PREVfUEVSRk9STUFOQ0VfR0NfV0VBS0NCIiwiY2xpZW50Iiwic2VydmVyU3RhdHVzIiwidG90YWxDaGVja291dFRpbWUiLCJtZWFzdXJlbWVudENvdW50IiwicGVuZGluZ1RvdGFsIiwiY2hlY2tlZE91dFRvdGFsIiwiZ2V0U2VydmVyU3RhdHVzIiwiZ2V0UHJpbWFyeSIsIkRFRkFVTFRfTUFYX1BPT0xfU0laRSIsImdldFBvb2xTaXplIiwidG9wb2xvZ3kiLCJzIiwibWF4UG9vbFNpemUiLCJfY2xpZW50IiwiZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIiLCJ2ZXJzaW9uUGFydHMiLCJOcG1Nb2R1bGVzIiwibW9uZ29kYiIsInBhcnQiLCJ1c2VVbmlmaWVkVG9wb2xvZ3kiLCJwcmltYXJ5RGVzY3JpcHRpb24iLCJnZXRTZXJ2ZXJEZXNjcmlwdGlvbiIsInBvb2wiLCJ0b3RhbENvbm5lY3Rpb25zIiwidG90YWxDb25uZWN0aW9uQ291bnQiLCJhdmFpbGFibGVDb25uZWN0aW9ucyIsImF2YWlsYWJsZUNvbm5lY3Rpb25Db3VudCIsInByaW1hcnkiLCJkZWxldGUiLCJjb25uZWN0aW9uSWQiLCJjaGVja291dER1cmF0aW9uIiwiZGlzYWJsZUNyZWF0ZSIsImxhc3RJc01hc3RlciIsImxhc3RIZWxsbyIsInNlcnZlcnMiLCJkZXNjcmlwdGlvbiIsIlBpY2tlciIsIm9yaWdQcm9jZXNzUm91dGUiLCJfcHJvY2Vzc1JvdXRlIiwiY29ubmVjdFJvdXRlcyIsImNvbm5lY3RSb3V0ZSIsInJvdXRlciIsIm9sZEFkZCIsImNoZWNrSGFuZGxlcnNJbkZpYmVyIiwiV2ViQXBwSW50ZXJuYWxzIiwiTUFYX0JPRFlfU0laRSIsIk1BWF9TVFJJTkdJRklFRF9CT0RZX1NJWkUiLCJjYW5XcmFwU3RhdGljSGFuZGxlciIsInN0YXRpY0ZpbGVzQnlBcmNoIiwiaGFuZGxlcnNMZW5ndGgiLCJyYXdDb25uZWN0SGFuZGxlcnMiLCJpbkZpYmVyIiwib3V0c2lkZUZpYmVyIiwidXNlIiwiX3JlcSIsIl9yZXMiLCJuZXh0IiwicG9wIiwiSW5mb1N5bWJvbCIsInBhcnNlVXJsIiwicmVnaXN0ZXJCb2lsZXJwbGF0ZURhdGFDYWxsYmFjayIsInJlcXVlc3QiLCJpc0FwcFJvdXRlIiwib3JpZ0NhdGVnb3JpemVSZXF1ZXN0IiwiY2F0ZWdvcml6ZVJlcXVlc3QiLCJwYXRobmFtZSIsImFzeW5jRXZlbnQiLCJpc1N0YXRpYyIsImlzSnNvbiIsImhhc1NtYWxsQm9keSIsImJ1aWx0Iiwid3JhcEhhbmRsZXIiLCJlcnJvckhhbmRsZXIiLCJ3cmFwcGVyIiwibmV4dENhbGxlZCIsIndyYXBwZWROZXh0IiwicG90ZW50aWFsUHJvbWlzZSIsImZpbmlzaGVkIiwid3JhcENvbm5lY3QiLCJhcHAiLCJ3cmFwU3RhY2siLCJvbGRVc2UiLCJ3cmFwcGVkSGFuZGxlciIsImFzeW5jQXBwbHkiLCJtZXRlb3JJbnRlcm5hbEhhbmRsZXJzIiwiY29ubmVjdEhhbmRsZXJzIiwiY29ubmVjdEFwcCIsIm9sZFN0YXRpY0ZpbGVzTWlkZGxld2FyZSIsInN0YXRpY0ZpbGVzTWlkZGxld2FyZSIsInN0YXRpY0hhbmRsZXIiLCJfc3RhdGljRmlsZXMiLCJub3JtYWxpemVkUHJlZml4IiwicmVwbGFjZSIsIl9wYXJzZUVudiIsIm5vcm1hbGl6ZWROYW1lIiwiX29wdGlvbnMiLCJwYXJzZXIiLCJzdHIiLCJwYXJzZUJvb2wiLCJ0b0xvd2VyQ2FzZSIsInBhcnNlU3RyaW5nIiwiTU9OVElfQVBQX0lEIiwiTU9OVElfQVBQX1NFQ1JFVCIsIk1PTlRJX09QVElPTlNfQ0xJRU5UX0VOR0lORV9TWU5DX0RFTEFZIiwiTU9OVElfT1BUSU9OU19FUlJPUl9EVU1QX0lOVEVSVkFMIiwiTU9OVElfT1BUSU9OU19NQVhfRVJST1JTX1BFUl9JTlRFUlZBTCIsIk1PTlRJX09QVElPTlNfQ09MTEVDVF9BTExfU1RBQ0tTIiwiTU9OVElfT1BUSU9OU19FTkFCTEVfRVJST1JfVFJBQ0tJTkciLCJNT05USV9PUFRJT05TX0VORFBPSU5UIiwiTU9OVElfT1BUSU9OU19IT1NUTkFNRSIsIk1PTlRJX09QVElPTlNfUEFZTE9BRF9USU1FT1VUIiwiTU9OVElfT1BUSU9OU19QUk9YWSIsIk1PTlRJX09QVElPTlNfRE9DVU1FTlRfU0laRV9DQUNIRV9TSVpFIiwiTU9OVElfVVBMT0FEX1NPVVJDRV9NQVBTIiwiTU9OVElfUkVDT1JEX0lQX0FERFJFU1MiLCJNT05USV9FVkVOVF9TVEFDS19UUkFDRSIsIl9jb25uZWN0V2l0aEVudiIsIl9jb25uZWN0V2l0aFNldHRpbmdzIiwibW9udGlTZXR0aW5ncyIsInNldHRpbmdzIiwibW9udGkiLCJjb25mbGljdGluZ1BhY2thZ2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUFDQyxvQkFBa0IsRUFBQyxNQUFJQTtBQUF4QixDQUFkOztBQUFBQyxvQkFBb0IsR0FBRyxVQUFVQyxJQUFWLEVBQWdCO0FBQ3JDLFFBQU1DLFVBQVUsR0FBR0MseUJBQXlCLENBQUNELFVBQTdDOztBQUVBLE1BQUlBLFVBQUosRUFBZ0I7QUFDZCxXQUFPQSxVQUFVLENBQUNFLFFBQVgsQ0FBb0JILElBQXBCLElBQTRCQyxVQUFVLENBQUNFLFFBQVgsQ0FBb0JILElBQXBCLEVBQTBCSSxPQUF0RCxHQUFnRSxNQUF2RTtBQUNELEdBTG9DLENBT3JDOzs7QUFDQSxVQUFRSixJQUFSO0FBQ0UsU0FBSyxhQUFMO0FBQ0UsYUFBT0UseUJBQXlCLENBQUNHLHdCQUFqQzs7QUFDRixTQUFLLGFBQUw7QUFDQSxTQUFLLG9CQUFMO0FBQ0U7QUFDQSxhQUFPSCx5QkFBeUIsQ0FBQ0ksaUJBQWpDOztBQUVGO0FBQ0UsYUFBTyxNQUFQO0FBVEo7QUFXRCxDQW5CRDs7QUFxQkEsTUFBTUMsZ0JBQWdCLEdBQUcsTUFBTTtBQUM3QixNQUFJQyxLQUFLLENBQUNDLGlCQUFWLEVBQTZCO0FBQzNCLFFBQUlDLEdBQUcsR0FBRyxFQUFWO0FBQ0FGLFNBQUssQ0FBQ0MsaUJBQU4sQ0FBd0JDLEdBQXhCLEVBQTZCQyxNQUFNLENBQUNDLFVBQXBDO0FBQ0EsV0FBT0YsR0FBRyxDQUFDRyxLQUFYO0FBQ0Q7O0FBRUQsUUFBTUEsS0FBSyxHQUFHLElBQUlMLEtBQUosR0FBWUssS0FBWixDQUFrQkMsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBZDtBQUNBLE1BQUlDLFFBQVEsR0FBRyxDQUFmLENBUjZCLENBVTdCOztBQUNBLFNBQU9BLFFBQVEsR0FBR0YsS0FBSyxD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QUFDbkJockIsYUFBTyxDQUFDbVgsR0FBUiw0Q0FDc0NsVCxJQUR0QztBQUdEO0FBQ0YsR0FORDtBQU9ELENBUkQsRSIsImZpbGUiOiIvcGFja2FnZXMvbW9udGlhcG1fYWdlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJnZXRDbGllbnRBcmNoVmVyc2lvbiA9IGZ1bmN0aW9uIChhcmNoKSB7XG4gIGNvbnN0IGF1dG91cGRhdGUgPSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmF1dG91cGRhdGVcblxuICBpZiAoYXV0b3VwZGF0ZSkge1xuICAgIHJldHVybiBhdXRvdXBkYXRlLnZlcnNpb25zW2FyY2hdID8gYXV0b3VwZGF0ZS52ZXJzaW9uc1thcmNoXS52ZXJzaW9uIDogJ25vbmUnO1xuICB9XG5cbiAgLy8gTWV0ZW9yIDEuNyBhbmQgb2xkZXIgZGlkIG5vdCBoYXZlIGFuIGBhdXRvdXBkYXRlYCBvYmplY3QuXG4gIHN3aXRjaCAoYXJjaCkge1xuICAgIGNhc2UgJ2NvcmRvdmEud2ViJzpcbiAgICAgIHJldHVybiBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmF1dG91cGRhdGVWZXJzaW9uQ29yZG92YTtcbiAgICBjYXNlICd3ZWIuYnJvd3Nlcic6XG4gICAgY2FzZSAnd2ViLmJyb3dzZXIubGVnYWN5JzpcbiAgICAgIC8vIE1ldGVvciAxLjcgYWx3YXlzIHVzZWQgdGhlIHdlYi5icm93c2VyLmxlZ2FjeSB2ZXJzaW9uXG4gICAgICByZXR1cm4gX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5hdXRvdXBkYXRlVmVyc2lvbjtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ25vbmUnO1xuICB9XG59XG5cbmNvbnN0IGNyZWF0ZVN0YWNrVHJhY2UgPSAoKSA9PiB7XG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIGxldCBlcnIgPSB7fTtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlcnIsIEthZGlyYS50cmFja0Vycm9yKTtcbiAgICByZXR1cm4gZXJyLnN0YWNrO1xuICB9XG5cbiAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjay5zcGxpdCgnXFxuJyk7XG4gIGxldCB0b1JlbW92ZSA9IDA7XG5cbiAgLy8gUmVtb3ZlIGZyYW1lcyBzdGFydGluZyBmcm9tIHdoZW4gdHJhY2tFcnJvciB3YXMgY2FsbGVkXG4gIGZvciAoOyB0b1JlbW92ZSA8IHN0YWNrLmxlbmd0aDsgdG9SZW1vdmUrKykge1xuICAgIGlmIChzdGFja1t0b1JlbW92ZV0uaW5kZXhPZigndHJhY2tFcnJvcicpID4gLTEpIHtcbiAgICAgIHRvUmVtb3ZlICs9IDE7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhY2suc2xpY2UodG9SZW1vdmUpLmpvaW4oJ1xcbicpO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RXJyb3JQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgbGV0IHR5cGUgPSBudWxsO1xuICBsZXQgbWVzc2FnZSA9IG51bGw7XG4gIGxldCBzdWJUeXBlID0gbnVsbDtcbiAgbGV0IHN0YWNrID0gbnVsbDtcblxuICBpZiAoXG4gICAgIShhcmdzWzBdIGluc3RhbmNlb2YgRXJyb3IpICYmXG4gICAgdHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIGFyZ3NbMV0gPT09ICdzdHJpbmcnXG4gICkge1xuICAgIC8vIE9sZCB1c2FnZTpcbiAgICAvLyBNb250aS50cmFja0Vycm9yKFxuICAgIC8vICAgJ3R5cGUnLCAnZXJyb3IgbWVzc2FnZScsIHsgc3RhY2tzOiAnZXJyb3Igc3RhY2snLCBzdWJUeXBlOiAnc3ViIHR5cGUgfVxuICAgIC8vICk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gYXJnc1syXSB8fCB7fTtcblxuICAgIHR5cGUgPSBhcmdzWzBdO1xuICAgIHN1YlR5cGUgPSBNZXRlb3IuaXNDbGllbnQ/IGFyZ3NbMF0gOiBvcHRpb25zLnN1YlR5cGU7XG4gICAgbWVzc2FnZSA9IGFyZ3NbMV07XG4gICAgc3RhY2sgPSBvcHRpb25zLnN0YWNrcyB8fCBjcmVhdGVTdGFja1RyYWNlKCk7XG5cbiAgfSBlbHNlIHtcbiAgICAvLyBOZXcgdXNhZ2U6XG4gICAgLy8gTW9udGkudHJhY2tFcnJvcihlcnJvciwgeyB0eXBlOiAndHlwZScsIHN1YlR5cGU6ICdzdWJUeXBlJyB9KTtcbiAgICBjb25zdCBlcnJvciA9IGFyZ3NbMF07XG4gICAgY29uc3Qgb3B0aW9ucyA9IGFyZ3NbMV0gfHwge307XG4gICAgY29uc3QgaXNFcnJvck9iamVjdCA9IHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT09IG51bGxcbiAgICBcbiAgICBtZXNzYWdlID0gaXNFcnJvck9iamVjdCA/IGVycm9yLm1lc3NhZ2UgOiBlcnJvcjtcbiAgICBzdGFjayA9IGlzRXJyb3JPYmplY3QgJiYgZXJyb3Iuc3RhY2sgfHwgY3JlYXRlU3RhY2tUcmFjZSgpO1xuICAgIHR5cGUgPSBvcHRpb25zLnR5cGU7XG4gICAgc3ViVHlwZSA9IG9wdGlvbnMuc3ViVHlwZTtcbiAgfVxuXG4gIHJldHVybiB7IHR5cGUsIG1lc3NhZ2UsIHN1YlR5cGUsIHN0YWNrIH1cbn1cbiIsIkthZGlyYSA9IHt9O1xuS2FkaXJhLm9wdGlvbnMgPSB7fTtcblxuTW9udGkgPSBLYWRpcmE7XG5cbmlmKE1ldGVvci53cmFwQXN5bmMpIHtcbiAgS2FkaXJhLl93cmFwQXN5bmMgPSBNZXRlb3Iud3JhcEFzeW5jO1xufSBlbHNlIHtcbiAgS2FkaXJhLl93cmFwQXN5bmMgPSBNZXRlb3IuX3dyYXBBc3luYztcbn1cblxuaWYoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIHZhciBFdmVudEVtaXR0ZXIgPSBOcG0ucmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuICB2YXIgZXZlbnRCdXMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIGV2ZW50QnVzLnNldE1heExpc3RlbmVycygwKTtcblxuICB2YXIgYnVpbGRBcmdzID0gZnVuY3Rpb24oYXJncykge1xuICAgIHZhciBldmVudE5hbWUgPSBhcmdzWzBdICsgJy0nICsgYXJnc1sxXTtcbiAgICB2YXIgYXJncyA9IGFyZ3Muc2xpY2UoMik7XG4gICAgYXJncy51bnNoaWZ0KGV2ZW50TmFtZSk7XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH07XG4gIFxuICBLYWRpcmEuRXZlbnRCdXMgPSB7fTtcbiAgWydvbicsICdlbWl0JywgJ3JlbW92ZUxpc3RlbmVyJywgJ3JlbW92ZUFsbExpc3RlbmVycyddLmZvckVhY2goZnVuY3Rpb24obSkge1xuICAgIEthZGlyYS5FdmVudEJ1c1ttXSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIHZhciBhcmdzID0gYnVpbGRBcmdzKGFyZ3MpO1xuICAgICAgcmV0dXJuIGV2ZW50QnVzW21dLmFwcGx5KGV2ZW50QnVzLCBhcmdzKTtcbiAgICB9O1xuICB9KTtcbn0iLCJ2YXIgY29tbW9uRXJyUmVnRXhwcyA9IFtcbiAgL2Nvbm5lY3Rpb24gdGltZW91dFxcLiBubyAoXFx3KikgaGVhcnRiZWF0IHJlY2VpdmVkL2ksXG4gIC9JTlZBTElEX1NUQVRFX0VSUi9pLFxuXTtcblxuS2FkaXJhLmVycm9yRmlsdGVycyA9IHtcbiAgZmlsdGVyVmFsaWRhdGlvbkVycm9yczogZnVuY3Rpb24odHlwZSwgbWVzc2FnZSwgZXJyKSB7XG4gICAgaWYoZXJyICYmIGVyciBpbnN0YW5jZW9mIE1ldGVvci5FcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgZmlsdGVyQ29tbW9uTWV0ZW9yRXJyb3JzOiBmdW5jdGlvbih0eXBlLCBtZXNzYWdlKSB7XG4gICAgZm9yKHZhciBsYz0wOyBsYzxjb21tb25FcnJSZWdFeHBzLmxlbmd0aDsgbGMrKykge1xuICAgICAgdmFyIHJlZ0V4cCA9IGNvbW1vbkVyclJlZ0V4cHNbbGNdO1xuICAgICAgaWYocmVnRXhwLnRlc3QobWVzc2FnZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCJLYWRpcmEuc2VuZCA9IGZ1bmN0aW9uIChwYXlsb2FkLCBwYXRoLCBjYWxsYmFjaykge1xuICBpZighS2FkaXJhLmNvbm5lY3RlZCkgIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbmVlZCB0byBjb25uZWN0IHdpdGggS2FkaXJhIGZpcnN0LCBiZWZvcmUgc2VuZGluZyBtZXNzYWdlcyFcIik7XG4gIH1cblxuICBwYXRoID0gKHBhdGguc3Vic3RyKDAsIDEpICE9ICcvJyk/IFwiL1wiICsgcGF0aCA6IHBhdGg7XG4gIHZhciBlbmRwb2ludCA9IEthZGlyYS5vcHRpb25zLmVuZHBvaW50ICsgcGF0aDtcbiAgdmFyIHJldHJ5Q291bnQgPSAwO1xuICB2YXIgcmV0cnkgPSBuZXcgUmV0cnkoe1xuICAgIG1pbkNvdW50OiAxLFxuICAgIG1pblRpbWVvdXQ6IDAsXG4gICAgYmFzZVRpbWVvdXQ6IDEwMDAqNSxcbiAgICBtYXhUaW1lb3V0OiAxMDAwKjYwLFxuICB9KTtcblxuICB2YXIgc2VuZEZ1bmN0aW9uID0gS2FkaXJhLl9nZXRTZW5kRnVuY3Rpb24oKTtcbiAgdHJ5VG9TZW5kKCk7XG5cbiAgZnVuY3Rpb24gdHJ5VG9TZW5kKGVycikge1xuICAgIGlmKHJldHJ5Q291bnQgPCA1KSB7XG4gICAgICByZXRyeS5yZXRyeUxhdGVyKHJldHJ5Q291bnQrKywgc2VuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignRXJyb3Igc2VuZGluZyBlcnJvciB0cmFjZXMgdG8gTW9udGkgQVBNIHNlcnZlcicpO1xuICAgICAgaWYoY2FsbGJhY2spIGNhbGxiYWNrKGVycik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2VuZCgpIHtcbiAgICBzZW5kRnVuY3Rpb24oZW5kcG9pbnQsIHBheWxvYWQsIGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICBpZihlcnIgJiYgIXJlcykge1xuICAgICAgICB0cnlUb1NlbmQoZXJyKTtcbiAgICAgIH0gZWxzZSBpZihyZXMuc3RhdHVzQ29kZSA9PSAyMDApIHtcbiAgICAgICAgaWYoY2FsbGJhY2spIGNhbGxiYWNrKG51bGwsIHJlcy5kYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhuZXcgTWV0ZW9yLkVycm9yKHJlcy5zdGF0dXNDb2RlLCByZXMuY29udGVudCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5LYWRpcmEuX2dldFNlbmRGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gKE1ldGVvci5pc1NlcnZlcik/IEthZGlyYS5fc2VydmVyU2VuZCA6IEthZGlyYS5fY2xpZW50U2VuZDtcbn07XG5cbkthZGlyYS5fY2xpZW50U2VuZCA9IGZ1bmN0aW9uIChlbmRwb2ludCwgcGF5bG9hZCwgY2FsbGJhY2spIHtcbiAgaHR0cFJlcXVlc3QoJ1BPU1QnLCBlbmRwb2ludCwge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICB9LFxuICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpXG4gIH0sIGNhbGxiYWNrKTtcbn1cblxuS2FkaXJhLl9zZXJ2ZXJTZW5kID0gZnVuY3Rpb24gKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0thZGlyYS5fc2VydmVyU2VuZCBpcyBub3Qgc3VwcG9ydGVkLiBVc2UgY29yZUFwaSBpbnN0ZWFkLicpO1xufVxuIiwiQmFzZUVycm9yTW9kZWwgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHRoaXMuX2ZpbHRlcnMgPSBbXTtcbn07XG5cbkJhc2VFcnJvck1vZGVsLnByb3RvdHlwZS5hZGRGaWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcbiAgaWYodHlwZW9mIGZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMuX2ZpbHRlcnMucHVzaChmaWx0ZXIpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGZpbHRlciBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbkJhc2VFcnJvck1vZGVsLnByb3RvdHlwZS5yZW1vdmVGaWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5fZmlsdGVycy5pbmRleE9mKGZpbHRlcik7XG4gIGlmKGluZGV4ID49IDApIHtcbiAgICB0aGlzLl9maWx0ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbkJhc2VFcnJvck1vZGVsLnByb3RvdHlwZS5hcHBseUZpbHRlcnMgPSBmdW5jdGlvbih0eXBlLCBtZXNzYWdlLCBlcnJvciwgc3ViVHlwZSkge1xuICBmb3IodmFyIGxjPTA7IGxjPHRoaXMuX2ZpbHRlcnMubGVuZ3RoOyBsYysrKSB7XG4gICAgdmFyIGZpbHRlciA9IHRoaXMuX2ZpbHRlcnNbbGNdO1xuICAgIHRyeSB7XG4gICAgICB2YXIgdmFsaWRhdGVkID0gZmlsdGVyKHR5cGUsIG1lc3NhZ2UsIGVycm9yLCBzdWJUeXBlKTtcbiAgICAgIGlmKCF2YWxpZGF0ZWQpIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgLy8gd2UgbmVlZCB0byByZW1vdmUgdGhpcyBmaWx0ZXJcbiAgICAgIC8vIHdlIG1heSBlbmRlZCB1cCBpbiBhIGVycm9yIGN5Y2xlXG4gICAgICB0aGlzLl9maWx0ZXJzLnNwbGljZShsYywgMSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhbiBlcnJvciB0aHJvd24gZnJvbSBhIGZpbHRlciB5b3UndmUgc3VwbGllZFwiLCBleC5tZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07IiwiS2FkaXJhTW9kZWwgPSBmdW5jdGlvbigpIHtcblxufTtcblxuS2FkaXJhTW9kZWwucHJvdG90eXBlLl9nZXREYXRlSWQgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgdmFyIHJlbWFpbmRlciA9IHRpbWVzdGFtcCAlICgxMDAwICogNjApO1xuICB2YXIgZGF0ZUlkID0gdGltZXN0YW1wIC0gcmVtYWluZGVyO1xuICByZXR1cm4gZGF0ZUlkO1xufTsiLCJjb25zdCB7IEREU2tldGNoIH0gPSByZXF1aXJlKCdtb250aS1hcG0tc2tldGNoZXMtanMnKTtcblxudmFyIE1FVEhPRF9NRVRSSUNTX0ZJRUxEUyA9IFsnd2FpdCcsICdkYicsICdodHRwJywgJ2VtYWlsJywgJ2FzeW5jJywgJ2NvbXB1dGUnLCAndG90YWwnXTtcblxuTWV0aG9kc01vZGVsID0gZnVuY3Rpb24gKG1ldHJpY3NUaHJlc2hvbGQpIHtcbiAgdGhpcy5tZXRob2RNZXRyaWNzQnlNaW51dGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLmVycm9yTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB0aGlzLl9tZXRyaWNzVGhyZXNob2xkID0gXy5leHRlbmQoe1xuICAgIFwid2FpdFwiOiAxMDAsXG4gICAgXCJkYlwiOiAxMDAsXG4gICAgXCJodHRwXCI6IDEwMDAsXG4gICAgXCJlbWFpbFwiOiAxMDAsXG4gICAgXCJhc3luY1wiOiAxMDAsXG4gICAgXCJjb21wdXRlXCI6IDEwMCxcbiAgICBcInRvdGFsXCI6IDIwMFxuICB9LCBtZXRyaWNzVGhyZXNob2xkIHx8IE9iamVjdC5jcmVhdGUobnVsbCkpO1xuXG4gIC8vc3RvcmUgbWF4IHRpbWUgZWxhcHNlZCBtZXRob2RzIGZvciBlYWNoIG1ldGhvZCwgZXZlbnQobWV0cmljcy1maWVsZClcbiAgdGhpcy5tYXhFdmVudFRpbWVzRm9yTWV0aG9kcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgdGhpcy50cmFjZXJTdG9yZSA9IG5ldyBUcmFjZXJTdG9yZSh7XG4gICAgaW50ZXJ2YWw6IDEwMDAgKiA2MCwgLy9wcm9jZXNzIHRyYWNlcyBldmVyeSBtaW51dGVcbiAgICBtYXhUb3RhbFBvaW50czogMzAsIC8vZm9yIDMwIG1pbnV0ZXNcbiAgICBhcmNoaXZlRXZlcnk6IDUgLy9hbHdheXMgdHJhY2UgZm9yIGV2ZXJ5IDUgbWludXRlcyxcbiAgfSk7XG5cbiAgdGhpcy50cmFjZXJTdG9yZS5zdGFydCgpO1xufTtcblxuXy5leHRlbmQoTWV0aG9kc01vZGVsLnByb3RvdHlwZSwgS2FkaXJhTW9kZWwucHJvdG90eXBlKTtcblxuTWV0aG9kc01vZGVsLnByb3RvdHlwZS5fZ2V0TWV0cmljcyA9IGZ1bmN0aW9uKHRpbWVzdGFtcCwgbWV0aG9kKSB7XG4gIHZhciBkYXRlSWQgPSB0aGlzLl9nZXREYXRlSWQodGltZXN0YW1wKTtcblxuICBpZighdGhpcy5tZXRob2RNZXRyaWNzQnlNaW51dGVbZGF0ZUlkXSkge1xuICAgIHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2RhdGVJZF0gPSB7XG4gICAgICBtZXRob2RzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIH07XG4gIH1cblxuICB2YXIgbWV0aG9kcyA9IHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2RhdGVJZF0ubWV0aG9kcztcblxuICAvL2luaXRpYWxpemUgbWV0aG9kXG4gIGlmKCFtZXRob2RzW21ldGhvZF0pIHtcbiAgICBtZXRob2RzW21ldGhvZF0gPSB7XG4gICAgICBjb3VudDogMCxcbiAgICAgIGVycm9yczogMCxcbiAgICAgIGZldGNoZWREb2NTaXplOiAwLFxuICAgICAgc2VudE1zZ1NpemU6IDAsXG4gICAgICBoaXN0b2dyYW06IG5ldyBERFNrZXRjaCh7XG4gICAgICAgIGFscGhhOiAwLjAyXG4gICAgICB9KVxuICAgIH07XG5cbiAgICBNRVRIT0RfTUVUUklDU19GSUVMRFMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgbWV0aG9kc1ttZXRob2RdW2ZpZWxkXSA9IDA7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5tZXRob2RNZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5tZXRob2RzW21ldGhvZF07XG59O1xuXG5NZXRob2RzTW9kZWwucHJvdG90eXBlLnNldFN0YXJ0VGltZSA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDtcbn1cblxuTWV0aG9kc01vZGVsLnByb3RvdHlwZS5wcm9jZXNzTWV0aG9kID0gZnVuY3Rpb24obWV0aG9kVHJhY2UpIHtcbiAgdmFyIGRhdGVJZCA9IHRoaXMuX2dldERhdGVJZChtZXRob2RUcmFjZS5hdCk7XG5cbiAgLy9hcHBlbmQgbWV0cmljcyB0byBwcmV2aW91cyB2YWx1ZXNcbiAgdGhpcy5fYXBwZW5kTWV0cmljcyhkYXRlSWQsIG1ldGhvZFRyYWNlKTtcbiAgaWYobWV0aG9kVHJhY2UuZXJyb3JlZCkge1xuICAgIHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2RhdGVJZF0ubWV0aG9kc1ttZXRob2RUcmFjZS5uYW1lXS5lcnJvcnMgKytcbiAgfVxuXG4gIHRoaXMudHJhY2VyU3RvcmUuYWRkVHJhY2UobWV0aG9kVHJhY2UpO1xufTtcblxuTWV0aG9kc01vZGVsLnByb3RvdHlwZS5fYXBwZW5kTWV0cmljcyA9IGZ1bmN0aW9uKGlkLCBtZXRob2RUcmFjZSkge1xuICB2YXIgbWV0aG9kTWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3MoaWQsIG1ldGhvZFRyYWNlLm5hbWUpXG5cbiAgLy8gc3RhcnRUaW1lIG5lZWRzIHRvIGJlIGNvbnZlcnRlZCBpbnRvIHNlcnZlclRpbWUgYmVmb3JlIHNlbmRpbmdcbiAgaWYoIXRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2lkXS5zdGFydFRpbWUpe1xuICAgIHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2lkXS5zdGFydFRpbWUgPSBtZXRob2RUcmFjZS5hdDtcbiAgfVxuXG4gIC8vbWVyZ2VcbiAgTUVUSE9EX01FVFJJQ1NfRklFTERTLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcbiAgICB2YXIgdmFsdWUgPSBtZXRob2RUcmFjZS5tZXRyaWNzW2ZpZWxkXTtcbiAgICBpZih2YWx1ZSA+IDApIHtcbiAgICAgIG1ldGhvZE1ldHJpY3NbZmllbGRdICs9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgbWV0aG9kTWV0cmljcy5jb3VudCsrO1xuICBtZXRob2RNZXRyaWNzLmhpc3RvZ3JhbS5hZGQobWV0aG9kVHJhY2UubWV0cmljcy50b3RhbCk7XG4gIHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2lkXS5lbmRUaW1lID0gbWV0aG9kVHJhY2UubWV0cmljcy5hdDtcbn07XG5cbk1ldGhvZHNNb2RlbC5wcm90b3R5cGUudHJhY2tEb2NTaXplID0gZnVuY3Rpb24obWV0aG9kLCBzaXplKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgZGF0ZUlkID0gdGhpcy5fZ2V0RGF0ZUlkKHRpbWVzdGFtcCk7XG5cbiAgdmFyIG1ldGhvZE1ldHJpY3MgPSB0aGlzLl9nZXRNZXRyaWNzKGRhdGVJZCwgbWV0aG9kKTtcbiAgbWV0aG9kTWV0cmljcy5mZXRjaGVkRG9jU2l6ZSArPSBzaXplO1xufVxuXG5NZXRob2RzTW9kZWwucHJvdG90eXBlLnRyYWNrTXNnU2l6ZSA9IGZ1bmN0aW9uKG1ldGhvZCwgc2l6ZSkge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIGRhdGVJZCA9IHRoaXMuX2dldERhdGVJZCh0aW1lc3RhbXApO1xuXG4gIHZhciBtZXRob2RNZXRyaWNzID0gdGhpcy5fZ2V0TWV0cmljcyhkYXRlSWQsIG1ldGhvZCk7XG4gIG1ldGhvZE1ldHJpY3Muc2VudE1zZ1NpemUgKz0gc2l6ZTtcbn1cblxuLypcbiAgVGhlcmUgYXJlIHR3byB0eXBlcyBvZiBkYXRhXG5cbiAgMS4gbWV0aG9kTWV0cmljcyAtIG1ldHJpY3MgYWJvdXQgdGhlIG1ldGhvZHMgKGZvciBldmVyeSAxMCBzZWNzKVxuICAyLiBtZXRob2RSZXF1ZXN0cyAtIHJhdyBtZXRob2QgcmVxdWVzdC4gbm9ybWFsbHkgbWF4LCBtaW4gZm9yIGV2ZXJ5IDEgbWluIGFuZCBlcnJvcnMgYWx3YXlzXG4qL1xuTWV0aG9kc01vZGVsLnByb3RvdHlwZS5idWlsZFBheWxvYWQgPSBmdW5jdGlvbihidWlsZERldGFpbGVkSW5mbykge1xuICB2YXIgcGF5bG9hZCA9IHtcbiAgICBtZXRob2RNZXRyaWNzOiBbXSxcbiAgICBtZXRob2RSZXF1ZXN0czogW11cbiAgfTtcblxuICAvL2hhbmRsaW5nIG1ldHJpY3NcbiAgdmFyIG1ldGhvZE1ldHJpY3NCeU1pbnV0ZSA9IHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlO1xuICB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgLy9jcmVhdGUgZmluYWwgcGF5bG9kIGZvciBtZXRob2RNZXRyaWNzXG4gIGZvcih2YXIga2V5IGluIG1ldGhvZE1ldHJpY3NCeU1pbnV0ZSkge1xuICAgIHZhciBtZXRob2RNZXRyaWNzID0gbWV0aG9kTWV0cmljc0J5TWludXRlW2tleV07XG4gICAgLy8gY29udmVydGluZyBzdGFydFRpbWUgaW50byB0aGUgYWN0dWFsIHNlcnZlclRpbWVcbiAgICB2YXIgc3RhcnRUaW1lID0gbWV0aG9kTWV0cmljcy5zdGFydFRpbWU7XG4gICAgbWV0aG9kTWV0cmljcy5zdGFydFRpbWUgPSBLYWRpcmEuc3luY2VkRGF0ZS5zeW5jVGltZShzdGFydFRpbWUpO1xuXG4gICAgZm9yKHZhciBtZXRob2ROYW1lIGluIG1ldGhvZE1ldHJpY3MubWV0aG9kcykge1xuICAgICAgTUVUSE9EX01FVFJJQ1NfRklFTERTLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgbWV0aG9kTWV0cmljcy5tZXRob2RzW21ldGhvZE5hbWVdW2ZpZWxkXSAvPVxuICAgICAgICAgIG1ldGhvZE1ldHJpY3MubWV0aG9kc1ttZXRob2ROYW1lXS5jb3VudDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHBheWxvYWQubWV0aG9kTWV0cmljcy5wdXNoKG1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtrZXldKTtcbiAgfVxuXG4gIC8vY29sbGVjdCB0cmFjZXMgYW5kIHNlbmQgdGhlbSB3aXRoIHRoZSBwYXlsb2FkXG4gIHBheWxvYWQubWV0aG9kUmVxdWVzdHMgPSB0aGlzLnRyYWNlclN0b3JlLmNvbGxlY3RUcmFjZXMoKTtcblxuICByZXR1cm4gcGF5bG9hZDtcbn07XG4iLCJ2YXIgbG9nZ2VyID0gTnBtLnJlcXVpcmUoJ2RlYnVnJykoJ2thZGlyYTpwdWJzdWInKTtcbmNvbnN0IHsgRERTa2V0Y2ggfSA9IHJlcXVpcmUoJ21vbnRpLWFwbS1za2V0Y2hlcy1qcycpO1xuXG5QdWJzdWJNb2RlbCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm1ldHJpY3NCeU1pbnV0ZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHRoaXMuc3Vic2NyaXB0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgdGhpcy50cmFjZXJTdG9yZSA9IG5ldyBUcmFjZXJTdG9yZSh7XG4gICAgaW50ZXJ2YWw6IDEwMDAgKiA2MCwgLy9wcm9jZXNzIHRyYWNlcyBldmVyeSBtaW51dGVcbiAgICBtYXhUb3RhbFBvaW50czogMzAsIC8vZm9yIDMwIG1pbnV0ZXNcbiAgICBhcmNoaXZlRXZlcnk6IDUgLy9hbHdheXMgdHJhY2UgZm9yIGV2ZXJ5IDUgbWludXRlcyxcbiAgfSk7XG5cbiAgdGhpcy50cmFjZXJTdG9yZS5zdGFydCgpO1xufVxuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuX3RyYWNrU3ViID0gZnVuY3Rpb24oc2Vzc2lvbiwgbXNnKSB7XG4gIGxvZ2dlcignU1VCOicsIHNlc3Npb24uaWQsIG1zZy5pZCwgbXNnLm5hbWUsIG1zZy5wYXJhbXMpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUobXNnLm5hbWUpO1xuICB2YXIgc3Vic2NyaXB0aW9uSWQgPSBtc2cuaWQ7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgbWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbik7XG5cbiAgbWV0cmljcy5zdWJzKys7XG4gIHRoaXMuc3Vic2NyaXB0aW9uc1ttc2cuaWRdID0ge1xuICAgIC8vIFdlIHVzZSBsb2NhbFRpbWUgaGVyZSwgYmVjYXVzZSB3aGVuIHdlIHVzZWQgc3luZWRUaW1lIHdlIG1pZ2h0IGdldFxuICAgIC8vIG1pbnVzIG9yIG1vcmUgdGhhbiB3ZSd2ZSBleHBlY3RlZFxuICAgIC8vICAgKGJlZm9yZSBzZXJ2ZXJUaW1lIGRpZmYgY2hhbmdlZCBvdmVydGltZSlcbiAgICBzdGFydFRpbWU6IHRpbWVzdGFtcCxcbiAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb24sXG4gICAgcGFyYW1zOiBtc2cucGFyYW1zLFxuICAgIGlkOiBtc2cuaWRcbiAgfTtcblxuICAvL3NldCBzZXNzaW9uIHN0YXJ0ZWRUaW1lXG4gIHNlc3Npb24uX3N0YXJ0VGltZSA9IHNlc3Npb24uX3N0YXJ0VGltZSB8fCB0aW1lc3RhbXA7XG59O1xuXG5fLmV4dGVuZChQdWJzdWJNb2RlbC5wcm90b3R5cGUsIEthZGlyYU1vZGVsLnByb3RvdHlwZSk7XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS5fdHJhY2tVbnN1YiA9IGZ1bmN0aW9uKHNlc3Npb24sIHN1Yikge1xuICBsb2dnZXIoJ1VOU1VCOicsIHNlc3Npb24uaWQsIHN1Yi5fc3Vic2NyaXB0aW9uSWQpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUoc3ViLl9uYW1lKTtcbiAgdmFyIHN1YnNjcmlwdGlvbklkID0gc3ViLl9zdWJzY3JpcHRpb25JZDtcbiAgdmFyIHN1YnNjcmlwdGlvblN0YXRlID0gdGhpcy5zdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbklkXTtcblxuICB2YXIgc3RhcnRUaW1lID0gbnVsbDtcbiAgLy9zb21ldGltZSwgd2UgZG9uJ3QgaGF2ZSB0aGVzZSBzdGF0ZXNcbiAgaWYoc3Vic2NyaXB0aW9uU3RhdGUpIHtcbiAgICBzdGFydFRpbWUgPSBzdWJzY3JpcHRpb25TdGF0ZS5zdGFydFRpbWU7XG4gIH0gZWxzZSB7XG4gICAgLy9pZiB0aGlzIGlzIG51bGwgc3Vic2NyaXB0aW9uLCB3aGljaCBpcyBzdGFydGVkIGF1dG9tYXRpY2FsbHlcbiAgICAvL2hlbmNlLCB3ZSBkb24ndCBoYXZlIGEgc3RhdGVcbiAgICBzdGFydFRpbWUgPSBzZXNzaW9uLl9zdGFydFRpbWU7XG4gIH1cblxuICAvL2luIGNhc2UsIHdlIGNhbid0IGdldCB0aGUgc3RhcnRUaW1lXG4gIGlmKHN0YXJ0VGltZSkge1xuICAgIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICAgIHZhciBtZXRyaWNzID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uKTtcbiAgICAvL3RyYWNrIHRoZSBjb3VudFxuICAgIGlmKHN1Yi5fbmFtZSAhPSBudWxsKSB7XG4gICAgICAvLyB3ZSBjYW4ndCB0cmFjayBzdWJzIGZvciBgbnVsbGAgcHVibGljYXRpb25zLlxuICAgICAgLy8gc28gd2Ugc2hvdWxkIG5vdCB0cmFjayB1bnN1YnMgdG9vXG4gICAgICBtZXRyaWNzLnVuc3VicysrO1xuICAgIH1cbiAgICAvL3VzZSB0aGUgY3VycmVudCBkYXRlIHRvIGdldCB0aGUgbGlmZVRpbWUgb2YgdGhlIHN1YnNjcmlwdGlvblxuICAgIG1ldHJpY3MubGlmZVRpbWUgKz0gdGltZXN0YW1wIC0gc3RhcnRUaW1lO1xuICAgIC8vdGhpcyBpcyBwbGFjZSB3ZSBjYW4gY2xlYW4gdGhlIHN1YnNjcmlwdGlvblN0YXRlIGlmIGV4aXN0c1xuICAgIGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbnNbc3Vic2NyaXB0aW9uSWRdO1xuICB9XG59O1xuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuX3RyYWNrUmVhZHkgPSBmdW5jdGlvbihzZXNzaW9uLCBzdWIsIHRyYWNlKSB7XG4gIGxvZ2dlcignUkVBRFk6Jywgc2Vzc2lvbi5pZCwgc3ViLl9zdWJzY3JpcHRpb25JZCk7XG4gIC8vdXNlIHRoZSBjdXJyZW50IHRpbWUgdG8gdHJhY2sgdGhlIHJlc3BvbnNlIHRpbWVcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKHN1Yi5fbmFtZSk7XG4gIHZhciBzdWJzY3JpcHRpb25JZCA9IHN1Yi5fc3Vic2NyaXB0aW9uSWQ7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgbWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbik7XG5cbiAgdmFyIHN1YnNjcmlwdGlvblN0YXRlID0gdGhpcy5zdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbklkXTtcbiAgaWYoc3Vic2NyaXB0aW9uU3RhdGUgJiYgIXN1YnNjcmlwdGlvblN0YXRlLnJlYWR5VHJhY2tlZCkge1xuICAgIHZhciByZXNUaW1lID0gdGltZXN0YW1wIC0gc3Vic2NyaXB0aW9uU3RhdGUuc3RhcnRUaW1lXG4gICAgbWV0cmljcy5yZXNUaW1lICs9IHJlc1RpbWU7XG4gICAgc3Vic2NyaXB0aW9uU3RhdGUucmVhZHlUcmFja2VkID0gdHJ1ZTtcbiAgICBtZXRyaWNzLmhpc3RvZ3JhbS5hZGQocmVzVGltZSk7XG4gIH1cblxuICBpZih0cmFjZSkge1xuICAgIHRoaXMudHJhY2VyU3RvcmUuYWRkVHJhY2UodHJhY2UpO1xuICB9XG59O1xuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuX3RyYWNrRXJyb3IgPSBmdW5jdGlvbihzZXNzaW9uLCBzdWIsIHRyYWNlKSB7XG4gIGxvZ2dlcignRVJST1I6Jywgc2Vzc2lvbi5pZCwgc3ViLl9zdWJzY3JpcHRpb25JZCk7XG4gIC8vdXNlIHRoZSBjdXJyZW50IHRpbWUgdG8gdHJhY2sgdGhlIHJlc3BvbnNlIHRpbWVcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKHN1Yi5fbmFtZSk7XG4gIHZhciBzdWJzY3JpcHRpb25JZCA9IHN1Yi5fc3Vic2NyaXB0aW9uSWQ7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgbWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbik7XG5cbiAgbWV0cmljcy5lcnJvcnMrKztcblxuICBpZih0cmFjZSkge1xuICAgIHRoaXMudHJhY2VyU3RvcmUuYWRkVHJhY2UodHJhY2UpO1xuICB9XG59O1xuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuX2dldE1ldHJpY3MgPSBmdW5jdGlvbih0aW1lc3RhbXAsIHB1YmxpY2F0aW9uKSB7XG4gIHZhciBkYXRlSWQgPSB0aGlzLl9nZXREYXRlSWQodGltZXN0YW1wKTtcblxuICBpZighdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXSkge1xuICAgIHRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0gPSB7XG4gICAgICAvLyBzdGFydFRpbWUgbmVlZHMgdG8gYmUgY29udmVydCB0byBzZXJ2ZXJUaW1lIGJlZm9yZSBzZW5kaW5nIHRvIHRoZSBzZXJ2ZXJcbiAgICAgIHN0YXJ0VGltZTogdGltZXN0YW1wLFxuICAgICAgcHViczogT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIH07XG4gIH1cblxuICBpZighdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5wdWJzW3B1YmxpY2F0aW9uXSkge1xuICAgIHRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0ucHVic1twdWJsaWNhdGlvbl0gPSB7XG4gICAgICBzdWJzOiAwLFxuICAgICAgdW5zdWJzOiAwLFxuICAgICAgcmVzVGltZTogMCxcbiAgICAgIGFjdGl2ZVN1YnM6IDAsXG4gICAgICBhY3RpdmVEb2NzOiAwLFxuICAgICAgbGlmZVRpbWU6IDAsXG4gICAgICB0b3RhbE9ic2VydmVyczogMCxcbiAgICAgIGNhY2hlZE9ic2VydmVyczogMCxcbiAgICAgIGNyZWF0ZWRPYnNlcnZlcnM6IDAsXG4gICAgICBkZWxldGVkT2JzZXJ2ZXJzOiAwLFxuICAgICAgZXJyb3JzOiAwLFxuICAgICAgb2JzZXJ2ZXJMaWZldGltZTogMCxcbiAgICAgIHBvbGxlZERvY3VtZW50czogMCxcbiAgICAgIG9wbG9nVXBkYXRlZERvY3VtZW50czogMCxcbiAgICAgIG9wbG9nSW5zZXJ0ZWREb2N1bWVudHM6IDAsXG4gICAgICBvcGxvZ0RlbGV0ZWREb2N1bWVudHM6IDAsXG4gICAgICBpbml0aWFsbHlBZGRlZERvY3VtZW50czogMCxcbiAgICAgIGxpdmVBZGRlZERvY3VtZW50czogMCxcbiAgICAgIGxpdmVDaGFuZ2VkRG9jdW1lbnRzOiAwLFxuICAgICAgbGl2ZVJlbW92ZWREb2N1bWVudHM6IDAsXG4gICAgICBwb2xsZWREb2NTaXplOiAwLFxuICAgICAgZmV0Y2hlZERvY1NpemU6IDAsXG4gICAgICBpbml0aWFsbHlGZXRjaGVkRG9jU2l6ZTogMCxcbiAgICAgIGxpdmVGZXRjaGVkRG9jU2l6ZTogMCxcbiAgICAgIGluaXRpYWxseVNlbnRNc2dTaXplOiAwLFxuICAgICAgbGl2ZVNlbnRNc2dTaXplOiAwLFxuICAgICAgaGlzdG9ncmFtOiBuZXcgRERTa2V0Y2goe1xuICAgICAgICBhbHBoYTogMC4wMlxuICAgICAgfSlcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0ucHVic1twdWJsaWNhdGlvbl07XG59O1xuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuX2dldFB1YmxpY2F0aW9uTmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUgfHwgXCJudWxsKGF1dG9wdWJsaXNoKVwiO1xufTtcblxuUHVic3ViTW9kZWwucHJvdG90eXBlLl9nZXRTdWJzY3JpcHRpb25JbmZvID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGFjdGl2ZVN1YnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgYWN0aXZlRG9jcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciB0b3RhbERvY3NTZW50ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIHRvdGFsRGF0YVNlbnQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgdG90YWxPYnNlcnZlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgY2FjaGVkT2JzZXJ2ZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICBpdGVyYXRlKE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMsIHNlc3Npb24gPT4ge1xuICAgIGl0ZXJhdGUoc2Vzc2lvbi5fbmFtZWRTdWJzLCBjb3VudFN1YkRhdGEpO1xuICAgIGl0ZXJhdGUoc2Vzc2lvbi5fdW5pdmVyc2FsU3VicywgY291bnRTdWJEYXRhKTtcbiAgfSk7XG5cbiAgdmFyIGF2Z09ic2VydmVyUmV1c2UgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBfLmVhY2godG90YWxPYnNlcnZlcnMsIGZ1bmN0aW9uKHZhbHVlLCBwdWJsaWNhdGlvbikge1xuICAgIGF2Z09ic2VydmVyUmV1c2VbcHVibGljYXRpb25dID0gY2FjaGVkT2JzZXJ2ZXJzW3B1YmxpY2F0aW9uXSAvIHRvdGFsT2JzZXJ2ZXJzW3B1YmxpY2F0aW9uXTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBhY3RpdmVTdWJzOiBhY3RpdmVTdWJzLFxuICAgIGFjdGl2ZURvY3M6IGFjdGl2ZURvY3MsXG4gICAgYXZnT2JzZXJ2ZXJSZXVzZTogYXZnT2JzZXJ2ZXJSZXVzZVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNvdW50U3ViRGF0YSAoc3ViKSB7XG4gICAgdmFyIHB1YmxpY2F0aW9uID0gc2VsZi5fZ2V0UHVibGljYXRpb25OYW1lKHN1Yi5fbmFtZSk7XG4gICAgY291bnRTdWJzY3JpcHRpb25zKHN1YiwgcHVibGljYXRpb24pO1xuICAgIGNvdW50RG9jdW1lbnRzKHN1YiwgcHVibGljYXRpb24pO1xuICAgIGNvdW50T2JzZXJ2ZXJzKHN1YiwgcHVibGljYXRpb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY291bnRTdWJzY3JpcHRpb25zIChzdWIsIHB1YmxpY2F0aW9uKSB7XG4gICAgYWN0aXZlU3Vic1twdWJsaWNhdGlvbl0gPSBhY3RpdmVTdWJzW3B1YmxpY2F0aW9uXSB8fCAwO1xuICAgIGFjdGl2ZVN1YnNbcHVibGljYXRpb25dKys7XG4gIH1cblxuICBmdW5jdGlvbiBjb3VudERvY3VtZW50cyAoc3ViLCBwdWJsaWNhdGlvbikge1xuICAgIGFjdGl2ZURvY3NbcHVibGljYXRpb25dID0gYWN0aXZlRG9jc1twdWJsaWNhdGlvbl0gfHwgMDtcbiAgICBpdGVyYXRlKHN1Yi5fZG9jdW1lbnRzLCBjb2xsZWN0aW9uID0+IHtcbiAgICAgIGFjdGl2ZURvY3NbcHVibGljYXRpb25dICs9IGNvdW50S2V5cyhjb2xsZWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvdW50T2JzZXJ2ZXJzKHN1YiwgcHVibGljYXRpb24pIHtcbiAgICB0b3RhbE9ic2VydmVyc1twdWJsaWNhdGlvbl0gPSB0b3RhbE9ic2VydmVyc1twdWJsaWNhdGlvbl0gfHwgMDtcbiAgICBjYWNoZWRPYnNlcnZlcnNbcHVibGljYXRpb25dID0gY2FjaGVkT2JzZXJ2ZXJzW3B1YmxpY2F0aW9uXSB8fCAwO1xuXG4gICAgdG90YWxPYnNlcnZlcnNbcHVibGljYXRpb25dICs9IHN1Yi5fdG90YWxPYnNlcnZlcnM7XG4gICAgY2FjaGVkT2JzZXJ2ZXJzW3B1YmxpY2F0aW9uXSArPSBzdWIuX2NhY2hlZE9ic2VydmVycztcbiAgfVxufVxuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuYnVpbGRQYXlsb2FkID0gZnVuY3Rpb24oYnVpbGREZXRhaWxJbmZvKSB7XG4gIHZhciBtZXRyaWNzQnlNaW51dGUgPSB0aGlzLm1ldHJpY3NCeU1pbnV0ZTtcbiAgdGhpcy5tZXRyaWNzQnlNaW51dGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHZhciBwYXlsb2FkID0ge1xuICAgIHB1Yk1ldHJpY3M6IFtdXG4gIH07XG5cbiAgdmFyIHN1YnNjcmlwdGlvbkRhdGEgPSB0aGlzLl9nZXRTdWJzY3JpcHRpb25JbmZvKCk7XG4gIHZhciBhY3RpdmVTdWJzID0gc3Vic2NyaXB0aW9uRGF0YS5hY3RpdmVTdWJzO1xuICB2YXIgYWN0aXZlRG9jcyA9IHN1YnNjcmlwdGlvbkRhdGEuYWN0aXZlRG9jcztcbiAgdmFyIGF2Z09ic2VydmVyUmV1c2UgPSBzdWJzY3JpcHRpb25EYXRhLmF2Z09ic2VydmVyUmV1c2U7XG5cbiAgLy90byB0aGUgYXZlcmFnaW5nXG4gIGZvcih2YXIgZGF0ZUlkIGluIG1ldHJpY3NCeU1pbnV0ZSkge1xuICAgIHZhciBkYXRlTWV0cmljcyA9IG1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdO1xuICAgIC8vIFdlIG5lZWQgdG8gY29udmVydCBzdGFydFRpbWUgaW50byBhY3R1YWwgc2VydmVyVGltZVxuICAgIGRhdGVNZXRyaWNzLnN0YXJ0VGltZSA9IEthZGlyYS5zeW5jZWREYXRlLnN5bmNUaW1lKGRhdGVNZXRyaWNzLnN0YXJ0VGltZSk7XG5cbiAgICBmb3IodmFyIHB1YmxpY2F0aW9uIGluIG1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnB1YnMpIHtcbiAgICAgIHZhciBzaW5nbGVQdWJNZXRyaWNzID0gbWV0cmljc0J5TWludXRlW2RhdGVJZF0ucHVic1twdWJsaWNhdGlvbl07XG4gICAgICAvLyBXZSBvbmx5IGNhbGN1bGF0ZSByZXNUaW1lIGZvciBuZXcgc3Vic2NyaXB0aW9uc1xuICAgICAgc2luZ2xlUHViTWV0cmljcy5yZXNUaW1lIC89IHNpbmdsZVB1Yk1ldHJpY3Muc3VicztcbiAgICAgIHNpbmdsZVB1Yk1ldHJpY3MucmVzVGltZSA9IHNpbmdsZVB1Yk1ldHJpY3MucmVzVGltZSB8fCAwO1xuICAgICAgLy8gV2Ugb25seSB0cmFjayBsaWZlVGltZSBpbiB0aGUgdW5zdWJzXG4gICAgICBzaW5nbGVQdWJNZXRyaWNzLmxpZmVUaW1lIC89IHNpbmdsZVB1Yk1ldHJpY3MudW5zdWJzO1xuICAgICAgc2luZ2xlUHViTWV0cmljcy5saWZlVGltZSA9IHNpbmdsZVB1Yk1ldHJpY3MubGlmZVRpbWUgfHwgMDtcblxuICAgICAgLy8gQ291bnQgdGhlIGF2ZXJhZ2UgZm9yIG9ic2VydmVyIGxpZmV0aW1lXG4gICAgICBpZihzaW5nbGVQdWJNZXRyaWNzLmRlbGV0ZWRPYnNlcnZlcnMgPiAwKSB7XG4gICAgICAgIHNpbmdsZVB1Yk1ldHJpY3Mub2JzZXJ2ZXJMaWZldGltZSAvPSBzaW5nbGVQdWJNZXRyaWNzLmRlbGV0ZWRPYnNlcnZlcnM7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSB0d28gb3JlIG1vcmUgZGF0ZUlkcywgd2Ugd2lsbCBiZSB1c2luZyB0aGUgY3VycmVudENvdW50IGZvciBhbGwgb2YgdGhlbS5cbiAgICAgIC8vIFdlIGNhbiBjb21lIHVwIHdpdGggYSBiZXR0ZXIgc29sdXRpb24gbGF0ZXIgb24uXG4gICAgICBzaW5nbGVQdWJNZXRyaWNzLmFjdGl2ZVN1YnMgPSBhY3RpdmVTdWJzW3B1YmxpY2F0aW9uXSB8fCAwO1xuICAgICAgc2luZ2xlUHViTWV0cmljcy5hY3RpdmVEb2NzID0gYWN0aXZlRG9jc1twdWJsaWNhdGlvbl0gfHwgMDtcbiAgICAgIHNpbmdsZVB1Yk1ldHJpY3MuYXZnT2JzZXJ2ZXJSZXVzZSA9IGF2Z09ic2VydmVyUmV1c2VbcHVibGljYXRpb25dIHx8IDA7XG4gICAgfVxuXG4gICAgcGF5bG9hZC5wdWJNZXRyaWNzLnB1c2gobWV0cmljc0J5TWludXRlW2RhdGVJZF0pO1xuICB9XG5cbiAgLy9jb2xsZWN0IHRyYWNlcyBhbmQgc2VuZCB0aGVtIHdpdGggdGhlIHBheWxvYWRcbiAgcGF5bG9hZC5wdWJSZXF1ZXN0cyA9IHRoaXMudHJhY2VyU3RvcmUuY29sbGVjdFRyYWNlcygpO1xuXG4gIHJldHVybiBwYXlsb2FkO1xufTtcblxuUHVic3ViTW9kZWwucHJvdG90eXBlLmluY3JlbWVudEhhbmRsZUNvdW50ID0gZnVuY3Rpb24odHJhY2UsIGlzQ2FjaGVkKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgcHVibGljYXRpb25OYW1lID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKHRyYWNlLm5hbWUpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb25OYW1lKTtcblxuICB2YXIgc2Vzc2lvbiA9IGdldFByb3BlcnR5KE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMsIHRyYWNlLnNlc3Npb24pO1xuICBpZihzZXNzaW9uKSB7XG4gICAgdmFyIHN1YiA9IGdldFByb3BlcnR5KHNlc3Npb24uX25hbWVkU3VicywgdHJhY2UuaWQpO1xuICAgIGlmKHN1Yikge1xuICAgICAgc3ViLl90b3RhbE9ic2VydmVycyA9IHN1Yi5fdG90YWxPYnNlcnZlcnMgfHwgMDtcbiAgICAgIHN1Yi5fY2FjaGVkT2JzZXJ2ZXJzID0gc3ViLl9jYWNoZWRPYnNlcnZlcnMgfHwgMDtcbiAgICB9XG4gIH1cbiAgLy8gbm90IHN1cmUsIHdlIG5lZWQgdG8gZG8gdGhpcz8gQnV0IEkgZG9uJ3QgbmVlZCB0byBicmVhayB0aGUgaG93ZXZlclxuICBzdWIgPSBzdWIgfHwge190b3RhbE9ic2VydmVyczowICwgX2NhY2hlZE9ic2VydmVyczogMH07XG5cbiAgcHVibGljYXRpb24udG90YWxPYnNlcnZlcnMrKztcbiAgc3ViLl90b3RhbE9ic2VydmVycysrO1xuICBpZihpc0NhY2hlZCkge1xuICAgIHB1YmxpY2F0aW9uLmNhY2hlZE9ic2VydmVycysrO1xuICAgIHN1Yi5fY2FjaGVkT2JzZXJ2ZXJzKys7XG4gIH1cbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLnRyYWNrQ3JlYXRlZE9ic2VydmVyID0gZnVuY3Rpb24oaW5mbykge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIHB1YmxpY2F0aW9uTmFtZSA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZShpbmZvLm5hbWUpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb25OYW1lKTtcbiAgcHVibGljYXRpb24uY3JlYXRlZE9ic2VydmVycysrO1xufVxuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUudHJhY2tEZWxldGVkT2JzZXJ2ZXIgPSBmdW5jdGlvbihpbmZvKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgcHVibGljYXRpb25OYW1lID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKGluZm8ubmFtZSk7XG4gIHZhciBwdWJsaWNhdGlvbiA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbk5hbWUpO1xuICBwdWJsaWNhdGlvbi5kZWxldGVkT2JzZXJ2ZXJzKys7XG4gIHB1YmxpY2F0aW9uLm9ic2VydmVyTGlmZXRpbWUgKz0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIGluZm8uc3RhcnRUaW1lO1xufVxuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUudHJhY2tEb2N1bWVudENoYW5nZXMgPSBmdW5jdGlvbihpbmZvLCBvcCkge1xuICAvLyBJdCdzIHBvc3NpYmVsIHRoYXQgaW5mbyB0byBiZSBudWxsXG4gIC8vIFNwZWNpYWxseSB3aGVuIGdldHRpbmcgY2hhbmdlcyBhdCB0aGUgdmVyeSBiZWdpbmluZy5cbiAgLy8gVGhpcyBtYXkgYmUgZmFsc2UsIGJ1dCBuaWNlIHRvIGhhdmUgYSBjaGVja1xuICBpZighaW5mbykge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHRpbWVzdGFtcCA9IE50cC5fbm93KCk7XG4gIHZhciBwdWJsaWNhdGlvbk5hbWUgPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUoaW5mby5uYW1lKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uTmFtZSk7XG4gIGlmKG9wLm9wID09PSBcImRcIikge1xuICAgIHB1YmxpY2F0aW9uLm9wbG9nRGVsZXRlZERvY3VtZW50cysrO1xuICB9IGVsc2UgaWYob3Aub3AgPT09IFwiaVwiKSB7XG4gICAgcHVibGljYXRpb24ub3Bsb2dJbnNlcnRlZERvY3VtZW50cysrO1xuICB9IGVsc2UgaWYob3Aub3AgPT09IFwidVwiKSB7XG4gICAgcHVibGljYXRpb24ub3Bsb2dVcGRhdGVkRG9jdW1lbnRzKys7XG4gIH1cbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLnRyYWNrUG9sbGVkRG9jdW1lbnRzID0gZnVuY3Rpb24oaW5mbywgY291bnQpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IE50cC5fbm93KCk7XG4gIHZhciBwdWJsaWNhdGlvbk5hbWUgPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUoaW5mby5uYW1lKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uTmFtZSk7XG4gIHB1YmxpY2F0aW9uLnBvbGxlZERvY3VtZW50cyArPSBjb3VudDtcbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLnRyYWNrTGl2ZVVwZGF0ZXMgPSBmdW5jdGlvbihpbmZvLCB0eXBlLCBjb3VudCkge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIHB1YmxpY2F0aW9uTmFtZSA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZShpbmZvLm5hbWUpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb25OYW1lKTtcblxuICBpZih0eXBlID09PSBcIl9hZGRQdWJsaXNoZWRcIikge1xuICAgIHB1YmxpY2F0aW9uLmxpdmVBZGRlZERvY3VtZW50cyArPSBjb3VudDtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiX3JlbW92ZVB1Ymxpc2hlZFwiKSB7XG4gICAgcHVibGljYXRpb24ubGl2ZVJlbW92ZWREb2N1bWVudHMgKz0gY291bnQ7XG4gIH0gZWxzZSBpZih0eXBlID09PSBcIl9jaGFuZ2VQdWJsaXNoZWRcIikge1xuICAgIHB1YmxpY2F0aW9uLmxpdmVDaGFuZ2VkRG9jdW1lbnRzICs9IGNvdW50O1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJfaW5pdGlhbEFkZHNcIikge1xuICAgIHB1YmxpY2F0aW9uLmluaXRpYWxseUFkZGVkRG9jdW1lbnRzICs9IGNvdW50O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkthZGlyYTogVW5rbm93biBsaXZlIHVwZGF0ZSB0eXBlXCIpO1xuICB9XG59XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS50cmFja0RvY1NpemUgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBzaXplKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgcHVibGljYXRpb25OYW1lID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKG5hbWUpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb25OYW1lKTtcblxuICBpZih0eXBlID09PSBcInBvbGxlZEZldGNoZXNcIikge1xuICAgIHB1YmxpY2F0aW9uLnBvbGxlZERvY1NpemUgKz0gc2l6ZTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwibGl2ZUZldGNoZXNcIikge1xuICAgIHB1YmxpY2F0aW9uLmxpdmVGZXRjaGVkRG9jU2l6ZSArPSBzaXplO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJjdXJzb3JGZXRjaGVzXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5mZXRjaGVkRG9jU2l6ZSArPSBzaXplO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJpbml0aWFsRmV0Y2hlc1wiKSB7XG4gICAgcHVibGljYXRpb24uaW5pdGlhbGx5RmV0Y2hlZERvY1NpemUgKz0gc2l6ZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLYWRpcmE6IFVua25vd24gZG9jcyBmZXRjaGVkIHR5cGVcIik7XG4gIH1cbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLnRyYWNrTXNnU2l6ZSA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIHNpemUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IE50cC5fbm93KCk7XG4gIHZhciBwdWJsaWNhdGlvbk5hbWUgPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUobmFtZSk7XG4gIHZhciBwdWJsaWNhdGlvbiA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbk5hbWUpO1xuXG4gIGlmKHR5cGUgPT09IFwibGl2ZVNlbnRcIikge1xuICAgIHB1YmxpY2F0aW9uLmxpdmVTZW50TXNnU2l6ZSArPSBzaXplO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJpbml0aWFsU2VudFwiKSB7XG4gICAgcHVibGljYXRpb24uaW5pdGlhbGx5U2VudE1zZ1NpemUgKz0gc2l6ZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLYWRpcmE6IFVua25vd24gZG9jcyBmZXRjaGVkIHR5cGVcIik7XG4gIH1cbn1cbiIsInZhciBFdmVudExvb3BNb25pdG9yID0gTnBtLnJlcXVpcmUoJ2V2bG9vcC1tb25pdG9yJyk7XG5pbXBvcnQgeyBjcmVhdGVIaXN0b2dyYW0gfSBmcm9tICcuLi91dGlscy5qcyc7XG5pbXBvcnQgR0NNZXRyaWNzIGZyb20gJy4uL2hpamFjay9nYy5qcyc7XG5pbXBvcnQgeyBnZXRGaWJlck1ldHJpY3MsIHJlc2V0RmliZXJNZXRyaWNzIH0gZnJvbSAnLi4vaGlqYWNrL2FzeW5jLmpzJztcbmltcG9ydCB7IGdldE1vbmdvRHJpdmVyU3RhdHMsIHJlc2V0TW9uZ29Ecml2ZXJTdGF0cyB9IGZyb20gJy4uL2hpamFjay9tb25nb19kcml2ZXJfZXZlbnRzLmpzJztcblxuU3lzdGVtTW9kZWwgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RhcnRUaW1lID0gTnRwLl9ub3coKTtcbiAgdGhpcy5uZXdTZXNzaW9ucyA9IDA7XG4gIHRoaXMuc2Vzc2lvblRpbWVvdXQgPSAxMDAwICogNjAgKiAzMDsgLy8zMCBtaW5cblxuICB0aGlzLmV2bG9vcEhpc3RvZ3JhbSA9IGNyZWF0ZUhpc3RvZ3JhbSgpO1xuICB0aGlzLmV2bG9vcE1vbml0b3IgPSBuZXcgRXZlbnRMb29wTW9uaXRvcigyMDApO1xuICB0aGlzLmV2bG9vcE1vbml0b3Iuc3RhcnQoKTtcbiAgdGhpcy5ldmxvb3BNb25pdG9yLm9uKCdsYWcnLCBsYWcgPT4ge1xuICAgIC8vIHN0b3JlIGFzIG1pY3Jvc2Vjb25kXG4gICAgdGhpcy5ldmxvb3BIaXN0b2dyYW0uYWRkKGxhZyAqIDEwMDApO1xuICB9KTtcblxuICB0aGlzLmdjTWV0cmljcyA9IG5ldyBHQ01ldHJpY3MoKTtcbiAgdGhpcy5nY01ldHJpY3Muc3RhcnQoKTtcblxuXG4gIHRoaXMuY3B1VGltZSA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gIHRoaXMucHJldmlvdXNDcHVVc2FnZSA9IHByb2Nlc3MuY3B1VXNhZ2UoKTtcbiAgdGhpcy5jcHVIaXN0b3J5ID0gW107XG4gIHRoaXMuY3VycmVudENwdVVzYWdlID0gMDtcblxuICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgdGhpcy5jcHVVc2FnZSgpO1xuICB9LCAyMDAwKTtcbn1cblxuXy5leHRlbmQoU3lzdGVtTW9kZWwucHJvdG90eXBlLCBLYWRpcmFNb2RlbC5wcm90b3R5cGUpO1xuXG5TeXN0ZW1Nb2RlbC5wcm90b3R5cGUuYnVpbGRQYXlsb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtZXRyaWNzID0ge307XG4gIHZhciBub3cgPSBOdHAuX25vdygpO1xuICBtZXRyaWNzLnN0YXJ0VGltZSA9IEthZGlyYS5zeW5jZWREYXRlLnN5bmNUaW1lKHRoaXMuc3RhcnRUaW1lKTtcbiAgbWV0cmljcy5lbmRUaW1lID0gS2FkaXJhLnN5bmNlZERhdGUuc3luY1RpbWUobm93KTtcbiAgbWV0cmljcy5zZXNzaW9ucyA9IGNvdW50S2V5cyhNZXRlb3Iuc2VydmVyLnNlc3Npb25zKTtcblxuICBsZXQgbWVtb3J5VXNhZ2UgPSBwcm9jZXNzLm1lbW9yeVVzYWdlKCk7XG4gIG1ldHJpY3MubWVtb3J5ID0gbWVtb3J5VXNhZ2UucnNzIC8gKDEwMjQqMTAyNCk7XG4gIG1ldHJpY3MubWVtb3J5QXJyYXlCdWZmZXJzID0gKG1lbW9yeVVzYWdlLmFycmF5QnVmZmVycyB8fCAwKSAvICgxMDI0KjEwMjQpO1xuICBtZXRyaWNzLm1lbW9yeUV4dGVybmFsID0gbWVtb3J5VXNhZ2UuZXh0ZXJuYWwgLyAoMTAyNCoxMDI0KTtcbiAgbWV0cmljcy5tZW1vcnlIZWFwVXNlZCA9IG1lbW9yeVVzYWdlLmhlYXBVc2VkIC8gKDEwMjQqMTAyNCk7XG4gIG1ldHJpY3MubWVtb3J5SGVhcFRvdGFsID0gbWVtb3J5VXNhZ2UuaGVhcFRvdGFsIC8gKDEwMjQqMTAyNCk7XG5cbiAgbWV0cmljcy5uZXdTZXNzaW9ucyA9IHRoaXMubmV3U2Vzc2lvbnM7XG4gIHRoaXMubmV3U2Vzc2lvbnMgPSAwO1xuXG4gIG1ldHJpY3MuYWN0aXZlUmVxdWVzdHMgPSBwcm9jZXNzLl9nZXRBY3RpdmVSZXF1ZXN0cygpLmxlbmd0aDtcbiAgbWV0cmljcy5hY3RpdmVIYW5kbGVzID0gcHJvY2Vzcy5fZ2V0QWN0aXZlSGFuZGxlcygpLmxlbmd0aDtcblxuICAvLyB0cmFjayBldmVudGxvb3AgbWV0cmljc1xuICBtZXRyaWNzLnBjdEV2bG9vcEJsb2NrID0gdGhpcy5ldmxvb3BNb25pdG9yLnN0YXR1cygpLnBjdEJsb2NrO1xuICBtZXRyaWNzLmV2bG9vcEhpc3RvZ3JhbSA9IHRoaXMuZXZsb29wSGlzdG9ncmFtO1xuICB0aGlzLmV2bG9vcEhpc3RvZ3JhbSA9IGNyZWF0ZUhpc3RvZ3JhbSgpO1xuXG4gIG1ldHJpY3MuZ2NNYWpvckR1cmF0aW9uID0gdGhpcy5nY01ldHJpY3MubWV0cmljcy5nY01ham9yO1xuICBtZXRyaWNzLmdjTWlub3JEdXJhdGlvbiA9IHRoaXMuZ2NNZXRyaWNzLm1ldHJpY3MuZ2NNaW5vcjtcbiAgbWV0cmljcy5nY0luY3JlbWVudGFsRHVyYXRpb24gPSB0aGlzLmdjTWV0cmljcy5tZXRyaWNzLmdjSW5jcmVtZW50YWw7XG4gIG1ldHJpY3MuZ2NXZWFrQ0JEdXJhdGlvbiA9IHRoaXMuZ2NNZXRyaWNzLm1ldHJpY3MuZ2NXZWFrQ0I7XG4gIHRoaXMuZ2NNZXRyaWNzLnJlc2V0KCk7XG5cbiAgY29uc3QgZHJpdmVyTWV0cmljcyA9IGdldE1vbmdvRHJpdmVyU3RhdHMoKTtcbiAgcmVzZXRNb25nb0RyaXZlclN0YXRzKCk7XG5cbiAgbWV0cmljcy5tb25nb1Bvb2xTaXplID0gZHJpdmVyTWV0cmljcy5wb29sU2l6ZTtcbiAgbWV0cmljcy5tb25nb1Bvb2xQcmltYXJ5Q2hlY2tvdXRzID0gZHJpdmVyTWV0cmljcy5wcmltYXJ5Q2hlY2tvdXRzO1xuICBtZXRyaWNzLm1vbmdvUG9vbE90aGVyQ2hlY2tvdXRzID0gZHJpdmVyTWV0cmljcy5vdGhlckNoZWNrb3V0cztcbiAgbWV0cmljcy5tb25nb1Bvb2xDaGVja291dFRpbWUgPSBkcml2ZXJNZXRyaWNzLmNoZWNrb3V0VGltZTtcbiAgbWV0cmljcy5tb25nb1Bvb2xNYXhDaGVja291dFRpbWUgPSBkcml2ZXJNZXRyaWNzLm1heENoZWNrb3V0VGltZTtcbiAgbWV0cmljcy5tb25nb1Bvb2xQZW5kaW5nID0gZHJpdmVyTWV0cmljcy5wZW5kaW5nO1xuICBtZXRyaWNzLm1vbmdvUG9vbENoZWNrZWRPdXRDb25uZWN0aW9ucyA9IGRyaXZlck1ldHJpY3MuY2hlY2tlZE91dDtcbiAgbWV0cmljcy5tb25nb1Bvb2xDcmVhdGVkQ29ubmVjdGlvbnMgPSBkcml2ZXJNZXRyaWNzLmNyZWF0ZWQ7XG5cbiAgY29uc3QgZmliZXJNZXRyaWNzID0gZ2V0RmliZXJNZXRyaWNzKCk7XG4gIHJlc2V0RmliZXJNZXRyaWNzKCk7XG4gIG1ldHJpY3MuY3JlYXRlZEZpYmVycyA9IGZpYmVyTWV0cmljcy5jcmVhdGVkO1xuICBtZXRyaWNzLmFjdGl2ZUZpYmVycyA9IGZpYmVyTWV0cmljcy5hY3RpdmU7XG4gIG1ldHJpY3MuZmliZXJQb29sU2l6ZSA9IGZpYmVyTWV0cmljcy5wb29sU2l6ZTtcblxuICBtZXRyaWNzLnBjcHUgPSAwO1xuICBtZXRyaWNzLnBjcHVVc2VyID0gMDtcbiAgbWV0cmljcy5wY3B1U3lzdGVtID0gMDtcblxuICBpZiAodGhpcy5jcHVIaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICBsZXQgbGFzdENwdVVzYWdlID0gdGhpcy5jcHVIaXN0b3J5W3RoaXMuY3B1SGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICBtZXRyaWNzLnBjcHUgPSBsYXN0Q3B1VXNhZ2UudXNhZ2UgKiAxMDA7XG4gICAgbWV0cmljcy5wY3B1VXNlciA9IGxhc3RDcHVVc2FnZS51c2VyICogMTAwO1xuICAgIG1ldHJpY3MucGNwdVN5c3RlbSA9IGxhc3RDcHVVc2FnZS5zeXMgKiAxMDA7XG4gIH1cblxuICBtZXRyaWNzLmNwdUhpc3RvcnkgPSB0aGlzLmNwdUhpc3RvcnkubWFwKGVudHJ5ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdGltZTogS2FkaXJhLnN5bmNlZERhdGUuc3luY1RpbWUoZW50cnkudGltZSksXG4gICAgICB1c2FnZTogZW50cnkudXNhZ2UsXG4gICAgICBzeXM6IGVudHJ5LnN5cyxcbiAgICAgIHVzZXI6IGVudHJ5LnVzZXJcbiAgICB9O1xuICB9KTtcblxuICB0aGlzLmNwdUhpc3RvcnkgPSBbXTtcbiAgdGhpcy5zdGFydFRpbWUgPSBub3c7XG4gIHJldHVybiB7c3lzdGVtTWV0cmljczogW21ldHJpY3NdfTtcbn07XG5cbmZ1bmN0aW9uIGhydGltZVRvTVMoaHJ0aW1lKSB7XG4gIHJldHVybiBocnRpbWVbMF0gKiAxMDAwICsgaHJ0aW1lWzFdIC8gMTAwMDAwMDtcbn1cblxuU3lzdGVtTW9kZWwucHJvdG90eXBlLmNwdVVzYWdlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBlbGFwVGltZU1TID0gaHJ0aW1lVG9NUyhwcm9jZXNzLmhydGltZSh0aGlzLmNwdVRpbWUpKTtcbiAgdmFyIGVsYXBVc2FnZSA9IHByb2Nlc3MuY3B1VXNhZ2UodGhpcy5wcmV2aW91c0NwdVVzYWdlKTtcbiAgdmFyIGVsYXBVc2VyTVMgPSBlbGFwVXNhZ2UudXNlciAvIDEwMDA7XG4gIHZhciBlbGFwU3lzdE1TID0gZWxhcFVzYWdlLnN5c3RlbSAvIDEwMDA7XG4gIHZhciB0b3RhbFVzYWdlTVMgPSBlbGFwVXNlck1TICsgZWxhcFN5c3RNUztcbiAgdmFyIHRvdGFsVXNhZ2VQZXJjZW50ID0gdG90YWxVc2FnZU1TIC8gZWxhcFRpbWVNUztcblxuICB0aGlzLmNwdUhpc3RvcnkucHVzaCh7XG4gICAgdGltZTogTnRwLl9ub3coKSxcbiAgICB1c2FnZTogdG90YWxVc2FnZVBlcmNlbnQsXG4gICAgdXNlcjogZWxhcFVzZXJNUyAvIGVsYXBUaW1lTVMsXG4gICAgc3lzOiBlbGFwU3lzdE1TIC8gZWxhcFVzYWdlLnN5c3RlbVxuICB9KTtcblxuICB0aGlzLmN1cnJlbnRDcHVVc2FnZSA9IHRvdGFsVXNhZ2VQZXJjZW50ICogMTAwO1xuICBLYWRpcmEuZG9jU3pDYWNoZS5zZXRQY3B1KHRoaXMuY3VycmVudENwdVVzYWdlKTtcblxuICB0aGlzLmNwdVRpbWUgPSBwcm9jZXNzLmhydGltZSgpO1xuICB0aGlzLnByZXZpb3VzQ3B1VXNhZ2UgPSBwcm9jZXNzLmNwdVVzYWdlKCk7XG59XG5cblN5c3RlbU1vZGVsLnByb3RvdHlwZS5oYW5kbGVTZXNzaW9uQWN0aXZpdHkgPSBmdW5jdGlvbihtc2csIHNlc3Npb24pIHtcbiAgaWYobXNnLm1zZyA9PT0gJ2Nvbm5lY3QnICYmICFtc2cuc2Vzc2lvbikge1xuICAgIHRoaXMuY291bnROZXdTZXNzaW9uKHNlc3Npb24pO1xuICB9IGVsc2UgaWYoWydzdWInLCAnbWV0aG9kJ10uaW5kZXhPZihtc2cubXNnKSAhPSAtMSkge1xuICAgIGlmKCF0aGlzLmlzU2Vzc2lvbkFjdGl2ZShzZXNzaW9uKSkge1xuICAgICAgdGhpcy5jb3VudE5ld1Nlc3Npb24oc2Vzc2lvbik7XG4gICAgfVxuICB9XG4gIHNlc3Npb24uX2FjdGl2ZUF0ID0gRGF0ZS5ub3coKTtcbn1cblxuU3lzdGVtTW9kZWwucHJvdG90eXBlLmNvdW50TmV3U2Vzc2lvbiA9IGZ1bmN0aW9uKHNlc3Npb24pIHtcbiAgaWYoIWlzTG9jYWxBZGRyZXNzKHNlc3Npb24uc29ja2V0KSkge1xuICAgIHRoaXMubmV3U2Vzc2lvbnMrKztcbiAgfVxufVxuXG5TeXN0ZW1Nb2RlbC5wcm90b3R5cGUuaXNTZXNzaW9uQWN0aXZlID0gZnVuY3Rpb24oc2Vzc2lvbikge1xuICB2YXIgaW5hY3RpdmVUaW1lID0gRGF0ZS5ub3coKSAtIHNlc3Npb24uX2FjdGl2ZUF0O1xuICByZXR1cm4gaW5hY3RpdmVUaW1lIDwgdGhpcy5zZXNzaW9uVGltZW91dDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBodHRwOi8vcmVnZXgxMDEuY29tL3IvaUYzeVIzLzJcbnZhciBpc0xvY2FsSG9zdFJlZ2V4ID0gL14oPzouKlxcLmxvY2FsfGxvY2FsaG9zdCkoPzpcXDpcXGQrKT98MTI3KD86XFwuXFxkezEsM30pezN9fDE5MlxcLjE2OCg/OlxcLlxcZHsxLDN9KXsyfXwxMCg/OlxcLlxcZHsxLDN9KXszfXwxNzJcXC4oPzoxWzYtOV18MlxcZHwzWzAtMV0pKD86XFwuXFxkezEsM30pezJ9JC87XG5cbi8vIGh0dHA6Ly9yZWdleDEwMS5jb20vci9oTTVnRDgvMVxudmFyIGlzTG9jYWxBZGRyZXNzUmVnZXggPSAvXjEyNyg/OlxcLlxcZHsxLDN9KXszfXwxOTJcXC4xNjgoPzpcXC5cXGR7MSwzfSl7Mn18MTAoPzpcXC5cXGR7MSwzfSl7M318MTcyXFwuKD86MVs2LTldfDJcXGR8M1swLTFdKSg/OlxcLlxcZHsxLDN9KXsyfSQvO1xuXG5mdW5jdGlvbiBpc0xvY2FsQWRkcmVzcyAoc29ja2V0KSB7XG4gIHZhciBob3N0ID0gc29ja2V0LmhlYWRlcnNbJ2hvc3QnXTtcbiAgaWYoaG9zdCkgcmV0dXJuIGlzTG9jYWxIb3N0UmVnZXgudGVzdChob3N0KTtcbiAgdmFyIGFkZHJlc3MgPSBzb2NrZXQuaGVhZGVyc1sneC1mb3J3YXJkZWQtZm9yJ10gfHwgc29ja2V0LnJlbW90ZUFkZHJlc3M7XG4gIGlmKGFkZHJlc3MpIHJldHVybiBpc0xvY2FsQWRkcmVzc1JlZ2V4LnRlc3QoYWRkcmVzcyk7XG59XG4iLCJFcnJvck1vZGVsID0gZnVuY3Rpb24gKGFwcElkKSB7XG4gIEJhc2VFcnJvck1vZGVsLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5hcHBJZCA9IGFwcElkO1xuICB0aGlzLmVycm9ycyA9IHt9O1xuICB0aGlzLnN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gIHRoaXMubWF4RXJyb3JzID0gMTA7XG59XG5cbk9iamVjdC5hc3NpZ24oRXJyb3JNb2RlbC5wcm90b3R5cGUsIEthZGlyYU1vZGVsLnByb3RvdHlwZSk7XG5PYmplY3QuYXNzaWduKEVycm9yTW9kZWwucHJvdG90eXBlLCBCYXNlRXJyb3JNb2RlbC5wcm90b3R5cGUpO1xuXG5FcnJvck1vZGVsLnByb3RvdHlwZS5idWlsZFBheWxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1ldHJpY3MgPSBfLnZhbHVlcyh0aGlzLmVycm9ycyk7XG4gIHRoaXMuc3RhcnRUaW1lID0gTnRwLl9ub3coKTtcblxuICBtZXRyaWNzLmZvckVhY2goZnVuY3Rpb24gKG1ldHJpYykge1xuICAgIG1ldHJpYy5zdGFydFRpbWUgPSBLYWRpcmEuc3luY2VkRGF0ZS5zeW5jVGltZShtZXRyaWMuc3RhcnRUaW1lKVxuICB9KTtcblxuICB0aGlzLmVycm9ycyA9IHt9O1xuICByZXR1cm4ge2Vycm9yczogbWV0cmljc307XG59O1xuXG5FcnJvck1vZGVsLnByb3RvdHlwZS5lcnJvckNvdW50ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gXy52YWx1ZXModGhpcy5lcnJvcnMpLmxlbmd0aDtcbn07XG5cbkVycm9yTW9kZWwucHJvdG90eXBlLnRyYWNrRXJyb3IgPSBmdW5jdGlvbihleCwgdHJhY2UpIHtcbiAgdmFyIGtleSA9IHRyYWNlLnR5cGUgKyAnOicgKyBleC5tZXNzYWdlO1xuICBpZih0aGlzLmVycm9yc1trZXldKSB7XG4gICAgdGhpcy5lcnJvcnNba2V5XS5jb3VudCsrO1xuICB9IGVsc2UgaWYgKHRoaXMuZXJyb3JDb3VudCgpIDwgdGhpcy5tYXhFcnJvcnMpIHtcbiAgICB2YXIgZXJyb3JEZWYgPSB0aGlzLl9mb3JtYXRFcnJvcihleCwgdHJhY2UpO1xuICAgIGlmKHRoaXMuYXBwbHlGaWx0ZXJzKGVycm9yRGVmLnR5cGUsIGVycm9yRGVmLm5hbWUsIGV4LCBlcnJvckRlZi5zdWJUeXBlKSkge1xuICAgICAgdGhpcy5lcnJvcnNba2V5XSA9IHRoaXMuX2Zvcm1hdEVycm9yKGV4LCB0cmFjZSk7XG4gICAgfVxuICB9XG59O1xuXG5FcnJvck1vZGVsLnByb3RvdHlwZS5fZm9ybWF0RXJyb3IgPSBmdW5jdGlvbihleCwgdHJhY2UpIHtcbiAgdmFyIHRpbWUgPSBEYXRlLm5vdygpO1xuICB2YXIgc3RhY2sgPSBleC5zdGFjaztcblxuICAvLyB0byBnZXQgTWV0ZW9yJ3MgRXJyb3IgZGV0YWlsc1xuICBpZihleC5kZXRhaWxzKSB7XG4gICAgc3RhY2sgPSBcIkRldGFpbHM6IFwiICsgZXguZGV0YWlscyArIFwiXFxyXFxuXCIgKyBzdGFjaztcbiAgfVxuXG4gIC8vIFVwZGF0ZSB0cmFjZSdzIGVycm9yIGV2ZW50IHdpdGggdGhlIG5leHQgc3RhY2tcbiAgdmFyIGVycm9yRXZlbnQgPSB0cmFjZS5ldmVudHMgJiYgdHJhY2UuZXZlbnRzW3RyYWNlLmV2ZW50cy5sZW5ndGggLTFdO1xuICB2YXIgZXJyb3JPYmplY3QgPSBlcnJvckV2ZW50ICYmIGVycm9yRXZlbnRbMl0gJiYgZXJyb3JFdmVudFsyXS5lcnJvcjtcblxuICBpZihlcnJvck9iamVjdCkge1xuICAgIGVycm9yT2JqZWN0LnN0YWNrID0gc3RhY2s7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFwcElkOiB0aGlzLmFwcElkLFxuICAgIG5hbWU6IGV4Lm1lc3NhZ2UsXG4gICAgdHlwZTogdHJhY2UudHlwZSxcbiAgICBzdGFydFRpbWU6IHRpbWUsXG4gICAgc3ViVHlwZTogdHJhY2Uuc3ViVHlwZSB8fCB0cmFjZS5uYW1lLFxuICAgIHRyYWNlOiB0cmFjZSxcbiAgICBzdGFja3M6IFt7c3RhY2s6IHN0YWNrfV0sXG4gICAgY291bnQ6IDFcbiAgfVxufTtcbiIsImNvbnN0IHsgRERTa2V0Y2ggfSA9IHJlcXVpcmUoJ21vbnRpLWFwbS1za2V0Y2hlcy1qcycpO1xuXG5jb25zdCBNRVRIT0RfTUVUUklDU19GSUVMRFMgPSBbJ2RiJywgJ2h0dHAnLCAnZW1haWwnLCAnYXN5bmMnLCAnY29tcHV0ZScsICd0b3RhbCcsICdmcyddO1xuXG5cbmNvbnN0IEh0dHBNb2RlbCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5tZXRyaWNzQnlNaW51dGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLnRyYWNlclN0b3JlID0gbmV3IFRyYWNlclN0b3JlKHtcbiAgICBpbnRlcnZhbDogMTAwMCAqIDEwLFxuICAgIG1heFRvdGFsUG9pbnRzOiAzMCxcbiAgICBhcmNoaXZlRXZlcnk6IDEwXG4gIH0pO1xuXG4gIHRoaXMudHJhY2VyU3RvcmUuc3RhcnQoKTtcbn1cblxuXy5leHRlbmQoSHR0cE1vZGVsLnByb3RvdHlwZSwgS2FkaXJhTW9kZWwucHJvdG90eXBlKTtcblxuSHR0cE1vZGVsLnByb3RvdHlwZS5wcm9jZXNzUmVxdWVzdCA9IGZ1bmN0aW9uICh0cmFjZSwgcmVxLCByZXMpIHtcbiAgY29uc3QgZGF0ZUlkID0gdGhpcy5fZ2V0RGF0ZUlkKHRyYWNlLmF0KTtcbiAgdGhpcy5fYXBwZW5kTWV0cmljcyhkYXRlSWQsIHRyYWNlLCByZXMpO1xuICB0aGlzLnRyYWNlclN0b3JlLmFkZFRyYWNlKHRyYWNlKTtcbn1cblxuSHR0cE1vZGVsLnByb3RvdHlwZS5fZ2V0TWV0cmljcyA9IGZ1bmN0aW9uICh0aW1lc3RhbXAsIHJvdXRlSWQpIHtcbiAgY29uc3QgZGF0ZUlkID0gdGhpcy5fZ2V0RGF0ZUlkKHRpbWVzdGFtcCk7XG5cbiAgaWYgKCF0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdKSB7XG4gICAgdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXSA9IHtcbiAgICAgIHJvdXRlczogT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIH07XG4gIH1cblxuICBjb25zdCByb3V0ZXMgPSB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnJvdXRlcztcblxuICBpZiAoIXJvdXRlc1tyb3V0ZUlkXSkge1xuICAgIHJvdXRlc1tyb3V0ZUlkXSA9IHtcbiAgICAgIGhpc3RvZ3JhbTogbmV3IEREU2tldGNoKHtcbiAgICAgICAgYWxwaGE6IDAuMDIsXG4gICAgICB9KSxcbiAgICAgIGNvdW50OiAwLFxuICAgICAgZXJyb3JzOiAwLFxuICAgICAgc3RhdHVzQ29kZXM6IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICB9O1xuXG4gICAgTUVUSE9EX01FVFJJQ1NfRklFTERTLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByb3V0ZXNbcm91dGVJZF1bZmllbGRdID0gMDtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnJvdXRlc1tyb3V0ZUlkXTtcbn1cblxuSHR0cE1vZGVsLnByb3RvdHlwZS5fYXBwZW5kTWV0cmljcyA9IGZ1bmN0aW9uIChkYXRlSWQsIHRyYWNlLCByZXMpIHtcbiAgdmFyIHJlcXVlc3RNZXRyaWNzID0gdGhpcy5fZ2V0TWV0cmljcyhkYXRlSWQsIHRyYWNlLm5hbWUpO1xuXG4gIGlmICghdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5zdGFydFRpbWUpIHtcbiAgICB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnN0YXJ0VGltZSA9IHRyYWNlLmF0O1xuICB9XG5cbiAgLy8gbWVyZ2VcbiAgTUVUSE9EX01FVFJJQ1NfRklFTERTLmZvckVhY2goZmllbGQgPT4ge1xuICAgIHZhciB2YWx1ZSA9IHRyYWNlLm1ldHJpY3NbZmllbGRdO1xuICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgIHJlcXVlc3RNZXRyaWNzW2ZpZWxkXSArPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IHN0YXR1c0NvZGUgPSByZXMuc3RhdHVzQ29kZTtcbiAgbGV0IHN0YXR1c01ldHJpYztcblxuICBpZiAoc3RhdHVzQ29kZSA8IDIwMCkge1xuICAgIHN0YXR1c01ldHJpYyA9ICcxeHgnO1xuICB9IGVsc2UgaWYgKHN0YXR1c0NvZGUgPCAzMDApIHtcbiAgICBzdGF0dXNNZXRyaWMgPSAnMnh4JztcbiAgfSBlbHNlIGlmIChzdGF0dXNDb2RlIDwgNDAwKSB7XG4gICAgc3RhdHVzTWV0cmljID0gJzN4eCc7XG4gIH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA8IDUwMCkge1xuICAgIHN0YXR1c01ldHJpYyA9ICc0eHgnO1xuICB9IGVsc2UgaWYgKHN0YXR1c0NvZGUgPCA2MDApIHtcbiAgICBzdGF0dXNNZXRyaWMgPSAnNXh4JztcbiAgfVxuXG4gIHJlcXVlc3RNZXRyaWNzLnN0YXR1c0NvZGVzW3N0YXR1c01ldHJpY10gPSByZXF1ZXN0TWV0cmljcy5zdGF0dXNDb2Rlc1tzdGF0dXNNZXRyaWNdIHx8IDA7XG4gIHJlcXVlc3RNZXRyaWNzLnN0YXR1c0NvZGVzW3N0YXR1c01ldHJpY10gKz0gMTtcblxuICByZXF1ZXN0TWV0cmljcy5jb3VudCArPSAxO1xuICByZXF1ZXN0TWV0cmljcy5oaXN0b2dyYW0uYWRkKHRyYWNlLm1ldHJpY3MudG90YWwpO1xuICB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLmVuZFRpbWUgPSB0cmFjZS5tZXRyaWNzLmF0O1xufVxuXG5IdHRwTW9kZWwucHJvdG90eXBlLmJ1aWxkUGF5bG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF5bG9hZCA9IHtcbiAgICBodHRwTWV0cmljczogW10sXG4gICAgaHR0cFJlcXVlc3RzOiBbXVxuICB9O1xuXG4gIHZhciBtZXRyaWNzQnlNaW51dGUgPSB0aGlzLm1ldHJpY3NCeU1pbnV0ZTtcbiAgdGhpcy5tZXRyaWNzQnlNaW51dGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGZvcih2YXIga2V5IGluIG1ldHJpY3NCeU1pbnV0ZSkge1xuICAgIHZhciBtZXRyaWNzID0gbWV0cmljc0J5TWludXRlW2tleV07XG4gICAgLy8gY29udmVydCBzdGFydFRpbWUgaW50byB0aGUgYWN0dWFsIHNlcnZlclRpbWVcbiAgICB2YXIgc3RhcnRUaW1lID0gbWV0cmljcy5zdGFydFRpbWU7XG4gICAgbWV0cmljcy5zdGFydFRpbWUgPSBLYWRpcmEuc3luY2VkRGF0ZS5zeW5jVGltZShzdGFydFRpbWUpO1xuXG4gICAgZm9yKHZhciByZXF1ZXN0TmFtZSBpbiBtZXRyaWNzLnJvdXRlcykge1xuICAgICAgTUVUSE9EX01FVFJJQ1NfRklFTERTLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIG1ldHJpY3Mucm91dGVzW3JlcXVlc3ROYW1lXVtmaWVsZF0gLz0gbWV0cmljcy5yb3V0ZXNbcmVxdWVzdE5hbWVdLmNvdW50O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcGF5bG9hZC5odHRwTWV0cmljcy5wdXNoKG1ldHJpY3NCeU1pbnV0ZVtrZXldKTtcbiAgfVxuXG4gIHBheWxvYWQuaHR0cFJlcXVlc3RzID0gdGhpcy50cmFjZXJTdG9yZS5jb2xsZWN0VHJhY2VzKCk7XG5cbiAgcmV0dXJuIHBheWxvYWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEh0dHBNb2RlbDtcbiIsInZhciBKb2JzID0gS2FkaXJhLkpvYnMgPSB7fTtcblxuSm9icy5nZXRBc3luYyA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICBLYWRpcmEuY29yZUFwaS5nZXRKb2IoaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpXG4gICAgfSk7XG59O1xuXG5cbkpvYnMuc2V0QXN5bmMgPSBmdW5jdGlvbihpZCwgY2hhbmdlcywgY2FsbGJhY2spIHtcbiAgS2FkaXJhLmNvcmVBcGkudXBkYXRlSm9iKGlkLCBjaGFuZ2VzKVxuICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKVxuICAgIH0pO1xufTtcblxuSm9icy5zZXQgPSBLYWRpcmEuX3dyYXBBc3luYyhKb2JzLnNldEFzeW5jKTtcbkpvYnMuZ2V0ID0gS2FkaXJhLl93cmFwQXN5bmMoSm9icy5nZXRBc3luYyk7XG4iLCIvLyBSZXRyeSBsb2dpYyB3aXRoIGFuIGV4cG9uZW50aWFsIGJhY2tvZmYuXG4vL1xuLy8gb3B0aW9uczpcbi8vICBiYXNlVGltZW91dDogdGltZSBmb3IgaW5pdGlhbCByZWNvbm5lY3QgYXR0ZW1wdCAobXMpLlxuLy8gIGV4cG9uZW50OiBleHBvbmVudGlhbCBmYWN0b3IgdG8gaW5jcmVhc2UgdGltZW91dCBlYWNoIGF0dGVtcHQuXG4vLyAgbWF4VGltZW91dDogbWF4aW11bSB0aW1lIGJldHdlZW4gcmV0cmllcyAobXMpLlxuLy8gIG1pbkNvdW50OiBob3cgbWFueSB0aW1lcyB0byByZWNvbm5lY3QgXCJpbnN0YW50bHlcIi5cbi8vICBtaW5UaW1lb3V0OiB0aW1lIHRvIHdhaXQgZm9yIHRoZSBmaXJzdCBgbWluQ291bnRgIHJldHJpZXMgKG1zKS5cbi8vICBmdXp6OiBmYWN0b3IgdG8gcmFuZG9taXplIHJldHJ5IHRpbWVzIGJ5ICh0byBhdm9pZCByZXRyeSBzdG9ybXMpLlxuXG4vL1RPRE86IHJlbW92ZSB0aGlzIGNsYXNzIGFuZCB1c2UgTWV0ZW9yIFJldHJ5IGluIGEgbGF0ZXIgdmVyc2lvbiBvZiBtZXRlb3IuXG5cblJldHJ5ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvciAoe1xuICAgIGJhc2VUaW1lb3V0ID0gMTAwMCwgLy8gMSBzZWNvbmRcbiAgICBleHBvbmVudCA9IDIuMixcbiAgICAvLyBUaGUgZGVmYXVsdCBpcyBoaWdoLWlzaCB0byBlbnN1cmUgYSBzZXJ2ZXIgY2FuIHJlY292ZXIgZnJvbSBhXG4gICAgLy8gZmFpbHVyZSBjYXVzZWQgYnkgbG9hZC5cbiAgICBtYXhUaW1lb3V0ID0gNSAqIDYwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICBtaW5UaW1lb3V0ID0gMTAsXG4gICAgbWluQ291bnQgPSAyLFxuICAgIGZ1enogPSAwLjUsIC8vICstIDI1JVxuICB9ID0ge30pIHtcbiAgICB0aGlzLmJhc2VUaW1lb3V0ID0gYmFzZVRpbWVvdXQ7XG4gICAgdGhpcy5leHBvbmVudCA9IGV4cG9uZW50O1xuICAgIHRoaXMubWF4VGltZW91dCA9IG1heFRpbWVvdXQ7XG4gICAgdGhpcy5taW5UaW1lb3V0ID0gbWluVGltZW91dDtcbiAgICB0aGlzLm1pbkNvdW50ID0gbWluQ291bnQ7XG4gICAgdGhpcy5mdXp6ID0gZnV6ejtcbiAgICB0aGlzLnJldHJ5VGltZXIgPSBudWxsO1xuICB9XG5cbiAgLy8gUmVzZXQgYSBwZW5kaW5nIHJldHJ5LCBpZiBhbnkuXG4gIGNsZWFyKCkge1xuICAgIGlmKHRoaXMucmV0cnlUaW1lcilcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJldHJ5VGltZXIpO1xuICAgIHRoaXMucmV0cnlUaW1lciA9IG51bGw7XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgaG93IGxvbmcgdG8gd2FpdCBpbiBtaWxsaXNlY29uZHMgdG8gcmV0cnksIGJhc2VkIG9uIHRoZVxuICAvLyBgY291bnRgIG9mIHdoaWNoIHJldHJ5IHRoaXMgaXMuXG4gIF90aW1lb3V0KGNvdW50KSB7XG4gICAgaWYoY291bnQgPCB0aGlzLm1pbkNvdW50KVxuICAgICAgcmV0dXJuIHRoaXMubWluVGltZW91dDtcblxuICAgIGxldCB0aW1lb3V0ID0gTWF0aC5taW4oXG4gICAgICB0aGlzLm1heFRpbWVvdXQsXG4gICAgICB0aGlzLmJhc2VUaW1lb3V0ICogTWF0aC5wb3codGhpcy5leHBvbmVudCwgY291bnQpKTtcbiAgICAvLyBmdXp6IHRoZSB0aW1lb3V0IHJhbmRvbWx5LCB0byBhdm9pZCByZWNvbm5lY3Qgc3Rvcm1zIHdoZW4gYVxuICAgIC8vIHNlcnZlciBnb2VzIGRvd24uXG4gICAgdGltZW91dCA9IHRpbWVvdXQgKiAoKFJhbmRvbS5mcmFjdGlvbigpICogdGhpcy5mdXp6KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgKDEgLSB0aGlzLmZ1enovMikpO1xuICAgIHJldHVybiBNYXRoLmNlaWwodGltZW91dCk7XG4gIH1cblxuICAvLyBDYWxsIGBmbmAgYWZ0ZXIgYSBkZWxheSwgYmFzZWQgb24gdGhlIGBjb3VudGAgb2Ygd2hpY2ggcmV0cnkgdGhpcyBpcy5cbiAgcmV0cnlMYXRlcihjb3VudCwgZm4pIHtcbiAgICBjb25zdCB0aW1lb3V0ID0gdGhpcy5fdGltZW91dChjb3VudCk7XG4gICAgaWYodGhpcy5yZXRyeVRpbWVyKVxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmV0cnlUaW1lcik7XG5cbiAgICB0aGlzLnJldHJ5VGltZXIgPSBzZXRUaW1lb3V0KGZuLCB0aW1lb3V0KTtcbiAgICByZXR1cm4gdGltZW91dDtcbiAgfVxuXG59XG5cbiIsImNvbnN0IHsgRERTa2V0Y2ggfSA9IHJlcXVpcmUoJ21vbnRpLWFwbS1za2V0Y2hlcy1qcycpO1xuXG5IYXZlQXN5bmNDYWxsYmFjayA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgdmFyIGxhc3RBcmcgPSBhcmdzW2FyZ3MubGVuZ3RoIC0xXTtcbiAgcmV0dXJuICh0eXBlb2YgbGFzdEFyZykgPT0gJ2Z1bmN0aW9uJztcbn07XG5cblVuaXF1ZUlkID0gZnVuY3Rpb24oc3RhcnQpIHtcbiAgdGhpcy5pZCA9IDA7XG59XG5cblVuaXF1ZUlkLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiXCIgKyB0aGlzLmlkKys7XG59O1xuXG5EZWZhdWx0VW5pcXVlSWQgPSBuZXcgVW5pcXVlSWQoKTtcblxuLy8gY3JlYXRlcyBhIHN0YWNrIHRyYWNlLCByZW1vdmluZyBmcmFtZXMgaW4gbW9udGlhcG06YWdlbnQncyBjb2RlXG5DcmVhdGVVc2VyU3RhY2sgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgY29uc3Qgc3RhY2sgPSAoZXJyb3IgfHwgbmV3IEVycm9yKCkpLnN0YWNrLnNwbGl0KCdcXG4nKTtcbiAgbGV0IHRvUmVtb3ZlID0gMTtcblxuICAvLyBGaW5kIGhvdyBtYW55IGZyYW1lcyBuZWVkIHRvIGJlIHJlbW92ZWRcbiAgLy8gdG8gbWFrZSB0aGUgdXNlcidzIGNvZGUgdGhlIGZpcnN0IGZyYW1lXG4gIGZvciAoOyB0b1JlbW92ZSA8IHN0YWNrLmxlbmd0aDsgdG9SZW1vdmUrKykge1xuICAgIGlmIChzdGFja1t0b1JlbW92ZV0uaW5kZXhPZignbW9udGlhcG06YWdlbnQnKSA9PT0gLTEpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGFjay5zbGljZSh0b1JlbW92ZSkuam9pbignXFxuJyk7XG59XG5cbi8vIE9wdGltaXplZCB2ZXJzaW9uIG9mIGFwcGx5IHdoaWNoIHRyaWVzIHRvIGNhbGwgYXMgcG9zc2libGUgYXMgaXQgY2FuXG4vLyBUaGVuIGZhbGwgYmFjayB0byBhcHBseVxuLy8gVGhpcyBpcyBiZWNhdXNlLCB2OCBpcyB2ZXJ5IHNsb3cgdG8gaW52b2tlIGFwcGx5LlxuT3B0aW1pemVkQXBwbHkgPSBmdW5jdGlvbiBPcHRpbWl6ZWRBcHBseShjb250ZXh0LCBmbiwgYXJncykge1xuICB2YXIgYSA9IGFyZ3M7XG4gIHN3aXRjaChhLmxlbmd0aCkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBmbi5jYWxsKGNvbnRleHQpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBmbi5jYWxsKGNvbnRleHQsIGFbMF0pO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBmbi5jYWxsKGNvbnRleHQsIGFbMF0sIGFbMV0pO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBmbi5jYWxsKGNvbnRleHQsIGFbMF0sIGFbMV0sIGFbMl0pO1xuICAgIGNhc2UgNDpcbiAgICAgIHJldHVybiBmbi5jYWxsKGNvbnRleHQsIGFbMF0sIGFbMV0sIGFbMl0sIGFbM10pO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBmbi5jYWxsKGNvbnRleHQsIGFbMF0sIGFbMV0sIGFbMl0sIGFbM10sIGFbNF0pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYSk7XG4gIH1cbn1cblxuZ2V0Q2xpZW50VmVyc2lvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgJ3dlYi5jb3Jkb3ZhJzogZ2V0Q2xpZW50QXJjaFZlcnNpb24oJ3dlYi5jb3Jkb3ZhJyksXG4gICAgJ3dlYi5icm93c2VyJzogZ2V0Q2xpZW50QXJjaFZlcnNpb24oJ3dlYi5icm93c2VyJyksXG4gICAgJ3dlYi5icm93c2VyLmxlZ2FjeSc6IGdldENsaWVudEFyY2hWZXJzaW9uKCd3ZWIuYnJvd3Nlci5sZWdhY3knKVxuICB9XG59XG5cbi8vIFJldHVybnMgbnVtYmVyIG9mIGtleXMgb2YgYW4gb2JqZWN0LCBvciBzaXplIG9mIGEgTWFwIG9yIFNldFxuY291bnRLZXlzID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAob2JqIGluc3RhbmNlb2YgTWFwIHx8IG9iaiBpbnN0YW5jZW9mIFNldCkge1xuICAgIHJldHVybiBvYmouc2l6ZTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbn1cblxuLy8gSXRlcmF0ZXMgb2JqZWN0cyBhbmQgbWFwcy5cbi8vIENhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIGEgdmFsdWUgYW5kIGtleVxuaXRlcmF0ZSA9IGZ1bmN0aW9uIChvYmosIGNhbGxiYWNrKSB7XG4gIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICByZXR1cm4gb2JqLmZvckVhY2goY2FsbGJhY2spO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgIGNhbGxiYWNrKHZhbHVlLCBrZXkpO1xuICB9XG59XG5cbi8vIFJldHVybnMgYSBwcm9wZXJ0eSBmcm9tIGFuIG9iamVjdCwgb3IgYW4gZW50cnkgZnJvbSBhIG1hcFxuZ2V0UHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBrZXkpIHtcbiAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHJldHVybiBvYmouZ2V0KGtleSk7XG4gIH1cblxuICByZXR1cm4gb2JqW2tleV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIaXN0b2dyYW0gKCkge1xuICByZXR1cm4gbmV3IEREU2tldGNoKHtcbiAgICBhbHBoYTogMC4wMlxuICB9KTtcbn1cbiIsInZhciBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuTnRwID0gZnVuY3Rpb24gKGVuZHBvaW50KSB7XG4gIHRoaXMucGF0aCA9ICcvc2ltcGxlbnRwL3N5bmMnO1xuICB0aGlzLnNldEVuZHBvaW50KGVuZHBvaW50KTtcbiAgdGhpcy5kaWZmID0gMDtcbiAgdGhpcy5zeW5jZWQgPSBmYWxzZTtcbiAgdGhpcy5yZVN5bmNDb3VudCA9IDA7XG4gIHRoaXMucmVTeW5jID0gbmV3IFJldHJ5KHtcbiAgICBiYXNlVGltZW91dDogMTAwMCo2MCxcbiAgICBtYXhUaW1lb3V0OiAxMDAwKjYwKjEwLFxuICAgIG1pbkNvdW50OiAwXG4gIH0pO1xufVxuXG5OdHAuX25vdyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgaWYodHlwZW9mIG5vdyA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBub3c7XG4gIH0gZWxzZSBpZihub3cgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgLy8gc29tZSBleHRlbmFsIEpTIGxpYnJhcmllcyBvdmVycmlkZSBEYXRlLm5vdyBhbmQgcmV0dXJucyBhIERhdGUgb2JqZWN0XG4gICAgLy8gd2hpY2ggZGlyZWN0bHkgYWZmZWN0IHVzLiBTbyB3ZSBuZWVkIHRvIHByZXBhcmUgZm9yIHRoYXRcbiAgICByZXR1cm4gbm93LmdldFRpbWUoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB0cnVzdCBtZS4gSSd2ZSBzZWVuIG5vdyA9PT0gdW5kZWZpbmVkXG4gICAgcmV0dXJuIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gIH1cbn07XG5cbk50cC5wcm90b3R5cGUuc2V0RW5kcG9pbnQgPSBmdW5jdGlvbihlbmRwb2ludCkge1xuICB0aGlzLmVuZHBvaW50ID0gZW5kcG9pbnQgPyBlbmRwb2ludCArIHRoaXMucGF0aCA6IG51bGw7XG59O1xuXG5OdHAucHJvdG90eXBlLmdldFRpbWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIE50cC5fbm93KCkgKyBNYXRoLnJvdW5kKHRoaXMuZGlmZik7XG59O1xuXG5OdHAucHJvdG90eXBlLnN5bmNUaW1lID0gZnVuY3Rpb24obG9jYWxUaW1lKSB7XG4gIHJldHVybiBsb2NhbFRpbWUgKyBNYXRoLmNlaWwodGhpcy5kaWZmKTtcbn07XG5cbk50cC5wcm90b3R5cGUuc3luYyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5lbmRwb2ludCA9PT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxvZ2dlcignaW5pdCBzeW5jJyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHJldHJ5Q291bnQgPSAwO1xuICB2YXIgcmV0cnkgPSBuZXcgUmV0cnkoe1xuICAgIGJhc2VUaW1lb3V0OiAxMDAwKjIwLFxuICAgIG1heFRpbWVvdXQ6IDEwMDAqNjAsXG4gICAgbWluQ291bnQ6IDEsXG4gICAgbWluVGltZW91dDogMFxuICB9KTtcbiAgc3luY1RpbWUoKTtcblxuICBmdW5jdGlvbiBzeW5jVGltZSAoKSB7XG4gICAgaWYocmV0cnlDb3VudDw1KSB7XG4gICAgICBsb2dnZXIoJ2F0dGVtcHQgdGltZSBzeW5jIHdpdGggc2VydmVyJywgcmV0cnlDb3VudCk7XG4gICAgICAvLyBpZiB3ZSBzZW5kIDAgdG8gdGhlIHJldHJ5TGF0ZXIsIGNhY2hlRG5zIHdpbGwgcnVuIGltbWVkaWF0ZWx5XG4gICAgICByZXRyeS5yZXRyeUxhdGVyKHJldHJ5Q291bnQrKywgY2FjaGVEbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIoJ21heGltdW0gcmV0cmllcyByZWFjaGVkJyk7XG4gICAgICBzZWxmLnJlU3luYy5yZXRyeUxhdGVyKHNlbGYucmVTeW5jQ291bnQrKywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgc2VsZi5zeW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZmlyc3QgYXR0ZW1wdCBpcyB0byBjYWNoZSBkbnMuIFNvLCBjYWxjdWxhdGlvbiBkb2VzIG5vdFxuICAvLyBpbmNsdWRlIEROUyByZXNvbHV0aW9uIHRpbWVcbiAgZnVuY3Rpb24gY2FjaGVEbnMgKCkge1xuICAgIHNlbGYuZ2V0U2VydmVyVGltZShmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmKCFlcnIpIHtcbiAgICAgICAgY2FsY3VsYXRlVGltZURpZmYoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN5bmNUaW1lKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVUaW1lRGlmZiAoKSB7XG4gICAgdmFyIGNsaWVudFN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgc2VsZi5nZXRTZXJ2ZXJUaW1lKGZ1bmN0aW9uKGVyciwgc2VydmVyVGltZSkge1xuICAgICAgaWYoIWVyciAmJiBzZXJ2ZXJUaW1lKSB7XG4gICAgICAgIC8vIChEYXRlLm5vdygpICsgY2xpZW50U3RhcnRUaW1lKS8yIDogTWlkcG9pbnQgYmV0d2VlbiByZXEgYW5kIHJlc1xuICAgICAgICB2YXIgbmV0d29ya1RpbWUgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIGNsaWVudFN0YXJ0VGltZSkvMlxuICAgICAgICB2YXIgc2VydmVyU3RhcnRUaW1lID0gc2VydmVyVGltZSAtIG5ldHdvcmtUaW1lO1xuICAgICAgICBzZWxmLmRpZmYgPSBzZXJ2ZXJTdGFydFRpbWUgLSBjbGllbnRTdGFydFRpbWU7XG4gICAgICAgIHNlbGYuc3luY2VkID0gdHJ1ZTtcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzZW5kIDEgaW50byByZXRyeUxhdGVyLlxuICAgICAgICBzZWxmLnJlU3luYy5yZXRyeUxhdGVyKHNlbGYucmVTeW5jQ291bnQrKywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgIHNlbGYuc3luYy5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxvZ2dlcignc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgZGlmZiB2YWx1ZScsIHNlbGYuZGlmZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzeW5jVGltZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbk50cC5wcm90b3R5cGUuZ2V0U2VydmVyVGltZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoc2VsZi5lbmRwb2ludCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZ2V0U2VydmVyVGltZSByZXF1aXJlcyB0aGUgZW5kcG9pbnQgdG8gYmUgc2V0Jyk7XG4gIH1cblxuICBpZihNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICBLYWRpcmEuY29yZUFwaS5nZXQoc2VsZi5wYXRoLCB7IG5vUmV0cmllczogdHJ1ZSB9KS50aGVuKGNvbnRlbnQgPT4ge1xuICAgICAgdmFyIHNlcnZlclRpbWUgPSBwYXJzZUludChjb250ZW50KTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHNlcnZlclRpbWUpO1xuICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGh0dHBSZXF1ZXN0KCdHRVQnLCBzZWxmLmVuZHBvaW50ICsgYD9ub0NhY2hlPSR7bmV3IERhdGUoKS5nZXRUaW1lKCl9LSR7TWF0aC5yYW5kb20oKX1gLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNlcnZlclRpbWUgPSBwYXJzZUludChyZXMuY29udGVudCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHNlcnZlclRpbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIGlmKE1ldGVvci5pc1NlcnZlcikge1xuICAgIHJldHVybiBOcG0ucmVxdWlyZSgnZGVidWcnKShcImthZGlyYTpudHBcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBjYW5Mb2dLYWRpcmEgPSBnbG9iYWwubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0xPR19LQURJUkEnKSAhPT0gbnVsbCAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICB9IGNhdGNoIChlKSB7IH0gLy9vbGRlciBicm93c2VycyBjYW4gc29tZXRpbWVzIHRocm93IGJlY2F1c2Ugb2YgZ2V0SXRlbVxuICAgICAgaWYgKGNhbkxvZ0thZGlyYSkge1xuICAgICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICAgIG1lc3NhZ2UgPSBcImthZGlyYTpudHAgXCIgKyBtZXNzYWdlO1xuICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsInZhciB1cmwgPSBOcG0ucmVxdWlyZSgndXJsJyk7XG52YXIgcGF0aCA9IE5wbS5yZXF1aXJlKCdwYXRoJyk7XG52YXIgZnMgPSBOcG0ucmVxdWlyZSgnZnMnKTtcbnZhciBsb2dnZXIgPSBOcG0ucmVxdWlyZSgnZGVidWcnKSgna2FkaXJhOmFwbTpzb3VyY2VtYXBzJyk7XG5cbi8vIE1ldGVvciAxLjcgYW5kIG9sZGVyIHVzZWQgY2xpZW50UGF0aHNcbnZhciBjbGllbnRQYXRocyA9IF9fbWV0ZW9yX2Jvb3RzdHJhcF9fLmNvbmZpZ0pzb24uY2xpZW50UGF0aHM7XG52YXIgY2xpZW50QXJjaHMgPSAgX19tZXRlb3JfYm9vdHN0cmFwX18uY29uZmlnSnNvbi5jbGllbnRBcmNocztcbnZhciBzZXJ2ZXJEaXIgPSBfX21ldGVvcl9ib290c3RyYXBfXy5zZXJ2ZXJEaXI7XG52YXIgYWJzQ2xpZW50UGF0aHNcblxuaWYgKGNsaWVudEFyY2hzKSB7XG4gIGFic0NsaWVudFBhdGhzID0gY2xpZW50QXJjaHMucmVkdWNlKChyZXN1bHQsIGFyY2gpID0+IHtcbiAgICByZXN1bHRbYXJjaF0gPSBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKHNlcnZlckRpciksIGFyY2gpXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sIHt9KVxufSBlbHNlIHtcbiAgYWJzQ2xpZW50UGF0aHMgPSBPYmplY3Qua2V5cyhjbGllbnRQYXRocykucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuICAgIHJlc3VsdFtrZXldID0gcGF0aC5yZXNvbHZlKHNlcnZlckRpciwgcGF0aC5kaXJuYW1lKGNsaWVudFBhdGhzW2tleV0pKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sIHt9KTtcbn1cblxuaGFuZGxlQXBpUmVzcG9uc2UgPSBmdW5jdGlvbiAoYm9keSA9IHt9KSB7XG4gIHZhciB1bmF2YWlsYWJsZSA9IFtdO1xuXG4gIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgYm9keSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyKCdmYWlsZWQgcGFyc2luZyBib2R5JywgZSwgYm9keSlcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICB2YXIgbmVlZGVkU291cmNlbWFwcyA9IGJvZHkubmVlZGVkU291cmNlbWFwcyB8fCBbXVxuICBsb2dnZXIoJ2JvZHknLCBuZWVkZWRTb3VyY2VtYXBzKVxuXG4gIHZhciBwcm9taXNlcyA9IG5lZWRlZFNvdXJjZW1hcHMubWFwKChzb3VyY2VtYXApID0+IHtcbiAgICBpZiAoIUthZGlyYS5vcHRpb25zLnVwbG9hZFNvdXJjZU1hcHMpIHtcbiAgICAgIHJldHVybiB1bmF2YWlsYWJsZS5wdXNoKHNvdXJjZW1hcClcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0U291cmNlbWFwUGF0aChzb3VyY2VtYXAuYXJjaCwgc291cmNlbWFwLmZpbGUucGF0aClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChzb3VyY2VNYXBQYXRoKSB7XG4gICAgICAgIGlmIChzb3VyY2VNYXBQYXRoID09PSBudWxsKSB7XG4gICAgICAgICAgdW5hdmFpbGFibGUucHVzaChzb3VyY2VtYXApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VuZFNvdXJjZW1hcChzb3VyY2VtYXAsIHNvdXJjZU1hcFBhdGgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIH0pXG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIGlmICh1bmF2YWlsYWJsZS5sZW5ndGggPiAwKSB7XG4gICAgICBsb2dnZXIoJ3NlbmRpbmcgdW5hdmFpbGFibGUgc291cmNlbWFwcycsIHVuYXZhaWxhYmxlKVxuICAgICAgS2FkaXJhLmNvcmVBcGkuc2VuZERhdGEoe1xuICAgICAgICB1bmF2YWlsYWJsZVNvdXJjZW1hcHM6IHVuYXZhaWxhYmxlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKGJvZHkpIHtcbiAgICAgICAgaGFuZGxlQXBpUmVzcG9uc2UoYm9keSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01vbnRpIEFQTTogdW5hYmxlIHRvIHNlbmQgZGF0YScsIGVycik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pXG5cbn1cblxuZnVuY3Rpb24gc2VuZFNvdXJjZW1hcChzb3VyY2VtYXAsIHNvdXJjZW1hcFBhdGgpIHtcbiAgbG9nZ2VyKCdTZW5kaW5nIHNvdXJjZW1hcCcsIHNvdXJjZW1hcCwgc291cmNlbWFwUGF0aClcblxuICB2YXIgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShzb3VyY2VtYXBQYXRoKTtcblxuICBzdHJlYW0ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdNb250aSBBUE06IGVycm9yIHdoaWxlIHVwbG9hZGluZyBzb3VyY2VtYXAnLCBlcnIpXG4gIH0pO1xuXG4gIHZhciBhcmNoID0gc291cmNlbWFwLmFyY2g7XG4gIHZhciBhcmNoVmVyc2lvbiA9IHNvdXJjZW1hcC5hcmNoVmVyc2lvbjtcbiAgdmFyIGZpbGUgPSBlbmNvZGVVUklDb21wb25lbnQoc291cmNlbWFwLmZpbGUucGF0aCk7XG4gIFxuICBLYWRpcmEuY29yZUFwaS5zZW5kU3RyZWFtKGAvc291cmNlbWFwP2FyY2g9JHthcmNofSZhcmNoVmVyc2lvbj0ke2FyY2hWZXJzaW9ufSZmaWxlPSR7ZmlsZX1gLCBzdHJlYW0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdNb250aSBBUE06IGVycm9yIHVwbG9hZGluZyBzb3VyY2VtYXAnLCBlcnIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlUGF0aCAodXJsUGF0aCkge1xuICB1cmxQYXRoID0gcGF0aC5wb3NpeC5ub3JtYWxpemUodXJsUGF0aCk7XG5cbiAgaWYgKHVybFBhdGhbMF0gPT09ICcvJykge1xuICAgIHVybFBhdGggPSB1cmxQYXRoLnNsaWNlKDEpO1xuICB9XG5cbiAgcmV0dXJuIHVybFBhdGg7XG59XG5cbmZ1bmN0aW9uIGNoZWNrRm9yRHluYW1pY0ltcG9ydCAoYXJjaCwgdXJsUGF0aCkge1xuICBjb25zdCBmaWxlUGF0aCA9IHByZXBhcmVQYXRoKHVybFBhdGgpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGNvbnN0IGFyY2hQYXRoID0gYWJzQ2xpZW50UGF0aHNbYXJjaF1cbiAgICBjb25zdCBkeW5hbWljUGF0aCA9IHBhdGguam9pbihhcmNoUGF0aCwgJ2R5bmFtaWMnLCBmaWxlUGF0aCkgKyAnLm1hcCdcblxuICAgIGZzLnN0YXQoZHluYW1pY1BhdGgsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHJlc29sdmUoZXJyID8gbnVsbCA6IGR5bmFtaWNQYXRoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNvdXJjZW1hcFBhdGgoYXJjaCwgdXJsUGF0aCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHZhciBjbGllbnRQcm9ncmFtID0gV2ViQXBwLmNsaWVudFByb2dyYW1zW2FyY2hdO1xuICBcbiAgICBpZiAoIWNsaWVudFByb2dyYW0gfHwgIWNsaWVudFByb2dyYW0ubWFuaWZlc3QpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIHZhciBmaWxlSW5mbyA9IGNsaWVudFByb2dyYW0ubWFuaWZlc3QuZmluZCgoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuIGZpbGUudXJsICYmIGZpbGUudXJsLnN0YXJ0c1dpdGgodXJsUGF0aCk7XG4gICAgfSk7XG5cbiAgICBpZiAoZmlsZUluZm8gJiYgZmlsZUluZm8uc291cmNlTWFwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShwYXRoLmpvaW4oXG4gICAgICAgIGFic0NsaWVudFBhdGhzW2FyY2hdLFxuICAgICAgICBmaWxlSW5mby5zb3VyY2VNYXBcbiAgICAgICkpO1xuICAgIH1cblxuICAgIGNoZWNrRm9yRHluYW1pY0ltcG9ydChhcmNoLCB1cmxQYXRoKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdClcbiAgfSk7XG59XG4iLCJpbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xuXG5jb25zdCBXQUlUT05fTUVTU0FHRV9GSUVMRFMgPSBbJ21zZycsICdpZCcsICdtZXRob2QnLCAnbmFtZScsICd3YWl0VGltZSddO1xuXG4vLyBUaGlzIGlzIHdheSBob3cgd2UgY2FuIGJ1aWxkIHdhaXRUaW1lIGFuZCBpdCdzIGJyZWFrZG93blxuZXhwb3J0IGNsYXNzIFdhaXRUaW1lQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3dhaXRMaXN0U3RvcmUgPSB7fTtcbiAgICB0aGlzLl9jdXJyZW50UHJvY2Vzc2luZ01lc3NhZ2VzID0ge307XG4gICAgdGhpcy5fbWVzc2FnZUNhY2hlID0ge307XG4gIH1cblxuICByZWdpc3RlcihzZXNzaW9uLCBtc2dJZCkge1xuICAgIGNvbnN0IG1haW5LZXkgPSB0aGlzLl9nZXRNZXNzYWdlS2V5KHNlc3Npb24uaWQsIG1zZ0lkKTtcblxuICAgIGxldCBpblF1ZXVlID0gc2Vzc2lvbi5pblF1ZXVlIHx8IFtdO1xuICAgIGlmICh0eXBlb2YgaW5RdWV1ZS50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBsYXRlc3QgdmVyc2lvbiBvZiBNZXRlb3IgdXNlcyBhIGRvdWJsZS1lbmRlZC1xdWV1ZSBmb3IgdGhlIGluUXVldWVcbiAgICAgIC8vIGluZm86IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2RvdWJsZS1lbmRlZC1xdWV1ZVxuICAgICAgaW5RdWV1ZSA9IGluUXVldWUudG9BcnJheSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHdhaXRMaXN0ID1cbiAgICAgIGluUXVldWUubWFwKG1zZyA9PiB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX2dldE1lc3NhZ2VLZXkoc2Vzc2lvbi5pZCwgbXNnLmlkKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVNZXNzYWdlKGtleSwgbXNnKTtcbiAgICAgIH0pIHx8IFtdO1xuXG4gICAgLy8gYWRkIGN1cnJlbnRseSBwcm9jZXNzaW5nIGRkcCBtZXNzYWdlIGlmIGV4aXN0c1xuICAgIGNvbnN0IGN1cnJlbnRseVByb2Nlc3NpbmdNZXNzYWdlID1cbiAgICAgIHRoaXMuX2N1cnJlbnRQcm9jZXNzaW5nTWVzc2FnZXNbc2Vzc2lvbi5pZF07XG4gICAgaWYgKGN1cnJlbnRseVByb2Nlc3NpbmdNZXNzYWdlKSB7XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRNZXNzYWdlS2V5KFxuICAgICAgICBzZXNzaW9uLmlkLFxuICAgICAgICBjdXJyZW50bHlQcm9jZXNzaW5nTWVzc2FnZS5pZFxuICAgICAgKTtcbiAgICAgIHdhaXRMaXN0LnVuc2hpZnQodGhpcy5fZ2V0Q2FjaGVNZXNzYWdlKGtleSwgY3VycmVudGx5UHJvY2Vzc2luZ01lc3NhZ2UpKTtcbiAgICB9XG5cbiAgICB0aGlzLl93YWl0TGlzdFN0b3JlW21haW5LZXldID0gd2FpdExpc3Q7XG4gIH1cblxuICBidWlsZChzZXNzaW9uLCBtc2dJZCkge1xuICAgIGNvbnN0IG1haW5LZXkgPSB0aGlzLl9nZXRNZXNzYWdlS2V5KHNlc3Npb24uaWQsIG1zZ0lkKTtcbiAgICBjb25zdCB3YWl0TGlzdCA9IHRoaXMuX3dhaXRMaXN0U3RvcmVbbWFpbktleV0gfHwgW107XG4gICAgZGVsZXRlIHRoaXMuX3dhaXRMaXN0U3RvcmVbbWFpbktleV07XG5cbiAgICBjb25zdCBmaWx0ZXJlZFdhaXRMaXN0ID0gd2FpdExpc3QubWFwKHRoaXMuX2NsZWFuQ2FjaGVNZXNzYWdlLmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIGZpbHRlcmVkV2FpdExpc3Q7XG4gIH1cblxuICBfZ2V0TWVzc2FnZUtleShzZXNzaW9uSWQsIG1zZ0lkKSB7XG4gICAgcmV0dXJuIGAke3Nlc3Npb25JZH06OiR7bXNnSWR9YDtcbiAgfVxuXG4gIF9nZXRDYWNoZU1lc3NhZ2Uoa2V5LCBtc2cpIHtcbiAgICBsZXQgY2FjaGVkTWVzc2FnZSA9IHRoaXMuX21lc3NhZ2VDYWNoZVtrZXldO1xuICAgIGlmICghY2FjaGVkTWVzc2FnZSkge1xuICAgICAgdGhpcy5fbWVzc2FnZUNhY2hlW2tleV0gPSBjYWNoZWRNZXNzYWdlID0gXy5waWNrKFxuICAgICAgICBtc2csXG4gICAgICAgIFdBSVRPTl9NRVNTQUdFX0ZJRUxEU1xuICAgICAgKTtcbiAgICAgIGNhY2hlZE1lc3NhZ2UuX2tleSA9IGtleTtcbiAgICAgIGNhY2hlZE1lc3NhZ2UuX3JlZ2lzdGVyZWQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWNoZWRNZXNzYWdlLl9yZWdpc3RlcmVkKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhY2hlZE1lc3NhZ2U7XG4gIH1cblxuICBfY2xlYW5DYWNoZU1lc3NhZ2UobXNnKSB7XG4gICAgbXNnLl9yZWdpc3RlcmVkLS07XG4gICAgaWYgKG1zZy5fcmVnaXN0ZXJlZCA9PSAwKSB7XG4gICAgICBkZWxldGUgdGhpcy5fbWVzc2FnZUNhY2hlW21zZy5fa2V5XTtcbiAgICB9XG5cbiAgICAvLyBuZWVkIHRvIHNlbmQgYSBjbGVhbiBzZXQgb2Ygb2JqZWN0c1xuICAgIC8vIG90aGVyd2lzZSByZWdpc3RlciBjYW4gZ28gd2l0aCB0aGlzXG4gICAgcmV0dXJuIF8ucGljayhtc2csIFdBSVRPTl9NRVNTQUdFX0ZJRUxEUyk7XG4gIH1cblxuICB0cmFja1dhaXRUaW1lKHNlc3Npb24sIG1zZywgdW5ibG9jaykge1xuICAgIGNvbnN0IHN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX2N1cnJlbnRQcm9jZXNzaW5nTWVzc2FnZXNbc2Vzc2lvbi5pZF0gPSBtc2c7XG5cbiAgICBsZXQgdW5ibG9ja2VkID0gZmFsc2U7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCB3cmFwcGVkVW5ibG9jayA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF1bmJsb2NrZWQpIHtcbiAgICAgICAgY29uc3Qgd2FpdFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRlZDtcbiAgICAgICAgY29uc3Qga2V5ID0gc2VsZi5fZ2V0TWVzc2FnZUtleShzZXNzaW9uLmlkLCBtc2cuaWQpO1xuICAgICAgICBjb25zdCBjYWNoZWRNZXNzYWdlID0gc2VsZi5fbWVzc2FnZUNhY2hlW2tleV07XG4gICAgICAgIGlmIChjYWNoZWRNZXNzYWdlKSB7XG4gICAgICAgICAgY2FjaGVkTWVzc2FnZS53YWl0VGltZSA9IHdhaXRUaW1lO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBzZWxmLl9jdXJyZW50UHJvY2Vzc2luZ01lc3NhZ2VzW3Nlc3Npb24uaWRdO1xuICAgICAgICB1bmJsb2NrZWQgPSB0cnVlO1xuICAgICAgICB1bmJsb2NrKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3cmFwcGVkVW5ibG9jaztcbiAgfVxufVxuIiwiLy8gZXhwb3NlIGZvciB0ZXN0aW5nIHB1cnBvc2Vcbk9wbG9nQ2hlY2sgPSB7fTtcblxuT3Bsb2dDaGVjay5fMDcwID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICBpZiAob3B0aW9ucy5saW1pdCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIjA3MF9MSU1JVF9OT1RfU1VQUE9SVEVEXCIsXG4gICAgICByZWFzb246IFwiTWV0ZW9yIDAuNy4wIGRvZXMgbm90IHN1cHBvcnQgbGltaXQgd2l0aCBvcGxvZy5cIixcbiAgICAgIHNvbHV0aW9uOiBcIlVwZ3JhZGUgeW91ciBhcHAgdG8gTWV0ZW9yIHZlcnNpb24gMC43LjIgb3IgbGF0ZXIuXCJcbiAgICB9XG4gIH07XG5cbiAgdmFyIGV4aXN0cyQgPSBfLmFueShjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvciwgZnVuY3Rpb24gKHZhbHVlLCBmaWVsZCkge1xuICAgIGlmIChmaWVsZC5zdWJzdHIoMCwgMSkgPT09ICckJylcbiAgICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxuICBpZihleGlzdHMkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiMDcwXyRfTk9UX1NVUFBPUlRFRFwiLFxuICAgICAgcmVhc29uOiBcIk1ldGVvciAwLjcuMCBzdXBwb3J0cyBvbmx5IGVxdWFsIGNoZWNrcyB3aXRoIG9wbG9nLlwiLFxuICAgICAgc29sdXRpb246IFwiVXBncmFkZSB5b3VyIGFwcCB0byBNZXRlb3IgdmVyc2lvbiAwLjcuMiBvciBsYXRlci5cIlxuICAgIH1cbiAgfTtcblxuICB2YXIgb25seVNjYWxlcnMgPSBfLmFsbChjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvciwgZnVuY3Rpb24gKHZhbHVlLCBmaWVsZCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHxcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIiB8fFxuICAgICAgdHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIiB8fFxuICAgICAgdmFsdWUgPT09IG51bGwgfHxcbiAgICAgIHZhbHVlIGluc3RhbmNlb2YgTWV0ZW9yLkNvbGxlY3Rpb24uT2JqZWN0SUQ7XG4gIH0pO1xuXG4gIGlmKCFvbmx5U2NhbGVycykge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIjA3MF9PTkxZX1NDQUxFUlNcIixcbiAgICAgIHJlYXNvbjogXCJNZXRlb3IgMC43LjAgb25seSBzdXBwb3J0cyBzY2FsZXJzIGFzIGNvbXBhcmF0b3JzLlwiLFxuICAgICAgc29sdXRpb246IFwiVXBncmFkZSB5b3VyIGFwcCB0byBNZXRlb3IgdmVyc2lvbiAwLjcuMiBvciBsYXRlci5cIlxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuT3Bsb2dDaGVjay5fMDcxID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICB2YXIgbWF0Y2hlciA9IG5ldyBNaW5pbW9uZ28uTWF0Y2hlcihjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3Rvcik7XG4gIGlmIChvcHRpb25zLmxpbWl0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiMDcxX0xJTUlUX05PVF9TVVBQT1JURURcIixcbiAgICAgIHJlYXNvbjogXCJNZXRlb3IgMC43LjEgZG9lcyBub3Qgc3VwcG9ydCBsaW1pdCB3aXRoIG9wbG9nLlwiLFxuICAgICAgc29sdXRpb246IFwiVXBncmFkZSB5b3VyIGFwcCB0byBNZXRlb3IgdmVyc2lvbiAwLjcuMiBvciBsYXRlci5cIlxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuT3Bsb2dDaGVjay5lbnYgPSBmdW5jdGlvbigpIHtcbiAgaWYoIXByb2Nlc3MuZW52Lk1PTkdPX09QTE9HX1VSTCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIk5PX0VOVlwiLFxuICAgICAgcmVhc29uOiBcIllvdSBoYXZlbid0IGFkZGVkIG9wbG9nIHN1cHBvcnQgZm9yIHlvdXIgdGhlIE1ldGVvciBhcHAuXCIsXG4gICAgICBzb2x1dGlvbjogXCJBZGQgb3Bsb2cgc3VwcG9ydCBmb3IgeW91ciBNZXRlb3IgYXBwLiBzZWU6IGh0dHA6Ly9nb28uZ2wvQ28xakpjXCJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbk9wbG9nQ2hlY2suZGlzYWJsZU9wbG9nID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgaWYoY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5fZGlzYWJsZU9wbG9nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiRElTQUJMRV9PUExPR1wiLFxuICAgICAgcmVhc29uOiBcIllvdSd2ZSBkaXNhYmxlIG9wbG9nIGZvciB0aGlzIGN1cnNvciBleHBsaWNpdGx5IHdpdGggX2Rpc2FibGVPcGxvZyBvcHRpb24uXCJcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG4vLyB3aGVuIGNyZWF0aW5nIE1pbmltb25nby5NYXRjaGVyIG9iamVjdCwgaWYgdGhhdCdzIHRocm93cyBhbiBleGNlcHRpb25cbi8vIG1ldGVvciB3b24ndCBkbyB0aGUgb3Bsb2cgc3VwcG9ydFxuT3Bsb2dDaGVjay5taW5pTW9uZ29NYXRjaGVyID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgaWYoTWluaW1vbmdvLk1hdGNoZXIpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChleCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogXCJNSU5JTU9OR09fTUFUQ0hFUl9FUlJPUlwiLFxuICAgICAgICByZWFzb246IFwiVGhlcmUncyBzb21ldGhpbmcgd3JvbmcgaW4geW91ciBtb25nbyBxdWVyeTogXCIgKyAgZXgubWVzc2FnZSxcbiAgICAgICAgc29sdXRpb246IFwiQ2hlY2sgeW91ciBzZWxlY3RvciBhbmQgY2hhbmdlIGl0IGFjY29yZGluZ2x5LlwiXG4gICAgICB9O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBNaW5pbW9uZ28uTWF0Y2hlciwgd2UgZG9uJ3QgbmVlZCB0byBjaGVjayB0aGlzXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbk9wbG9nQ2hlY2subWluaU1vbmdvU29ydGVyID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICBpZihNaW5pbW9uZ28uU29ydGVyICYmIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc29ydCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgc29ydGVyID0gbmV3IE1pbmltb25nby5Tb3J0ZXIoXG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc29ydCxcbiAgICAgICAgeyBtYXRjaGVyOiBtYXRjaGVyIH1cbiAgICAgICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGV4KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiBcIk1JTklNT05HT19TT1JURVJfRVJST1JcIixcbiAgICAgICAgcmVhc29uOiBcIlNvbWUgb2YgeW91ciBzb3J0IHNwZWNpZmllcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiICsgZXgubWVzc2FnZSxcbiAgICAgICAgc29sdXRpb246IFwiQ2hlY2sgeW91ciBzb3J0IHNwZWNpZmllcnMgYW5kIGNoYWdlIHRoZW0gYWNjb3JkaW5nbHkuXCJcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbk9wbG9nQ2hlY2suZmllbGRzID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICBpZihvcHRpb25zLmZpZWxkcykge1xuICAgIHRyeSB7XG4gICAgICBMb2NhbENvbGxlY3Rpb24uX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbihvcHRpb25zLmZpZWxkcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lID09PSBcIk1pbmltb25nb0Vycm9yXCIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBcIk5PVF9TVVBQT1JURURfRklFTERTXCIsXG4gICAgICAgICAgcmVhc29uOiBcIlNvbWUgb2YgdGhlIGZpZWxkIGZpbHRlcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiICsgZS5tZXNzYWdlLFxuICAgICAgICAgIHNvbHV0aW9uOiBcIlRyeSByZW1vdmluZyB0aG9zZSBmaWVsZCBmaWx0ZXJzLlwiXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbk9wbG9nQ2hlY2suc2tpcCA9IGZ1bmN0aW9uKGN1cnNvckRlc2NyaXB0aW9uKSB7XG4gIGlmKGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc2tpcCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIlNLSVBfTk9UX1NVUFBPUlRFRFwiLFxuICAgICAgcmVhc29uOiBcIlNraXAgZG9lcyBub3Qgc3VwcG9ydCB3aXRoIG9wbG9nLlwiLFxuICAgICAgc29sdXRpb246IFwiVHJ5IHRvIGF2b2lkIHVzaW5nIHNraXAuIFVzZSByYW5nZSBxdWVyaWVzIGluc3RlYWQ6IGh0dHA6Ly9nb28uZ2wvYjUyMkF2XCJcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5PcGxvZ0NoZWNrLndoZXJlID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICBpZihtYXRjaGVyLmhhc1doZXJlKCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogXCJXSEVSRV9OT1RfU1VQUE9SVEVEXCIsXG4gICAgICByZWFzb246IFwiTWV0ZW9yIGRvZXMgbm90IHN1cHBvcnQgcXVlcmllcyB3aXRoICR3aGVyZS5cIixcbiAgICAgIHNvbHV0aW9uOiBcIlRyeSB0byByZW1vdmUgJHdoZXJlIGZyb20geW91ciBxdWVyeS4gVXNlIHNvbWUgYWx0ZXJuYXRpdmUuXCJcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5PcGxvZ0NoZWNrLmdlbyA9IGZ1bmN0aW9uKGN1cnNvckRlc2NyaXB0aW9uKSB7XG4gIHZhciBtYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yKTtcblxuICBpZihtYXRjaGVyLmhhc0dlb1F1ZXJ5KCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogXCJHRU9fTk9UX1NVUFBPUlRFRFwiLFxuICAgICAgcmVhc29uOiBcIk1ldGVvciBkb2VzIG5vdCBzdXBwb3J0IHF1ZXJpZXMgd2l0aCBnZW8gcGFydGlhbCBvcGVyYXRvcnMuXCIsXG4gICAgICBzb2x1dGlvbjogXCJUcnkgdG8gcmVtb3ZlIGdlbyBwYXJ0aWFsIG9wZXJhdG9ycyBmcm9tIHlvdXIgcXVlcnkgaWYgcG9zc2libGUuXCJcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5PcGxvZ0NoZWNrLmxpbWl0QnV0Tm9Tb3J0ID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuXG4gIGlmKChvcHRpb25zLmxpbWl0ICYmICFvcHRpb25zLnNvcnQpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiTElNSVRfTk9fU09SVFwiLFxuICAgICAgcmVhc29uOiBcIk1ldGVvciBvcGxvZyBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGxpbWl0IHdpdGhvdXQgYSBzb3J0IHNwZWNpZmllci5cIixcbiAgICAgIHNvbHV0aW9uOiBcIlRyeSBhZGRpbmcgYSBzb3J0IHNwZWNpZmllci5cIlxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbk9wbG9nQ2hlY2sub2xkZXJWZXJzaW9uID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24sIGRyaXZlcikge1xuICBpZihkcml2ZXIgJiYgIWRyaXZlci5jb25zdHJ1Y3Rvci5jdXJzb3JTdXBwb3J0ZWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogXCJPTERFUl9WRVJTSU9OXCIsXG4gICAgICByZWFzb246IFwiWW91ciBNZXRlb3IgdmVyc2lvbiBkb2VzIG5vdCBoYXZlIG9wbG9nIHN1cHBvcnQuXCIsXG4gICAgICBzb2x1dGlvbjogXCJVcGdyYWRlIHlvdXIgYXBwIHRvIE1ldGVvciB2ZXJzaW9uIDAuNy4yIG9yIGxhdGVyLlwiXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbk9wbG9nQ2hlY2suZ2l0Q2hlY2tvdXQgPSBmdW5jdGlvbihjdXJzb3JEZXNjcmlwdGlvbiwgZHJpdmVyKSB7XG4gIGlmKCFNZXRlb3IucmVsZWFzZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIkdJVF9DSEVDS09VVFwiLFxuICAgICAgcmVhc29uOiBcIlNlZW1zIGxpa2UgeW91ciBNZXRlb3IgdmVyc2lvbiBpcyBiYXNlZCBvbiBhIEdpdCBjaGVja291dCBhbmQgaXQgZG9lc24ndCBoYXZlIHRoZSBvcGxvZyBzdXBwb3J0LlwiLFxuICAgICAgc29sdXRpb246IFwiVHJ5IHRvIHVwZ3JhZGUgeW91ciBNZXRlb3IgdmVyc2lvbi5cIlxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG52YXIgcHJlUnVubmluZ01hdGNoZXJzID0gW1xuICBPcGxvZ0NoZWNrLmVudixcbiAgT3Bsb2dDaGVjay5kaXNhYmxlT3Bsb2csXG4gIE9wbG9nQ2hlY2subWluaU1vbmdvTWF0Y2hlclxuXTtcblxudmFyIGdsb2JhbE1hdGNoZXJzID0gW1xuICBPcGxvZ0NoZWNrLmZpZWxkcyxcbiAgT3Bsb2dDaGVjay5za2lwLFxuICBPcGxvZ0NoZWNrLndoZXJlLFxuICBPcGxvZ0NoZWNrLmdlbyxcbiAgT3Bsb2dDaGVjay5saW1pdEJ1dE5vU29ydCxcbiAgT3Bsb2dDaGVjay5taW5pTW9uZ29Tb3J0ZXIsXG4gIE9wbG9nQ2hlY2sub2xkZXJWZXJzaW9uLFxuICBPcGxvZ0NoZWNrLmdpdENoZWNrb3V0XG5dO1xuXG52YXIgdmVyc2lvbk1hdGNoZXJzID0gW1xuICBbL14wXFwuN1xcLjEvLCBPcGxvZ0NoZWNrLl8wNzFdLFxuICBbL14wXFwuN1xcLjAvLCBPcGxvZ0NoZWNrLl8wNzBdLFxuXTtcblxuS2FkaXJhLmNoZWNrV2h5Tm9PcGxvZyA9IGZ1bmN0aW9uKGN1cnNvckRlc2NyaXB0aW9uLCBvYnNlcnZlckRyaXZlcikge1xuICBpZih0eXBlb2YgTWluaW1vbmdvID09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiQ0FOTk9UX0RFVEVDVFwiLFxuICAgICAgcmVhc29uOiBcIllvdSBhcmUgcnVubmluZyBhbiBvbGRlciBNZXRlb3IgdmVyc2lvbiBhbmQgS2FkaXJhIGNhbid0IGNoZWNrIG9wbG9nIHN0YXRlLlwiLFxuICAgICAgc29sdXRpb246IFwiVHJ5IHVwZGF0aW5nIHlvdXIgTWV0ZW9yIGFwcFwiXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHJ1bk1hdGNoZXJzKHByZVJ1bm5pbmdNYXRjaGVycywgY3Vyc29yRGVzY3JpcHRpb24sIG9ic2VydmVyRHJpdmVyKTtcbiAgaWYocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBtZXRlb3JWZXJzaW9uID0gTWV0ZW9yLnJlbGVhc2U7XG4gIGZvcih2YXIgbGM9MDsgbGM8dmVyc2lvbk1hdGNoZXJzLmxlbmd0aDsgbGMrKykge1xuICAgIHZhciBtYXRjaGVySW5mbyA9IHZlcnNpb25NYXRjaGVyc1tsY107XG4gICAgaWYobWF0Y2hlckluZm9bMF0udGVzdChtZXRlb3JWZXJzaW9uKSkge1xuICAgICAgdmFyIG1hdGNoZWQgPSBtYXRjaGVySW5mb1sxXShjdXJzb3JEZXNjcmlwdGlvbiwgb2JzZXJ2ZXJEcml2ZXIpO1xuICAgICAgaWYobWF0Y2hlZCAhPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXN1bHQgPSBydW5NYXRjaGVycyhnbG9iYWxNYXRjaGVycywgY3Vyc29yRGVzY3JpcHRpb24sIG9ic2VydmVyRHJpdmVyKTtcbiAgaWYocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29kZTogXCJPUExPR19TVVBQT1JURURcIixcbiAgICByZWFzb246IFwiVGhpcyBxdWVyeSBzaG91bGQgc3VwcG9ydCBvcGxvZy4gSXQncyB3ZWlyZCBpZiBpdCdzIG5vdC5cIixcbiAgICBzb2x1dGlvbjogXCJQbGVhc2UgY29udGFjdCBLYWRpcmEgc3VwcG9ydCBhbmQgbGV0J3MgZGlzY3Vzcy5cIlxuICB9O1xufTtcblxuZnVuY3Rpb24gcnVuTWF0Y2hlcnMobWF0Y2hlckxpc3QsIGN1cnNvckRlc2NyaXB0aW9uLCBvYnNlcnZlckRyaXZlcikge1xuICBmb3IodmFyIGxjPTA7IGxjPG1hdGNoZXJMaXN0Lmxlbmd0aDsgbGMrKykge1xuICAgIHZhciBtYXRjaGVyID0gbWF0Y2hlckxpc3RbbGNdO1xuICAgIHZhciBtYXRjaGVkID0gbWF0Y2hlcihjdXJzb3JEZXNjcmlwdGlvbiwgb2JzZXJ2ZXJEcml2ZXIpO1xuICAgIGlmKG1hdGNoZWQgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsInZhciBldmVudExvZ2dlciA9IE5wbS5yZXF1aXJlKCdkZWJ1ZycpKCdrYWRpcmE6dHJhY2VyJyk7XG52YXIgUkVQRVRJVElWRV9FVkVOVFMgPSB7J2RiJzogdHJ1ZSwgJ2h0dHAnOiB0cnVlLCAnZW1haWwnOiB0cnVlLCAnd2FpdCc6IHRydWUsICdhc3luYyc6IHRydWUsICdjdXN0b20nOiB0cnVlLCAnZnMnOiB0cnVlfTtcbnZhciBUUkFDRV9UWVBFUyA9IFsnc3ViJywgJ21ldGhvZCcsICdodHRwJ107XG52YXIgTUFYX1RSQUNFX0VWRU5UUyA9IDE1MDA7XG5cblRyYWNlciA9IGZ1bmN0aW9uIFRyYWNlcigpIHtcbiAgdGhpcy5fZmlsdGVycyA9IFtdO1xuICB0aGlzLl9maWx0ZXJGaWVsZHMgPSBbJ3Bhc3N3b3JkJ107XG4gIHRoaXMubWF4QXJyYXlJdGVtc1RvRmlsdGVyID0gMjA7XG59O1xuXG4vL0luIHRoZSBmdXR1cmUsIHdlIG1pZ2h0IHdhbid0IHRvIHRyYWNrIGlubmVyIGZpYmVyIGV2ZW50cyB0b28uXG4vL1RoZW4gd2UgY2FuJ3Qgc2VyaWFsaXplIHRoZSBvYmplY3Qgd2l0aCBtZXRob2RzXG4vL1RoYXQncyB3aHkgd2UgdXNlIHRoaXMgbWV0aG9kIG9mIHJldHVybmluZyB0aGUgZGF0YVxuVHJhY2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChuYW1lLCB0eXBlLCB7XG4gIHNlc3Npb25JZCxcbiAgbXNnSWQsXG4gIHVzZXJJZFxufSA9IHt9KSB7XG5cbiAgLy8gZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBsZXQgc2Vzc2lvbiA9IG5hbWU7XG4gICAgbGV0IG1zZyA9IHR5cGU7XG4gICAgc2Vzc2lvbklkID0gc2Vzc2lvbi5pZDtcbiAgICBtc2dJZCA9IG1zZy5pZDtcbiAgICB1c2VySWQgPSBzZXNzaW9uLnVzZXJJZDtcblxuICAgIGlmKG1zZy5tc2cgPT0gJ21ldGhvZCcpIHtcbiAgICAgIHR5cGUgPSAnbWV0aG9kJztcbiAgICAgIG5hbWUgPSBtc2cubWV0aG9kO1xuICAgIH0gZWxzZSBpZihtc2cubXNnID09ICdzdWInKSB7XG4gICAgICB0eXBlID0gJ3N1Yic7XG4gICAgICBuYW1lID0gbXNnLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlmIChUUkFDRV9UWVBFUy5pbmRleE9mKHR5cGUpID09PSAtMSkge1xuICAgIGNvbnNvbGUud2FybihgTW9udGkgQVBNOiB1bmtub3duIHRyYWNlIHR5cGUgXCIke3R5cGV9XCJgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgdmFyIHRyYWNlSW5mbyA9IHtcbiAgICBfaWQ6IGAke3Nlc3Npb25JZH06OiR7bXNnSWQgfHwgRGVmYXVsdFVuaXF1ZUlkLmdldCgpfWAsXG4gICAgdHlwZSxcbiAgICBuYW1lLFxuICAgIHNlc3Npb246IHNlc3Npb25JZCxcbiAgICBpZDogbXNnSWQsXG4gICAgZXZlbnRzOiBbXSxcbiAgICB1c2VySWQsXG4gIH07XG5cbiAgcmV0dXJuIHRyYWNlSW5mbztcbn07XG5cblRyYWNlci5wcm90b3R5cGUuZXZlbnQgPSBmdW5jdGlvbiAodHJhY2VJbmZvLCB0eXBlLCBkYXRhLCBtZXRhRGF0YSkge1xuICAvLyBkbyBub3QgYWxsb3cgdG8gcHJvY2VlZCwgaWYgYWxyZWFkeSBjb21wbGV0ZWQgb3IgZXJyb3JlZFxuICB2YXIgbGFzdEV2ZW50ID0gdGhpcy5nZXRMYXN0RXZlbnQodHJhY2VJbmZvKTtcblxuICBpZihcbiAgICAvLyB0cmFjZSBjb21wbGV0ZWQgYnV0IGhhcyBub3QgYmVlbiBwcm9jZXNzZWRcbiAgICBsYXN0RXZlbnQgJiZcbiAgICBbJ2NvbXBsZXRlJywgJ2Vycm9yJ10uaW5kZXhPZihsYXN0RXZlbnQudHlwZSkgPj0gMCB8fFxuICAgIC8vIHRyYWNlIGNvbXBsZXRlZCBhbmQgcHJvY2Vzc2VkLlxuICAgIHRyYWNlSW5mby5pc0V2ZW50c1Byb2Nlc3NlZFxuICAgICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBldmVudCA9IHtcbiAgICB0eXBlLFxuICAgIGF0OiBOdHAuX25vdygpLFxuICAgIGVuZEF0OiBudWxsLFxuICAgIG5lc3RlZDogW10sXG4gIH07XG5cbiAgLy8gc3BlY2lhbCBoYW5kbGluZyBmb3IgZXZlbnRzIHRoYXQgYXJlIG5vdCByZXBldGl0aXZlXG4gIGlmICghUkVQRVRJVElWRV9FVkVOVFNbdHlwZV0pIHtcbiAgICBldmVudC5lbmRBdCA9IGV2ZW50LmF0O1xuICB9XG5cbiAgaWYoZGF0YSkge1xuICAgIHZhciBpbmZvID0gXy5waWNrKHRyYWNlSW5mbywgJ3R5cGUnLCAnbmFtZScpXG4gICAgZXZlbnQuZGF0YSA9IHRoaXMuX2FwcGx5RmlsdGVycyh0eXBlLCBkYXRhLCBpbmZvLCBcInN0YXJ0XCIpO1xuICB9XG5cbiAgaWYgKG1ldGFEYXRhICYmIG1ldGFEYXRhLm5hbWUpIHtcbiAgICBldmVudC5uYW1lID0gbWV0YURhdGEubmFtZVxuICB9XG5cbiAgaWYgKEthZGlyYS5vcHRpb25zLmV2ZW50U3RhY2tUcmFjZSkge1xuICAgIGV2ZW50LnN0YWNrID0gQ3JlYXRlVXNlclN0YWNrKClcbiAgfVxuICBcbiAgZXZlbnRMb2dnZXIoXCIlcyAlc1wiLCB0eXBlLCB0cmFjZUluZm8uX2lkKTtcblxuICBpZiAobGFzdEV2ZW50ICYmICFsYXN0RXZlbnQuZW5kQXQpIHtcbiAgICBpZiAoIWxhc3RFdmVudC5uZXN0ZWQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01vbnRpOiBpbnZhbGlkIHRyYWNlLiBQbGVhc2Ugc2hhcmUgdGhlIHRyYWNlIGJlbG93IGF0Jyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdNb250aTogaHR0cHM6Ly9naXRodWIuY29tL21vbnRpLWFwbS9tb250aS1hcG0tYWdlbnQvaXNzdWVzLzE0Jyk7XG4gICAgICBjb25zb2xlLmRpcih0cmFjZUluZm8sIHsgZGVwdGg6IDEwIH0pO1xuICAgIH1cbiAgICB2YXIgbGFzdE5lc3RlZCA9IGxhc3RFdmVudC5uZXN0ZWRbbGFzdEV2ZW50Lm5lc3RlZC5sZW5ndGggLSAxXTtcblxuICAgIC8vIE9ubHkgbmVzdCBvbmUgbGV2ZWxcbiAgICBpZiAoIWxhc3ROZXN0ZWQgfHwgbGFzdE5lc3RlZC5lbmRBdCkge1xuICAgICAgbGFzdEV2ZW50Lm5lc3RlZC5wdXNoKGV2ZW50KTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIHRyYWNlSW5mby5ldmVudHMucHVzaChldmVudCk7XG5cbiAgcmV0dXJuIGV2ZW50O1xufTtcblxuVHJhY2VyLnByb3RvdHlwZS5ldmVudEVuZCA9IGZ1bmN0aW9uKHRyYWNlSW5mbywgZXZlbnQsIGRhdGEpIHtcbiAgaWYgKGV2ZW50LmVuZEF0KSB7XG4gICAgLy8gRXZlbnQgYWxyZWFkeSBlbmRlZCBvciBpcyBub3QgYSByZXBpdGl0aXZlIGV2ZW50XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZXZlbnQuZW5kQXQgPSBOdHAuX25vdygpO1xuXG4gIGlmKGRhdGEpIHtcbiAgICB2YXIgaW5mbyA9IF8ucGljayh0cmFjZUluZm8sICd0eXBlJywgJ25hbWUnKVxuICAgIGV2ZW50LmRhdGEgPSBPYmplY3QuYXNzaWduKFxuICAgICAgZXZlbnQuZGF0YSB8fCB7fSxcbiAgICAgIHRoaXMuX2FwcGx5RmlsdGVycyhgJHtldmVudC50eXBlfWVuZGAsIGRhdGEsIGluZm8sICdlbmQnKVxuICAgICk7XG4gIH1cbiAgZXZlbnRMb2dnZXIoXCIlcyAlc1wiLCBldmVudC50eXBlICsgJ2VuZCcsIHRyYWNlSW5mby5faWQpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuVHJhY2VyLnByb3RvdHlwZS5nZXRMYXN0RXZlbnQgPSBmdW5jdGlvbih0cmFjZUluZm8pIHtcbiAgcmV0dXJuIHRyYWNlSW5mby5ldmVudHNbdHJhY2VJbmZvLmV2ZW50cy5sZW5ndGggLTFdXG59O1xuXG5UcmFjZXIucHJvdG90eXBlLmVuZExhc3RFdmVudCA9IGZ1bmN0aW9uKHRyYWNlSW5mbykge1xuICB2YXIgbGFzdEV2ZW50ID0gdGhpcy5nZXRMYXN0RXZlbnQodHJhY2VJbmZvKTtcblxuICBpZiAoIWxhc3RFdmVudC5lbmRBdCkge1xuICAgIHRoaXMuZXZlbnRFbmQodHJhY2VJbmZvLCBsYXN0RXZlbnQpO1xuICAgIGxhc3RFdmVudC5mb3JjZWRFbmQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIE1vc3Qgb2YgdGhlIHRpbWUsIGFsbCBvZiB0aGUgbmVzdGVkIGV2ZW50cyBhcmUgYXN5bmNcbi8vIHdoaWNoIGlzIG5vdCBoZWxwZnVsLiBUaGlzIHJldHVybnMgdHJ1ZSBpZlxuLy8gdGhlcmUgYXJlIG5lc3RlZCBldmVudHMgb3RoZXIgdGhhbiBhc3luYy5cblRyYWNlci5wcm90b3R5cGUuX2hhc1VzZWZ1bE5lc3RlZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICByZXR1cm4gIWV2ZW50Lm5lc3RlZC5ldmVyeShldmVudCA9PiB7XG4gICAgcmV0dXJuIGV2ZW50LnR5cGUgPT09ICdhc3luYyc7XG4gIH0pO1xufVxuXG5UcmFjZXIucHJvdG90eXBlLmJ1aWxkRXZlbnQgPSBmdW5jdGlvbihldmVudCwgZGVwdGggPSAwLCB0cmFjZSkge1xuICB2YXIgZWxhcHNlZFRpbWVGb3JFdmVudCA9IGV2ZW50LmVuZEF0IC0gZXZlbnQuYXQ7XG4gIHZhciBidWlsdEV2ZW50ID0gW2V2ZW50LnR5cGVdO1xuICB2YXIgbmVzdGVkID0gW107XG5cbiAgYnVpbHRFdmVudC5wdXNoKGVsYXBzZWRUaW1lRm9yRXZlbnQpO1xuICBidWlsdEV2ZW50LnB1c2goZXZlbnQuZGF0YSB8fCB7fSk7XG4gIFxuICBpZiAoZXZlbnQubmVzdGVkLmxlbmd0aCAmJiB0aGlzLl9oYXNVc2VmdWxOZXN0ZWQoZXZlbnQpKSB7XG4gICAgbGV0IHByZXZFbmQgPSBldmVudC5hdDtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgZXZlbnQubmVzdGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmVzdGVkRXZlbnQgPSBldmVudC5uZXN0ZWRbaV07XG4gICAgICBpZiAoIW5lc3RlZEV2ZW50LmVuZEF0KSB7XG4gICAgICAgIHRoaXMuZXZlbnRFbmQodHJhY2UsIG5lc3RlZEV2ZW50KTtcbiAgICAgICAgbmVzdGVkRXZlbnQuZm9yY2VkRW5kID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbXB1dGVUaW1lID0gbmVzdGVkRXZlbnQuYXQgLSBwcmV2RW5kO1xuICAgICAgaWYgKGNvbXB1dGVUaW1lID4gMCkge1xuICAgICAgICBuZXN0ZWQucHVzaChbJ2NvbXB1dGUnLCBjb21wdXRlVGltZV0pO1xuICAgICAgfVxuXG4gICAgICBuZXN0ZWQucHVzaCh0aGlzLmJ1aWxkRXZlbnQobmVzdGVkRXZlbnQsIGRlcHRoICsgMSwgdHJhY2UpKTtcbiAgICAgIHByZXZFbmQgPSBuZXN0ZWRFdmVudC5lbmRBdDtcbiAgICB9XG4gIH1cblxuXG4gIGlmIChcbiAgICBuZXN0ZWQubGVuZ3RoIHx8XG4gICAgZXZlbnQuc3RhY2sgfHxcbiAgICBldmVudC5mb3JjZWRFbmQgfHxcbiAgICBldmVudC5uYW1lXG4gICkge1xuICAgIGJ1aWx0RXZlbnQucHVzaCh7XG4gICAgICBzdGFjazogZXZlbnQuc3RhY2ssXG4gICAgICBuZXN0ZWQ6IG5lc3RlZC5sZW5ndGggPyBuZXN0ZWQgOiB1bmRlZmluZWQsXG4gICAgICBmb3JjZWRFbmQ6IGV2ZW50LmZvcmNlZEVuZCxcbiAgICAgIG5hbWU6IGV2ZW50Lm5hbWVcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBidWlsdEV2ZW50O1xufVxuXG5UcmFjZXIucHJvdG90eXBlLmJ1aWxkVHJhY2UgPSBmdW5jdGlvbiAodHJhY2VJbmZvKSB7XG4gIHZhciBmaXJzdEV2ZW50ID0gdHJhY2VJbmZvLmV2ZW50c1swXTtcbiAgdmFyIGxhc3RFdmVudCA9IHRyYWNlSW5mby5ldmVudHNbdHJhY2VJbmZvLmV2ZW50cy5sZW5ndGggLSAxXTtcbiAgdmFyIHByb2Nlc3NlZEV2ZW50cyA9IFtdO1xuXG4gIGlmIChmaXJzdEV2ZW50LnR5cGUgIT09ICdzdGFydCcpIHtcbiAgICBjb25zb2xlLndhcm4oJ01vbnRpIEFQTTogdHJhY2UgaGFzIG5vdCBzdGFydGVkIHlldCcpO1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKGxhc3RFdmVudC50eXBlICE9PSAnY29tcGxldGUnICYmIGxhc3RFdmVudC50eXBlICE9PSAnZXJyb3InKSB7XG4gICAgLy90cmFjZSBpcyBub3QgY29tcGxldGVkIG9yIGVycm9yZWQgeWV0XG4gICAgY29uc29sZS53YXJuKCdNb250aSBBUE06IHRyYWNlIGhhcyBub3QgY29tcGxldGVkIG9yIGVycm9yZWQgeWV0Jyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgLy9idWlsZCB0aGUgbWV0cmljc1xuICAgIHRyYWNlSW5mby5lcnJvcmVkID0gbGFzdEV2ZW50LnR5cGUgPT09ICdlcnJvcic7XG4gICAgdHJhY2VJbmZvLmF0ID0gZmlyc3RFdmVudC5hdDtcblxuICAgIHZhciBtZXRyaWNzID0ge1xuICAgICAgdG90YWw6IGxhc3RFdmVudC5hdCAtIGZpcnN0RXZlbnQuYXQsXG4gICAgfTtcblxuICAgIHZhciB0b3RhbE5vbkNvbXB1dGUgPSAwO1xuXG4gICAgZmlyc3RFdmVudCA9IFsnc3RhcnQnLCAwXTtcbiAgICBpZiAodHJhY2VJbmZvLmV2ZW50c1swXS5kYXRhKSB7XG4gICAgICBmaXJzdEV2ZW50LnB1c2godHJhY2VJbmZvLmV2ZW50c1swXS5kYXRhKTtcbiAgICB9XG4gICAgcHJvY2Vzc2VkRXZlbnRzLnB1c2goZmlyc3RFdmVudCk7XG5cbiAgICBmb3IgKHZhciBsYyA9IDE7IGxjIDwgdHJhY2VJbmZvLmV2ZW50cy5sZW5ndGggLSAxOyBsYyArPSAxKSB7XG4gICAgICB2YXIgcHJldkV2ZW50ID0gdHJhY2VJbmZvLmV2ZW50c1tsYyAtIDFdO1xuICAgICAgdmFyIGV2ZW50ID0gdHJhY2VJbmZvLmV2ZW50c1tsY107XG5cbiAgICAgIGlmICghZXZlbnQuZW5kQXQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTW9udGkgQVBNOiBubyBlbmQgZXZlbnQgZm9yIHR5cGU6ICcsIGV2ZW50LnR5cGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbXB1dGVUaW1lID0gZXZlbnQuYXQgLSBwcmV2RXZlbnQuZW5kQXQ7XG4gICAgICBpZiAoY29tcHV0ZVRpbWUgPiAwKSB7XG4gICAgICAgIHByb2Nlc3NlZEV2ZW50cy5wdXNoKFsnY29tcHV0ZScsIGNvbXB1dGVUaW1lXSk7XG4gICAgICB9XG4gICAgICB2YXIgYnVpbHRFdmVudCA9IHRoaXMuYnVpbGRFdmVudChldmVudCwgMCwgdHJhY2VJbmZvKTtcbiAgICAgIHByb2Nlc3NlZEV2ZW50cy5wdXNoKGJ1aWx0RXZlbnQpO1xuXG4gICAgICBtZXRyaWNzW2V2ZW50LnR5cGVdID0gbWV0cmljc1tldmVudC50eXBlXSB8fCAwO1xuICAgICAgbWV0cmljc1tldmVudC50eXBlXSArPSBidWlsdEV2ZW50WzFdO1xuICAgICAgdG90YWxOb25Db21wdXRlICs9IGJ1aWx0RXZlbnRbMV07XG4gICAgfVxuICB9XG5cbiAgY29tcHV0ZVRpbWUgPSBsYXN0RXZlbnQuYXQgLSB0cmFjZUluZm8uZXZlbnRzW3RyYWNlSW5mby5ldmVudHMubGVuZ3RoIC0gMl0uZW5kQXQ7XG4gIGlmKGNvbXB1dGVUaW1lID4gMCkgcHJvY2Vzc2VkRXZlbnRzLnB1c2goWydjb21wdXRlJywgY29tcHV0ZVRpbWVdKTtcblxuICB2YXIgbGFzdEV2ZW50RGF0YSA9IFtsYXN0RXZlbnQudHlwZSwgMF07XG4gIGlmKGxhc3RFdmVudC5kYXRhKSBsYXN0RXZlbnREYXRhLnB1c2gobGFzdEV2ZW50LmRhdGEpO1xuICBwcm9jZXNzZWRFdmVudHMucHVzaChsYXN0RXZlbnREYXRhKTtcblxuICBpZiAocHJvY2Vzc2VkRXZlbnRzLmxlbmd0aCA+IE1BWF9UUkFDRV9FVkVOVFMpIHtcbiAgICBjb25zdCByZW1vdmVDb3VudCA9IHByb2Nlc3NlZEV2ZW50cy5sZW5ndGggLSBNQVhfVFJBQ0VfRVZFTlRTXG4gICAgcHJvY2Vzc2VkRXZlbnRzLnNwbGljZShNQVhfVFJBQ0VfRVZFTlRTLCByZW1vdmVDb3VudCk7XG4gIH1cblxuICBtZXRyaWNzLmNvbXB1dGUgPSBtZXRyaWNzLnRvdGFsIC0gdG90YWxOb25Db21wdXRlO1xuICB0cmFjZUluZm8ubWV0cmljcyA9IG1ldHJpY3M7XG4gIHRyYWNlSW5mby5ldmVudHMgPSBwcm9jZXNzZWRFdmVudHM7XG4gIHRyYWNlSW5mby5pc0V2ZW50c1Byb2Nlc3NlZCA9IHRydWU7XG4gIHJldHVybiB0cmFjZUluZm87XG59O1xuXG5UcmFjZXIucHJvdG90eXBlLmFkZEZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlckZuKSB7XG4gIHRoaXMuX2ZpbHRlcnMucHVzaChmaWx0ZXJGbik7XG59O1xuXG5UcmFjZXIucHJvdG90eXBlLnJlZGFjdEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHRoaXMuX2ZpbHRlckZpZWxkcy5wdXNoKGZpZWxkKTtcbn07XG5cblRyYWNlci5wcm90b3R5cGUuX2FwcGx5RmlsdGVycyA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgZGF0YSwgaW5mbykge1xuICB0aGlzLl9maWx0ZXJzLmZvckVhY2goZnVuY3Rpb24oZmlsdGVyRm4pIHtcbiAgICBkYXRhID0gZmlsdGVyRm4oZXZlbnRUeXBlLCBfLmNsb25lKGRhdGEpLCBpbmZvKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuXG5UcmFjZXIucHJvdG90eXBlLl9hcHBseU9iamVjdEZpbHRlcnMgPSBmdW5jdGlvbiAodG9GaWx0ZXIpIHtcbiAgY29uc3QgZmlsdGVyT2JqZWN0ID0gKG9iaikgPT4ge1xuICAgIGxldCBjbG9uZWQ7XG4gICAgdGhpcy5fZmlsdGVyRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoZmllbGQgaW4gb2JqKSB7XG4gICAgICAgIGNsb25lZCA9IGNsb25lZCB8fCBPYmplY3QuYXNzaWduKHt9LCBvYmopO1xuICAgICAgICBjbG9uZWRbZmllbGRdID0gJ01vbnRpOiByZWRhY3RlZCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2xvbmVkO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodG9GaWx0ZXIpKSB7XG4gICAgbGV0IGNsb25lZDtcbiAgICAvLyBUaGVyZSBjb3VsZCBiZSB0aG91c2FuZHMgb3IgbW9yZSBpdGVtcyBpbiB0aGUgYXJyYXksIGFuZCB0aGlzIHVzdWFsbHkgcnVuc1xuICAgIC8vIGJlZm9yZSB0aGUgZGF0YSBpcyB2YWxpZGF0ZWQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zIHdlIGxpbWl0IGhvd1xuICAgIC8vIG1hbnkgdG8gY2hlY2tcbiAgICBsZXQgbGVuZ3RoID0gTWF0aC5taW4odG9GaWx0ZXIubGVuZ3RoLCB0aGlzLm1heEFycmF5SXRlbXNUb0ZpbHRlcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHR5cGVvZiB0b0ZpbHRlcltpXSA9PT0gJ29iamVjdCcgJiYgdG9GaWx0ZXJbaV0gIT09IG51bGwpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZpbHRlck9iamVjdCh0b0ZpbHRlcltpXSk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICBjbG9uZWQgPSBjbG9uZWQgfHwgWy4uLnRvRmlsdGVyXTtcbiAgICAgICAgICBjbG9uZWRbaV0gPSByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xvbmVkIHx8IHRvRmlsdGVyO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlck9iamVjdCh0b0ZpbHRlcikgfHwgdG9GaWx0ZXI7XG59XG5cbkthZGlyYS50cmFjZXIgPSBuZXcgVHJhY2VyKCk7XG4vLyBuZWVkIHRvIGV4cG9zZSBUcmFjZXIgdG8gcHJvdmlkZSBkZWZhdWx0IHNldCBvZiBmaWx0ZXJzXG5LYWRpcmEuVHJhY2VyID0gVHJhY2VyO1xuIiwiLy8gc3RyaXAgc2Vuc2l0aXZlIGRhdGEgc2VudCB0byBNb250aSBBUE0gZW5naW5lLlxuLy8gcG9zc2libGUgdG8gbGltaXQgdHlwZXMgYnkgcHJvdmlkaW5nIGFuIGFycmF5IG9mIHR5cGVzIHRvIHN0cmlwXG4vLyBwb3NzaWJsZSB0eXBlcyBhcmU6IFwic3RhcnRcIiwgXCJkYlwiLCBcImh0dHBcIiwgXCJlbWFpbFwiXG5UcmFjZXIuc3RyaXBTZW5zaXRpdmUgPSBmdW5jdGlvbiBzdHJpcFNlbnNpdGl2ZSh0eXBlc1RvU3RyaXAsIHJlY2VpdmVyVHlwZSwgbmFtZSkge1xuICB0eXBlc1RvU3RyaXAgPSAgdHlwZXNUb1N0cmlwIHx8IFtdO1xuXG4gIHZhciBzdHJpcHBlZFR5cGVzID0ge307XG4gIHR5cGVzVG9TdHJpcC5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBzdHJpcHBlZFR5cGVzW3R5cGVdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlLCBkYXRhLCBpbmZvKSB7XG4gICAgaWYodHlwZXNUb1N0cmlwLmxlbmd0aCA+IDAgJiYgIXN0cmlwcGVkVHlwZXNbdHlwZV0pXG4gICAgICByZXR1cm4gZGF0YTtcblxuICAgIGlmKHJlY2VpdmVyVHlwZSAmJiByZWNlaXZlclR5cGUgIT0gaW5mby50eXBlKVxuICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICBpZihuYW1lICYmIG5hbWUgIT0gaW5mby5uYW1lKVxuICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICBpZih0eXBlID09IFwic3RhcnRcIikge1xuICAgICAgaWYgKGRhdGEucGFyYW1zKSB7XG4gICAgICAgIGRhdGEucGFyYW1zID0gXCJbc3RyaXBwZWRdXCI7XG4gICAgICB9XG4gICAgICBpZiAoZGF0YS5oZWFkZXJzKSB7XG4gICAgICAgIGRhdGEuaGVhZGVycyA9IFwiW3N0cmlwcGVkXVwiO1xuICAgICAgfVxuICAgICAgaWYgKGRhdGEuYm9keSkge1xuICAgICAgICBkYXRhLmJvZHkgPSBcIltzdHJpcHBlZF1cIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRiXCIpIHtcbiAgICAgIGRhdGEuc2VsZWN0b3IgPSBcIltzdHJpcHBlZF1cIjtcbiAgICB9IGVsc2UgaWYodHlwZSA9PSBcImh0dHBcIikge1xuICAgICAgZGF0YS51cmwgPSBcIltzdHJpcHBlZF1cIjtcbiAgICB9IGVsc2UgaWYodHlwZSA9PSBcImVtYWlsXCIpIHtcbiAgICAgIFtcImZyb21cIiwgXCJ0b1wiLCBcImNjXCIsIFwiYmNjXCIsIFwicmVwbHlUb1wiXS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYoZGF0YVtpdGVtXSkge1xuICAgICAgICAgIGRhdGFbaXRlbV0gPSBcIltzdHJpcHBlZF1cIjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG59O1xuXG4vLyBTdHJpcCBzZW5zaXRpdmUgZGF0YSBzZW50IHRvIE1vbnRpIEFQTSBlbmdpbmUuXG4vLyBJbiBjb250cmFzdCB0byBzdHJpcFNlbnNpdGl2ZSwgdGhpcyBvbmUgaGFzIGFuIGFsbG93IGxpc3Qgb2Ygd2hhdCB0byBrZWVwXG4vLyB0byBndWFyZCBhZ2FpbnN0IGZvcmdldHRpbmcgdG8gc3RyaXAgbmV3IGZpZWxkc1xuLy8gSW4gdGhlIGZ1dHVyZSB0aGlzIG9uZSBtaWdodCByZXBsYWNlIFRyYWNlci5zdHJpcFNlbnNpdGl2ZVxuLy8gb3B0aW9uc1xuVHJhY2VyLnN0cmlwU2Vuc2l0aXZlVGhvcm91Z2ggPSBmdW5jdGlvbiBzdHJpcFNlbnNpdGl2ZSgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gICAgbGV0IGZpZWxkc1RvS2VlcCA9IFtdO1xuXG4gICAgaWYgKHR5cGUgPT0gXCJzdGFydFwiKSB7XG4gICAgICBmaWVsZHNUb0tlZXAgPSBbJ3VzZXJJZCddO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3dhaXRlbmQnKSB7XG4gICAgICBmaWVsZHNUb0tlZXAgPSBbICd3YWl0T24nIF07XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGJcIikge1xuICAgICAgZmllbGRzVG9LZWVwID0gW1xuICAgICAgICAnY29sbCcsICdmdW5jJywgJ2N1cnNvcicsICdsaW1pdCcsICdkb2NzRmV0Y2hlZCcsICdkb2NTaXplJywgJ29wbG9nJyxcbiAgICAgICAgJ2ZpZWxkcycsICdwcm9qZWN0aW9uJywgJ3dhc011bHRpcGxleGVyUmVhZHknLCAncXVldWVMZW5ndGgnLCAnZWxhcHNlZFBvbGxpbmdUaW1lJyxcbiAgICAgICAgJ25vT2ZDYWNoZWREb2NzJ1xuICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJodHRwXCIpIHtcbiAgICAgIGZpZWxkc1RvS2VlcCA9IFsnbWV0aG9kJywgJ3N0YXR1c0NvZGUnXTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbWFpbFwiKSB7XG4gICAgICBmaWVsZHNUb0tlZXAgPSBbXTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjdXN0b20nKSB7XG4gICAgICAvLyBUaGlzIGlzIHN1cHBsaWVkIGJ5IHRoZSB1c2VyIHNvIHdlIGFzc3VtZSB0aGV5IGFyZSBvbmx5IGdpdmluZyBkYXRhIHRoYXQgY2FuIGJlIHNlbnRcbiAgICAgIGZpZWxkc1RvS2VlcCA9IE9iamVjdC5rZXlzKGRhdGEpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgZmllbGRzVG9LZWVwID0gWydlcnJvciddO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmIChmaWVsZHNUb0tlZXAuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgICBkYXRhW2tleV0gPSAnW3N0cmlwcGVkXSc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbn07XG5cbi8vIHN0cmlwIHNlbGVjdG9ycyBvbmx5IGZyb20gdGhlIGdpdmVuIGxpc3Qgb2YgY29sbGVjdGlvbiBuYW1lc1xuVHJhY2VyLnN0cmlwU2VsZWN0b3JzID0gZnVuY3Rpb24gc3RyaXBTZWxlY3RvcnMoY29sbGVjdGlvbkxpc3QsIHJlY2VpdmVyVHlwZSwgbmFtZSkge1xuICBjb2xsZWN0aW9uTGlzdCA9IGNvbGxlY3Rpb25MaXN0IHx8IFtdO1xuXG4gIHZhciBjb2xsTWFwID0ge307XG4gIGNvbGxlY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oY29sbE5hbWUpIHtcbiAgICBjb2xsTWFwW2NvbGxOYW1lXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbih0eXBlLCBkYXRhLCBpbmZvKSB7XG4gICAgaWYodHlwZSAhPSBcImRiXCIgfHwgKGRhdGEgJiYgIWNvbGxNYXBbZGF0YS5jb2xsXSkpIHtcbiAgICAgIHJldHVybiBkYXRhXG4gICAgfVxuXG4gICAgaWYocmVjZWl2ZXJUeXBlICYmIHJlY2VpdmVyVHlwZSAhPSBpbmZvLnR5cGUpXG4gICAgICByZXR1cm4gZGF0YTtcblxuICAgIGlmKG5hbWUgJiYgbmFtZSAhPSBpbmZvLm5hbWUpXG4gICAgICByZXR1cm4gZGF0YTtcblxuICAgIGRhdGEuc2VsZWN0b3IgPSBcIltzdHJpcHBlZF1cIjtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbn1cbiIsInZhciBsb2dnZXIgPSBOcG0ucmVxdWlyZSgnZGVidWcnKSgna2FkaXJhOnRzJyk7XG5cblRyYWNlclN0b3JlID0gZnVuY3Rpb24gVHJhY2VyU3RvcmUob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0aGlzLm1heFRvdGFsUG9pbnRzID0gb3B0aW9ucy5tYXhUb3RhbFBvaW50cyB8fCAzMDtcbiAgdGhpcy5pbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWwgfHwgMTAwMCAqIDYwO1xuICB0aGlzLmFyY2hpdmVFdmVyeSA9IG9wdGlvbnMuYXJjaGl2ZUV2ZXJ5IHx8IHRoaXMubWF4VG90YWxQb2ludHMgLyA2O1xuXG4gIC8vc3RvcmUgbWF4IHRvdGFsIG9uIHRoZSBwYXN0IDMwIG1pbnV0ZXMgKG9yIHBhc3QgMzAgaXRlbXMpXG4gIHRoaXMubWF4VG90YWxzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgLy9zdG9yZSB0aGUgbWF4IHRyYWNlIG9mIHRoZSBjdXJyZW50IGludGVydmFsXG4gIHRoaXMuY3VycmVudE1heFRyYWNlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgLy9hcmNoaXZlIGZvciB0aGUgdHJhY2VzXG4gIHRoaXMudHJhY2VBcmNoaXZlID0gW107XG5cbiAgdGhpcy5wcm9jZXNzZWRDbnQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vZ3JvdXAgZXJyb3JzIGJ5IG1lc3NhZ2VzIGJldHdlZW4gYW4gaW50ZXJ2YWxcbiAgdGhpcy5lcnJvck1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuYWRkVHJhY2UgPSBmdW5jdGlvbih0cmFjZSkge1xuICB2YXIga2luZCA9IFt0cmFjZS50eXBlLCB0cmFjZS5uYW1lXS5qb2luKCc6OicpO1xuICBpZighdGhpcy5jdXJyZW50TWF4VHJhY2Vba2luZF0pIHtcbiAgICB0aGlzLmN1cnJlbnRNYXhUcmFjZVtraW5kXSA9IEVKU09OLmNsb25lKHRyYWNlKTtcbiAgfSBlbHNlIGlmKHRoaXMuY3VycmVudE1heFRyYWNlW2tpbmRdLm1ldHJpY3MudG90YWwgPCB0cmFjZS5tZXRyaWNzLnRvdGFsKSB7XG4gICAgdGhpcy5jdXJyZW50TWF4VHJhY2Vba2luZF0gPSBFSlNPTi5jbG9uZSh0cmFjZSk7XG4gIH0gZWxzZSBpZih0cmFjZS5lcnJvcmVkKSB7XG4gICAgdGhpcy5faGFuZGxlRXJyb3JzKHRyYWNlKTtcbiAgfVxufTtcblxuVHJhY2VyU3RvcmUucHJvdG90eXBlLmNvbGxlY3RUcmFjZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHRyYWNlcyA9IHRoaXMudHJhY2VBcmNoaXZlO1xuICB0aGlzLnRyYWNlQXJjaGl2ZSA9IFtdO1xuXG4gIC8vIGNvbnZlcnQgYXQodGltZXN0YW1wKSBpbnRvIHRoZSBhY3R1YWwgc2VydmVyVGltZVxuICB0cmFjZXMuZm9yRWFjaChmdW5jdGlvbih0cmFjZSkge1xuICAgIHRyYWNlLmF0ID0gS2FkaXJhLnN5bmNlZERhdGUuc3luY1RpbWUodHJhY2UuYXQpO1xuICB9KTtcbiAgcmV0dXJuIHRyYWNlcztcbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl90aW1lb3V0SGFuZGxlciA9IHNldEludGVydmFsKHRoaXMucHJvY2Vzc1RyYWNlcy5iaW5kKHRoaXMpLCB0aGlzLmludGVydmFsKTtcbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIGlmKHRoaXMuX3RpbWVvdXRIYW5kbGVyKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lb3V0SGFuZGxlcik7XG4gIH1cbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5faGFuZGxlRXJyb3JzID0gZnVuY3Rpb24odHJhY2UpIHtcbiAgLy8gc2VuZGluZyBlcnJvciByZXF1ZXN0cyBhcyBpdCBpc1xuICB2YXIgbGFzdEV2ZW50ID0gdHJhY2UuZXZlbnRzW3RyYWNlLmV2ZW50cy5sZW5ndGggLTFdO1xuICBpZihsYXN0RXZlbnQgJiYgbGFzdEV2ZW50WzJdKSB7XG4gICAgdmFyIGVycm9yID0gbGFzdEV2ZW50WzJdLmVycm9yO1xuXG4gICAgLy8gZ3JvdXBpbmcgZXJyb3JzIG9jY3VyZWQgKHJlc2V0IGFmdGVyIHByb2Nlc3NUcmFjZXMpXG4gICAgdmFyIGVycm9yS2V5ID0gW3RyYWNlLnR5cGUsIHRyYWNlLm5hbWUsIGVycm9yLm1lc3NhZ2VdLmpvaW4oXCI6OlwiKTtcbiAgICBpZighdGhpcy5lcnJvck1hcFtlcnJvcktleV0pIHtcbiAgICAgIHZhciBlcnJvcmVkVHJhY2UgPSBFSlNPTi5jbG9uZSh0cmFjZSk7XG4gICAgICB0aGlzLmVycm9yTWFwW2Vycm9yS2V5XSA9IGVycm9yZWRUcmFjZTtcblxuICAgICAgdGhpcy50cmFjZUFyY2hpdmUucHVzaChlcnJvcmVkVHJhY2UpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsb2dnZXIoJ2xhc3QgZXZlbnRzIGlzIG5vdCBhbiBlcnJvcjogJywgSlNPTi5zdHJpbmdpZnkodHJhY2UuZXZlbnRzKSk7XG4gIH1cbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5wcm9jZXNzVHJhY2VzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgXG4gIGxldCBraW5kcyA9IG5ldyBTZXQoKTtcbiAgT2JqZWN0LmtleXModGhpcy5tYXhUb3RhbHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBraW5kcy5hZGQoa2V5KTtcbiAgfSk7XG4gIE9iamVjdC5rZXlzKHRoaXMuY3VycmVudE1heFRyYWNlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAga2luZHMuYWRkKGtleSk7XG4gIH0pO1xuXG4gIGZvciAoa2luZCBvZiBraW5kcykge1xuICAgIHNlbGYucHJvY2Vzc2VkQ250W2tpbmRdID0gc2VsZi5wcm9jZXNzZWRDbnRba2luZF0gfHwgMDtcbiAgICB2YXIgY3VycmVudE1heFRyYWNlID0gc2VsZi5jdXJyZW50TWF4VHJhY2Vba2luZF07XG4gICAgdmFyIGN1cnJlbnRNYXhUb3RhbCA9IGN1cnJlbnRNYXhUcmFjZT8gY3VycmVudE1heFRyYWNlLm1ldHJpY3MudG90YWwgOiAwO1xuXG4gICAgc2VsZi5tYXhUb3RhbHNba2luZF0gPSBzZWxmLm1heFRvdGFsc1traW5kXSB8fCBbXTtcbiAgICAvL2FkZCB0aGUgY3VycmVudCBtYXhQb2ludFxuICAgIHNlbGYubWF4VG90YWxzW2tpbmRdLnB1c2goY3VycmVudE1heFRvdGFsKTtcbiAgICB2YXIgZXhjZWVkaW5nUG9pbnRzID0gc2VsZi5tYXhUb3RhbHNba2luZF0ubGVuZ3RoIC0gc2VsZi5tYXhUb3RhbFBvaW50cztcbiAgICBpZihleGNlZWRpbmdQb2ludHMgPiAwKSB7XG4gICAgICBzZWxmLm1heFRvdGFsc1traW5kXS5zcGxpY2UoMCwgZXhjZWVkaW5nUG9pbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgYXJjaGl2ZURlZmF1bHQgPSAoc2VsZi5wcm9jZXNzZWRDbnRba2luZF0gJSBzZWxmLmFyY2hpdmVFdmVyeSkgPT0gMDtcbiAgICBzZWxmLnByb2Nlc3NlZENudFtraW5kXSsrO1xuXG4gICAgdmFyIGNhbkFyY2hpdmUgPSBhcmNoaXZlRGVmYXVsdFxuICAgICAgfHwgc2VsZi5faXNUcmFjZU91dGxpZXIoa2luZCwgY3VycmVudE1heFRyYWNlKTtcblxuICAgIGlmKGNhbkFyY2hpdmUgJiYgY3VycmVudE1heFRyYWNlKSB7XG4gICAgICBzZWxmLnRyYWNlQXJjaGl2ZS5wdXNoKGN1cnJlbnRNYXhUcmFjZSk7XG4gICAgfVxuXG4gICAgLy9yZXNldCBjdXJyZW50TWF4VHJhY2VcbiAgICBzZWxmLmN1cnJlbnRNYXhUcmFjZVtraW5kXSA9IG51bGw7XG4gIH07XG5cbiAgLy9yZXNldCB0aGUgZXJyb3JNYXBcbiAgc2VsZi5lcnJvck1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuX2lzVHJhY2VPdXRsaWVyID0gZnVuY3Rpb24oa2luZCwgdHJhY2UpIHtcbiAgaWYodHJhY2UpIHtcbiAgICB2YXIgZGF0YVNldCA9IHRoaXMubWF4VG90YWxzW2tpbmRdO1xuICAgIHJldHVybiB0aGlzLl9pc091dGxpZXIoZGF0YVNldCwgdHJhY2UubWV0cmljcy50b3RhbCwgMyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vKlxuICBEYXRhIHBvaW50IG11c3QgZXhpc3RzIGluIHRoZSBkYXRhU2V0XG4qL1xuVHJhY2VyU3RvcmUucHJvdG90eXBlLl9pc091dGxpZXIgPSBmdW5jdGlvbihkYXRhU2V0LCBkYXRhUG9pbnQsIG1heE1hZFopIHtcbiAgdmFyIG1lZGlhbiA9IHRoaXMuX2dldE1lZGlhbihkYXRhU2V0KTtcbiAgdmFyIG1hZCA9IHRoaXMuX2NhbGN1bGF0ZU1hZChkYXRhU2V0LCBtZWRpYW4pO1xuICB2YXIgbWFkWiA9IHRoaXMuX2Z1bmNNZWRpYW5EZXZpYXRpb24obWVkaWFuKShkYXRhUG9pbnQpIC8gbWFkO1xuXG4gIHJldHVybiBtYWRaID4gbWF4TWFkWjtcbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5fZ2V0TWVkaWFuID0gZnVuY3Rpb24oZGF0YVNldCkge1xuICB2YXIgc29ydGVkRGF0YVNldCA9IF8uY2xvbmUoZGF0YVNldCkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGEtYjtcbiAgfSk7XG4gIHJldHVybiB0aGlzLl9waWNrUXVhcnRpbGUoc29ydGVkRGF0YVNldCwgMik7XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuX3BpY2tRdWFydGlsZSA9IGZ1bmN0aW9uKGRhdGFTZXQsIG51bSkge1xuICB2YXIgcG9zID0gKChkYXRhU2V0Lmxlbmd0aCArIDEpICogbnVtKSAvIDQ7XG4gIGlmKHBvcyAlIDEgPT0gMCkge1xuICAgIHJldHVybiBkYXRhU2V0W3BvcyAtMV07XG4gIH0gZWxzZSB7XG4gICAgcG9zID0gcG9zIC0gKHBvcyAlIDEpO1xuICAgIHJldHVybiAoZGF0YVNldFtwb3MgLTFdICsgZGF0YVNldFtwb3NdKS8yXG4gIH1cbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5fY2FsY3VsYXRlTWFkID0gZnVuY3Rpb24oZGF0YVNldCwgbWVkaWFuKSB7XG4gIHZhciBtZWRpYW5EZXZpYXRpb25zID0gXy5tYXAoZGF0YVNldCwgdGhpcy5fZnVuY01lZGlhbkRldmlhdGlvbihtZWRpYW4pKTtcbiAgdmFyIG1hZCA9IHRoaXMuX2dldE1lZGlhbihtZWRpYW5EZXZpYXRpb25zKTtcblxuICByZXR1cm4gbWFkO1xufTtcblxuVHJhY2VyU3RvcmUucHJvdG90eXBlLl9mdW5jTWVkaWFuRGV2aWF0aW9uID0gZnVuY3Rpb24obWVkaWFuKSB7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKG1lZGlhbiAtIHgpO1xuICB9O1xufTtcblxuVHJhY2VyU3RvcmUucHJvdG90eXBlLl9nZXRNZWFuID0gZnVuY3Rpb24oZGF0YVBvaW50cykge1xuICBpZihkYXRhUG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgdG90YWwgPSAwO1xuICAgIGRhdGFQb2ludHMuZm9yRWFjaChmdW5jdGlvbihwb2ludCkge1xuICAgICAgdG90YWwgKz0gcG9pbnQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdGFsL2RhdGFQb2ludHMubGVuZ3RoO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59O1xuIiwidmFyIExSVSA9IE5wbS5yZXF1aXJlKCdscnUtY2FjaGUnKTtcbnZhciBjcnlwdG8gPSBOcG0ucmVxdWlyZSgnY3J5cHRvJyk7XG52YXIganNvblN0cmluZ2lmeSA9IE5wbS5yZXF1aXJlKCdqc29uLXN0cmluZ2lmeS1zYWZlJyk7XG5cbkRvY1N6Q2FjaGUgPSBmdW5jdGlvbiAobWF4SXRlbXMsIG1heFZhbHVlcykge1xuICB0aGlzLml0ZW1zID0gbmV3IExSVSh7bWF4OiBtYXhJdGVtc30pO1xuICB0aGlzLm1heFZhbHVlcyA9IG1heFZhbHVlcztcbiAgdGhpcy5jcHVVc2FnZSA9IDA7XG59XG5cbi8vIFRoaXMgaXMgY2FsbGVkIGZyb20gU3lzdGVtTW9kZWwucHJvdG90eXBlLmNwdVVzYWdlIGFuZCBzYXZlcyBjcHUgdXNhZ2UuXG5Eb2NTekNhY2hlLnByb3RvdHlwZS5zZXRQY3B1ID0gZnVuY3Rpb24gKHBjcHUpIHtcbiAgdGhpcy5jcHVVc2FnZSA9IHBjcHU7XG59O1xuXG5Eb2NTekNhY2hlLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gKGNvbGwsIHF1ZXJ5LCBvcHRzLCBkYXRhKSB7XG4gIC8vIElmIHRoZSBkYXRhc2V0IGlzIG51bGwgb3IgZW1wdHkgd2UgY2FuJ3QgY2FsY3VsYXRlIHRoZSBzaXplXG4gIC8vIERvIG5vdCBwcm9jZXNzIHRoaXMgZGF0YSBhbmQgcmV0dXJuIDAgYXMgdGhlIGRvY3VtZW50IHNpemUuXG4gIGlmICghKGRhdGEgJiYgKGRhdGEubGVuZ3RoIHx8ICh0eXBlb2YgZGF0YS5zaXplID09PSAnZnVuY3Rpb24nICYmIGRhdGEuc2l6ZSgpKSkpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIga2V5ID0gdGhpcy5nZXRLZXkoY29sbCwgcXVlcnksIG9wdHMpO1xuICB2YXIgaXRlbSA9IHRoaXMuaXRlbXMuZ2V0KGtleSk7XG5cbiAgaWYgKCFpdGVtKSB7XG4gICAgaXRlbSA9IG5ldyBEb2NTekNhY2hlSXRlbSh0aGlzLm1heFZhbHVlcyk7XG4gICAgdGhpcy5pdGVtcy5zZXQoa2V5LCBpdGVtKTtcbiAgfVxuXG4gIGlmICh0aGlzLm5lZWRzVXBkYXRlKGl0ZW0pKSB7XG4gICAgdmFyIGRvYyA9IHt9O1xuICAgIGlmKHR5cGVvZiBkYXRhLmdldCA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAvLyBUaGlzIGlzIGFuIElkTWFwXG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgIGRvYyA9IGVsZW1lbnQ7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gcmV0dXJuIGZhbHNlIHRvIHN0b3AgbG9vcC4gV2Ugb25seSBuZWVkIG9uZSBkb2MuXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBkb2MgPSBkYXRhWzBdO1xuICAgIH1cbiAgICB2YXIgc2l6ZSA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGpzb25TdHJpbmdpZnkoZG9jKSwgJ3V0ZjgnKTtcbiAgICBpdGVtLmFkZERhdGEoc2l6ZSk7XG4gIH1cblxuICByZXR1cm4gaXRlbS5nZXRWYWx1ZSgpO1xufTtcblxuRG9jU3pDYWNoZS5wcm90b3R5cGUuZ2V0S2V5ID0gZnVuY3Rpb24gKGNvbGwsIHF1ZXJ5LCBvcHRzKSB7XG4gIHJldHVybiBqc29uU3RyaW5naWZ5KFtjb2xsLCBxdWVyeSwgb3B0c10pO1xufTtcblxuLy8gcmV0dXJucyBhIHNjb3JlIGJldHdlZW4gMCBhbmQgMSBmb3IgYSBjYWNoZSBpdGVtXG4vLyB0aGlzIHNjb3JlIGlzIGRldGVybWluZWQgYnk6XG4vLyAgKiBhdmFpbGFibGUgY2FjaGUgaXRlbSBzbG90c1xuLy8gICogdGltZSBzaW5jZSBsYXN0IHVwZGF0ZWRcbi8vICAqIGNwdSB1c2FnZSBvZiB0aGUgYXBwbGljYXRpb25cbkRvY1N6Q2FjaGUucHJvdG90eXBlLmdldEl0ZW1TY29yZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHJldHVybiBbXG4gICAgKGl0ZW0ubWF4VmFsdWVzIC0gaXRlbS52YWx1ZXMubGVuZ3RoKS9pdGVtLm1heFZhbHVlcyxcbiAgICAoRGF0ZS5ub3coKSAtIGl0ZW0udXBkYXRlZCkgLyA2MDAwMCxcbiAgICAoMTAwIC0gdGhpcy5jcHVVc2FnZSkgLyAxMDAsXG4gIF0ubWFwKGZ1bmN0aW9uIChzY29yZSkge1xuICAgIHJldHVybiBzY29yZSA+IDEgPyAxIDogc2NvcmU7XG4gIH0pLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNjb3JlKSB7XG4gICAgcmV0dXJuICh0b3RhbCB8fCAwKSArIHNjb3JlO1xuICB9KSAvIDM7XG59O1xuXG5Eb2NTekNhY2hlLnByb3RvdHlwZS5uZWVkc1VwZGF0ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIC8vIGhhbmRsZSBuZXdseSBtYWRlIGl0ZW1zXG4gIGlmICghaXRlbS52YWx1ZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICB2YXIgdGltZVNpbmNlVXBkYXRlID0gY3VycmVudFRpbWUgLSBpdGVtLnVwZGF0ZWQ7XG4gIGlmICh0aW1lU2luY2VVcGRhdGUgPiAxMDAwKjYwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdGhpcy5nZXRJdGVtU2NvcmUoaXRlbSkgPiAwLjU7XG59O1xuXG5cbkRvY1N6Q2FjaGVJdGVtID0gZnVuY3Rpb24gKG1heFZhbHVlcykge1xuICB0aGlzLm1heFZhbHVlcyA9IG1heFZhbHVlcztcbiAgdGhpcy51cGRhdGVkID0gMDtcbiAgdGhpcy52YWx1ZXMgPSBbXTtcbn1cblxuRG9jU3pDYWNoZUl0ZW0ucHJvdG90eXBlLmFkZERhdGEgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdGhpcy52YWx1ZXMucHVzaCh2YWx1ZSk7XG4gIHRoaXMudXBkYXRlZCA9IERhdGUubm93KCk7XG5cbiAgaWYgKHRoaXMudmFsdWVzLmxlbmd0aCA+IHRoaXMubWF4VmFsdWVzKSB7XG4gICAgdGhpcy52YWx1ZXMuc2hpZnQoKTtcbiAgfVxufTtcblxuRG9jU3pDYWNoZUl0ZW0ucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzb3J0TnVtYmVyKGEsIGIpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH1cbiAgdmFyIHNvcnRlZCA9IHRoaXMudmFsdWVzLnNvcnQoc29ydE51bWJlcik7XG4gIHZhciBtZWRpYW4gPSAwO1xuXG4gIGlmIChzb3J0ZWQubGVuZ3RoICUgMiA9PT0gMCkge1xuICAgIHZhciBpZHggPSBzb3J0ZWQubGVuZ3RoIC8gMjtcbiAgICBtZWRpYW4gPSAoc29ydGVkW2lkeF0gKyBzb3J0ZWRbaWR4LTFdKSAvIDI7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGlkeCA9IE1hdGguZmxvb3Ioc29ydGVkLmxlbmd0aCAvIDIpO1xuICAgIG1lZGlhbiA9IHNvcnRlZFtpZHhdO1xuICB9XG5cbiAgcmV0dXJuIG1lZGlhbjtcbn07XG4iLCJpbXBvcnQgSHR0cE1vZGVsIGZyb20gXCIuL21vZGVscy9odHRwXCI7XG5pbXBvcnQgcGFja2FnZU1hcCBmcm9tICcuLy5tZXRlb3ItcGFja2FnZS12ZXJzaW9ucyc7XG5pbXBvcnQgeyBnZXRFcnJvclBhcmFtZXRlcnMgIH0gZnJvbSBcIi4vY29tbW9uL3V0aWxzXCI7XG5pbXBvcnQgeyBXYWl0VGltZUJ1aWxkZXIgfSBmcm9tIFwiLi93YWl0X3RpbWVfYnVpbGRlclwiO1xuXG52YXIgaG9zdG5hbWUgPSBOcG0ucmVxdWlyZSgnb3MnKS5ob3N0bmFtZSgpO1xudmFyIGxvZ2dlciA9IE5wbS5yZXF1aXJlKCdkZWJ1ZycpKCdrYWRpcmE6YXBtJyk7XG52YXIgRmliZXJzID0gTnBtLnJlcXVpcmUoJ2ZpYmVycycpO1xuXG52YXIgS2FkaXJhQ29yZSA9IE5wbS5yZXF1aXJlKCdtb250aS1hcG0tY29yZScpLkthZGlyYTtcblxuS2FkaXJhLm1vZGVscyA9IHt9O1xuS2FkaXJhLm9wdGlvbnMgPSB7fTtcbkthZGlyYS5lbnYgPSB7XG4gIGN1cnJlbnRTdWI6IG51bGwsIC8vIGtlZXAgY3VycmVudCBzdWJzY3JpcHRpb24gaW5zaWRlIGRkcFxuICBrYWRpcmFJbmZvOiBuZXcgTWV0ZW9yLkVudmlyb25tZW50VmFyaWFibGUoKSxcbn07XG5LYWRpcmEud2FpdFRpbWVCdWlsZGVyID0gbmV3IFdhaXRUaW1lQnVpbGRlcigpO1xuS2FkaXJhLmVycm9ycyA9IFtdO1xuS2FkaXJhLmVycm9ycy5hZGRGaWx0ZXIgPSBLYWRpcmEuZXJyb3JzLnB1c2guYmluZChLYWRpcmEuZXJyb3JzKTtcblxuS2FkaXJhLm1vZGVscy5tZXRob2RzID0gbmV3IE1ldGhvZHNNb2RlbCgpO1xuS2FkaXJhLm1vZGVscy5wdWJzdWIgPSBuZXcgUHVic3ViTW9kZWwoKTtcbkthZGlyYS5tb2RlbHMuc3lzdGVtID0gbmV3IFN5c3RlbU1vZGVsKCk7XG5LYWRpcmEubW9kZWxzLmh0dHAgPSBuZXcgSHR0cE1vZGVsKCk7XG5LYWRpcmEuZG9jU3pDYWNoZSA9IG5ldyBEb2NTekNhY2hlKDEwMDAwMCwgMTApO1xuS2FkaXJhLnN5bmNlZERhdGUgPSBuZXcgTnRwKCk7XG5cbi8vIElmIHRoZSBhZ2VudCBpcyBub3QgY29ubmVjdGVkLCB3ZSBzdGlsbCB3YW50IHRvIGJ1aWxkIHRoZSBwYXlsb2FkIG9jY2FzaW9uYWxseVxuLy8gc2luY2UgYnVpbGRpbmcgdGhlIHBheWxvYWQgZG9lcyBzb21lIGNsZWFudXAgdG8gcHJldmVudCBtZW1vcnkgbGVha3Ncbi8vIE9uY2UgY29ubmVjdGVkLCB0aGlzIGludGVydmFsIGlzIGNsZWFyZWRcbmxldCBidWlsZEludGVydmFsID0gTWV0ZW9yLnNldEludGVydmFsKCgpID0+IHtcbiAgS2FkaXJhLl9idWlsZFBheWxvYWQoKTtcbn0sIDEwMDAgKiA2MCk7XG5cblxuS2FkaXJhLmNvbm5lY3QgPSBmdW5jdGlvbihhcHBJZCwgYXBwU2VjcmV0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBvcHRpb25zLmFwcElkID0gYXBwSWQ7XG4gIG9wdGlvbnMuYXBwU2VjcmV0ID0gYXBwU2VjcmV0O1xuICBvcHRpb25zLnBheWxvYWRUaW1lb3V0ID0gb3B0aW9ucy5wYXlsb2FkVGltZW91dCB8fCAxMDAwICogMjA7XG4gIG9wdGlvbnMuZW5kcG9pbnQgPSBvcHRpb25zLmVuZHBvaW50IHx8IFwiaHR0cHM6Ly9lbmdpbmUubW9udGlhcG0uY29tXCI7XG4gIG9wdGlvbnMuY2xpZW50RW5naW5lU3luY0RlbGF5ID0gb3B0aW9ucy5jbGllbnRFbmdpbmVTeW5jRGVsYXkgfHwgMTAwMDA7XG4gIG9wdGlvbnMudGhyZXNob2xkcyA9IG9wdGlvbnMudGhyZXNob2xkcyB8fCB7fTtcbiAgb3B0aW9ucy5pc0hvc3ROYW1lU2V0ID0gISFvcHRpb25zLmhvc3RuYW1lO1xuICBvcHRpb25zLmhvc3RuYW1lID0gb3B0aW9ucy5ob3N0bmFtZSB8fCBob3N0bmFtZTtcbiAgb3B0aW9ucy5wcm94eSA9IG9wdGlvbnMucHJveHkgfHwgbnVsbDtcbiAgb3B0aW9ucy5yZWNvcmRJUEFkZHJlc3MgPSBvcHRpb25zLnJlY29yZElQQWRkcmVzcyB8fCAnZnVsbCc7XG4gIG9wdGlvbnMuZXZlbnRTdGFja1RyYWNlID0gb3B0aW9ucy5ldmVudFN0YWNrVHJhY2UgfHwgZmFsc2U7XG5cbiAgaWYob3B0aW9ucy5kb2N1bWVudFNpemVDYWNoZVNpemUpIHtcbiAgICBLYWRpcmEuZG9jU3pDYWNoZSA9IG5ldyBEb2NTekNhY2hlKG9wdGlvbnMuZG9jdW1lbnRTaXplQ2FjaGVTaXplLCAxMCk7XG4gIH1cblxuICAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBlbmRwb2ludCB1cmwgKGlmIGFueSlcbiAgaWYoXy5sYXN0KG9wdGlvbnMuZW5kcG9pbnQpID09PSAnLycpIHtcbiAgICBvcHRpb25zLmVuZHBvaW50ID0gb3B0aW9ucy5lbmRwb2ludC5zdWJzdHIoMCwgb3B0aW9ucy5lbmRwb2ludC5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIC8vIGVycm9yIHRyYWNraW5nIGlzIGVuYWJsZWQgYnkgZGVmYXVsdFxuICBpZihvcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIG9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZyA9IHRydWU7XG4gIH1cblxuICAvLyB1cGxvYWRpbmcgc291cmNlbWFwcyBpcyBlbmFibGVkIGJ5IGRlZmF1bHQgaW4gcHJvZHVjdGlvblxuICBpZiAob3B0aW9ucy51cGxvYWRTb3VyY2VNYXBzID09PSB1bmRlZmluZWQgJiYgTWV0ZW9yLmlzUHJvZHVjdGlvbikge1xuICAgIG9wdGlvbnMudXBsb2FkU291cmNlTWFwcyA9IHRydWU7XG4gIH1cblxuICBLYWRpcmEub3B0aW9ucyA9IG9wdGlvbnM7XG4gIEthZGlyYS5vcHRpb25zLmF1dGhIZWFkZXJzID0ge1xuICAgICdLQURJUkEtQVBQLUlEJzogS2FkaXJhLm9wdGlvbnMuYXBwSWQsXG4gICAgJ0tBRElSQS1BUFAtU0VDUkVUJzogS2FkaXJhLm9wdGlvbnMuYXBwU2VjcmV0XG4gIH07XG5cbiAgaWYgKGFwcElkICYmIGFwcFNlY3JldCkge1xuICAgIG9wdGlvbnMuYXBwSWQgPSBvcHRpb25zLmFwcElkLnRyaW0oKTtcbiAgICBvcHRpb25zLmFwcFNlY3JldCA9IG9wdGlvbnMuYXBwU2VjcmV0LnRyaW0oKTtcblxuICAgIEthZGlyYS5jb3JlQXBpID0gbmV3IEthZGlyYUNvcmUoe1xuICAgICAgYXBwSWQ6IG9wdGlvbnMuYXBwSWQsXG4gICAgICBhcHBTZWNyZXQ6IG9wdGlvbnMuYXBwU2VjcmV0LFxuICAgICAgZW5kcG9pbnQ6IG9wdGlvbnMuZW5kcG9pbnQsXG4gICAgICBob3N0bmFtZTogb3B0aW9ucy5ob3N0bmFtZSxcbiAgICAgIGFnZW50VmVyc2lvbjogcGFja2FnZU1hcFsnbW9udGlhcG06YWdlbnQnXSB8fCAnPHVua25vd24+J1xuICAgIH0pO1xuXG4gICAgS2FkaXJhLmNvcmVBcGkuX2NoZWNrQXV0aCgpXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxvZ2dlcignY29ubmVjdGVkIHRvIGFwcDogJywgYXBwSWQpO1xuICAgICAgICBjb25zb2xlLmxvZygnTW9udGkgQVBNOiBTdWNjZXNzZnVsbHkgY29ubmVjdGVkJyk7XG4gICAgICAgIEthZGlyYS5fc2VuZEFwcFN0YXRzKCk7XG4gICAgICAgIEthZGlyYS5fc2NoZWR1bGVQYXlsb2FkU2VuZCgpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIubWVzc2FnZSA9PT0gXCJVbmF1dGhvcml6ZWRcIikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdNb250aSBBUE06IGF1dGhlbnRpY2F0aW9uIGZhaWxlZCAtIGNoZWNrIHlvdXIgYXBwSWQgJiBhcHBTZWNyZXQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdNb250aSBBUE06IHVuYWJsZSB0byBjb25uZWN0LiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01vbnRpIEFQTTogcmVxdWlyZWQgYXBwSWQgYW5kIGFwcFNlY3JldCcpO1xuICB9XG5cbiAgS2FkaXJhLnN5bmNlZERhdGUgPSBuZXcgTnRwKG9wdGlvbnMuZW5kcG9pbnQpO1xuICBLYWRpcmEuc3luY2VkRGF0ZS5zeW5jKCk7XG4gIEthZGlyYS5tb2RlbHMuZXJyb3IgPSBuZXcgRXJyb3JNb2RlbChhcHBJZCk7XG5cbiAgLy8gaGFuZGxlIHByZS1hZGRlZCBmaWx0ZXJzXG4gIHZhciBhZGRGaWx0ZXJGbiA9IEthZGlyYS5tb2RlbHMuZXJyb3IuYWRkRmlsdGVyLmJpbmQoS2FkaXJhLm1vZGVscy5lcnJvcik7XG4gIEthZGlyYS5lcnJvcnMuZm9yRWFjaChhZGRGaWx0ZXJGbik7XG4gIEthZGlyYS5lcnJvcnMgPSBLYWRpcmEubW9kZWxzLmVycm9yO1xuXG4gIC8vIHNldHRpbmcgcnVudGltZSBpbmZvLCB3aGljaCB3aWxsIGJlIHNlbnQgdG8ga2FkaXJhXG4gIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ua2FkaXJhID0ge1xuICAgIGFwcElkOiBhcHBJZCxcbiAgICBlbmRwb2ludDogb3B0aW9ucy5lbmRwb2ludCxcbiAgICBjbGllbnRFbmdpbmVTeW5jRGVsYXk6IG9wdGlvbnMuY2xpZW50RW5naW5lU3luY0RlbGF5LFxuICAgIHJlY29yZElQQWRkcmVzczogb3B0aW9ucy5yZWNvcmRJUEFkZHJlc3MsXG4gIH07XG5cbiAgaWYob3B0aW9ucy5lbmFibGVFcnJvclRyYWNraW5nKSB7XG4gICAgS2FkaXJhLmVuYWJsZUVycm9yVHJhY2tpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICBLYWRpcmEuZGlzYWJsZUVycm9yVHJhY2tpbmcoKTtcbiAgfVxuXG4gIC8vIHN0YXJ0IHRyYWNraW5nIGVycm9yc1xuICBNZXRlb3Iuc3RhcnR1cChmdW5jdGlvbiAoKSB7XG4gICAgVHJhY2tVbmNhdWdodEV4Y2VwdGlvbnMoKTtcbiAgICBUcmFja1VuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICBUcmFja01ldGVvckRlYnVnKCk7XG4gIH0pXG5cbiAgTWV0ZW9yLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0gX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5rYWRpcmE7XG4gICAgdGhpcy5hZGRlZCgna2FkaXJhX3NldHRpbmdzJywgUmFuZG9tLmlkKCksIG9wdGlvbnMpO1xuICAgIHRoaXMucmVhZHkoKTtcbiAgfSk7XG5cbiAgLy8gbm90aWZ5IHdlJ3ZlIGNvbm5lY3RlZFxuICBLYWRpcmEuY29ubmVjdGVkID0gdHJ1ZTtcbn07XG5cbi8vdHJhY2sgaG93IG1hbnkgdGltZXMgd2UndmUgc2VudCB0aGUgZGF0YSAob25jZSBwZXIgbWludXRlKVxuS2FkaXJhLl9idWlsZFBheWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYXlsb2FkID0ge2hvc3Q6IEthZGlyYS5vcHRpb25zLmhvc3RuYW1lLCBjbGllbnRWZXJzaW9uczogZ2V0Q2xpZW50VmVyc2lvbnMoKX07XG4gIHZhciBidWlsZERldGFpbGVkSW5mbyA9IEthZGlyYS5faXNEZXRhaWxlZEluZm8oKTtcbiAgXy5leHRlbmQocGF5bG9hZCwgS2FkaXJhLm1vZGVscy5tZXRob2RzLmJ1aWxkUGF5bG9hZChidWlsZERldGFpbGVkSW5mbykpO1xuICBfLmV4dGVuZChwYXlsb2FkLCBLYWRpcmEubW9kZWxzLnB1YnN1Yi5idWlsZFBheWxvYWQoYnVpbGREZXRhaWxlZEluZm8pKTtcbiAgXy5leHRlbmQocGF5bG9hZCwgS2FkaXJhLm1vZGVscy5zeXN0ZW0uYnVpbGRQYXlsb2FkKCkpO1xuICBfLmV4dGVuZChwYXlsb2FkLCBLYWRpcmEubW9kZWxzLmh0dHAuYnVpbGRQYXlsb2FkKCkpO1xuXG4gIGlmKEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcpIHtcbiAgICBfLmV4dGVuZChwYXlsb2FkLCBLYWRpcmEubW9kZWxzLmVycm9yLmJ1aWxkUGF5bG9hZCgpKTtcbiAgfVxuXG4gIHJldHVybiBwYXlsb2FkO1xufVxuXG5LYWRpcmEuX2NvdW50RGF0YVNlbnQgPSAwO1xuS2FkaXJhLl9kZXRhaWxJbmZvU2VudEludGVydmFsID0gTWF0aC5jZWlsKCgxMDAwKjYwKSAvIEthZGlyYS5vcHRpb25zLnBheWxvYWRUaW1lb3V0KTtcbkthZGlyYS5faXNEZXRhaWxlZEluZm8gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAoS2FkaXJhLl9jb3VudERhdGFTZW50KysgJSBLYWRpcmEuX2RldGFpbEluZm9TZW50SW50ZXJ2YWwpID09IDA7XG59XG5cbkthZGlyYS5fc2VuZEFwcFN0YXRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXBwU3RhdHMgPSB7fTtcbiAgYXBwU3RhdHMucmVsZWFzZSA9IE1ldGVvci5yZWxlYXNlO1xuICBhcHBTdGF0cy5wcm90b2NvbFZlcnNpb24gPSAnMS4wLjAnO1xuICBhcHBTdGF0cy5wYWNrYWdlVmVyc2lvbnMgPSBbXTtcbiAgYXBwU3RhdHMuY2xpZW50VmVyc2lvbnMgPSBnZXRDbGllbnRWZXJzaW9ucygpO1xuXG4gIF8uZWFjaChQYWNrYWdlLCBmdW5jdGlvbiAodiwgbmFtZSkge1xuICAgIGFwcFN0YXRzLnBhY2thZ2VWZXJzaW9ucy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB2ZXJzaW9uOiBwYWNrYWdlTWFwW25hbWVdIHx8IG51bGxcbiAgICB9KTtcbiAgfSk7XG5cbiAgS2FkaXJhLmNvcmVBcGkuc2VuZERhdGEoe1xuICAgIHN0YXJ0VGltZTogbmV3IERhdGUoKSxcbiAgICBhcHBTdGF0czogYXBwU3RhdHNcbiAgfSkudGhlbihmdW5jdGlvbihib2R5KSB7XG4gICAgaGFuZGxlQXBpUmVzcG9uc2UoYm9keSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ01vbnRpIEFQTSBFcnJvciBvbiBzZW5kaW5nIGFwcFN0YXRzOicsIGVyci5tZXNzYWdlKTtcbiAgfSk7XG59XG5cbkthZGlyYS5fc2NoZWR1bGVQYXlsb2FkU2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgY2xlYXJJbnRlcnZhbChidWlsZEludGVydmFsKTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBLYWRpcmEuX3NjaGVkdWxlUGF5bG9hZFNlbmQoKTtcbiAgICBLYWRpcmEuX3NlbmRQYXlsb2FkKCk7XG4gIH0sIEthZGlyYS5vcHRpb25zLnBheWxvYWRUaW1lb3V0KTtcbn1cblxuS2FkaXJhLl9zZW5kUGF5bG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgbmV3IEZpYmVycyhmdW5jdGlvbigpIHtcbiAgICB2YXIgcGF5bG9hZCA9IEthZGlyYS5fYnVpbGRQYXlsb2FkKCk7XG4gICAgS2FkaXJhLmNvcmVBcGkuc2VuZERhdGEocGF5bG9hZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChib2R5KSB7XG4gICAgICAgIGhhbmRsZUFwaVJlc3BvbnNlKGJvZHkpO1xuICAgICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNb250aSBBUE0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgfSk7XG4gIH0pLnJ1bigpO1xufVxuXG4vLyB0aGlzIHJldHVybiB0aGUgX19rYWRpcmFJbmZvIGZyb20gdGhlIGN1cnJlbnQgRmliZXIgYnkgZGVmYXVsdFxuLy8gaWYgY2FsbGVkIHdpdGggMm5kIGFyZ3VtZW50IGFzIHRydWUsIGl0IHdpbGwgZ2V0IHRoZSBrYWRpcmEgaW5mbyBmcm9tXG4vLyBNZXRlb3IuRW52aXJvbm1lbnRWYXJpYWJsZVxuLy9cbi8vIFdBUk5OSU5HOiByZXR1cm5lZCBpbmZvIG9iamVjdCBpcyB0aGUgcmVmZXJlbmNlIG9iamVjdC5cbi8vICBDaGFuZ2luZyBpdCBtaWdodCBjYXVzZSBpc3N1ZXMgd2hlbiBidWlsZGluZyB0cmFjZXMuIFNvIHVzZSB3aXRoIGNhcmVcbkthZGlyYS5fZ2V0SW5mbyA9IGZ1bmN0aW9uKGN1cnJlbnRGaWJlciwgdXNlRW52aXJvbm1lbnRWYXJpYWJsZSkge1xuICBjdXJyZW50RmliZXIgPSBjdXJyZW50RmliZXIgfHwgRmliZXJzLmN1cnJlbnQ7XG4gIGlmKGN1cnJlbnRGaWJlcikge1xuICAgIGlmKHVzZUVudmlyb25tZW50VmFyaWFibGUpIHtcbiAgICAgIHJldHVybiBLYWRpcmEuZW52LmthZGlyYUluZm8uZ2V0KCk7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50RmliZXIuX19rYWRpcmFJbmZvO1xuICB9XG59O1xuXG4vLyB0aGlzIGRvZXMgbm90IGNsb25lIHRoZSBpbmZvIG9iamVjdC4gU28sIHVzZSB3aXRoIGNhcmVcbkthZGlyYS5fc2V0SW5mbyA9IGZ1bmN0aW9uKGluZm8pIHtcbiAgRmliZXJzLmN1cnJlbnQuX19rYWRpcmFJbmZvID0gaW5mbztcbn07XG5cbkthZGlyYS5zdGFydENvbnRpbnVvdXNQcm9maWxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIE1vbnRpUHJvZmlsZXIuc3RhcnRDb250aW51b3VzKGZ1bmN0aW9uIG9uUHJvZmlsZSh7IHByb2ZpbGUsIHN0YXJ0VGltZSwgZW5kVGltZSB9KSB7XG4gICAgaWYgKCFLYWRpcmEuY29ubmVjdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgS2FkaXJhLmNvcmVBcGkuc2VuZERhdGEoeyBwcm9maWxlczogW3twcm9maWxlLCBzdGFydFRpbWUsIGVuZFRpbWUgfV19KVxuICAgICAgLmNhdGNoKGUgPT4gY29uc29sZS5sb2coJ01vbnRpOiBlcnIgc2VuZGluZyBjcHUgcHJvZmlsZScsIGUpKTtcbiAgfSk7XG59XG5cbkthZGlyYS5lbmFibGVFcnJvclRyYWNraW5nID0gZnVuY3Rpb24gKCkge1xuICBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmthZGlyYS5lbmFibGVFcnJvclRyYWNraW5nID0gdHJ1ZTtcbiAgS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZyA9IHRydWU7XG59O1xuXG5LYWRpcmEuZGlzYWJsZUVycm9yVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ua2FkaXJhLmVuYWJsZUVycm9yVHJhY2tpbmcgPSBmYWxzZTtcbiAgS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZyA9IGZhbHNlO1xufTtcblxuS2FkaXJhLnRyYWNrRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgbWVzc2FnZSwgc3ViVHlwZSwgc3RhY2ssIHR5cGUgfSA9IGdldEVycm9yUGFyYW1ldGVycyhhcmd1bWVudHMpO1xuXG4gIGlmIChtZXNzYWdlKSB7XG4gICAgdmFyIHRyYWNlID0ge1xuICAgICAgdHlwZTogdHlwZSB8fCAnc2VydmVyLWludGVybmFsJyxcbiAgICAgIHN1YlR5cGU6IHN1YlR5cGUgfHwgJ3NlcnZlcicsXG4gICAgICBuYW1lOiBtZXNzYWdlLFxuICAgICAgZXJyb3JlZDogdHJ1ZSxcbiAgICAgIGF0OiBLYWRpcmEuc3luY2VkRGF0ZS5nZXRUaW1lKCksXG4gICAgICBldmVudHM6IFtbJ3N0YXJ0JywgMCwge31dLCBbJ2Vycm9yJywgMCwgeyBlcnJvcjogeyBtZXNzYWdlLCBzdGFjayB9IH1dXSxcbiAgICAgIG1ldHJpY3M6IHsgdG90YWw6IDAgfVxuICAgIH07XG5cbiAgICBLYWRpcmEubW9kZWxzLmVycm9yLnRyYWNrRXJyb3IoeyBtZXNzYWdlLCBzdGFjayB9LCB0cmFjZSk7XG4gIH1cbn1cblxuS2FkaXJhLmlnbm9yZUVycm9yVHJhY2tpbmcgPSBmdW5jdGlvbiAoZXJyKSB7XG4gIGVyci5fc2tpcEthZGlyYSA9IHRydWU7XG59XG5cbkthZGlyYS5zdGFydEV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEgPSB7fSkge1xuICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuICBpZihrYWRpcmFJbmZvKSB7XG4gICAgcmV0dXJuIEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2N1c3RvbScsIGRhdGEsIHsgbmFtZSB9KTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG5LYWRpcmEuZW5kRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcblxuICAvLyBUaGUgZXZlbnQgY291bGQgYmUgZmFsc2UgaWYgaXQgY291bGQgbm90IGJlIHN0YXJ0ZWQuXG4gIC8vIEhhbmRsZSBpdCBoZXJlIGluc3RlYWQgb2YgcmVxdWlyaW5nIHRoZSBhcHAgdG8uXG4gIGlmIChrYWRpcmFJbmZvICYmIGV2ZW50KSB7XG4gICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudCwgZGF0YSk7XG4gIH1cbn1cbiIsInZhciBGaWJlciA9IE5wbS5yZXF1aXJlKCdmaWJlcnMnKTtcblxud3JhcFNlcnZlciA9IGZ1bmN0aW9uKHNlcnZlclByb3RvKSB7XG4gIHZhciBvcmlnaW5hbEhhbmRsZUNvbm5lY3QgPSBzZXJ2ZXJQcm90by5faGFuZGxlQ29ubmVjdFxuICBzZXJ2ZXJQcm90by5faGFuZGxlQ29ubmVjdCA9IGZ1bmN0aW9uKHNvY2tldCwgbXNnKSB7XG4gICAgb3JpZ2luYWxIYW5kbGVDb25uZWN0LmNhbGwodGhpcywgc29ja2V0LCBtc2cpO1xuICAgIHZhciBzZXNzaW9uID0gc29ja2V0Ll9tZXRlb3JTZXNzaW9uO1xuICAgIC8vIHNvbWV0aW1lcyBpdCBpcyBwb3NzaWJsZSBmb3IgX21ldGVvclNlc3Npb24gdG8gYmUgdW5kZWZpbmVkXG4gICAgLy8gb25lIHN1Y2ggcmVhc29uIHdvdWxkIGJlIGlmIEREUCB2ZXJzaW9ucyBhcmUgbm90IG1hdGNoaW5nXG4gICAgLy8gaWYgdGhlbiwgd2Ugc2hvdWxkIG5vdCBwcm9jZXNzIGl0XG4gICAgaWYoIXNlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBLYWRpcmEuRXZlbnRCdXMuZW1pdCgnc3lzdGVtJywgJ2NyZWF0ZVNlc3Npb24nLCBtc2csIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbik7XG5cbiAgICBpZihLYWRpcmEuY29ubmVjdGVkKSB7XG4gICAgICBLYWRpcmEubW9kZWxzLnN5c3RlbS5oYW5kbGVTZXNzaW9uQWN0aXZpdHkobXNnLCBzb2NrZXQuX21ldGVvclNlc3Npb24pO1xuICAgIH1cbiAgfTtcbn07XG4iLCJpbXBvcnQgeyBNZXRlb3JEZWJ1Z0lnbm9yZSB9IGZyb20gXCIuL2Vycm9yXCI7XG5cbmNvbnN0IE1BWF9QQVJBTVNfTEVOR1RIID0gNDAwMFxuXG53cmFwU2Vzc2lvbiA9IGZ1bmN0aW9uKHNlc3Npb25Qcm90bykge1xuICB2YXIgb3JpZ2luYWxQcm9jZXNzTWVzc2FnZSA9IHNlc3Npb25Qcm90by5wcm9jZXNzTWVzc2FnZTtcbiAgc2Vzc2lvblByb3RvLnByb2Nlc3NNZXNzYWdlID0gZnVuY3Rpb24obXNnKSB7XG4gICAgaWYodHJ1ZSkge1xuICAgICAgdmFyIGthZGlyYUluZm8gPSB7XG4gICAgICAgIHNlc3Npb246IHRoaXMuaWQsXG4gICAgICAgIHVzZXJJZDogdGhpcy51c2VySWRcbiAgICAgIH07XG5cbiAgICAgIGlmKG1zZy5tc2cgPT0gJ21ldGhvZCcgfHwgbXNnLm1zZyA9PSAnc3ViJykge1xuICAgICAgICBrYWRpcmFJbmZvLnRyYWNlID0gS2FkaXJhLnRyYWNlci5zdGFydCh0aGlzLCBtc2cpO1xuICAgICAgICBLYWRpcmEud2FpdFRpbWVCdWlsZGVyLnJlZ2lzdGVyKHRoaXMsIG1zZy5pZCk7XG5cbiAgICAgICAgbGV0IHBhcmFtcyA9IEthZGlyYS50cmFjZXIuX2FwcGx5T2JqZWN0RmlsdGVycyhtc2cucGFyYW1zIHx8IFtdKTtcbiAgICAgICAgLy8gdXNlIEpTT04gaW5zdGVhZCBvZiBFSlNPTiB0byBzYXZlIHRoZSBDUFVcbiAgICAgICAgbGV0IHN0cmluZ2lmaWVkUGFyYW1zID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcblxuICAgICAgICAvLyBUaGUgcGFyYW1zIGNvdWxkIGJlIHNldmVyYWwgbWIgb3IgbGFyZ2VyLlxuICAgICAgICAvLyBUcnVuY2F0ZSBpZiBpdCBpcyBsYXJnZVxuICAgICAgICBpZiAoc3RyaW5naWZpZWRQYXJhbXMubGVuZ3RoID4gTUFYX1BBUkFNU19MRU5HVEgpIHtcbiAgICAgICAgICBzdHJpbmdpZmllZFBhcmFtcyA9IGBNb250aSBBUE06IHBhcmFtcyBhcmUgdG9vIGJpZy4gRmlyc3QgJHtNQVhfUEFSQU1TX0xFTkdUSH0gY2hhcmFjdGVyczogJHtzdHJpbmdpZmllZFBhcmFtcy5zbGljZSgwLCBNQVhfUEFSQU1TX0xFTkdUSCl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGFydERhdGEgPSB7IHVzZXJJZDogdGhpcy51c2VySWQsIHBhcmFtczogc3RyaW5naWZpZWRQYXJhbXMgfTtcbiAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnc3RhcnQnLCBzdGFydERhdGEpO1xuICAgICAgICB2YXIgd2FpdEV2ZW50SWQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICd3YWl0Jywge30sIGthZGlyYUluZm8pO1xuICAgICAgICBtc2cuX3dhaXRFdmVudElkID0gd2FpdEV2ZW50SWQ7XG4gICAgICAgIG1zZy5fX2thZGlyYUluZm8gPSBrYWRpcmFJbmZvO1xuXG4gICAgICAgIGlmKG1zZy5tc2cgPT0gJ3N1YicpIHtcbiAgICAgICAgICAvLyBzdGFydCB0cmFja2luZyBpbnNpZGUgcHJvY2Vzc01lc3NhZ2UgYWxsb3dzIHVzIHRvIGluZGljYXRlXG4gICAgICAgICAgLy8gd2FpdCB0aW1lIGFzIHdlbGxcbiAgICAgICAgICBLYWRpcmEuRXZlbnRCdXMuZW1pdCgncHVic3ViJywgJ3N1YlJlY2VpdmVkJywgdGhpcywgbXNnKTtcbiAgICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi5fdHJhY2tTdWIodGhpcywgbXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgc2Vzc2lvbiBsYXN0IGFjdGl2ZSB0aW1lXG4gICAgICBLYWRpcmEuRXZlbnRCdXMuZW1pdCgnc3lzdGVtJywgJ2RkcE1lc3NhZ2VSZWNlaXZlZCcsIHRoaXMsIG1zZyk7XG4gICAgICBLYWRpcmEubW9kZWxzLnN5c3RlbS5oYW5kbGVTZXNzaW9uQWN0aXZpdHkobXNnLCB0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luYWxQcm9jZXNzTWVzc2FnZS5jYWxsKHRoaXMsIG1zZyk7XG4gIH07XG5cbiAgLy8gYWRkaW5nIHRoZSBtZXRob2QgY29udGV4dCB0byB0aGUgY3VycmVudCBmaWJlclxuICB2YXIgb3JpZ2luYWxNZXRob2RIYW5kbGVyID0gc2Vzc2lvblByb3RvLnByb3RvY29sX2hhbmRsZXJzLm1ldGhvZDtcbiAgc2Vzc2lvblByb3RvLnByb3RvY29sX2hhbmRsZXJzLm1ldGhvZCA9IGZ1bmN0aW9uKG1zZywgdW5ibG9jaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL2FkZCBjb250ZXh0XG4gICAgdmFyIGthZGlyYUluZm8gPSBtc2cuX19rYWRpcmFJbmZvO1xuICAgIGlmKGthZGlyYUluZm8pIHtcbiAgICAgIEthZGlyYS5fc2V0SW5mbyhrYWRpcmFJbmZvKTtcblxuICAgICAgLy8gZW5kIHdhaXQgZXZlbnRcbiAgICAgIHZhciB3YWl0TGlzdCA9IEthZGlyYS53YWl0VGltZUJ1aWxkZXIuYnVpbGQodGhpcywgbXNnLmlkKTtcbiAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgbXNnLl93YWl0RXZlbnRJZCwge3dhaXRPbjogd2FpdExpc3R9KTtcblxuICAgICAgdW5ibG9jayA9IEthZGlyYS53YWl0VGltZUJ1aWxkZXIudHJhY2tXYWl0VGltZSh0aGlzLCBtc2csIHVuYmxvY2spO1xuICAgICAgdmFyIHJlc3BvbnNlID0gS2FkaXJhLmVudi5rYWRpcmFJbmZvLndpdGhWYWx1ZShrYWRpcmFJbmZvLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbE1ldGhvZEhhbmRsZXIuY2FsbChzZWxmLCBtc2csIHVuYmxvY2spO1xuICAgICAgfSk7XG4gICAgICB1bmJsb2NrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXNwb25zZSA9IG9yaWdpbmFsTWV0aG9kSGFuZGxlci5jYWxsKHNlbGYsIG1zZywgdW5ibG9jayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIC8vdG8gY2FwdHVyZSB0aGUgY3VycmVudGx5IHByb2Nlc3NpbmcgbWVzc2FnZVxuICB2YXIgb3JnaW5hbFN1YkhhbmRsZXIgPSBzZXNzaW9uUHJvdG8ucHJvdG9jb2xfaGFuZGxlcnMuc3ViO1xuICBzZXNzaW9uUHJvdG8ucHJvdG9jb2xfaGFuZGxlcnMuc3ViID0gZnVuY3Rpb24obXNnLCB1bmJsb2NrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vYWRkIGNvbnRleHRcbiAgICB2YXIga2FkaXJhSW5mbyA9IG1zZy5fX2thZGlyYUluZm87XG4gICAgaWYoa2FkaXJhSW5mbykge1xuICAgICAgS2FkaXJhLl9zZXRJbmZvKGthZGlyYUluZm8pO1xuXG4gICAgICAvLyBlbmQgd2FpdCBldmVudFxuICAgICAgdmFyIHdhaXRMaXN0ID0gS2FkaXJhLndhaXRUaW1lQnVpbGRlci5idWlsZCh0aGlzLCBtc2cuaWQpO1xuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBtc2cuX3dhaXRFdmVudElkLCB7d2FpdE9uOiB3YWl0TGlzdH0pO1xuXG4gICAgICB1bmJsb2NrID0gS2FkaXJhLndhaXRUaW1lQnVpbGRlci50cmFja1dhaXRUaW1lKHRoaXMsIG1zZywgdW5ibG9jayk7XG4gICAgICB2YXIgcmVzcG9uc2UgPSBLYWRpcmEuZW52LmthZGlyYUluZm8ud2l0aFZhbHVlKGthZGlyYUluZm8sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG9yZ2luYWxTdWJIYW5kbGVyLmNhbGwoc2VsZiwgbXNnLCB1bmJsb2NrKTtcbiAgICAgIH0pO1xuICAgICAgdW5ibG9jaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzcG9uc2UgPSBvcmdpbmFsU3ViSGFuZGxlci5jYWxsKHNlbGYsIG1zZywgdW5ibG9jayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIC8vdG8gY2FwdHVyZSB0aGUgY3VycmVudGx5IHByb2Nlc3NpbmcgbWVzc2FnZVxuICB2YXIgb3JnaW5hbFVuU3ViSGFuZGxlciA9IHNlc3Npb25Qcm90by5wcm90b2NvbF9oYW5kbGVycy51bnN1YjtcbiAgc2Vzc2lvblByb3RvLnByb3RvY29sX2hhbmRsZXJzLnVuc3ViID0gZnVuY3Rpb24obXNnLCB1bmJsb2NrKSB7XG4gICAgdW5ibG9jayA9IEthZGlyYS53YWl0VGltZUJ1aWxkZXIudHJhY2tXYWl0VGltZSh0aGlzLCBtc2csIHVuYmxvY2spO1xuICAgIHZhciByZXNwb25zZSA9IG9yZ2luYWxVblN1YkhhbmRsZXIuY2FsbCh0aGlzLCBtc2csIHVuYmxvY2spO1xuICAgIHVuYmxvY2soKTtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgLy90cmFjayBtZXRob2QgZW5kaW5nICh0byBnZXQgdGhlIHJlc3VsdCBvZiBlcnJvcilcbiAgdmFyIG9yaWdpbmFsU2VuZCA9IHNlc3Npb25Qcm90by5zZW5kO1xuICBzZXNzaW9uUHJvdG8uc2VuZCA9IGZ1bmN0aW9uKG1zZykge1xuICAgIGlmKG1zZy5tc2cgPT0gJ3Jlc3VsdCcpIHtcbiAgICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG4gICAgICBpZihrYWRpcmFJbmZvKSB7XG4gICAgICAgIGlmKG1zZy5lcnJvcikge1xuICAgICAgICAgIHZhciBlcnJvciA9IF8ucGljayhtc2cuZXJyb3IsIFsnbWVzc2FnZScsICdzdGFjaycsICdkZXRhaWxzJ10pO1xuXG4gICAgICAgICAgLy8gcGljayB0aGUgZXJyb3IgZnJvbSB0aGUgd3JhcHBlZCBtZXRob2QgaGFuZGxlclxuICAgICAgICAgIGlmKGthZGlyYUluZm8gJiYga2FkaXJhSW5mby5jdXJyZW50RXJyb3IpIHtcbiAgICAgICAgICAgIC8vIHRoZSBlcnJvciBzdGFjayBpcyB3cmFwcGVkIHNvIE1ldGVvci5fZGVidWcgY2FuIGlkZW50aWZ5XG4gICAgICAgICAgICAvLyB0aGlzIGFzIGEgbWV0aG9kIGVycm9yLlxuICAgICAgICAgICAgZXJyb3IgPSBfLnBpY2soa2FkaXJhSW5mby5jdXJyZW50RXJyb3IsIFsnbWVzc2FnZScsICdzdGFjaycsICdkZXRhaWxzJ10pO1xuICAgICAgICAgICAgLy8gc2VlIHdyYXBNZXRob2RIYW5kZXJGb3JFcnJvcnMoKSBtZXRob2QgZGVmIGZvciBtb3JlIGluZm9cbiAgICAgICAgICAgIGlmKGVycm9yLnN0YWNrICYmIGVycm9yLnN0YWNrLnN0YWNrKSB7XG4gICAgICAgICAgICAgIGVycm9yLnN0YWNrID0gZXJyb3Iuc3RhY2suc3RhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5lbmRMYXN0RXZlbnQoa2FkaXJhSW5mby50cmFjZSk7XG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnZXJyb3InLCB7ZXJyb3I6IGVycm9yfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5lbmRMYXN0RXZlbnQoa2FkaXJhSW5mby50cmFjZSk7XG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnY29tcGxldGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJvY2Vzc2luZyB0aGUgbWVzc2FnZVxuICAgICAgICB2YXIgdHJhY2UgPSBLYWRpcmEudHJhY2VyLmJ1aWxkVHJhY2Uoa2FkaXJhSW5mby50cmFjZSk7XG4gICAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdtZXRob2QnLCAnbWV0aG9kQ29tcGxldGVkJywgdHJhY2UsIHRoaXMpO1xuICAgICAgICBLYWRpcmEubW9kZWxzLm1ldGhvZHMucHJvY2Vzc01ldGhvZCh0cmFjZSk7XG5cbiAgICAgICAgLy8gZXJyb3IgbWF5IG9yIG1heSBub3QgZXhpc3QgYW5kIGVycm9yIHRyYWNraW5nIGNhbiBiZSBkaXNhYmxlZFxuICAgICAgICBpZihlcnJvciAmJiBLYWRpcmEub3B0aW9ucy5lbmFibGVFcnJvclRyYWNraW5nKSB7XG4gICAgICAgICAgS2FkaXJhLm1vZGVscy5lcnJvci50cmFja0Vycm9yKGVycm9yLCB0cmFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NsZWFuIGFuZCBtYWtlIHN1cmUsIGZpYmVyIGlzIGNsZWFuXG4gICAgICAgIC8vbm90IHN1cmUgd2UgbmVlZCB0byBkbyB0aGlzLCBidXQgYSBwcmV2ZW50aXZlIG1lYXN1cmVcbiAgICAgICAgS2FkaXJhLl9zZXRJbmZvKG51bGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbFNlbmQuY2FsbCh0aGlzLCBtc2cpO1xuICB9O1xufTtcblxuLy8gd3JhcCBleGlzdGluZyBtZXRob2QgaGFuZGxlcnMgZm9yIGNhcHR1cmluZyBlcnJvcnNcbl8uZWFjaChNZXRlb3Iuc2VydmVyLm1ldGhvZF9oYW5kbGVycywgZnVuY3Rpb24oaGFuZGxlciwgbmFtZSkge1xuICB3cmFwTWV0aG9kSGFuZGVyRm9yRXJyb3JzKG5hbWUsIGhhbmRsZXIsIE1ldGVvci5zZXJ2ZXIubWV0aG9kX2hhbmRsZXJzKTtcbn0pO1xuXG4vLyB3cmFwIGZ1dHVyZSBtZXRob2QgaGFuZGxlcnMgZm9yIGNhcHR1cmluZyBlcnJvcnNcbnZhciBvcmlnaW5hbE1ldGVvck1ldGhvZHMgPSBNZXRlb3IubWV0aG9kcztcbk1ldGVvci5tZXRob2RzID0gZnVuY3Rpb24obWV0aG9kTWFwKSB7XG4gIF8uZWFjaChtZXRob2RNYXAsIGZ1bmN0aW9uKGhhbmRsZXIsIG5hbWUpIHtcbiAgICB3cmFwTWV0aG9kSGFuZGVyRm9yRXJyb3JzKG5hbWUsIGhhbmRsZXIsIG1ldGhvZE1hcCk7XG4gIH0pO1xuICBvcmlnaW5hbE1ldGVvck1ldGhvZHMobWV0aG9kTWFwKTtcbn07XG5cblxuZnVuY3Rpb24gd3JhcE1ldGhvZEhhbmRlckZvckVycm9ycyhuYW1lLCBvcmlnaW5hbEhhbmRsZXIsIG1ldGhvZE1hcCkge1xuICBtZXRob2RNYXBbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICB0cnl7XG4gICAgICByZXR1cm4gb3JpZ2luYWxIYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSBjYXRjaChleCkge1xuICAgICAgaWYoZXggJiYgS2FkaXJhLl9nZXRJbmZvKCkpIHtcbiAgICAgICAgLy8gc29tZXRpbWVzIGVycm9yIG1heSBiZSBqdXN0IGFuIHN0cmluZyBvciBhIHByaW1pdGl2ZVxuICAgICAgICAvLyBpbiB0aGF0IGNhc2UsIHdlIG5lZWQgdG8gbWFrZSBpdCBhIHBzdWVkbyBlcnJvclxuICAgICAgICBpZih0eXBlb2YgZXggIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgZXggPSB7bWVzc2FnZTogZXgsIHN0YWNrOiBleH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gTm93IHdlIGFyZSBtYXJraW5nIHRoaXMgZXJyb3IgdG8gZ2V0IHRyYWNrZWQgdmlhIG1ldGhvZHNcbiAgICAgICAgLy8gQnV0LCB0aGlzIGFsc28gdHJpZ2dlcnMgYSBNZXRlb3IuZGVidWcgY2FsbCBhbmRcbiAgICAgICAgLy8gaXQgb25seSBnZXRzIHRoZSBzdGFja1xuICAgICAgICAvLyBXZSBhbHNvIHRyYWNrIE1ldGVvci5kZWJ1ZyBlcnJvcnMgYW5kIHdhbnQgdG8gc3RvcFxuICAgICAgICAvLyB0cmFja2luZyB0aGlzIGVycm9yLiBUaGF0J3Mgd2h5IHdlIGRvIHRoaXNcbiAgICAgICAgLy8gU2VlIE1ldGVvci5kZWJ1ZyBlcnJvciB0cmFja2luZyBjb2RlIGZvciBtb3JlXG4gICAgICAgIC8vIElmIGVycm9yIHRyYWNraW5nIGlzIGRpc2FibGVkLCB3ZSBkbyBub3QgbW9kaWZ5IHRoZSBzdGFjayBzaW5jZVxuICAgICAgICAvLyBpdCB3b3VsZCBiZSBzaG93biBhcyBhbiBvYmplY3QgaW4gdGhlIGxvZ3NcbiAgICAgICAgaWYgKEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcpIHtcbiAgICAgICAgICBleC5zdGFjayA9IHtzdGFjazogZXguc3RhY2ssIHNvdXJjZTogJ21ldGhvZCcsIFtNZXRlb3JEZWJ1Z0lnbm9yZV06IHRydWV9O1xuICAgICAgICAgIEthZGlyYS5fZ2V0SW5mbygpLmN1cnJlbnRFcnJvciA9IGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aHJvdyBleDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IE1ldGVvckRlYnVnSWdub3JlIH0gZnJvbSBcIi4vZXJyb3JcIjtcblxud3JhcFN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvblByb3RvKSB7XG4gIC8vIElmIHRoZSByZWFkeSBldmVudCBydW5zIG91dHNpZGUgdGhlIEZpYmVyLCBLYWRpcmEuX2dldEluZm8oKSBkb2Vzbid0IHdvcmsuXG4gIC8vIHdlIG5lZWQgc29tZSBvdGhlciB3YXkgdG8gc3RvcmUga2FkaXJhSW5mbyBzbyB3ZSBjYW4gdXNlIGl0IGF0IHJlYWR5IGhpamFjay5cbiAgdmFyIG9yaWdpbmFsUnVuSGFuZGxlciA9IHN1YnNjcmlwdGlvblByb3RvLl9ydW5IYW5kbGVyO1xuICBzdWJzY3JpcHRpb25Qcm90by5fcnVuSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG4gICAgaWYgKGthZGlyYUluZm8pIHtcbiAgICAgIHRoaXMuX19rYWRpcmFJbmZvID0ga2FkaXJhSW5mbztcbiAgICB9O1xuICAgIG9yaWdpbmFsUnVuSGFuZGxlci5jYWxsKHRoaXMpO1xuICB9XG5cbiAgdmFyIG9yaWdpbmFsUmVhZHkgPSBzdWJzY3JpcHRpb25Qcm90by5yZWFkeTtcbiAgc3Vic2NyaXB0aW9uUHJvdG8ucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBtZXRlb3IgaGFzIGEgZmllbGQgY2FsbGVkIGBfcmVhZHlgIHdoaWNoIHRyYWNrcyB0aGlzXG4gICAgLy8gYnV0IHdlIG5lZWQgdG8gbWFrZSBpdCBmdXR1cmUgcHJvb2ZcbiAgICBpZighdGhpcy5fYXBtUmVhZHlUcmFja2VkKSB7XG4gICAgICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpIHx8IHRoaXMuX19rYWRpcmFJbmZvO1xuICAgICAgZGVsZXRlIHRoaXMuX19rYWRpcmFJbmZvO1xuICAgICAgLy9zb21ldGltZSAucmVhZHkgY2FuIGJlIGNhbGxlZCBpbiB0aGUgY29udGV4dCBvZiB0aGUgbWV0aG9kXG4gICAgICAvL3RoZW4gd2UgaGF2ZSBzb21lIHByb2JsZW1zLCB0aGF0J3Mgd2h5IHdlIGFyZSBjaGVja2luZyB0aGlzXG4gICAgICAvL2VnOi0gQWNjb3VudHMuY3JlYXRlVXNlclxuICAgICAgLy8gQWxzbywgd2hlbiB0aGUgc3Vic2NyaXB0aW9uIGlzIGNyZWF0ZWQgYnkgZmFzdCByZW5kZXIsIF9zdWJzY3JpcHRpb25JZCBhbmRcbiAgICAgIC8vIHRoZSB0cmFjZS5pZCBhcmUgYm90aCB1bmRlZmluZWQgYnV0IHdlIGRvbid0IHdhbnQgdG8gY29tcGxldGUgdGhlIEhUVFAgdHJhY2UgaGVyZVxuICAgICAgaWYoa2FkaXJhSW5mbyAmJiB0aGlzLl9zdWJzY3JpcHRpb25JZCAmJiB0aGlzLl9zdWJzY3JpcHRpb25JZCA9PSBrYWRpcmFJbmZvLnRyYWNlLmlkKSB7XG4gICAgICAgIEthZGlyYS50cmFjZXIuZW5kTGFzdEV2ZW50KGthZGlyYUluZm8udHJhY2UpO1xuICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdjb21wbGV0ZScpO1xuICAgICAgICB2YXIgdHJhY2UgPSBLYWRpcmEudHJhY2VyLmJ1aWxkVHJhY2Uoa2FkaXJhSW5mby50cmFjZSk7XG4gICAgICB9XG5cbiAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdwdWJzdWInLCAnc3ViQ29tcGxldGVkJywgdHJhY2UsIHRoaXMuX3Nlc3Npb24sIHRoaXMpO1xuICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIuX3RyYWNrUmVhZHkodGhpcy5fc2Vzc2lvbiwgdGhpcywgdHJhY2UpO1xuICAgICAgdGhpcy5fYXBtUmVhZHlUcmFja2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyB3ZSBzdGlsbCBwYXNzIHRoZSBjb250cm9sIHRvIHRoZSBvcmlnaW5hbCBpbXBsZW1lbnRhdGlvblxuICAgIC8vIHNpbmNlIG11bHRpcGxlIHJlYWR5IGNhbGxzIGFyZSBoYW5kbGVkIGJ5IGl0c2VsZlxuICAgIG9yaWdpbmFsUmVhZHkuY2FsbCh0aGlzKTtcbiAgfTtcblxuICB2YXIgb3JpZ2luYWxFcnJvciA9IHN1YnNjcmlwdGlvblByb3RvLmVycm9yO1xuICBzdWJzY3JpcHRpb25Qcm90by5lcnJvciA9IGZ1bmN0aW9uKGVycikge1xuICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgZXJyID0geyBtZXNzYWdlOiBlcnIgfTtcbiAgICB9XG5cbiAgICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuXG4gICAgaWYgKGthZGlyYUluZm8gJiYgdGhpcy5fc3Vic2NyaXB0aW9uSWQgJiYgdGhpcy5fc3Vic2NyaXB0aW9uSWQgPT0ga2FkaXJhSW5mby50cmFjZS5pZCkge1xuICAgICAgS2FkaXJhLnRyYWNlci5lbmRMYXN0RXZlbnQoa2FkaXJhSW5mby50cmFjZSk7XG5cbiAgICAgIHZhciBlcnJvckZvckFwbSA9IF8ucGljayhlcnIsICdtZXNzYWdlJywgJ3N0YWNrJyk7XG4gICAgICBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdlcnJvcicsIHtlcnJvcjogZXJyb3JGb3JBcG19KTtcbiAgICAgIHZhciB0cmFjZSA9IEthZGlyYS50cmFjZXIuYnVpbGRUcmFjZShrYWRpcmFJbmZvLnRyYWNlKTtcblxuICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIuX3RyYWNrRXJyb3IodGhpcy5fc2Vzc2lvbiwgdGhpcywgdHJhY2UpO1xuXG4gICAgICAvLyBlcnJvciB0cmFja2luZyBjYW4gYmUgZGlzYWJsZWQgYW5kIGlmIHRoZXJlIGlzIGEgdHJhY2VcbiAgICAgIC8vIHRyYWNlIHNob3VsZCBiZSBhdmFpbGFibGUgYWxsIHRoZSB0aW1lLCBidXQgaXQgd29uJ3RcbiAgICAgIC8vIGlmIHNvbWV0aGluZyB3cm9uZyBoYXBwZW5lZCBvbiB0aGUgdHJhY2UgYnVpbGRpbmdcbiAgICAgIGlmKEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcgJiYgdHJhY2UpIHtcbiAgICAgICAgS2FkaXJhLm1vZGVscy5lcnJvci50cmFja0Vycm9yKGVyciwgdHJhY2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdyYXAgZXJyb3Igc3RhY2sgc28gTWV0ZW9yLl9kZWJ1ZyBjYW4gaWRlbnRpZnkgYW5kIGlnbm9yZSBpdFxuICAgIC8vIGl0IGlzIG5vdCB3cmFwcGVkIHdoZW4gZXJyb3IgdHJhY2tpbmcgaXMgZGlzYWJsZWQgc2luY2UgaXRcbiAgICAvLyB3b3VsZCBiZSBzaG93biBhcyBhbiBvYmplY3QgaW4gdGhlIGxvZ3NcbiAgICBpZiAoS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZykge1xuICAgICAgZXJyLnN0YWNrID0ge3N0YWNrOiBlcnIuc3RhY2ssIHNvdXJjZTogJ3N1YnNjcmlwdGlvbicsIFtNZXRlb3JEZWJ1Z0lnbm9yZV06IHRydWV9O1xuICAgIH1cbiAgICBvcmlnaW5hbEVycm9yLmNhbGwodGhpcywgZXJyKTtcbiAgfTtcblxuICB2YXIgb3JpZ2luYWxEZWFjdGl2YXRlID0gc3Vic2NyaXB0aW9uUHJvdG8uX2RlYWN0aXZhdGU7XG4gIHN1YnNjcmlwdGlvblByb3RvLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ3B1YnN1YicsICdzdWJEZWFjdGl2YXRlZCcsIHRoaXMuX3Nlc3Npb24sIHRoaXMpO1xuICAgIEthZGlyYS5tb2RlbHMucHVic3ViLl90cmFja1Vuc3ViKHRoaXMuX3Nlc3Npb24sIHRoaXMpO1xuICAgIG9yaWdpbmFsRGVhY3RpdmF0ZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8vYWRkaW5nIHRoZSBjdXJyZW5TdWIgZW52IHZhcmlhYmxlXG4gIFsnYWRkZWQnLCAnY2hhbmdlZCcsICdyZW1vdmVkJ10uZm9yRWFjaChmdW5jdGlvbihmdW5jTmFtZSkge1xuICAgIHZhciBvcmlnaW5hbEZ1bmMgPSBzdWJzY3JpcHRpb25Qcm90b1tmdW5jTmFtZV07XG4gICAgc3Vic2NyaXB0aW9uUHJvdG9bZnVuY05hbWVdID0gZnVuY3Rpb24oY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gd2UgbmVlZCB0byBydW4gdGhpcyBjb2RlIGluIGEgZmliZXIgYW5kIHRoYXQncyBob3cgd2UgdHJhY2tcbiAgICAgIC8vIHN1YnNjcmlwdGlvbiBpbmZvLiBNYXkgYmUgd2UgY2FuIGZpZ3VyZSBvdXQsIHNvbWUgb3RoZXIgd2F5IHRvIGRvIHRoaXNcbiAgICAgIC8vIFdlIHVzZSB0aGlzIGN1cnJlbnRseSB0byBnZXQgdGhlIHB1YmxpY2F0aW9uIGluZm8gd2hlbiB0cmFja2luZyBtZXNzYWdlXG4gICAgICAvLyBzaXplcyBhdCB3cmFwX2RkcF9zdHJpbmdpZnkuanNcbiAgICAgIEthZGlyYS5lbnYuY3VycmVudFN1YiA9IHNlbGY7XG4gICAgICB2YXIgcmVzID0gb3JpZ2luYWxGdW5jLmNhbGwoc2VsZiwgY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpO1xuICAgICAgS2FkaXJhLmVudi5jdXJyZW50U3ViID0gbnVsbDtcblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICB9KTtcbn07XG4iLCJ3cmFwT3Bsb2dPYnNlcnZlRHJpdmVyID0gZnVuY3Rpb24ocHJvdG8pIHtcbiAgLy8gVHJhY2sgdGhlIHBvbGxlZCBkb2N1bWVudHMuIFRoaXMgaXMgcmVmbGVjdCB0byB0aGUgUkFNIHNpemUgYW5kXG4gIC8vIGZvciB0aGUgQ1BVIHVzYWdlIGRpcmVjdGx5XG4gIHZhciBvcmlnaW5hbFB1Ymxpc2hOZXdSZXN1bHRzID0gcHJvdG8uX3B1Ymxpc2hOZXdSZXN1bHRzO1xuICBwcm90by5fcHVibGlzaE5ld1Jlc3VsdHMgPSBmdW5jdGlvbihuZXdSZXN1bHRzLCBuZXdCdWZmZXIpIHtcbiAgICB2YXIgY29sbCA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuICAgIHZhciBxdWVyeSA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yO1xuICAgIHZhciBvcHRzID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucztcbiAgICB2YXIgZG9jU2l6ZSA9IEthZGlyYS5kb2NTekNhY2hlLmdldFNpemUoY29sbCwgcXVlcnksIG9wdHMsIG5ld1Jlc3VsdHMpO1xuICAgIHZhciBkb2NTaXplID0gS2FkaXJhLmRvY1N6Q2FjaGUuZ2V0U2l6ZShjb2xsLCBxdWVyeSwgb3B0cywgbmV3QnVmZmVyKTtcbiAgICB2YXIgY291bnQgPSBuZXdSZXN1bHRzLnNpemUoKSArIG5ld0J1ZmZlci5zaXplKCk7XG4gICAgaWYodGhpcy5fb3duZXJJbmZvKSB7XG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja1BvbGxlZERvY3VtZW50cyh0aGlzLl9vd25lckluZm8sIGNvdW50KTtcbiAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jU2l6ZSh0aGlzLl9vd25lckluZm8ubmFtZSwgXCJwb2xsZWRGZXRjaGVzXCIsIGRvY1NpemUqY291bnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wb2xsZWREb2N1bWVudHMgPSBjb3VudDtcbiAgICAgIHRoaXMuX2RvY1NpemUgPSB7XG4gICAgICAgIHBvbGxlZEZldGNoZXM6IGRvY1NpemUqY291bnRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9yaWdpbmFsUHVibGlzaE5ld1Jlc3VsdHMuY2FsbCh0aGlzLCBuZXdSZXN1bHRzLCBuZXdCdWZmZXIpO1xuICB9O1xuXG4gIHZhciBvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlRdWVyeWluZyA9IHByb3RvLl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmc7XG4gIHByb3RvLl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmcgPSBmdW5jdGlvbihvcCkge1xuICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jdW1lbnRDaGFuZ2VzKHRoaXMuX293bmVySW5mbywgb3ApO1xuICAgIHJldHVybiBvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlRdWVyeWluZy5jYWxsKHRoaXMsIG9wKTtcbiAgfTtcblxuICB2YXIgb3JpZ2luYWxIYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZyA9IHByb3RvLl9oYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZztcbiAgcHJvdG8uX2hhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nID0gZnVuY3Rpb24ob3ApIHtcbiAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0RvY3VtZW50Q2hhbmdlcyh0aGlzLl9vd25lckluZm8sIG9wKTtcbiAgICByZXR1cm4gb3JpZ2luYWxIYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZy5jYWxsKHRoaXMsIG9wKTtcbiAgfTtcblxuICAvLyB0cmFjayBsaXZlIHVwZGF0ZXNcbiAgWydfYWRkUHVibGlzaGVkJywgJ19yZW1vdmVQdWJsaXNoZWQnLCAnX2NoYW5nZVB1Ymxpc2hlZCddLmZvckVhY2goZnVuY3Rpb24oZm5OYW1lKSB7XG4gICAgdmFyIG9yaWdpbmFsRm4gPSBwcm90b1tmbk5hbWVdO1xuICAgIHByb3RvW2ZuTmFtZV0gPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gICAgICBpZih0aGlzLl9vd25lckluZm8pIHtcbiAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tMaXZlVXBkYXRlcyh0aGlzLl9vd25lckluZm8sIGZuTmFtZSwgMSk7XG5cbiAgICAgICAgaWYoZm5OYW1lID09PSBcIl9hZGRQdWJsaXNoZWRcIikge1xuICAgICAgICAgIHZhciBjb2xsID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3I7XG4gICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICAgICAgICAgIHZhciBkb2NTaXplID0gS2FkaXJhLmRvY1N6Q2FjaGUuZ2V0U2l6ZShjb2xsLCBxdWVyeSwgb3B0cywgW2JdKTtcblxuICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jU2l6ZSh0aGlzLl9vd25lckluZm8ubmFtZSwgXCJsaXZlRmV0Y2hlc1wiLCBkb2NTaXplKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gb3duZXJJbmZvLCB0aGF0IG1lYW5zIHRoaXMgaXMgdGhlIGluaXRpYWwgYWRkc1xuICAgICAgICBpZighdGhpcy5fbGl2ZVVwZGF0ZXNDb3VudHMpIHtcbiAgICAgICAgICB0aGlzLl9saXZlVXBkYXRlc0NvdW50cyA9IHtcbiAgICAgICAgICAgIF9pbml0aWFsQWRkczogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9saXZlVXBkYXRlc0NvdW50cy5faW5pdGlhbEFkZHMrKztcblxuICAgICAgICBpZihmbk5hbWUgPT09IFwiX2FkZFB1Ymxpc2hlZFwiKSB7XG4gICAgICAgICAgaWYoIXRoaXMuX2RvY1NpemUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RvY1NpemUgPSB7XG4gICAgICAgICAgICAgIGluaXRpYWxGZXRjaGVzOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKCF0aGlzLl9kb2NTaXplLmluaXRpYWxGZXRjaGVzKSB7XG4gICAgICAgICAgICB0aGlzLl9kb2NTaXplLmluaXRpYWxGZXRjaGVzID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgY29sbCA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuICAgICAgICAgIHZhciBxdWVyeSA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yO1xuICAgICAgICAgIHZhciBvcHRzID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucztcbiAgICAgICAgICB2YXIgZG9jU2l6ZSA9IEthZGlyYS5kb2NTekNhY2hlLmdldFNpemUoY29sbCwgcXVlcnksIG9wdHMsIFtiXSk7XG5cbiAgICAgICAgICB0aGlzLl9kb2NTaXplLmluaXRpYWxGZXRjaGVzICs9IGRvY1NpemU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsRm4uY2FsbCh0aGlzLCBhLCBiLCBjKTtcbiAgICB9O1xuICB9KTtcblxuICB2YXIgb3JpZ2luYWxTdG9wID0gcHJvdG8uc3RvcDtcbiAgcHJvdG8uc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMuX293bmVySW5mbyAmJiB0aGlzLl9vd25lckluZm8udHlwZSA9PT0gJ3N1YicpIHtcbiAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdwdWJzdWInLCAnb2JzZXJ2ZXJEZWxldGVkJywgdGhpcy5fb3duZXJJbmZvKTtcbiAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRGVsZXRlZE9ic2VydmVyKHRoaXMuX293bmVySW5mbyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsU3RvcC5jYWxsKHRoaXMpO1xuICB9O1xufTtcblxud3JhcFBvbGxpbmdPYnNlcnZlRHJpdmVyID0gZnVuY3Rpb24ocHJvdG8pIHtcbiAgdmFyIG9yaWdpbmFsUG9sbE1vbmdvID0gcHJvdG8uX3BvbGxNb25nbztcbiAgcHJvdG8uX3BvbGxNb25nbyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgb3JpZ2luYWxQb2xsTW9uZ28uY2FsbCh0aGlzKTtcblxuICAgIC8vIEN1cnJlbnQgcmVzdWx0IGlzIHN0b3JlZCBpbiB0aGUgZm9sbG93aW5nIHZhcmlhYmxlLlxuICAgIC8vIFNvLCB3ZSBjYW4gdXNlIHRoYXRcbiAgICAvLyBTb21ldGltZXMsIGl0J3MgcG9zc2libGUgdG8gZ2V0IHNpemUgYXMgdW5kZWZpbmVkLlxuICAgIC8vIE1heSBiZSBzb21ldGhpbmcgd2l0aCBkaWZmZXJlbnQgdmVyc2lvbi4gV2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dFxuICAgIC8vIHRoaXMgbm93XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgZG9jU2l6ZSA9IDA7XG5cbiAgICBpZih0aGlzLl9yZXN1bHRzICYmIHRoaXMuX3Jlc3VsdHMuc2l6ZSkge1xuICAgICAgY291bnQgPSB0aGlzLl9yZXN1bHRzLnNpemUoKSB8fCAwO1xuXG4gICAgICB2YXIgY29sbCA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3I7XG4gICAgICB2YXIgb3B0cyA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnM7XG5cbiAgICAgIGRvY1NpemUgPSBLYWRpcmEuZG9jU3pDYWNoZS5nZXRTaXplKGNvbGwsIHF1ZXJ5LCBvcHRzLCB0aGlzLl9yZXN1bHRzLl9tYXApKmNvdW50O1xuICAgIH1cblxuICAgIGlmKHRoaXMuX293bmVySW5mbykge1xuICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tQb2xsZWREb2N1bWVudHModGhpcy5fb3duZXJJbmZvLCBjb3VudCk7XG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0RvY1NpemUodGhpcy5fb3duZXJJbmZvLm5hbWUsIFwicG9sbGVkRmV0Y2hlc1wiLCBkb2NTaXplKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcG9sbGVkRG9jdW1lbnRzID0gY291bnQ7XG4gICAgICB0aGlzLl9wb2xsZWREb2NTaXplID0gZG9jU2l6ZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG9yaWdpbmFsU3RvcCA9IHByb3RvLnN0b3A7XG4gIHByb3RvLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLl9vd25lckluZm8gJiYgdGhpcy5fb3duZXJJbmZvLnR5cGUgPT09ICdzdWInKSB7XG4gICAgICBLYWRpcmEuRXZlbnRCdXMuZW1pdCgncHVic3ViJywgJ29ic2VydmVyRGVsZXRlZCcsIHRoaXMuX293bmVySW5mbyk7XG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0RlbGV0ZWRPYnNlcnZlcih0aGlzLl9vd25lckluZm8pO1xuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbFN0b3AuY2FsbCh0aGlzKTtcbiAgfTtcbn07XG5cbndyYXBNdWx0aXBsZXhlciA9IGZ1bmN0aW9uKHByb3RvKSB7XG4gIHZhciBvcmlnaW5hbEluaXRhbEFkZCA9IHByb3RvLmFkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcztcbiAgIHByb3RvLmFkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgIGlmKCF0aGlzLl9maXJzdEluaXRpYWxBZGRUaW1lKSB7XG4gICAgICB0aGlzLl9maXJzdEluaXRpYWxBZGRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB9XG5cbiAgICBoYW5kbGUuX3dhc011bHRpcGxleGVyUmVhZHkgPSB0aGlzLl9yZWFkeSgpO1xuICAgIGhhbmRsZS5fcXVldWVMZW5ndGggPSB0aGlzLl9xdWV1ZS5fdGFza0hhbmRsZXMubGVuZ3RoO1xuXG4gICAgaWYoIWhhbmRsZS5fd2FzTXVsdGlwbGV4ZXJSZWFkeSkge1xuICAgICAgaGFuZGxlLl9lbGFwc2VkUG9sbGluZ1RpbWUgPSBEYXRlLm5vdygpIC0gdGhpcy5fZmlyc3RJbml0aWFsQWRkVGltZTtcbiAgICB9XG4gICAgcmV0dXJuIG9yaWdpbmFsSW5pdGFsQWRkLmNhbGwodGhpcywgaGFuZGxlKTtcbiAgfTtcbn07XG5cbndyYXBGb3JDb3VudGluZ09ic2VydmVycyA9IGZ1bmN0aW9uKCkge1xuICAvLyB0byBjb3VudCBvYnNlcnZlcnNcbiAgdmFyIG1vbmdvQ29ubmVjdGlvblByb3RvID0gTWV0ZW9yWC5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgb3JpZ2luYWxPYnNlcnZlQ2hhbmdlcyA9IG1vbmdvQ29ubmVjdGlvblByb3RvLl9vYnNlcnZlQ2hhbmdlcztcbiAgbW9uZ29Db25uZWN0aW9uUHJvdG8uX29ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24sIG9yZGVyZWQsIGNhbGxiYWNrcykge1xuICAgIHZhciByZXQgPSBvcmlnaW5hbE9ic2VydmVDaGFuZ2VzLmNhbGwodGhpcywgY3Vyc29yRGVzY3JpcHRpb24sIG9yZGVyZWQsIGNhbGxiYWNrcyk7XG4gICAgLy8gZ2V0IHRoZSBLYWRpcmEgSW5mbyB2aWEgdGhlIE1ldGVvci5FbnZpcm9ubWVudGFsVmFyaWFibGVcbiAgICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbyhudWxsLCB0cnVlKTtcblxuICAgIGlmKGthZGlyYUluZm8gJiYgcmV0Ll9tdWx0aXBsZXhlcikge1xuICAgICAgaWYoIXJldC5fbXVsdGlwbGV4ZXIuX19rYWRpcmFUcmFja2VkKSB7XG4gICAgICAgIC8vIG5ldyBtdWx0aXBsZXhlclxuICAgICAgICByZXQuX211bHRpcGxleGVyLl9fa2FkaXJhVHJhY2tlZCA9IHRydWU7XG4gICAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdwdWJzdWInLCAnbmV3U3ViSGFuZGxlQ3JlYXRlZCcsIGthZGlyYUluZm8udHJhY2UpO1xuICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi5pbmNyZW1lbnRIYW5kbGVDb3VudChrYWRpcmFJbmZvLnRyYWNlLCBmYWxzZSk7XG4gICAgICAgIGlmKGthZGlyYUluZm8udHJhY2UudHlwZSA9PSAnc3ViJykge1xuICAgICAgICAgIHZhciBvd25lckluZm8gPSB7XG4gICAgICAgICAgICB0eXBlOiBrYWRpcmFJbmZvLnRyYWNlLnR5cGUsXG4gICAgICAgICAgICBuYW1lOiBrYWRpcmFJbmZvLnRyYWNlLm5hbWUsXG4gICAgICAgICAgICBzdGFydFRpbWU6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIG9ic2VydmVyRHJpdmVyID0gcmV0Ll9tdWx0aXBsZXhlci5fb2JzZXJ2ZURyaXZlcjtcbiAgICAgICAgICBvYnNlcnZlckRyaXZlci5fb3duZXJJbmZvID0gb3duZXJJbmZvO1xuICAgICAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdwdWJzdWInLCAnb2JzZXJ2ZXJDcmVhdGVkJywgb3duZXJJbmZvKTtcbiAgICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0NyZWF0ZWRPYnNlcnZlcihvd25lckluZm8pO1xuXG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBzZW5kIGluaXRpYWxseSBwb2xsZWQgZG9jdW1lbnRzIGlmIHRoZXJlIGFyZVxuICAgICAgICAgIGlmKG9ic2VydmVyRHJpdmVyLl9wb2xsZWREb2N1bWVudHMpIHtcbiAgICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrUG9sbGVkRG9jdW1lbnRzKG93bmVySW5mbywgb2JzZXJ2ZXJEcml2ZXIuX3BvbGxlZERvY3VtZW50cyk7XG4gICAgICAgICAgICBvYnNlcnZlckRyaXZlci5fcG9sbGVkRG9jdW1lbnRzID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIHNlbmQgaW5pdGlhbGx5IHBvbGxlZCBkb2N1bWVudHMgaWYgdGhlcmUgYXJlXG4gICAgICAgICAgaWYob2JzZXJ2ZXJEcml2ZXIuX3BvbGxlZERvY1NpemUpIHtcbiAgICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jU2l6ZShvd25lckluZm8ubmFtZSwgXCJwb2xsZWRGZXRjaGVzXCIsIG9ic2VydmVyRHJpdmVyLl9wb2xsZWREb2NTaXplKTtcbiAgICAgICAgICAgIG9ic2VydmVyRHJpdmVyLl9wb2xsZWREb2NTaXplID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQcm9jZXNzIF9saXZlVXBkYXRlc0NvdW50c1xuICAgICAgICAgIF8uZWFjaChvYnNlcnZlckRyaXZlci5fbGl2ZVVwZGF0ZXNDb3VudHMsIGZ1bmN0aW9uKGNvdW50LCBrZXkpIHtcbiAgICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrTGl2ZVVwZGF0ZXMob3duZXJJbmZvLCBrZXksIGNvdW50KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFByb2Nlc3MgZG9jU2l6ZVxuICAgICAgICAgIF8uZWFjaChvYnNlcnZlckRyaXZlci5fZG9jU2l6ZSwgZnVuY3Rpb24oY291bnQsIGtleSkge1xuICAgICAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tEb2NTaXplKG93bmVySW5mby5uYW1lLCBrZXksIGNvdW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ3B1YnN1YicsICdjYWNoZWRTdWJIYW5kbGVDcmVhdGVkJywga2FkaXJhSW5mby50cmFjZSk7XG4gICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLmluY3JlbWVudEhhbmRsZUNvdW50KGthZGlyYUluZm8udHJhY2UsIHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cbn07Iiwid3JhcFN0cmluZ2lmeUREUCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgb3JpZ2luYWxTdHJpbmdpZnlERFAgPSBERFBDb21tb24uc3RyaW5naWZ5RERQO1xuXG4gIEREUENvbW1vbi5zdHJpbmdpZnlERFAgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgbXNnU3RyaW5nID0gb3JpZ2luYWxTdHJpbmdpZnlERFAobXNnKTtcbiAgICB2YXIgbXNnU2l6ZSA9IEJ1ZmZlci5ieXRlTGVuZ3RoKG1zZ1N0cmluZywgJ3V0ZjgnKTtcblxuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKG51bGwsIHRydWUpO1xuXG4gICAgaWYoa2FkaXJhSW5mbyAmJiAhS2FkaXJhLmVudi5jdXJyZW50U3ViKSB7XG4gICAgICBpZihrYWRpcmFJbmZvLnRyYWNlLnR5cGUgPT09ICdtZXRob2QnKSB7XG4gICAgICAgIEthZGlyYS5tb2RlbHMubWV0aG9kcy50cmFja01zZ1NpemUoa2FkaXJhSW5mby50cmFjZS5uYW1lLCBtc2dTaXplKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1zZ1N0cmluZztcbiAgICB9XG5cbiAgICAvLyAnY3VycmVudFN1YicgaXMgc2V0IHdoZW4gd2Ugd3JhcCBTdWJzY3JpcHRpb24gb2JqZWN0IGFuZCBvdmVycmlkZVxuICAgIC8vIGhhbmRsZXJzIGZvciAnYWRkZWQnLCAnY2hhbmdlZCcsICdyZW1vdmVkJyBldmVudHMuIChzZWUgbGliL2hpamFjay93cmFwX3N1YnNjcmlwdGlvbi5qcylcbiAgICBpZihLYWRpcmEuZW52LmN1cnJlbnRTdWIpIHtcbiAgICAgIGlmKEthZGlyYS5lbnYuY3VycmVudFN1Yi5fX2thZGlyYUluZm8pe1xuICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja01zZ1NpemUoS2FkaXJhLmVudi5jdXJyZW50U3ViLl9uYW1lLCBcImluaXRpYWxTZW50XCIsIG1zZ1NpemUpO1xuICAgICAgICByZXR1cm4gbXNnU3RyaW5nO1xuICAgICAgfVxuICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tNc2dTaXplKEthZGlyYS5lbnYuY3VycmVudFN1Yi5fbmFtZSwgXCJsaXZlU2VudFwiLCBtc2dTaXplKTtcbiAgICAgIHJldHVybiBtc2dTdHJpbmc7XG4gICAgfVxuXG4gICAgS2FkaXJhLm1vZGVscy5tZXRob2RzLnRyYWNrTXNnU2l6ZShcIjxub3QtYS1tZXRob2Qtb3ItYS1wdWI+XCIsIG1zZ1NpemUpO1xuICAgIHJldHVybiBtc2dTdHJpbmc7XG4gIH1cbn1cbiIsImltcG9ydCB7IHdyYXBXZWJBcHAgfSBmcm9tIFwiLi93cmFwX3dlYmFwcC5qc1wiO1xuaW1wb3J0IHsgd3JhcEZhc3RSZW5kZXIgfSBmcm9tIFwiLi9mYXN0X3JlbmRlci5qc1wiO1xuaW1wb3J0IHsgd3JhcEZzIH0gZnJvbSBcIi4vZnMuanNcIjtcbmltcG9ydCB7IHdyYXBQaWNrZXIgfSBmcm9tIFwiLi9waWNrZXIuanNcIjtcbmltcG9ydCB7IHdyYXBSb3V0ZXJzIH0gZnJvbSAnLi93cmFwX3JvdXRlcnMuanMnO1xuaW1wb3J0IHsgd3JhcEZpYmVycyB9IGZyb20gJy4vYXN5bmMuanMnO1xuXG52YXIgaW5zdHJ1bWVudGVkID0gZmFsc2U7XG5LYWRpcmEuX3N0YXJ0SW5zdHJ1bWVudGluZyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIGlmKGluc3RydW1lbnRlZCkge1xuICAgIGNhbGxiYWNrKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaW5zdHJ1bWVudGVkID0gdHJ1ZTtcbiAgd3JhcEZpYmVycygpO1xuICB3cmFwU3RyaW5naWZ5RERQKCk7XG4gIHdyYXBXZWJBcHAoKTtcbiAgd3JhcEZhc3RSZW5kZXIoKTtcbiAgd3JhcFBpY2tlcigpO1xuICB3cmFwRnMoKTtcbiAgd3JhcFJvdXRlcnMoKTtcblxuICBNZXRlb3JYLm9uUmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy9pbnN0cnVtZW50aW5nIHNlc3Npb25cbiAgICB3cmFwU2VydmVyKE1ldGVvclguU2VydmVyLnByb3RvdHlwZSk7XG4gICAgd3JhcFNlc3Npb24oTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZSk7XG4gICAgd3JhcFN1YnNjcmlwdGlvbihNZXRlb3JYLlN1YnNjcmlwdGlvbi5wcm90b3R5cGUpO1xuXG4gICAgaWYoTWV0ZW9yWC5Nb25nb09wbG9nRHJpdmVyKSB7XG4gICAgICB3cmFwT3Bsb2dPYnNlcnZlRHJpdmVyKE1ldGVvclguTW9uZ29PcGxvZ0RyaXZlci5wcm90b3R5cGUpO1xuICAgIH1cblxuICAgIGlmKE1ldGVvclguTW9uZ29Qb2xsaW5nRHJpdmVyKSB7XG4gICAgICB3cmFwUG9sbGluZ09ic2VydmVEcml2ZXIoTWV0ZW9yWC5Nb25nb1BvbGxpbmdEcml2ZXIucHJvdG90eXBlKTtcbiAgICB9XG5cbiAgICBpZihNZXRlb3JYLk11bHRpcGxleGVyKSB7XG4gICAgICB3cmFwTXVsdGlwbGV4ZXIoTWV0ZW9yWC5NdWx0aXBsZXhlci5wcm90b3R5cGUpO1xuICAgIH1cblxuICAgIHdyYXBGb3JDb3VudGluZ09ic2VydmVycygpO1xuICAgIGhpamFja0RCT3BzKCk7XG5cbiAgICBzZXRMYWJlbHMoKTtcbiAgICBjYWxsYmFjaygpO1xuICB9KTtcbn07XG5cbi8vIFdlIG5lZWQgdG8gaW5zdHJ1bWVudCB0aGlzIHJpZ2h0IGF3YXkgYW5kIGl0J3Mgb2theVxuLy8gT25lIHJlYXNvbiBmb3IgdGhpcyBpcyB0byBjYWxsIGBzZXRMYWJsZXMoKWAgZnVuY3Rpb25cbi8vIE90aGVyd2lzZSwgQ1BVIHByb2ZpbGUgY2FuJ3Qgc2VlIGFsbCBvdXIgY3VzdG9tIGxhYmVsaW5nXG5LYWRpcmEuX3N0YXJ0SW5zdHJ1bWVudGluZyhmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ01vbnRpIEFQTTogY29tcGxldGVkIGluc3RydW1lbnRpbmcgdGhlIGFwcCcpXG59KTtcbiIsIi8vIFRoaXMgaGlqYWNrIGlzIGltcG9ydGFudCB0byBtYWtlIHN1cmUsIGNvbGxlY3Rpb25zIGNyZWF0ZWQgYmVmb3JlXG4vLyB3ZSBoaWphY2sgZGJPcHMsIGV2ZW4gZ2V0cyB0cmFja2VkLlxuLy8gIE1ldGVvciBkb2VzIG5vdCBzaW1wbHkgZXhwb3NlIE1vbmdvQ29ubmVjdGlvbiBvYmplY3QgdG8gdGhlIGNsaWVudFxuLy8gIEl0IHBpY2tzIG1ldGhvZHMgd2hpY2ggYXJlIG5lY2Vzc29yeSBhbmQgbWFrZSBhIGJpbmRlZCBvYmplY3QgYW5kXG4vLyAgYXNzaWduZWQgdG8gdGhlIE1vbmdvLkNvbGxlY3Rpb25cbi8vICBzbywgZXZlbiB3ZSB1cGRhdGVkIHByb3RvdHlwZSwgd2UgY2FuJ3QgdHJhY2sgdGhvc2UgY29sbGVjdGlvbnNcbi8vICBidXQsIHRoaXMgd2lsbCBmaXggaXQuXG52YXIgb3JpZ2luYWxPcGVuID0gTW9uZ29JbnRlcm5hbHMuUmVtb3RlQ29sbGVjdGlvbkRyaXZlci5wcm90b3R5cGUub3Blbjtcbk1vbmdvSW50ZXJuYWxzLlJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiBvcGVuKG5hbWUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgcmV0ID0gb3JpZ2luYWxPcGVuLmNhbGwoc2VsZiwgbmFtZSk7XG5cbiAgXy5lYWNoKHJldCwgZnVuY3Rpb24oZm4sIG0pIHtcbiAgICAvLyBtYWtlIHN1cmUsIGl0J3MgaW4gdGhlIGFjdHVhbCBtb25nbyBjb25uZWN0aW9uIG9iamVjdFxuICAgIC8vIG1ldGVvcmhhY2tzOm1vbmdvLWNvbGxlY3Rpb24tdXRpbHMgcGFja2FnZSBhZGQgc29tZSBhcmJpdGFyeSBtZXRob2RzXG4gICAgLy8gd2hpY2ggZG9lcyBub3QgZXhpc3QgaW4gdGhlIG1vbmdvIGNvbm5lY3Rpb25cbiAgICBpZihzZWxmLm1vbmdvW21dKSB7XG4gICAgICByZXRbbV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIG5hbWUpO1xuICAgICAgICByZXR1cm4gT3B0aW1pemVkQXBwbHkoc2VsZi5tb25nbywgc2VsZi5tb25nb1ttXSwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgYWRkZWQgdG8gTWV0ZW9yeFxuZnVuY3Rpb24gZ2V0U3luY3Jvbm91c0N1cnNvcigpIHtcbiAgY29uc3QgTW9uZ29Db2xsID0gdHlwZW9mIE1vbmdvICE9PSBcInVuZGVmaW5lZFwiID8gTW9uZ28uQ29sbGVjdGlvbiA6IE1ldGVvci5Db2xsZWN0aW9uO1xuICBjb25zdCBjb2xsID0gbmV3IE1vbmdvQ29sbChcIl9fZHVtbXlfY29sbF9cIiArIFJhbmRvbS5pZCgpKTtcbiAgLy8gd2UgbmVlZCB0byB3YWl0IHVudGlsIHRoZSBkYiBpcyBjb25uZWN0ZWQgd2l0aCBtZXRlb3IuIGZpbmRPbmUgZG9lcyB0aGF0XG4gIGNvbGwuZmluZE9uZSgpO1xuICBcbiAgY29uc3QgY3Vyc29yID0gY29sbC5maW5kKCk7XG4gIGN1cnNvci5mZXRjaCgpO1xuICByZXR1cm4gY3Vyc29yLl9zeW5jaHJvbm91c0N1cnNvci5jb25zdHJ1Y3RvclxufVxuXG5oaWphY2tEQk9wcyA9IGZ1bmN0aW9uIGhpamFja0RCT3BzKCkge1xuICB2YXIgbW9uZ29Db25uZWN0aW9uUHJvdG8gPSBNZXRlb3JYLk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGU7XG4gIC8vZmluZE9uZSBpcyBoYW5kbGVkIGJ5IGZpbmQgLSBzbyBubyBuZWVkIHRvIHRyYWNrIGl0XG4gIC8vdXBzZXJ0IGlzIGhhbmRsZXMgYnkgdXBkYXRlXG4gIC8vMi40IHJlcGxhY2VkIF9lbnN1cmVJbmRleCB3aXRoIGNyZWF0ZUluZGV4XG4gIFtcbiAgICAnZmluZCcsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2luc2VydCcsICdfZW5zdXJlSW5kZXgnLCAnX2Ryb3BJbmRleCcsICdjcmVhdGVJbmRleCdcbiAgXS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgb3JpZ2luYWxGdW5jID0gbW9uZ29Db25uZWN0aW9uUHJvdG9bZnVuY107XG5cbiAgICBpZiAoIW9yaWdpbmFsRnVuYykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1vbmdvQ29ubmVjdGlvblByb3RvW2Z1bmNdID0gZnVuY3Rpb24oY29sbE5hbWUsIHNlbGVjdG9yLCBtb2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBwYXlsb2FkID0ge1xuICAgICAgICBjb2xsOiBjb2xsTmFtZSxcbiAgICAgICAgZnVuYzogZnVuYyxcbiAgICAgIH07XG5cbiAgICAgIGlmKGZ1bmMgPT0gJ2luc2VydCcpIHtcbiAgICAgICAgLy9hZGQgbm90aGluZyBtb3JlIHRvIHRoZSBwYXlsb2FkXG4gICAgICB9IGVsc2UgaWYoZnVuYyA9PSAnX2Vuc3VyZUluZGV4JyB8fCBmdW5jID09ICdfZHJvcEluZGV4JyB8fCBmdW5jID09PSAnY3JlYXRlSW5kZXgnKSB7XG4gICAgICAgIC8vYWRkIGluZGV4XG4gICAgICAgIHBheWxvYWQuaW5kZXggPSBKU09OLnN0cmluZ2lmeShzZWxlY3Rvcik7XG4gICAgICB9IGVsc2UgaWYoZnVuYyA9PSAndXBkYXRlJyAmJiBvcHRpb25zICYmIG9wdGlvbnMudXBzZXJ0KSB7XG4gICAgICAgIHBheWxvYWQuZnVuYyA9ICd1cHNlcnQnO1xuICAgICAgICBwYXlsb2FkLnNlbGVjdG9yID0gSlNPTi5zdHJpbmdpZnkoc2VsZWN0b3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9hbGwgdGhlIG90aGVyIGZ1bmN0aW9ucyBoYXZlIHNlbGVjdG9yc1xuICAgICAgICBwYXlsb2FkLnNlbGVjdG9yID0gSlNPTi5zdHJpbmdpZnkoc2VsZWN0b3IpO1xuICAgICAgfVxuXG4gICAgICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuICAgICAgaWYoa2FkaXJhSW5mbykge1xuICAgICAgICB2YXIgZXZlbnRJZCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2RiJywgcGF5bG9hZCk7XG4gICAgICB9XG5cbiAgICAgIC8vdGhpcyBjYXVzZSBWOCB0byBhdm9pZCBhbnkgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9ucywgYnV0IHRoaXMgaXMgbXVzdCB0byB1c2VcbiAgICAgIC8vb3RoZXJ3aXNlLCBpZiB0aGUgZXJyb3IgYWRkcyB0cnkgY2F0Y2ggYmxvY2sgb3VyIGxvZ3MgZ2V0IG1lc3N5IGFuZCBkaWRuJ3Qgd29ya1xuICAgICAgLy9zZWU6IGlzc3VlICM2XG4gICAgICB0cnl7XG4gICAgICAgIHZhciByZXQgPSBvcmlnaW5hbEZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgLy9oYW5kbGluZyBmdW5jdGlvbnMgd2hpY2ggY2FuIGJlIHRyaWdnZXJlZCB3aXRoIGFuIGFzeW5jQ2FsbGJhY2tcbiAgICAgICAgdmFyIGVuZE9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpZihIYXZlQXN5bmNDYWxsYmFjayhhcmd1bWVudHMpKSB7XG4gICAgICAgICAgZW5kT3B0aW9ucy5hc3luYyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZihmdW5jID09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgLy8gdXBzZXJ0IG9ubHkgcmV0dXJucyBhbiBvYmplY3Qgd2hlbiBjYWxsZWQgYHVwc2VydGAgZGlyZWN0bHlcbiAgICAgICAgICAvLyBvdGhlcndpc2UgaXQgb25seSBhY3QgYW4gdXBkYXRlIGNvbW1hbmRcbiAgICAgICAgICBpZihvcHRpb25zICYmIG9wdGlvbnMudXBzZXJ0ICYmIHR5cGVvZiByZXQgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGVuZE9wdGlvbnMudXBkYXRlZERvY3MgPSByZXQubnVtYmVyQWZmZWN0ZWQ7XG4gICAgICAgICAgICBlbmRPcHRpb25zLmluc2VydGVkSWQgPSByZXQuaW5zZXJ0ZWRJZDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW5kT3B0aW9ucy51cGRhdGVkRG9jcyA9IHJldDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZihmdW5jID09ICdyZW1vdmUnKSB7XG4gICAgICAgICAgZW5kT3B0aW9ucy5yZW1vdmVkRG9jcyA9IHJldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV2ZW50SWQpIHtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50SWQsIGVuZE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoKGV4KSB7XG4gICAgICAgIGlmKGV2ZW50SWQpIHtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50SWQsIHtlcnI6IGV4Lm1lc3NhZ2V9KTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICB9KTtcblxuICB2YXIgY3Vyc29yUHJvdG8gPSBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZTtcbiAgWydmb3JFYWNoJywgJ21hcCcsICdmZXRjaCcsICdjb3VudCcsICdvYnNlcnZlQ2hhbmdlcycsICdvYnNlcnZlJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlKSB7XG4gICAgdmFyIG9yaWdpbmFsRnVuYyA9IGN1cnNvclByb3RvW3R5cGVdO1xuICAgIGN1cnNvclByb3RvW3R5cGVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3Vyc29yRGVzY3JpcHRpb24gPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbjtcbiAgICAgIHZhciBwYXlsb2FkID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKG51bGwpLCB7XG4gICAgICAgIGNvbGw6IGN1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICBzZWxlY3RvcjogSlNPTi5zdHJpbmdpZnkoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpLFxuICAgICAgICBmdW5jOiB0eXBlLFxuICAgICAgICBjdXJzb3I6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICBpZihjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zKSB7XG4gICAgICAgIHZhciBjdXJzb3JPcHRpb25zID0gXy5waWNrKGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMsIFsnZmllbGRzJywgJ3Byb2plY3Rpb24nLCAnc29ydCcsICdsaW1pdCddKTtcbiAgICAgICAgZm9yKHZhciBmaWVsZCBpbiBjdXJzb3JPcHRpb25zKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gY3Vyc29yT3B0aW9uc1tmaWVsZF1cbiAgICAgICAgICBpZih0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHZhbHVlID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXlsb2FkW2ZpZWxkXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG4gICAgICB2YXIgcHJldmlvdXNUcmFja05leHRPYmplY3Q7XG4gICAgICBpZihrYWRpcmFJbmZvKSB7XG4gICAgICAgIHZhciBldmVudElkID0gS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnZGInLCBwYXlsb2FkKTtcblxuICAgICAgICBwcmV2aW91c1RyYWNrTmV4dE9iamVjdCA9IGthZGlyYUluZm8udHJhY2tOZXh0T2JqZWN0XG4gICAgICAgIGlmICh0eXBlID09PSAnZm9yRWFjaCcgfHwgdHlwZSA9PT0gJ21hcCcpIHtcbiAgICAgICAgICBrYWRpcmFJbmZvLnRyYWNrTmV4dE9iamVjdCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHJ5e1xuICAgICAgICB2YXIgcmV0ID0gb3JpZ2luYWxGdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgdmFyIGVuZERhdGEgPSB7fTtcbiAgICAgICAgaWYodHlwZSA9PSAnb2JzZXJ2ZUNoYW5nZXMnIHx8IHR5cGUgPT0gJ29ic2VydmUnKSB7XG4gICAgICAgICAgdmFyIG9ic2VydmVyRHJpdmVyO1xuICAgICAgICAgIGVuZERhdGEub3Bsb2cgPSBmYWxzZTtcbiAgICAgICAgICAvLyBnZXQgZGF0YSB3cml0dGVuIGJ5IHRoZSBtdWx0aXBsZXhlclxuICAgICAgICAgIGVuZERhdGEud2FzTXVsdGlwbGV4ZXJSZWFkeSA9IHJldC5fd2FzTXVsdGlwbGV4ZXJSZWFkeTtcbiAgICAgICAgICBlbmREYXRhLnF1ZXVlTGVuZ3RoID0gcmV0Ll9xdWV1ZUxlbmd0aDtcbiAgICAgICAgICBlbmREYXRhLmVsYXBzZWRQb2xsaW5nVGltZSA9IHJldC5fZWxhcHNlZFBvbGxpbmdUaW1lO1xuXG4gICAgICAgICAgaWYocmV0Ll9tdWx0aXBsZXhlcikge1xuICAgICAgICAgICAgLy8gb2xkZXIgbWV0ZW9yIHZlcnNpb25zIGRvbmUgbm90IGhhdmUgYW4gX211bHRpcGxleGVyIHZhbHVlXG4gICAgICAgICAgICBvYnNlcnZlckRyaXZlciA9IHJldC5fbXVsdGlwbGV4ZXIuX29ic2VydmVEcml2ZXI7XG4gICAgICAgICAgICBpZihvYnNlcnZlckRyaXZlcikge1xuICAgICAgICAgICAgICBvYnNlcnZlckRyaXZlciA9IHJldC5fbXVsdGlwbGV4ZXIuX29ic2VydmVEcml2ZXI7XG4gICAgICAgICAgICAgIHZhciBvYnNlcnZlckRyaXZlckNsYXNzID0gb2JzZXJ2ZXJEcml2ZXIuY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgIHZhciB1c2VzT3Bsb2cgPSB0eXBlb2Ygb2JzZXJ2ZXJEcml2ZXJDbGFzcy5jdXJzb3JTdXBwb3J0ZWQgPT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICAgICAgZW5kRGF0YS5vcGxvZyA9IHVzZXNPcGxvZztcbiAgICAgICAgICAgICAgdmFyIHNpemUgPSAwO1xuICAgICAgICAgICAgICByZXQuX211bHRpcGxleGVyLl9jYWNoZS5kb2NzLmZvckVhY2goZnVuY3Rpb24oKSB7c2l6ZSsrfSk7XG4gICAgICAgICAgICAgIGVuZERhdGEubm9PZkNhY2hlZERvY3MgPSBzaXplO1xuXG4gICAgICAgICAgICAgIC8vIGlmIG11bHRpcGxleGVyV2FzTm90UmVhZHksIHdlIG5lZWQgdG8gZ2V0IHRoZSB0aW1lIHNwZW5kIGZvciB0aGUgcG9sbGluZ1xuICAgICAgICAgICAgICBpZighcmV0Ll93YXNNdWx0aXBsZXhlclJlYWR5KSB7XG4gICAgICAgICAgICAgICAgZW5kRGF0YS5pbml0aWFsUG9sbGluZ1RpbWUgPSBvYnNlcnZlckRyaXZlci5fbGFzdFBvbGxUaW1lO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoIWVuZERhdGEub3Bsb2cpIHtcbiAgICAgICAgICAgIC8vIGxldCdzIHRyeSB0byBmaW5kIHRoZSByZWFzb25cbiAgICAgICAgICAgIHZhciByZWFzb25JbmZvID0gS2FkaXJhLmNoZWNrV2h5Tm9PcGxvZyhjdXJzb3JEZXNjcmlwdGlvbiwgb2JzZXJ2ZXJEcml2ZXIpO1xuICAgICAgICAgICAgZW5kRGF0YS5ub09wbG9nQ29kZSA9IHJlYXNvbkluZm8uY29kZTtcbiAgICAgICAgICAgIGVuZERhdGEubm9PcGxvZ1JlYXNvbiA9IHJlYXNvbkluZm8ucmVhc29uO1xuICAgICAgICAgICAgZW5kRGF0YS5ub09wbG9nU29sdXRpb24gPSByZWFzb25JbmZvLnNvbHV0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKHR5cGUgPT0gJ2ZldGNoJyB8fCB0eXBlID09ICdtYXAnKXtcbiAgICAgICAgICAvL2ZvciBvdGhlciBjdXJzb3Igb3BlcmF0aW9uXG5cbiAgICAgICAgICBlbmREYXRhLmRvY3NGZXRjaGVkID0gcmV0Lmxlbmd0aDtcblxuICAgICAgICAgIGlmKHR5cGUgPT0gJ2ZldGNoJykge1xuICAgICAgICAgICAgdmFyIGNvbGwgPSBjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZTtcbiAgICAgICAgICAgIHZhciBxdWVyeSA9IGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yO1xuICAgICAgICAgICAgdmFyIG9wdHMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICAgICAgICAgICAgdmFyIGRvY1NpemUgPSBLYWRpcmEuZG9jU3pDYWNoZS5nZXRTaXplKGNvbGwsIHF1ZXJ5LCBvcHRzLCByZXQpICogcmV0Lmxlbmd0aDtcbiAgICAgICAgICAgIGVuZERhdGEuZG9jU2l6ZSA9IGRvY1NpemU7XG5cbiAgICAgICAgICAgIGlmKGthZGlyYUluZm8pIHtcbiAgICAgICAgICAgICAgaWYoa2FkaXJhSW5mby50cmFjZS50eXBlID09PSAnbWV0aG9kJykge1xuICAgICAgICAgICAgICAgIEthZGlyYS5tb2RlbHMubWV0aG9kcy50cmFja0RvY1NpemUoa2FkaXJhSW5mby50cmFjZS5uYW1lLCBkb2NTaXplKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmKGthZGlyYUluZm8udHJhY2UudHlwZSA9PT0gJ3N1YicpIHtcbiAgICAgICAgICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0RvY1NpemUoa2FkaXJhSW5mby50cmFjZS5uYW1lLCBcImN1cnNvckZldGNoZXNcIiwgZG9jU2l6ZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBrYWRpcmFJbmZvLnRyYWNrTmV4dE9iamVjdCA9IHByZXZpb3VzVHJhY2tOZXh0T2JqZWN0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBGZXRjaCB3aXRoIG5vIGthZGlyYSBpbmZvIGFyZSB0cmFja2VkIGFzIGZyb20gYSBudWxsIG1ldGhvZFxuICAgICAgICAgICAgICBLYWRpcmEubW9kZWxzLm1ldGhvZHMudHJhY2tEb2NTaXplKFwiPG5vdC1hLW1ldGhvZC1vci1hLXB1Yj5cIiwgZG9jU2l6ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRPRE86IEFkZCBkb2Mgc2l6ZSB0cmFja2luZyB0byBgbWFwYCBhcyB3ZWxsLlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV2ZW50SWQpIHtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50SWQsIGVuZERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9IGNhdGNoKGV4KSB7XG4gICAgICAgIGlmKGV2ZW50SWQpIHtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50SWQsIHtlcnI6IGV4Lm1lc3NhZ2V9KTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBTeW5jcm9ub3VzQ3Vyc29yID0gZ2V0U3luY3Jvbm91c0N1cnNvcigpO1xuICB2YXIgb3JpZ05leHRPYmplY3QgPSBTeW5jcm9ub3VzQ3Vyc29yLnByb3RvdHlwZS5fbmV4dE9iamVjdFxuICBTeW5jcm9ub3VzQ3Vyc29yLnByb3RvdHlwZS5fbmV4dE9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuICAgIHZhciBzaG91bGRUcmFjayA9IGthZGlyYUluZm8gJiYga2FkaXJhSW5mby50cmFja05leHRPYmplY3Q7XG4gICAgaWYoc2hvdWxkVHJhY2sgKSB7XG4gICAgICB2YXIgZXZlbnQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdkYicsIHtcbiAgICAgICAgZnVuYzogJ19uZXh0T2JqZWN0JyxcbiAgICAgICAgY29sbDogdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBvcmlnTmV4dE9iamVjdC5jYWxsKHRoaXMpO1xuXG4gICAgaWYgKHNob3VsZFRyYWNrKSB7XG4gICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufTtcbiIsImlmIChQYWNrYWdlWydodHRwJ10pIHtcbiAgY29uc3QgSFRUUCA9IFBhY2thZ2VbJ2h0dHAnXS5IVFRQO1xuXG4gIHZhciBvcmlnaW5hbENhbGwgPSBIVFRQLmNhbGw7XG5cbiAgSFRUUC5jYWxsID0gZnVuY3Rpb24gKG1ldGhvZCwgdXJsKSB7XG4gICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgICBpZiAoa2FkaXJhSW5mbykge1xuICAgICAgdmFyIGV2ZW50SWQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdodHRwJywgeyBtZXRob2Q6IG1ldGhvZCwgdXJsOiB1cmwgfSk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXNwb25zZSA9IG9yaWdpbmFsQ2FsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAvL2lmIHRoZSB1c2VyIHN1cHBsaWVkIGFuIGFzeW5DYWxsYmFjaywgd2UgZG9uJ3QgaGF2ZSBhIHJlc3BvbnNlIG9iamVjdCBhbmQgaXQgaGFuZGxlZCBhc3luY2hyb25vdXNseVxuICAgICAgLy93ZSBuZWVkIHRvIHRyYWNrIGl0IGRvd24gdG8gcHJldmVudCBpc3N1ZXMgbGlrZTogIzNcbiAgICAgIHZhciBlbmRPcHRpb25zID0gSGF2ZUFzeW5jQ2FsbGJhY2soYXJndW1lbnRzKSA/IHsgYXN5bmM6IHRydWUgfSA6IHsgc3RhdHVzQ29kZTogcmVzcG9uc2Uuc3RhdHVzQ29kZSB9O1xuICAgICAgaWYgKGV2ZW50SWQpIHtcbiAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCBlbmRPcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKGV2ZW50SWQpIHtcbiAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCB7IGVycjogZXgubWVzc2FnZSB9KTtcbiAgICAgIH1cbiAgICAgIHRocm93IGV4O1xuICAgIH1cbiAgfTtcbn0iLCJpZiAoUGFja2FnZVsnZW1haWwnXSkge1xuICBjb25zdCBFbWFpbCA9IFBhY2thZ2VbJ2VtYWlsJ10uRW1haWw7XG5cbiAgdmFyIG9yaWdpbmFsU2VuZCA9IEVtYWlsLnNlbmQ7XG5cbkVtYWlsLnNlbmQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgaWYoa2FkaXJhSW5mbykge1xuICAgICAgdmFyIGRhdGEgPSBfLnBpY2sob3B0aW9ucywgJ2Zyb20nLCAndG8nLCAnY2MnLCAnYmNjJywgJ3JlcGx5VG8nKTtcbiAgICAgIHZhciBldmVudElkID0gS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnZW1haWwnLCBkYXRhKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXQgPSBvcmlnaW5hbFNlbmQuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICBpZihldmVudElkKSB7XG4gICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgZXZlbnRJZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICB9IGNhdGNoKGV4KSB7XG4gICAgaWYoZXZlbnRJZCkge1xuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCB7ZXJyOiBleC5tZXNzYWdlfSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBleDtcbiAgICB9XG4gIH07XG59IiwidmFyIEZpYmVycyA9IE5wbS5yZXF1aXJlKCdmaWJlcnMnKTtcbnZhciBFdmVudFN5bWJvbCA9IFN5bWJvbCgpO1xudmFyIFN0YXJ0VHJhY2tlZCA9IFN5bWJvbCgpO1xuXG52YXIgYWN0aXZlRmliZXJzID0gMDtcbnZhciB3cmFwcGVkID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRmliZXJzKCkge1xuICBpZiAod3JhcHBlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB3cmFwcGVkID0gdHJ1ZTtcblxuICB2YXIgb3JpZ2luYWxZaWVsZCA9IEZpYmVycy55aWVsZDtcbiAgRmliZXJzLnlpZWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG4gICAgaWYgKGthZGlyYUluZm8pIHtcbiAgICAgIHZhciBldmVudElkID0gS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnYXN5bmMnKTtcbiAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgIC8vIFRoZSBldmVudCB1bmlxdWUgdG8gdGhpcyBmaWJlclxuICAgICAgICAvLyBVc2luZyBhIHN5bWJvbCBzaW5jZSBNZXRlb3IgZG9lc24ndCBjb3B5IHN5bWJvbHMgdG8gbmV3IGZpYmVycyBjcmVhdGVkXG4gICAgICAgIC8vIGZvciBwcm9taXNlcy4gVGhpcyBpcyBuZWVkZWQgc28gdGhlIGNvcnJlY3QgZXZlbnQgaXMgZW5kZWQgd2hlbiBhIGZpYmVyIHJ1bnMgYWZ0ZXIgYmVpbmcgeWllbGRlZC5cbiAgICAgICAgRmliZXJzLmN1cnJlbnRbRXZlbnRTeW1ib2xdID0gZXZlbnRJZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luYWxZaWVsZCgpO1xuICB9O1xuXG4gIHZhciBvcmlnaW5hbFJ1biA9IEZpYmVycy5wcm90b3R5cGUucnVuO1xuICB2YXIgb3JpZ2luYWxUaHJvd0ludG8gPSBGaWJlcnMucHJvdG90eXBlLnRocm93SW50bztcblxuICBmdW5jdGlvbiBlbnN1cmVGaWJlckNvdW50ZWQoZmliZXIpIHtcbiAgICAvLyBJZiBmaWJlci5zdGFydGVkIGlzIHRydWUsIGFuZCBTdGFydFRyYWNrZWQgaXMgZmFsc2VcbiAgICAvLyB0aGVuIHRoZSBmaWJlciB3YXMgcHJvYmFibHkgaW5pdGlhbGx5IHJhbiBiZWZvcmUgd2Ugd3JhcHBlZCBGaWJlcnMucnVuXG4gICAgaWYgKCFmaWJlci5zdGFydGVkIHx8ICFmaWJlcltTdGFydFRyYWNrZWRdKSB7XG4gICAgICBhY3RpdmVGaWJlcnMgKz0gMTtcbiAgICAgIGZpYmVyW1N0YXJ0VHJhY2tlZF0gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIEZpYmVycy5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIGVuc3VyZUZpYmVyQ291bnRlZCh0aGlzKTtcblxuICAgIGlmICh0aGlzW0V2ZW50U3ltYm9sXSkge1xuICAgICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8odGhpcyk7XG4gICAgICBpZiAoa2FkaXJhSW5mbykge1xuICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIHRoaXNbRXZlbnRTeW1ib2xdKTtcbiAgICAgICAgdGhpc1tFdmVudFN5bWJvbF0gPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX19rYWRpcmFJbmZvICYmIEZpYmVycy5jdXJyZW50ICYmIEZpYmVycy5jdXJyZW50Ll9fa2FkaXJhSW5mbykge1xuICAgICAgLy8gQ29weSBrYWRpcmFJbmZvIHdoZW4gcGFja2FnZXMgb3IgdXNlciBjb2RlIGNyZWF0ZXMgYSBuZXcgZmliZXJcbiAgICAgIC8vIERvbmUgYnkgbWFueSBhcHBzIGFuZCBwYWNrYWdlcyBpbiBjb25uZWN0IG1pZGRsZXdhcmUgc2luY2Ugb2xkZXJcbiAgICAgIC8vIHZlcnNpb25zIG9mIE1ldGVvciBkaWQgbm90IGRvIGl0IGF1dG9tYXRpY2FsbHlcbiAgICAgIHRoaXMuX19rYWRpcmFJbmZvID0gRmliZXJzLmN1cnJlbnQuX19rYWRpcmFJbmZvO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IG9yaWdpbmFsUnVuLmNhbGwodGhpcywgdmFsKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKCF0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgICAgYWN0aXZlRmliZXJzIC09IDE7XG4gICAgICAgIHRoaXNbU3RhcnRUcmFja2VkXSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgRmliZXJzLnByb3RvdHlwZS50aHJvd0ludG8gPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgZW5zdXJlRmliZXJDb3VudGVkKHRoaXMpO1xuXG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgcHJvYmFibHkgZW5kIHRoZSBjdXJyZW50IGFzeW5jIGV2ZW50IHNpbmNlIGluIHNvbWUgcGxhY2VzXG4gICAgLy8gTWV0ZW9yIGNhbGxzIHRocm93SW50byBpbnN0ZWFkIG9mIHJ1biBhZnRlciBhIGZpYmVyIGlzIHlpZWxkZWQuIEZvciBleGFtcGxlLFxuICAgIC8vIHdoZW4gYSBwcm9taXNlIGlzIGF3YWl0ZWQgYW5kIHJlamVjdHMgYW4gZXJyb3IuXG5cbiAgICBsZXQgcmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSBvcmlnaW5hbFRocm93SW50by5jYWxsKHRoaXMsIHZhbCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIGFjdGl2ZUZpYmVycyAtPSAxO1xuICAgICAgICB0aGlzW1N0YXJ0VHJhY2tlZF0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5sZXQgYWN0aXZlRmliZXJUb3RhbCA9IDA7XG5sZXQgYWN0aXZlRmliZXJDb3VudCA9IDA7XG5sZXQgcHJldmlvdXNUb3RhbENyZWF0ZWQgPSAwO1xuXG5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gIGFjdGl2ZUZpYmVyVG90YWwgKz0gYWN0aXZlRmliZXJzO1xuICBhY3RpdmVGaWJlckNvdW50ICs9IDE7XG59LCAxMDAwKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpYmVyTWV0cmljcygpIHtcbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVkOiBGaWJlcnMuZmliZXJzQ3JlYXRlZCAtIHByZXZpb3VzVG90YWxDcmVhdGVkLFxuICAgIGFjdGl2ZTogYWN0aXZlRmliZXJUb3RhbCAvIGFjdGl2ZUZpYmVyQ291bnQsXG4gICAgcG9vbFNpemU6IEZpYmVycy5wb29sU2l6ZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldEZpYmVyTWV0cmljcygpIHtcbiAgYWN0aXZlRmliZXJUb3RhbCA9IDA7XG4gIGFjdGl2ZUZpYmVyQ291bnQgPSAwO1xuICBwcmV2aW91c1RvdGFsQ3JlYXRlZCA9IEZpYmVycy5maWJlcnNDcmVhdGVkO1xufVxuIiwiZXhwb3J0IGNvbnN0IE1ldGVvckRlYnVnSWdub3JlID0gU3ltYm9sKClcblxuVHJhY2tVbmNhdWdodEV4Y2VwdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZnVuY3Rpb24gKGVycikge1xuICAgIC8vIHNraXAgZXJyb3JzIHdpdGggYF9za2lwS2FkaXJhYCBmbGFnXG4gICAgaWYoZXJyLl9za2lwS2FkaXJhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gbGV0IHRoZSBzZXJ2ZXIgY3Jhc2ggbm9ybWFsbHkgaWYgZXJyb3IgdHJhY2tpbmcgaXMgZGlzYWJsZWRcbiAgICBpZighS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZykge1xuICAgICAgcHJpbnRFcnJvckFuZEtpbGwoZXJyKTtcbiAgICB9XG5cbiAgICAvLyBsb29raW5nIGZvciBhbHJlYWR5IHRyYWNrZWQgZXJyb3JzIGFuZCB0aHJvdyB0aGVtIGltbWVkaWF0ZWx5XG4gICAgLy8gdGhyb3cgZXJyb3IgaW1tZWRpYXRlbHkgaWYga2FkaXJhIGlzIG5vdCByZWFkeVxuICAgIGlmKGVyci5fdHJhY2tlZCB8fCAhS2FkaXJhLmNvbm5lY3RlZCkge1xuICAgICAgcHJpbnRFcnJvckFuZEtpbGwoZXJyKTtcbiAgICB9XG5cbiAgICB2YXIgdHJhY2UgPSBnZXRUcmFjZShlcnIsICdzZXJ2ZXItY3Jhc2gnLCAndW5jYXVnaHRFeGNlcHRpb24nKTtcbiAgICBLYWRpcmEubW9kZWxzLmVycm9yLnRyYWNrRXJyb3IoZXJyLCB0cmFjZSk7XG4gICAgS2FkaXJhLl9zZW5kUGF5bG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGhyb3dFcnJvcihlcnIpO1xuICAgIH0pO1xuXG4gICAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvd0Vycm9yKGVycik7XG4gICAgfSwgMTAwMCoxMCk7XG5cbiAgICBmdW5jdGlvbiB0aHJvd0Vycm9yKGVycikge1xuICAgICAgLy8gc29tZXRpbWVzIGVycm9yIGNhbWUgYmFjayBmcm9tIGEgZmliZXIuXG4gICAgICAvLyBCdXQgd2UgZG9uJ3QgZmliZXJzIHRvIHRyYWNrIHRoYXQgZXJyb3IgZm9yIHVzXG4gICAgICAvLyBUaGF0J3Mgd2h5IHdlIHRocm93IHRoZSBlcnJvciBvbiB0aGUgbmV4dFRpY2tcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIHdlIG5lZWQgdG8gbWFyayB0aGlzIGVycm9yIHdoZXJlIHdlIHJlYWxseSBuZWVkIHRvIHRocm93XG4gICAgICAgIGVyci5fdHJhY2tlZCA9IHRydWU7XG4gICAgICAgIHByaW50RXJyb3JBbmRLaWxsKGVycik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHByaW50RXJyb3JBbmRLaWxsKGVycikge1xuICAgIC8vIHNpbmNlIHdlIGFyZSBjYXB0dXJpbmcgZXJyb3IsIHdlIGFyZSBhbHNvIG9uIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIC8vIHNvIGRldmVsb3BlcnMgdGhpbmsgd2UgYXJlIGFsc28gcmVwb25zaWJsZSBmb3IgdGhlIGVycm9yLlxuICAgIC8vIEJ1dCB3ZSBhcmUgbm90LiBUaGlzIHdpbGwgZml4IHRoYXQuXG4gICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spO1xuICAgIHByb2Nlc3MuZXhpdCg3KTtcbiAgfVxufVxuXG5UcmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBza2lwIGVycm9ycyB3aXRoIGBfc2tpcEthZGlyYWAgZmxhZ1xuICAgIGlmKFxuICAgICAgcmVhc29uLl9za2lwS2FkaXJhIHx8XG4gICAgICAhS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZ1xuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0cmFjZSA9IGdldFRyYWNlKHJlYXNvbiwgJ3NlcnZlci1pbnRlcm5hbCcsICd1bmhhbmRsZWRSZWplY3Rpb24nKTtcbiAgICBLYWRpcmEubW9kZWxzLmVycm9yLnRyYWNrRXJyb3IocmVhc29uLCB0cmFjZSk7XG5cbiAgICAvLyBUT0RPOiB3ZSBzaG91bGQgcmVzcGVjdCB0aGUgLS11bmhhbmRsZWQtcmVqZWN0aW9ucyBvcHRpb25cbiAgICAvLyBtZXNzYWdlIHRha2VuIGZyb20gXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvZjQ3OTdmZjFlZjczMDQ2NTlkNzQ3ZDE4MWVjMWU3YWZhYzQwOGQ1MC9saWIvaW50ZXJuYWwvcHJvY2Vzcy9wcm9taXNlcy5qcyNMMjQzLUwyNDhcbiAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgICdUaGlzIGVycm9yIG9yaWdpbmF0ZWQgZWl0aGVyIGJ5ICcgK1xuICAgICAgJ3Rocm93aW5nIGluc2lkZSBvZiBhbiBhc3luYyBmdW5jdGlvbiB3aXRob3V0IGEgY2F0Y2ggYmxvY2ssICcgK1xuICAgICAgJ29yIGJ5IHJlamVjdGluZyBhIHByb21pc2Ugd2hpY2ggd2FzIG5vdCBoYW5kbGVkIHdpdGggLmNhdGNoKCkuJyArXG4gICAgICAnIFRoZSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIHJlYXNvbjogJztcblxuICAgIC8vIFdlIGNvdWxkIGVtaXQgYSB3YXJuaW5nIGluc3RlYWQgbGlrZSBOb2RlIGRvZXMgaW50ZXJuYWxseVxuICAgIC8vIGJ1dCBpdCByZXF1aXJlcyBOb2RlIDggb3IgbmV3ZXJcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgY29uc29sZS5lcnJvcihyZWFzb24gJiYgcmVhc29uLnN0YWNrID8gcmVhc29uLnN0YWNrIDogcmVhc29uKVxuICB9KTtcbn1cblxuVHJhY2tNZXRlb3JEZWJ1ZyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9yaWdpbmFsTWV0ZW9yRGVidWcgPSBNZXRlb3IuX2RlYnVnO1xuICBNZXRlb3IuX2RlYnVnID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHN0YWNrKSB7XG4gICAgLy8gU29tZXRpbWVzIE1ldGVvciBjYWxscyBNZXRlb3IuX2RlYnVnIHdpdGggbm8gYXJndW1lbnRzXG4gICAgLy8gdG8gbG9nIGFuIGVtcHR5IGxpbmVcbiAgICBjb25zdCBpc0FyZ3MgPSBtZXNzYWdlICE9PSB1bmRlZmluZWQgfHwgc3RhY2sgIT09IHVuZGVmaW5lZDtcblxuICAgIC8vIFdlJ3ZlIGNoYW5nZWQgYHN0YWNrYCBpbnRvIGFuIG9iamVjdCBhdCBtZXRob2QgYW5kIHN1YiBoYW5kbGVycyBzbyB3ZSBjYW5cbiAgICAvLyBkZXRlY3QgdGhlIGVycm9yIGhlcmUuIFRoZXNlIGVycm9ycyBhcmUgYWxyZWFkeSB0cmFja2VkIHNvIGRvbid0IHRyYWNrIHRoZW0gYWdhaW4uXG4gICAgdmFyIGFscmVhZHlUcmFja2VkID0gZmFsc2U7XG5cbiAgICAvLyBTb21lIE1ldGVvciB2ZXJzaW9ucyBwYXNzIHRoZSBlcnJvciwgYW5kIG90aGVyIHZlcnNpb25zIHBhc3MgdGhlIGVycm9yIHN0YWNrXG4gICAgLy8gUmVzdG9yZSBzbyBvcmlnaW9uYWxNZXRlb3JEZWJ1ZyBzaG93cyB0aGUgc3RhY2sgYXMgYSBzdHJpbmcgaW5zdGVhZCBhcyBhbiBvYmplY3RcbiAgICBpZiAoc3RhY2sgJiYgc3RhY2tbTWV0ZW9yRGVidWdJZ25vcmVdKSB7XG4gICAgICBhbHJlYWR5VHJhY2tlZCA9IHRydWU7XG4gICAgICBhcmd1bWVudHNbMV0gPSBzdGFjay5zdGFjaztcbiAgICB9IGVsc2UgaWYgKHN0YWNrICYmIHN0YWNrLnN0YWNrICYmIHN0YWNrLnN0YWNrW01ldGVvckRlYnVnSWdub3JlXSkge1xuICAgICAgYWxyZWFkeVRyYWNrZWQgPSB0cnVlO1xuICAgICAgYXJndW1lbnRzWzFdID0gc3RhY2suc3RhY2suc3RhY2s7XG4gICAgfVxuXG4gICAgLy8gb25seSBzZW5kIHRvIHRoZSBzZXJ2ZXIgaWYgY29ubmVjdGVkIHRvIGthZGlyYVxuICAgIGlmIChcbiAgICAgIEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcgJiZcbiAgICAgIGlzQXJncyAmJlxuICAgICAgIWFscmVhZHlUcmFja2VkICYmXG4gICAgICBLYWRpcmEuY29ubmVjdGVkXG4gICAgKSB7XG4gICAgICBsZXQgZXJyb3JNZXNzYWdlID0gbWVzc2FnZTtcblxuICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnICYmIHN0YWNrIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gbWVzc2FnZS5lbmRzV2l0aCgnOicpID8gJycgOiAnOidcbiAgICAgICAgZXJyb3JNZXNzYWdlID0gYCR7bWVzc2FnZX0ke3NlcGFyYXRvcn0gJHtzdGFjay5tZXNzYWdlfWBcbiAgICAgIH1cblxuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICBpZiAoc3RhY2sgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBlcnJvci5zdGFjayA9IHN0YWNrLnN0YWNrO1xuICAgICAgfSBlbHNlIGlmIChzdGFjaykge1xuICAgICAgICBlcnJvci5zdGFjayA9IHN0YWNrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3Iuc3RhY2sgPSBDcmVhdGVVc2VyU3RhY2soZXJyb3IpO1xuICAgICAgfVxuICAgICAgdmFyIHRyYWNlID0gZ2V0VHJhY2UoZXJyb3IsICdzZXJ2ZXItaW50ZXJuYWwnLCAnTWV0ZW9yLl9kZWJ1ZycpO1xuICAgICAgS2FkaXJhLm1vZGVscy5lcnJvci50cmFja0Vycm9yKGVycm9yLCB0cmFjZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsTWV0ZW9yRGVidWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRUcmFjZShlcnIsIHR5cGUsIHN1YlR5cGUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHN1YlR5cGU6IHN1YlR5cGUsXG4gICAgbmFtZTogZXJyLm1lc3NhZ2UsXG4gICAgZXJyb3JlZDogdHJ1ZSxcbiAgICBhdDogS2FkaXJhLnN5bmNlZERhdGUuZ2V0VGltZSgpLFxuICAgIGV2ZW50czogW1xuICAgICAgWydzdGFydCcsIDAsIHt9XSxcbiAgICAgIFsnZXJyb3InLCAwLCB7ZXJyb3I6IHttZXNzYWdlOiBlcnIubWVzc2FnZSwgc3RhY2s6IGVyci5zdGFja319XVxuICAgIF0sXG4gICAgbWV0cmljczoge1xuICAgICAgdG90YWw6IDBcbiAgICB9XG4gIH07XG59XG4iLCJzZXRMYWJlbHMgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIG5hbWUgU2Vzc2lvbi5wcm90b3R5cGUuc2VuZFxuICB2YXIgb3JpZ2luYWxTZW5kID0gTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kO1xuICBNZXRlb3JYLlNlc3Npb24ucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiBrYWRpcmFfU2Vzc2lvbl9zZW5kIChtc2cpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxTZW5kLmNhbGwodGhpcywgbXNnKTtcbiAgfVxuXG4gIC8vIG5hbWUgTXVsdGlwbGV4ZXIgaW5pdGlhbCBhZGRzXG4gIC8vIE11bHRpcGxleGVyIGlzIHVuZGVmaW5lZCBpbiByb2NrZXQgY2hhdFxuICBpZiAoTWV0ZW9yWC5NdWx0aXBsZXhlcikge1xuICAgIHZhciBvcmlnaW5hbFNlbmRBZGRzID0gTWV0ZW9yWC5NdWx0aXBsZXhlci5wcm90b3R5cGUuX3NlbmRBZGRzO1xuICAgIE1ldGVvclguTXVsdGlwbGV4ZXIucHJvdG90eXBlLl9zZW5kQWRkcyA9IGZ1bmN0aW9uIGthZGlyYV9NdWx0aXBsZXhlcl9zZW5kQWRkcyAoaGFuZGxlKSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxTZW5kQWRkcy5jYWxsKHRoaXMsIGhhbmRsZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gbmFtZSBNb25nb0Nvbm5lY3Rpb24gaW5zZXJ0XG4gIHZhciBvcmlnaW5hbE1vbmdvSW5zZXJ0ID0gTWV0ZW9yWC5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9pbnNlcnQ7XG4gIE1ldGVvclguTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5faW5zZXJ0ID0gZnVuY3Rpb24ga2FkaXJhX01vbmdvQ29ubmVjdGlvbl9pbnNlcnQgKGNvbGwsIGRvYywgY2IpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxNb25nb0luc2VydC5jYWxsKHRoaXMsIGNvbGwsIGRvYywgY2IpO1xuICB9XG5cbiAgLy8gbmFtZSBNb25nb0Nvbm5lY3Rpb24gdXBkYXRlXG4gIHZhciBvcmlnaW5hbE1vbmdvVXBkYXRlID0gTWV0ZW9yWC5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGU7XG4gIE1ldGVvclguTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24ga2FkaXJhX01vbmdvQ29ubmVjdGlvbl91cGRhdGUgKGNvbGwsIHNlbGVjdG9yLCBtb2QsIG9wdGlvbnMsIGNiKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsTW9uZ29VcGRhdGUuY2FsbCh0aGlzLCBjb2xsLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zLCBjYik7XG4gIH1cblxuICAvLyBuYW1lIE1vbmdvQ29ubmVjdGlvbiByZW1vdmVcbiAgdmFyIG9yaWdpbmFsTW9uZ29SZW1vdmUgPSBNZXRlb3JYLk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX3JlbW92ZTtcbiAgTWV0ZW9yWC5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9yZW1vdmUgPSBmdW5jdGlvbiBrYWRpcmFfTW9uZ29Db25uZWN0aW9uX3JlbW92ZSAoY29sbCwgc2VsZWN0b3IsIGNiKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsTW9uZ29SZW1vdmUuY2FsbCh0aGlzLCBjb2xsLCBzZWxlY3RvciwgY2IpO1xuICB9XG5cbiAgLy8gbmFtZSBQdWJzdWIgYWRkZWRcbiAgdmFyIG9yaWdpbmFsUHVic3ViQWRkZWQgPSBNZXRlb3JYLlNlc3Npb24ucHJvdG90eXBlLnNlbmRBZGRlZDtcbiAgTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kQWRkZWQgPSBmdW5jdGlvbiBrYWRpcmFfU2Vzc2lvbl9zZW5kQWRkZWQgKGNvbGwsIGlkLCBmaWVsZHMpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxQdWJzdWJBZGRlZC5jYWxsKHRoaXMsIGNvbGwsIGlkLCBmaWVsZHMpO1xuICB9XG5cbiAgLy8gbmFtZSBQdWJzdWIgY2hhbmdlZFxuICB2YXIgb3JpZ2luYWxQdWJzdWJDaGFuZ2VkID0gTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kQ2hhbmdlZDtcbiAgTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kQ2hhbmdlZCA9IGZ1bmN0aW9uIGthZGlyYV9TZXNzaW9uX3NlbmRDaGFuZ2VkIChjb2xsLCBpZCwgZmllbGRzKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsUHVic3ViQ2hhbmdlZC5jYWxsKHRoaXMsIGNvbGwsIGlkLCBmaWVsZHMpO1xuICB9XG5cbiAgLy8gbmFtZSBQdWJzdWIgcmVtb3ZlZFxuICB2YXIgb3JpZ2luYWxQdWJzdWJSZW1vdmVkID0gTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kUmVtb3ZlZDtcbiAgTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kUmVtb3ZlZCA9IGZ1bmN0aW9uIGthZGlyYV9TZXNzaW9uX3NlbmRSZW1vdmVkIChjb2xsLCBpZCkge1xuICAgIHJldHVybiBvcmlnaW5hbFB1YnN1YlJlbW92ZWQuY2FsbCh0aGlzLCBjb2xsLCBpZCk7XG4gIH1cblxuICAvLyBuYW1lIE1vbmdvQ3Vyc29yIGZvckVhY2hcbiAgdmFyIG9yaWdpbmFsQ3Vyc29yRm9yRWFjaCA9IE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLmZvckVhY2g7XG4gIE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBrYWRpcmFfQ3Vyc29yX2ZvckVhY2ggKCkge1xuICAgIHJldHVybiBvcmlnaW5hbEN1cnNvckZvckVhY2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8vIG5hbWUgTW9uZ29DdXJzb3IgbWFwXG4gIHZhciBvcmlnaW5hbEN1cnNvck1hcCA9IE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLm1hcDtcbiAgTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24ga2FkaXJhX0N1cnNvcl9tYXAgKCkge1xuICAgIHJldHVybiBvcmlnaW5hbEN1cnNvck1hcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgLy8gbmFtZSBNb25nb0N1cnNvciBmZXRjaFxuICB2YXIgb3JpZ2luYWxDdXJzb3JGZXRjaCA9IE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLmZldGNoO1xuICBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5mZXRjaCA9IGZ1bmN0aW9uIGthZGlyYV9DdXJzb3JfZmV0Y2ggKCkge1xuICAgIHJldHVybiBvcmlnaW5hbEN1cnNvckZldGNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvLyBuYW1lIE1vbmdvQ3Vyc29yIGNvdW50XG4gIHZhciBvcmlnaW5hbEN1cnNvckNvdW50ID0gTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUuY291bnQ7XG4gIE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24ga2FkaXJhX0N1cnNvcl9jb3VudCAoKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ3Vyc29yQ291bnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8vIG5hbWUgTW9uZ29DdXJzb3Igb2JzZXJ2ZUNoYW5nZXNcbiAgdmFyIG9yaWdpbmFsQ3Vyc29yT2JzZXJ2ZUNoYW5nZXMgPSBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5vYnNlcnZlQ2hhbmdlcztcbiAgTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiBrYWRpcmFfQ3Vyc29yX29ic2VydmVDaGFuZ2VzICgpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDdXJzb3JPYnNlcnZlQ2hhbmdlcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgLy8gbmFtZSBNb25nb0N1cnNvciBvYnNlcnZlXG4gIHZhciBvcmlnaW5hbEN1cnNvck9ic2VydmUgPSBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5vYnNlcnZlO1xuICBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24ga2FkaXJhX0N1cnNvcl9vYnNlcnZlICgpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDdXJzb3JPYnNlcnZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvLyBuYW1lIENyb3NzQmFyIGxpc3RlblxuICB2YXIgb3JpZ2luYWxDcm9zc2Jhckxpc3RlbiA9IEREUFNlcnZlci5fQ3Jvc3NiYXIucHJvdG90eXBlLmxpc3RlbjtcbiAgRERQU2VydmVyLl9Dcm9zc2Jhci5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24ga2FkaXJhX0Nyb3NzYmFyX2xpc3RlbiAodHJpZ2dlciwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDcm9zc2Jhckxpc3Rlbi5jYWxsKHRoaXMsIHRyaWdnZXIsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIG5hbWUgQ3Jvc3NCYXIgZmlyZVxuICB2YXIgb3JpZ2luYWxDcm9zc2JhckZpcmUgPSBERFBTZXJ2ZXIuX0Nyb3NzYmFyLnByb3RvdHlwZS5maXJlO1xuICBERFBTZXJ2ZXIuX0Nyb3NzYmFyLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ga2FkaXJhX0Nyb3NzYmFyX2ZpcmUgKG5vdGlmaWNhdGlvbikge1xuICAgIHJldHVybiBvcmlnaW5hbENyb3NzYmFyRmlyZS5jYWxsKHRoaXMsIG5vdGlmaWNhdGlvbik7XG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiB3cmFwRmFzdFJlbmRlciAoKSB7XG4gIE1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICBpZiAoUGFja2FnZVsnc3RhcmluZ2F0bGlnaHRzOmZhc3QtcmVuZGVyJ10pIHtcbiAgICAgIGNvbnN0IEZhc3RSZW5kZXIgPSBQYWNrYWdlWydzdGFyaW5nYXRsaWdodHM6ZmFzdC1yZW5kZXInXS5GYXN0UmVuZGVyO1xuXG4gICAgICAvLyBGbG93IFJvdXRlciBkb2Vzbid0IGNhbGwgRmFzdFJlbmRlci5yb3V0ZSB1bnRpbCBhZnRlciBhbGxcbiAgICAgIC8vIE1ldGVvci5zdGFydHVwIGNhbGxiYWNrcyBmaW5pc2hcbiAgICAgIGxldCBvcmlnUm91dGUgPSBGYXN0UmVuZGVyLnJvdXRlXG4gICAgICBGYXN0UmVuZGVyLnJvdXRlID0gZnVuY3Rpb24gKHBhdGgsIF9jYWxsYmFjaykge1xuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc3QgaW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpXG4gICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgIGluZm8uc3VnZ2VzdGVkUm91dGVOYW1lID0gcGF0aFxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBfY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9yaWdSb3V0ZS5jYWxsKEZhc3RSZW5kZXIsIHBhdGgsIGNhbGxiYWNrKVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuY29uc3QgRmliZXJzID0gcmVxdWlyZSgnZmliZXJzJyk7XG5cbmZ1bmN0aW9uIHdyYXBDYWxsYmFjayhhcmdzLCBjcmVhdGVXcmFwcGVyKSB7XG4gIGlmICh0eXBlb2YgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYXJnc1thcmdzLmxlbmd0aCAtIDFdID0gY3JlYXRlV3JhcHBlcihhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUVycm9yRXZlbnQoZXZlbnRFbWl0dGVyLCB0cmFjZSwgZXZlbnQpIHtcbiAgZnVuY3Rpb24gaGFuZGxlciAoZXJyb3IpIHtcbiAgICBpZiAodHJhY2UgJiYgZXZlbnQpIHtcbiAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQodHJhY2UsIGV2ZW50LCB7XG4gICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTm9kZSB0aHJvd3MgdGhlIGVycm9yIGlmIHRoZXJlIGFyZSBubyBsaXN0ZW5lcnNcbiAgICAvLyBXZSB3YW50IGl0IHRvIGJlaGF2ZSBhcyBpZiB3ZSBhcmUgbm90IGxpc3RlbmluZyB0byBpdFxuICAgIGlmIChldmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCgnZXJyb3InKSA9PT0gMSkge1xuICAgICAgZXZlbnRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGhhbmRsZXIpO1xuICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGV2ZW50RW1pdHRlci5vbignZXJyb3InLCBoYW5kbGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBGcygpIHtcbiAgLy8gU29tZSBucG0gcGFja2FnZXMgd2lsbCBkbyBmcyBjYWxscyBpbiB0aGVcbiAgLy8gY2FsbGJhY2sgb2YgYW5vdGhlciBmcyBjYWxsLlxuICAvLyBUaGlzIHZhcmlhYmxlIGlzIHNldCB3aXRoIHRoZSBrYWRpcmFJbmZvIHdoaWxlXG4gIC8vIGEgY2FsbGJhY2sgaXMgcnVuIHNvIHdlIGNhbiB0cmFjayBvdGhlciBmcyBjYWxsc1xuICBsZXQgZnNLYWRpcmFJbmZvID0gbnVsbDtcbiAgXG4gIGxldCBvcmlnaW5hbFN0YXQgPSBmcy5zdGF0O1xuICBmcy5zdGF0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKSB8fCBmc0thZGlyYUluZm87XG5cbiAgICBpZiAoa2FkaXJhSW5mbykge1xuICAgICAgbGV0IGV2ZW50ID0gS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnZnMnLCB7XG4gICAgICAgIGZ1bmM6ICdzdGF0JyxcbiAgICAgICAgcGF0aDogYXJndW1lbnRzWzBdLFxuICAgICAgICBvcHRpb25zOiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnb2JqZWN0JyA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZFxuICAgICAgfSk7XG5cbiAgICAgIHdyYXBDYWxsYmFjayhhcmd1bWVudHMsIChjYikgPT4ge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgZXZlbnQpO1xuXG4gICAgICAgICAgaWYgKCFGaWJlcnMuY3VycmVudCkge1xuICAgICAgICAgICAgZnNLYWRpcmFJbmZvID0ga2FkaXJhSW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2IuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBmc0thZGlyYUluZm8gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsU3RhdC5hcHBseShmcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICBsZXQgb3JpZ2luYWxDcmVhdGVSZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbTtcbiAgZnMuY3JlYXRlUmVhZFN0cmVhbSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCkgfHwgZnNLYWRpcmFJbmZvO1xuICAgIGxldCBzdHJlYW0gPSBvcmlnaW5hbENyZWF0ZVJlYWRTdHJlYW0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmIChrYWRpcmFJbmZvKSB7XG4gICAgICBjb25zdCBldmVudCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2ZzJywge1xuICAgICAgICBmdW5jOiAnY3JlYXRlUmVhZFN0cmVhbScsXG4gICAgICAgIHBhdGg6IGFyZ3VtZW50c1swXSxcbiAgICAgICAgb3B0aW9uczogSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzWzFdKVxuICAgICAgfSk7XG5cbiAgICAgIHN0cmVhbS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBoYW5kbGVFcnJvckV2ZW50KHN0cmVhbSwga2FkaXJhSW5mby50cmFjZSwgZXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJlYW07XG4gIH07XG59XG4iLCJsZXQgUGVyZm9ybWFuY2VPYnNlcnZlcjtcbmxldCBjb25zdGFudHM7XG5sZXQgcGVyZm9ybWFuY2U7XG5cbnRyeSB7XG4gIC8vIE9ubHkgYXZhaWxhYmxlIGluIE5vZGUgOC41IGFuZCBuZXdlclxuICAoe1xuICAgIFBlcmZvcm1hbmNlT2JzZXJ2ZXIsXG4gICAgY29uc3RhbnRzLFxuICAgIHBlcmZvcm1hbmNlXG4gIH0gPSByZXF1aXJlKCdwZXJmX2hvb2tzJykpO1xufSBjYXRjaCAoZSkge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR0NNZXRyaWNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuXG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgaWYgKHRoaXMuc3RhcnRlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghUGVyZm9ybWFuY2VPYnNlcnZlciB8fCAhY29uc3RhbnRzKSB7XG4gICAgICAvLyBUaGUgbm9kZSB2ZXJzaW9uIGlzIHRvbyBvbGQgdG8gaGF2ZSBQZXJmb3JtYW5jZU9ic2VydmVyXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcblxuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcihsaXN0ID0+IHtcbiAgICAgIGxpc3QuZ2V0RW50cmllcygpLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBsZXQgbWV0cmljID0gdGhpcy5fbWFwS2luZFRvTWV0cmljKGVudHJ5LmtpbmQpO1xuICAgICAgICB0aGlzLm1ldHJpY3NbbWV0cmljXSArPSBlbnRyeS5kdXJhdGlvbjtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBUaGUgZnVuY3Rpb24gd2FzIHJlbW92ZWQgaW4gTm9kZSAxMCBzaW5jZSBpdCBzdG9wcGVkIHN0b3Jpbmcgb2xkXG4gICAgICAvLyBlbnRyaWVzXG4gICAgICBpZiAodHlwZW9mIHBlcmZvcm1hbmNlLmNsZWFyR0MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcGVyZm9ybWFuY2UuY2xlYXJHQygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHsgZW50cnlUeXBlczogWydnYyddLCBidWZmZXJlZDogZmFsc2UgfSk7XG4gIH1cblxuICBfbWFwS2luZFRvTWV0cmljKGdjS2luZCkge1xuICAgIHN3aXRjaChnY0tpbmQpIHtcbiAgICAgIGNhc2UgY29uc3RhbnRzLk5PREVfUEVSRk9STUFOQ0VfR0NfTUFKT1I6XG4gICAgICAgIHJldHVybiAnZ2NNYWpvcic7XG4gICAgICBjYXNlIGNvbnN0YW50cy5OT0RFX1BFUkZPUk1BTkNFX0dDX01JTk9SOlxuICAgICAgICByZXR1cm4gJ2djTWlub3InO1xuICAgICAgY2FzZSBjb25zdGFudHMuTk9ERV9QRVJGT1JNQU5DRV9HQ19JTkNSRU1FTlRBTDpcbiAgICAgICAgcmV0dXJuICdnY0luY3JlbWVudGFsJztcbiAgICAgIGNhc2UgY29uc3RhbnRzLk5PREVfUEVSRk9STUFOQ0VfR0NfV0VBS0NCOlxuICAgICAgICByZXR1cm4gJ2djV2Vha0NCJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUubG9nKGBNb250aSBBUE06IFVucmVjb2duaXplZCBHQyBLaW5kOiAke2djS2luZH1gKTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLm1ldHJpY3MgPSB7XG4gICAgICBnY01ham9yOiAwLFxuICAgICAgZ2NNaW5vcjogMCxcbiAgICAgIGdjSW5jcmVtZW50YWw6IDAsXG4gICAgICBnY1dlYWtDQjogMFxuICAgIH07XG4gIH1cbn1cbiIsInZhciBjbGllbnQ7XG52YXIgc2VydmVyU3RhdHVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxudmFyIG90aGVyQ2hlY2tvdXRzID0gMDtcblxuLy8gVGhlc2UgbWV0cmljcyBhcmUgb25seSBmb3IgdGhlIG1vbmdvIHBvb2wgZm9yIHRoZSBwcmltYXJ5IE1vbmdvIHNlcnZlclxudmFyIHByaW1hcnlDaGVja291dHMgPSAwO1xudmFyIHRvdGFsQ2hlY2tvdXRUaW1lID0gMDtcbnZhciBtYXhDaGVja291dFRpbWUgPSAwO1xudmFyIGNyZWF0ZWQgPSAwO1xudmFyIG1lYXN1cmVtZW50Q291bnQgPSAwO1xudmFyIHBlbmRpbmdUb3RhbCA9IDA7XG52YXIgY2hlY2tlZE91dFRvdGFsID0gMDtcblxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICBsZXQgc3RhdHVzID0gZ2V0U2VydmVyU3RhdHVzKGdldFByaW1hcnkoKSwgdHJ1ZSk7XG5cbiAgaWYgKHN0YXR1cykge1xuICAgIHBlbmRpbmdUb3RhbCArPSBzdGF0dXMucGVuZGluZy5sZW5ndGg7XG4gICAgY2hlY2tlZE91dFRvdGFsICs9IHN0YXR1cy5jaGVja2VkT3V0LnNpemU7XG4gICAgbWVhc3VyZW1lbnRDb3VudCArPSAxO1xuICB9XG59LCAxMDAwKTtcblxuLy8gVmVyc2lvbiA0IG9mIHRoZSBkcml2ZXIgZGVmYXVsdHMgdG8gMTAwLiBPbGRlciB2ZXJzaW9ucyB1c2VkIDEwLlxudmFyIERFRkFVTFRfTUFYX1BPT0xfU0laRSA9IDEwMDtcblxuZnVuY3Rpb24gZ2V0UG9vbFNpemUgKCkge1xuICBpZiAoY2xpZW50ICYmIGNsaWVudC50b3BvbG9neSAmJiBjbGllbnQudG9wb2xvZ3kucyAmJiBjbGllbnQudG9wb2xvZ3kucy5vcHRpb25zKSB7XG4gICAgcmV0dXJuIGNsaWVudC50b3BvbG9neS5zLm9wdGlvbnMubWF4UG9vbFNpemUgfHwgREVGQVVMVF9NQVhfUE9PTF9TSVpFO1xuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb25nb0RyaXZlclN0YXRzICgpIHtcbiAgcmV0dXJuIHtcbiAgICBwb29sU2l6ZTogZ2V0UG9vbFNpemUoKSxcbiAgICBwcmltYXJ5Q2hlY2tvdXRzLFxuICAgIG90aGVyQ2hlY2tvdXRzLFxuICAgIGNoZWNrb3V0VGltZTogdG90YWxDaGVja291dFRpbWUsXG4gICAgbWF4Q2hlY2tvdXRUaW1lLFxuICAgIHBlbmRpbmc6IHBlbmRpbmdUb3RhbCA/IHBlbmRpbmdUb3RhbCAvIG1lYXN1cmVtZW50Q291bnQgOiAwLFxuICAgIGNoZWNrZWRPdXQ6IGNoZWNrZWRPdXRUb3RhbCA/IGNoZWNrZWRPdXRUb3RhbCAvIG1lYXN1cmVtZW50Q291bnQgOiAwLFxuICAgIGNyZWF0ZWRcbiAgfTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldE1vbmdvRHJpdmVyU3RhdHMoKSB7XG4gIHByaW1hcnlDaGVja291dHMgPSAwO1xuICBvdGhlckNoZWNrb3V0cyA9IDA7XG4gIHRvdGFsQ2hlY2tvdXRUaW1lID0gMDtcbiAgbWF4Q2hlY2tvdXRUaW1lID0gMDtcbiAgcGVuZGluZ1RvdGFsID0gMDtcbiAgY2hlY2tlZE91dFRvdGFsID0gMDtcbiAgbWVhc3VyZW1lbnRDb3VudCA9IDA7XG4gIHByaW1hcnlDaGVja291dHMgPSAwO1xuICBjcmVhdGVkID0gMDtcbn1cblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICBsZXQgX2NsaWVudCA9IE1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKCkubW9uZ28uY2xpZW50O1xuXG4gIGlmICghX2NsaWVudCB8fCAhX2NsaWVudC5zKSB7XG4gICAgLy8gT2xkIHZlcnNpb24gb2YgYWdlbnRcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgb3B0aW9ucyA9IF9jbGllbnQucy5vcHRpb25zIHx8IHt9O1xuICBsZXQgdmVyc2lvblBhcnRzID0gTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlcy5tb25nb2RiLnZlcnNpb24uc3BsaXQoJy4nKVxuICAgIC5tYXAocGFydCA9PiBwYXJzZUludChwYXJ0LCAxMCkpO1xuXG4gICAgLy8gVmVyc2lvbiA0IG9mIHRoZSBkcml2ZXIgcmVtb3ZlZCB0aGUgb3B0aW9uIGFuZCBlbmFibGVkIGl0IGJ5IGRlZmF1bHRcbiAgaWYgKCFvcHRpb25zLnVzZVVuaWZpZWRUb3BvbG9neSAmJiB2ZXJzaW9uUGFydHNbMF0gPCA0KSB7XG4gICAgLy8gQ01BUCBhbmQgdG9wb2xvZ3kgbW9uaXRvcmluZyByZXF1aXJlcyB1c2VVbmlmaWVkVG9wb2xvZ3lcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBNZXRlb3IgMS45IGVuYWJsZWQgdXNlVW5pZmllZFRvcG9sb2d5LCBidXQgQ01BUCBldmVudHMgd2VyZSBvbmx5IGFkZGVkXG4gIC8vIGluIHZlcnNpb24gMy41IG9mIHRoZSBkcml2ZXIuXG4gIGlmICh2ZXJzaW9uUGFydHNbMF0gPT09IDMgJiYgdmVyc2lvblBhcnRzWzFdIDwgNSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNsaWVudCA9IF9jbGllbnQ7XG5cbiAgLy8gR2V0IHRoZSBudW1iZXIgb2YgY29ubmVjdGlvbnMgYWxyZWFkeSBjcmVhdGVkXG4gIGxldCBwcmltYXJ5RGVzY3JpcHRpb24gPSBnZXRTZXJ2ZXJEZXNjcmlwdGlvbihnZXRQcmltYXJ5KCkpO1xuICBpZiAocHJpbWFyeURlc2NyaXB0aW9uICYmIHByaW1hcnlEZXNjcmlwdGlvbi5zICYmIHByaW1hcnlEZXNjcmlwdGlvbi5zLnBvb2wpIHtcbiAgICBsZXQgcG9vbCA9IHByaW1hcnlEZXNjcmlwdGlvbi5zLnBvb2w7XG4gICAgbGV0IHRvdGFsQ29ubmVjdGlvbnMgPSBwb29sLnRvdGFsQ29ubmVjdGlvbkNvdW50O1xuICAgIGxldCBhdmFpbGFibGVDb25uZWN0aW9ucyA9IHBvb2wuYXZhaWxhYmxlQ29ubmVjdGlvbkNvdW50O1xuXG4gICAgLy8gdG90YWxDb25uZWN0aW9uQ291bnQgY291bnRzIGF2YWlsYWJsZSBjb25uZWN0aW9ucyB0d2ljZVxuICAgIGNyZWF0ZWQgKz0gdG90YWxDb25uZWN0aW9ucyAtIGF2YWlsYWJsZUNvbm5lY3Rpb25zO1xuICB9XG5cbiAgY2xpZW50Lm9uKCdjb25uZWN0aW9uQ3JlYXRlZCcsIGV2ZW50ID0+IHtcbiAgICBsZXQgcHJpbWFyeSA9IGdldFByaW1hcnkoKTtcbiAgICBpZiAocHJpbWFyeSA9PT0gZXZlbnQuYWRkcmVzcykge1xuICAgICAgY3JlYXRlZCArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgY2xpZW50Lm9uKCdjb25uZWN0aW9uQ2xvc2VkJywgZXZlbnQgPT4ge1xuICAgIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZXZlbnQuYWRkcmVzcywgdHJ1ZSk7XG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgc3RhdHVzLmNoZWNrZWRPdXQuZGVsZXRlKGV2ZW50LmNvbm5lY3Rpb25JZCk7XG4gICAgfVxuICB9KTtcblxuICBjbGllbnQub24oJ2Nvbm5lY3Rpb25DaGVja091dFN0YXJ0ZWQnLCBldmVudCA9PiB7XG4gICAgbGV0IHN0YXR1cyA9IGdldFNlcnZlclN0YXR1cyhldmVudC5hZGRyZXNzKTtcbiAgICBzdGF0dXMucGVuZGluZy5wdXNoKGV2ZW50LnRpbWUpO1xuICB9KTtcblxuICBjbGllbnQub24oJ2Nvbm5lY3Rpb25DaGVja091dEZhaWxlZCcsIGV2ZW50ID0+IHtcbiAgICBsZXQgc3RhdHVzID0gZ2V0U2VydmVyU3RhdHVzKGV2ZW50LmFkZHJlc3MsIHRydWUpO1xuICAgIGlmIChzdGF0dXMpIHtcbiAgICAgIHN0YXR1cy5wZW5kaW5nLnNoaWZ0KCk7XG4gICAgfVxuICB9KTtcblxuICBjbGllbnQub24oJ2Nvbm5lY3Rpb25DaGVja2VkT3V0JywgZXZlbnQgPT4ge1xuICAgIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZXZlbnQuYWRkcmVzcyk7XG4gICAgbGV0IHN0YXJ0ID0gc3RhdHVzLnBlbmRpbmcuc2hpZnQoKTtcbiAgICBsZXQgcHJpbWFyeSA9IGdldFByaW1hcnkoKTtcblxuICAgIGlmIChzdGFydCAmJiBwcmltYXJ5ID09PSBldmVudC5hZGRyZXNzKSB7XG4gICAgICBsZXQgY2hlY2tvdXREdXJhdGlvbiA9IGV2ZW50LnRpbWUuZ2V0VGltZSgpIC0gc3RhcnQuZ2V0VGltZSgpO1xuXG4gICAgICBwcmltYXJ5Q2hlY2tvdXRzICs9IDE7XG4gICAgICB0b3RhbENoZWNrb3V0VGltZSArPSBjaGVja291dER1cmF0aW9uO1xuICAgICAgaWYgKGNoZWNrb3V0RHVyYXRpb24gPiBtYXhDaGVja291dFRpbWUpIHtcbiAgICAgICAgbWF4Q2hlY2tvdXRUaW1lID0gY2hlY2tvdXREdXJhdGlvbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3RoZXJDaGVja291dHMgKz0gMTtcbiAgICB9XG5cbiAgICBzdGF0dXMuY2hlY2tlZE91dC5hZGQoZXZlbnQuY29ubmVjdGlvbklkKTtcbiAgfSk7XG5cbiAgY2xpZW50Lm9uKCdjb25uZWN0aW9uQ2hlY2tlZEluJywgZXZlbnQgPT4ge1xuICAgIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZXZlbnQuYWRkcmVzcywgdHJ1ZSk7XG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgc3RhdHVzLmNoZWNrZWRPdXQuZGVsZXRlKGV2ZW50LmNvbm5lY3Rpb25JZCk7XG4gICAgfVxuICB9KTtcblxuICBjbGllbnQub24oJ3NlcnZlckNsb3NlZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGRlbGV0ZSBzZXJ2ZXJTdGF0dXNbZXZlbnQuYWRkcmVzc107XG4gIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGdldFNlcnZlclN0YXR1cyhhZGRyZXNzLCBkaXNhYmxlQ3JlYXRlKSB7XG4gIGlmICh0eXBlb2YgYWRkcmVzcyAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChhZGRyZXNzIGluIHNlcnZlclN0YXR1cykge1xuICAgIHJldHVybiBzZXJ2ZXJTdGF0dXNbYWRkcmVzc107XG4gIH1cblxuICBpZiAoZGlzYWJsZUNyZWF0ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgc2VydmVyU3RhdHVzW2FkZHJlc3NdID0ge1xuICAgIHBlbmRpbmc6IFtdLFxuICAgIGNoZWNrZWRPdXQ6IG5ldyBTZXQoKSxcbiAgfVxuXG4gIHJldHVybiBzZXJ2ZXJTdGF0dXNbYWRkcmVzc107XG59XG5cbmZ1bmN0aW9uIGdldFByaW1hcnkoKSB7XG4gIGlmICghY2xpZW50IHx8ICFjbGllbnQudG9wb2xvZ3kpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBUaGUgZHJpdmVyIHJlbmFtZWQgbGFzdElzTWFzdGVyIGluIHZlcnNpb24gNC4zLjEgdG8gbGFzdEhlbGxvXG4gIGxldCBzZXJ2ZXIgPSBjbGllbnQudG9wb2xvZ3kubGFzdElzTWFzdGVyID9cbiAgICBjbGllbnQudG9wb2xvZ3kubGFzdElzTWFzdGVyKCkgOlxuICAgIGNsaWVudC50b3BvbG9neS5sYXN0SGVsbG8oKTtcblxuICBpZiAoc2VydmVyLnR5cGUgPT09ICdTdGFuZGFsb25lJykge1xuICAgIHJldHVybiBzZXJ2ZXIuYWRkcmVzcztcbiAgfVxuXG4gIGlmICghc2VydmVyIHx8ICFzZXJ2ZXIucHJpbWFyeSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHNlcnZlci5wcmltYXJ5O1xufVxuXG5mdW5jdGlvbiBnZXRTZXJ2ZXJEZXNjcmlwdGlvbihhZGRyZXNzKSB7XG4gIGlmICghY2xpZW50IHx8ICFjbGllbnQudG9wb2xvZ3kgfHwgIWNsaWVudC50b3BvbG9neS5zIHx8ICFjbGllbnQudG9wb2xvZ3kucy5zZXJ2ZXJzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbGV0IGRlc2NyaXB0aW9uID0gY2xpZW50LnRvcG9sb2d5LnMuc2VydmVycy5nZXQoYWRkcmVzcyk7XG5cbiAgcmV0dXJuIGRlc2NyaXB0aW9uIHx8IG51bGw7XG59XG4iLCJpbXBvcnQgRmliZXIgZnJvbSBcImZpYmVyc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gd3JhcFBpY2tlciAoKSB7XG4gIE1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICBpZiAoIVBhY2thZ2VbJ21ldGVvcmhhY2tzOnBpY2tlciddKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgUGlja2VyID0gUGFja2FnZVsnbWV0ZW9yaGFja3M6cGlja2VyJ10uUGlja2VyO1xuXG4gICAgLy8gV3JhcCBQaWNrZXIuX3Byb2Nlc3NSb3V0ZSB0byBtYWtlIHN1cmUgaXQgcnVucyB0aGVcbiAgICAvLyBoYW5kbGVyIGluIGEgRmliZXIgd2l0aCBfX2thZGlyYUluZm8gc2V0XG4gICAgLy8gTmVlZGVkIGlmIGFueSBwcmV2aW91cyBtaWRkbGV3YXJlIGNhbGxlZCBgbmV4dGAgb3V0c2lkZSBvZiBhIGZpYmVyLlxuICAgIGNvbnN0IG9yaWdQcm9jZXNzUm91dGUgPSBQaWNrZXIuY29uc3RydWN0b3IucHJvdG90eXBlLl9wcm9jZXNzUm91dGU7XG4gICAgUGlja2VyLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5fcHJvY2Vzc1JvdXRlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBwYXJhbXMsIHJlcSkge1xuICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKCFGaWJlci5jdXJyZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgRmliZXIoKCkgPT4ge1xuICAgICAgICAgIEthZGlyYS5fc2V0SW5mbyhyZXEuX19rYWRpcmFJbmZvKVxuICAgICAgICAgIHJldHVybiBvcmlnUHJvY2Vzc1JvdXRlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9KS5ydW4oKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHJlcS5fX2thZGlyYUluZm8pIHtcbiAgICAgICAgS2FkaXJhLl9zZXRJbmZvKHJlcS5fX2thZGlyYUluZm8pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ1Byb2Nlc3NSb3V0ZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9KTtcbn1cbiIsImltcG9ydCBGaWJlcnMgZnJvbSAnZmliZXJzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBSb3V0ZXJzICgpIHtcbiAgbGV0IGNvbm5lY3RSb3V0ZXMgPSBbXVxuICB0cnkge1xuICAgIGNvbm5lY3RSb3V0ZXMucHVzaChyZXF1aXJlKCdjb25uZWN0LXJvdXRlJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gV2UgY2FuIGlnbm9yZSBlcnJvcnNcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKFBhY2thZ2VbJ3NpbXBsZTpqc29uLXJvdXRlcyddKSB7XG4gICAgICAvLyBSZWxhdGl2ZSBmcm9tIC5ucG0vbm9kZV9tb2R1bGVzL21ldGVvci9tb250aWFwbV9hZ2VudC9ub2RlX21vZHVsZXNcbiAgICAgIC8vIE5wbS5yZXF1aXJlIGlzIGxlc3Mgc3RyaWN0IG9uIHdoYXQgcGF0aHMgeW91IHVzZSB0aGFuIHJlcXVpcmVcbiAgICAgIGNvbm5lY3RSb3V0ZXMucHVzaChOcG0ucmVxdWlyZSgnLi4vLi4vc2ltcGxlX2pzb24tcm91dGVzL25vZGVfbW9kdWxlcy9jb25uZWN0LXJvdXRlJykpO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgICAvLyB3ZSBjYW4gaWdub3JlIGVycm9yc1xuICB9XG5cbiAgY29ubmVjdFJvdXRlcy5mb3JFYWNoKGNvbm5lY3RSb3V0ZSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25uZWN0Um91dGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIFxuICAgIGNvbm5lY3RSb3V0ZSgocm91dGVyKSA9PiB7XG4gICAgICBjb25zdCBvbGRBZGQgPSByb3V0ZXIuY29uc3RydWN0b3IucHJvdG90eXBlLmFkZDtcbiAgICAgIHJvdXRlci5jb25zdHJ1Y3Rvci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG1ldGhvZCwgcm91dGUsIGhhbmRsZXIpIHtcbiAgICAgICAgLy8gVW5saWtlIG1vc3Qgcm91dGVycywgY29ubmVjdC1yb3V0ZSBkb2Vzbid0IGxvb2sgYXQgdGhlIGFyZ3VtZW50cyBsZW5ndGhcbiAgICAgICAgb2xkQWRkLmNhbGwodGhpcywgbWV0aG9kLCByb3V0ZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gJiYgYXJndW1lbnRzWzBdLl9fa2FkaXJhSW5mbykge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdLl9fa2FkaXJhSW5mby5zdWdnZXN0ZWRSb3V0ZU5hbWUgPSByb3V0ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBoYW5kbGVyLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG59XG4iLCJpbXBvcnQgeyBXZWJBcHBJbnRlcm5hbHMsIFdlYkFwcCB9IGZyb20gJ21ldGVvci93ZWJhcHAnO1xuaW1wb3J0IEZpYmVycyBmcm9tICdmaWJlcnMnO1xuXG4vLyBNYXhpbXVtIGNvbnRlbnQtbGVuZ3RoIHNpemVcbk1BWF9CT0RZX1NJWkUgPSA4MDAwXG4vLyBNYXhpbXVtIGNoYXJhY3RlcnMgZm9yIHN0cmluZ2lmaWVkIGJvZHlcbk1BWF9TVFJJTkdJRklFRF9CT0RZX1NJWkUgPSA0MDAwXG5cbmNvbnN0IGNhbldyYXBTdGF0aWNIYW5kbGVyID0gISFXZWJBcHBJbnRlcm5hbHMuc3RhdGljRmlsZXNCeUFyY2hcblxuLy8gVGhpcyBjaGVja3MgaWYgcnVubmluZyBvbiBhIHZlcnNpb24gb2YgTWV0ZW9yIHRoYXRcbi8vIHdyYXBzIGNvbm5lY3QgaGFuZGxlcnMgaW4gYSBmaWJlci5cbi8vIFRoaXMgY2hlY2sgaXMgZGVwZW5kYW50IG9uIE1ldGVvcidzIGltcGxlbWVudGF0aW9uIG9mIGB1c2VgLFxuLy8gd2hpY2ggd3JhcHMgZXZlcnkgaGFuZGxlciBpbiBhIG5ldyBmaWJlci5cbi8vIFRoaXMgd2lsbCBuZWVkIHRvIGJlIHVwZGF0ZWQgaWYgTWV0ZW9yIHN0YXJ0cyByZXVzaW5nXG4vLyBmaWJlcnMgd2hlbiB0aGV5IGV4aXN0LlxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSGFuZGxlcnNJbkZpYmVyICgpIHtcbiAgY29uc3QgaGFuZGxlcnNMZW5ndGggPSBXZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnN0YWNrLmxlbmd0aDtcbiAgbGV0IGluRmliZXIgPSBmYWxzZTtcbiAgbGV0IG91dHNpZGVGaWJlciA9IEZpYmVycy5jdXJyZW50O1xuXG4gIFdlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMudXNlKChfcmVxLCBfcmVzLCBuZXh0KSA9PiB7XG4gICAgaW5GaWJlciA9IEZpYmVycy5jdXJyZW50ICYmIEZpYmVycy5jdXJyZW50ICE9PSBvdXRzaWRlRmliZXI7XG4gICAgXG4gICAgLy8gaW4gY2FzZSB3ZSBkaWRuJ3Qgc3VjY2Vzc2Z1bGx5IHJlbW92ZSB0aGlzIGhhbmRsZXJcbiAgICAvLyBhbmQgaXQgaXMgYSByZWFsIHJlcXVlc3RcbiAgICBuZXh0KCk7XG4gIH0pO1xuXG4gIGlmIChXZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnN0YWNrW2hhbmRsZXJzTGVuZ3RoXSkge1xuICAgIGxldCBoYW5kbGVyID0gV2ViQXBwLnJhd0Nvbm5lY3RIYW5kbGVycy5zdGFja1toYW5kbGVyc0xlbmd0aF0uaGFuZGxlO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBuZXdseSBhZGRlZCBoYW5kbGVyXG4gICAgLy8gV2UgcmVtb3ZlIGl0IGltbWVkaWF0ZWx5IHNvIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IGZvclxuICAgIC8vIG90aGVyIGNvZGUgdG8gYWRkIGhhbmRsZXJzIGZpcnN0IGlmIHRoZSBjdXJyZW50IGZpYmVyIGlzIHlpZWxkZWRcbiAgICAvLyB3aGlsZSBydW5uaW5nIHRoZSBoYW5kbGVyXG4gICAgd2hpbGUgKFdlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMuc3RhY2subGVuZ3RoID4gaGFuZGxlcnNMZW5ndGgpIHtcbiAgICAgIFdlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMuc3RhY2sucG9wKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlcih7fSwge30sICgpID0+IHt9KVxuICB9XG5cbiAgcmV0dXJuIGluRmliZXI7XG59XG5cbmNvbnN0IEluZm9TeW1ib2wgPSBTeW1ib2woKVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFdlYkFwcCgpIHtcbiAgaWYgKCFjaGVja0hhbmRsZXJzSW5GaWJlcigpIHx8ICFjYW5XcmFwU3RhdGljSGFuZGxlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBhcnNlVXJsID0gcmVxdWlyZSgncGFyc2V1cmwnKTtcblxuICBXZWJBcHBJbnRlcm5hbHMucmVnaXN0ZXJCb2lsZXJwbGF0ZURhdGFDYWxsYmFjaygnX19tb250aUFwbVJvdXRlTmFtZScsIGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgLy8gVE9ETzogcmVjb3JkIGluIHRyYWNlIHdoaWNoIGFyY2ggaXMgdXNlZFxuXG4gICAgaWYgKHJlcXVlc3RbSW5mb1N5bWJvbF0pIHtcbiAgICAgIHJlcXVlc3RbSW5mb1N5bWJvbF0uaXNBcHBSb3V0ZSA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBMZXQgV2ViQXBwIGtub3cgd2UgZGlkbid0IG1ha2UgY2hhbmdlc1xuICAgIC8vIHNvIGl0IGNhbiB1c2UgYSBjYWNoZVxuICAgIHJldHVybiBmYWxzZVxuICB9KVxuXG4gIC8vIFdlIHdhbnQgdGhlIHJlcXVlc3Qgb2JqZWN0IHJldHVybmVkIGJ5IGNhdGVnb3JpemVSZXF1ZXN0IHRvIGhhdmVcbiAgLy8gX19rYWRpcmFJbmZvXG4gIGxldCBvcmlnQ2F0ZWdvcml6ZVJlcXVlc3QgPSBXZWJBcHAuY2F0ZWdvcml6ZVJlcXVlc3Q7XG4gIFdlYkFwcC5jYXRlZ29yaXplUmVxdWVzdCA9IGZ1bmN0aW9uIChyZXEpIHtcbiAgICBsZXQgcmVzdWx0ID0gb3JpZ0NhdGVnb3JpemVSZXF1ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAocmVzdWx0ICYmIHJlcS5fX2thZGlyYUluZm8pIHtcbiAgICAgIHJlc3VsdFtJbmZvU3ltYm9sXSA9IHJlcS5fX2thZGlyYUluZm87XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIEFkZGluZyB0aGUgaGFuZGxlciBkaXJlY3RseSB0byB0aGUgc3RhY2tcbiAgLy8gdG8gZm9yY2UgaXQgdG8gYmUgdGhlIGZpcnN0IG9uZSB0byBydW5cbiAgV2ViQXBwLnJhd0Nvbm5lY3RIYW5kbGVycy5zdGFjay51bnNoaWZ0KHtcbiAgICByb3V0ZTogJycsXG4gICAgaGFuZGxlOiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBjb25zdCBuYW1lID0gcGFyc2VVcmwocmVxKS5wYXRobmFtZTtcbiAgICBjb25zdCB0cmFjZSA9IEthZGlyYS50cmFjZXIuc3RhcnQoYCR7cmVxLm1ldGhvZH0tJHtuYW1lfWAsICdodHRwJyk7XG5cbiAgICBjb25zdCBoZWFkZXJzID0gS2FkaXJhLnRyYWNlci5fYXBwbHlPYmplY3RGaWx0ZXJzKHJlcS5oZWFkZXJzKTtcbiAgICBLYWRpcmEudHJhY2VyLmV2ZW50KHRyYWNlLCAnc3RhcnQnLCB7XG4gICAgICB1cmw6IHJlcS51cmwsXG4gICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICBoZWFkZXJzOiBKU09OLnN0cmluZ2lmeShoZWFkZXJzKSxcbiAgICB9KTtcbiAgICByZXEuX19rYWRpcmFJbmZvID0geyB0cmFjZSB9O1xuXG4gICAgcmVzLm9uKCdmaW5pc2gnLCAoKSA9PiB7XG4gICAgICBpZiAocmVxLl9fa2FkaXJhSW5mby5hc3luY0V2ZW50KSB7XG4gICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQodHJhY2UsIHJlcS5fX2thZGlyYUluZm8uYXN5bmNFdmVudCk7XG4gICAgICB9XG5cbiAgICAgIEthZGlyYS50cmFjZXIuZW5kTGFzdEV2ZW50KHRyYWNlKTtcblxuICAgICAgaWYgKHJlcS5fX2thZGlyYUluZm8uaXNTdGF0aWMpIHtcbiAgICAgICAgdHJhY2UubmFtZSA9IGAke3JlcS5tZXRob2R9LTxzdGF0aWMgZmlsZT5gXG4gICAgICB9IGVsc2UgaWYgKHJlcS5fX2thZGlyYUluZm8uc3VnZ2VzdGVkUm91dGVOYW1lKSB7XG4gICAgICAgIHRyYWNlLm5hbWUgPSBgJHtyZXEubWV0aG9kfS0ke3JlcS5fX2thZGlyYUluZm8uc3VnZ2VzdGVkUm91dGVOYW1lfWBcbiAgICAgIH0gZWxzZSBpZiAocmVxLl9fa2FkaXJhSW5mby5pc0FwcFJvdXRlKSB7XG4gICAgICAgIHRyYWNlLm5hbWUgPSBgJHtyZXEubWV0aG9kfS08YXBwPmBcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNKc29uID0gcmVxLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICBjb25zdCBoYXNTbWFsbEJvZHkgPSByZXEuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA+IDAgJiYgcmVxLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPCBNQVhfQk9EWV9TSVpFXG5cbiAgICAgIC8vIENoZWNrIGFmdGVyIGFsbCBtaWRkbGV3YXJlIGhhdmUgcnVuIHRvIHNlZSBpZiBhbnkgb2YgdGhlbVxuICAgICAgLy8gc2V0IHJlcS5ib2R5XG4gICAgICAvLyBUZWNobmljYWxseSBib2RpZXMgY2FuIGJlIHVzZWQgd2l0aCBhbnkgbWV0aG9kLCBidXQgc2luY2UgbWFueSBsb2FkIGJhbGFuY2VycyBhbmRcbiAgICAgIC8vIG90aGVyIHNvZnR3YXJlIG9ubHkgc3VwcG9ydCBib2RpZXMgZm9yIFBPU1QgcmVxdWVzdHMsIHdlIGFyZVxuICAgICAgLy8gbm90IHJlY29yZGluZyB0aGUgYm9keSBmb3Igb3RoZXIgbWV0aG9kcy5cbiAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgJiYgcmVxLmJvZHkgJiYgaXNKc29uICYmIGhhc1NtYWxsQm9keSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBib2R5ID0gSlNPTi5zdHJpbmdpZnkocmVxLmJvZHkpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgdGhlIGJvZHkgc2l6ZSBhZ2FpbiBpbiBjYXNlIGl0IGlzIG11Y2hcbiAgICAgICAgICAvLyBsYXJnZXIgdGhhbiB3aGF0IHdhcyBpbiB0aGUgY29udGVudC1sZW5ndGggaGVhZGVyXG4gICAgICAgICAgaWYgKGJvZHkubGVuZ3RoIDwgTUFYX1NUUklOR0lGSUVEX0JPRFlfU0laRSkge1xuICAgICAgICAgICAgdHJhY2UuZXZlbnRzWzBdLmRhdGEuYm9keSA9IGJvZHk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gSXQgaXMgb2theSBpZiB0aGlzIGZhaWxzXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogcmVjb3JkIHN0YXR1cyBjb2RlXG4gICAgICBLYWRpcmEudHJhY2VyLmV2ZW50KHRyYWNlLCAnY29tcGxldGUnKTtcbiAgICAgIGxldCBidWlsdCA9IEthZGlyYS50cmFjZXIuYnVpbGRUcmFjZSh0cmFjZSk7XG4gICAgICBLYWRpcmEubW9kZWxzLmh0dHAucHJvY2Vzc1JlcXVlc3QoYnVpbHQsIHJlcSwgcmVzKTtcbiAgICB9KTtcblxuICAgIG5leHQoKTtcbiAgfVxufSk7XG5cblxuICBmdW5jdGlvbiB3cmFwSGFuZGxlcihoYW5kbGVyKSB7XG4gICAgLy8gY29ubmVjdCBpZGVudGlmaWVzIGVycm9yIGhhbmRsZXMgYnkgdGhlbSBhY2NlcHRpbmdcbiAgICAvLyBmb3VyIGFyZ3VtZW50c1xuICAgIGxldCBlcnJvckhhbmRsZXIgPSBoYW5kbGVyLmxlbmd0aCA9PT0gNDtcblxuICAgIGZ1bmN0aW9uIHdyYXBwZXIocmVxLCByZXMsIG5leHQpIHtcbiAgICAgIGxldCBlcnJvcjtcbiAgICAgIGlmIChlcnJvckhhbmRsZXIpIHtcbiAgICAgICAgZXJyb3IgPSByZXE7XG4gICAgICAgIHJlcSA9IHJlcztcbiAgICAgICAgcmVzID0gbmV4dDtcbiAgICAgICAgbmV4dCA9IGFyZ3VtZW50c1szXVxuICAgICAgfVxuXG4gICAgICBjb25zdCBrYWRpcmFJbmZvID0gcmVxLl9fa2FkaXJhSW5mbztcbiAgICAgIEthZGlyYS5fc2V0SW5mbyhrYWRpcmFJbmZvKTtcblxuICAgICAgbGV0IG5leHRDYWxsZWQgPSBmYWxzZTtcbiAgICAgIC8vIFRPRE86IHRyYWNrIGVycm9ycyBwYXNzZWQgdG8gbmV4dCBvciB0aHJvd25cbiAgICAgIGZ1bmN0aW9uIHdyYXBwZWROZXh0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKGthZGlyYUluZm8gJiYga2FkaXJhSW5mby5hc3luY0V2ZW50KSB7XG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChyZXEuX19rYWRpcmFJbmZvLnRyYWNlLCByZXEuX19rYWRpcmFJbmZvLmFzeW5jRXZlbnQpO1xuICAgICAgICAgIHJlcS5fX2thZGlyYUluZm8uYXN5bmNFdmVudCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgbmV4dCguLi5hcmdzKVxuICAgICAgfVxuXG4gICAgICBsZXQgcG90ZW50aWFsUHJvbWlzZVxuXG4gICAgICBpZiAoZXJyb3JIYW5kbGVyKSB7XG4gICAgICAgIHBvdGVudGlhbFByb21pc2UgPSBoYW5kbGVyLmNhbGwodGhpcywgZXJyb3IsIHJlcSwgcmVzLCB3cmFwcGVkTmV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3RlbnRpYWxQcm9taXNlID0gaGFuZGxlci5jYWxsKHRoaXMsIHJlcSwgcmVzLCB3cmFwcGVkTmV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3RlbnRpYWxQcm9taXNlICYmIHR5cGVvZiBwb3RlbnRpYWxQcm9taXNlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG90ZW50aWFsUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAvLyByZXMuZmluaXNoZWQgaXMgZGVwcmVjaWF0ZWQgaW4gTm9kZSAxMywgYnV0IGl0IGlzIHRoZSBvbmx5IG9wdGlvblxuICAgICAgICAgIC8vIGZvciBOb2RlIDEyLjkgYW5kIG9sZGVyLlxuICAgICAgICAgIGlmIChrYWRpcmFJbmZvICYmICFyZXMuZmluaXNoZWQgJiYgIW5leHRDYWxsZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RFdmVudCA9IEthZGlyYS50cmFjZXIuZ2V0TGFzdEV2ZW50KGthZGlyYUluZm8udHJhY2UpXG4gICAgICAgICAgICBpZiAobGFzdEV2ZW50LmVuZEF0KSB7XG4gICAgICAgICAgICAgIC8vIHJlcSBpcyBub3QgZG9uZSwgYW5kIG5leHQgaGFzIG5vdCBiZWVuIGNhbGxlZFxuICAgICAgICAgICAgICAvLyBjcmVhdGUgYW4gYXN5bmMgZXZlbnQgdGhhdCB3aWxsIGVuZCB3aGVuIGVpdGhlciBvZiB0aG9zZSBoYXBwZW5zXG4gICAgICAgICAgICAgIGthZGlyYUluZm8uYXN5bmNFdmVudCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2FzeW5jJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvdGVudGlhbFByb21pc2U7XG4gICAgfVxuXG4gICAgaWYgKGVycm9ySGFuZGxlcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgcmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgcmV0dXJuIHdyYXBwZXIoZXJyb3IsIHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChyZXEsIHJlcywgbmV4dCkge1xuICAgICAgICByZXR1cm4gd3JhcHBlcihyZXEsIHJlcywgbmV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gd3JhcENvbm5lY3QoYXBwLCB3cmFwU3RhY2spIHtcbiAgICBsZXQgb2xkVXNlID0gYXBwLnVzZTtcbiAgICBpZiAod3JhcFN0YWNrKSB7XG4gICAgICAvLyBXZSBuZWVkIHRvIHNldCBrYWRpcmFJbmZvIG9uIHRoZSBGaWJlciB0aGUgaGFuZGxlciB3aWxsIHJ1biBpbi5cbiAgICAgIC8vIE1ldGVvciBoYXMgYWxyZWFkeSB3cmFwcGVkIHRoZSBoYW5kbGVyIHRvIHJ1biBpdCBpbiBhIG5ldyBGaWJlclxuICAgICAgLy8gYnkgdXNpbmcgUHJvbWlzZS5hc3luY0FwcGx5IHNvIHdlIGFyZSBub3QgYWJsZSB0byBkaXJlY3RseSBzZXQgaXRcbiAgICAgIC8vIG9uIHRoYXQgRmliZXIuIFxuICAgICAgLy8gTWV0ZW9yJ3MgcHJvbWlzZSBsaWJyYXJ5IGNvcGllcyBwcm9wZXJ0aWVzIGZyb20gdGhlIGN1cnJlbnQgZmliZXIgdG9cbiAgICAgIC8vIHRoZSBuZXcgZmliZXIsIHNvIHdlIGNhbiB3cmFwIGl0IGluIGFub3RoZXIgRmliZXIgd2l0aCBrYWRpcmFJbmZvIHNldFxuICAgICAgLy8gYW5kIE1ldGVvciB3aWxsIGNvcHkga2FkaXJhSW5mbyB0byB0aGUgbmV3IEZpYmVyLlxuICAgICAgLy8gSXQgd2lsbCBvbmx5IGNyZWF0ZSB0aGUgYWRkaXRpb25hbCBGaWJlciBpZiBpdCBpc24ndCBhbHJlYWR5IHJ1bm5pbmcgaW4gYSBGaWJlclxuICAgICAgYXBwLnN0YWNrLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBsZXQgd3JhcHBlZEhhbmRsZXIgPSB3cmFwSGFuZGxlcihlbnRyeS5oYW5kbGUpXG4gICAgICAgIGlmIChlbnRyeS5oYW5kbGUubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICBlbnRyeS5oYW5kbGUgPSBmdW5jdGlvbiAoZXJyb3IsIHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hc3luY0FwcGx5KFxuICAgICAgICAgICAgICB3cmFwcGVkSGFuZGxlcixcbiAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgYXJndW1lbnRzLFxuICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW50cnkuaGFuZGxlID0gZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hc3luY0FwcGx5KFxuICAgICAgICAgICAgICB3cmFwcGVkSGFuZGxlcixcbiAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgYXJndW1lbnRzLFxuICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgYXBwLnVzZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPSB3cmFwSGFuZGxlcihhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pXG4gICAgICByZXR1cm4gb2xkVXNlLmFwcGx5KGFwcCwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgd3JhcENvbm5lY3QoV2ViQXBwLnJhd0Nvbm5lY3RIYW5kbGVycywgZmFsc2UpO1xuICB3cmFwQ29ubmVjdChXZWJBcHBJbnRlcm5hbHMubWV0ZW9ySW50ZXJuYWxIYW5kbGVycywgZmFsc2UpO1xuXG4gIC8vIFRoZSBvYXV0aCBwYWNrYWdlIGFuZCBvdGhlciBjb3JlIHBhY2thZ2VzIG1pZ2h0IGhhdmUgYWxyZWFkeSBhZGRlZCB0aGVpciBtaWRkbGV3YXJlLFxuICAvLyBzbyB3ZSBuZWVkIHRvIHdyYXAgdGhlIGV4aXN0aW5nIG1pZGRsZXdhcmVcbiAgd3JhcENvbm5lY3QoV2ViQXBwLmNvbm5lY3RIYW5kbGVycywgdHJ1ZSk7XG5cbiAgd3JhcENvbm5lY3QoV2ViQXBwLmNvbm5lY3RBcHAsIGZhbHNlKTtcblxuICBsZXQgb2xkU3RhdGljRmlsZXNNaWRkbGV3YXJlID0gV2ViQXBwSW50ZXJuYWxzLnN0YXRpY0ZpbGVzTWlkZGxld2FyZTtcbiAgY29uc3Qgc3RhdGljSGFuZGxlciA9IHdyYXBIYW5kbGVyKG9sZFN0YXRpY0ZpbGVzTWlkZGxld2FyZS5iaW5kKFdlYkFwcEludGVybmFscywgV2ViQXBwSW50ZXJuYWxzLnN0YXRpY0ZpbGVzQnlBcmNoKSk7XG4gIFdlYkFwcEludGVybmFscy5zdGF0aWNGaWxlc01pZGRsZXdhcmUgPSBmdW5jdGlvbiAoX3N0YXRpY0ZpbGVzLCByZXEsIHJlcywgbmV4dCkge1xuICAgIGlmIChyZXEuX19rYWRpcmFJbmZvKSB7XG4gICAgICByZXEuX19rYWRpcmFJbmZvLmlzU3RhdGljID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGljSGFuZGxlcihyZXEsIHJlcywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgaXMgZm9yIGEgc3RhdGljIGZpbGUsIHRoZSBzdGF0aWMgaGFuZGxlciB3aWxsIGVuZCB0aGUgcmVzcG9uc2VcbiAgICAgIC8vIGluc3RlYWQgb2YgY2FsbGluZyBuZXh0XG4gICAgICByZXEuX19rYWRpcmFJbmZvLmlzU3RhdGljID0gZmFsc2U7XG4gICAgICByZXR1cm4gbmV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0pO1xuICB9O1xufVxuIiwiZnVuY3Rpb24gbm9ybWFsaXplZFByZWZpeCAobmFtZSkge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKCdLQURJUkFfJywgJ01PTlRJXycpO1xufVxuXG5LYWRpcmEuX3BhcnNlRW52ID0gZnVuY3Rpb24gKGVudikge1xuICB2YXIgb3B0aW9ucyA9IHt9O1xuICBmb3IodmFyIG5hbWUgaW4gZW52KSB7XG4gICAgdmFyIHZhbHVlID0gZW52W25hbWVdO1xuICAgIHZhciBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZWRQcmVmaXgobmFtZSk7XG4gICAgdmFyIGluZm8gPSBLYWRpcmEuX3BhcnNlRW52Ll9vcHRpb25zW25vcm1hbGl6ZWROYW1lXTtcblxuICAgIGlmKGluZm8gJiYgdmFsdWUpIHtcbiAgICAgIG9wdGlvbnNbaW5mby5uYW1lXSA9IGluZm8ucGFyc2VyKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3B0aW9ucztcbn07XG5cblxuS2FkaXJhLl9wYXJzZUVudi5wYXJzZUludCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgdmFyIG51bSA9IHBhcnNlSW50KHN0cik7XG4gIGlmKG51bSB8fCBudW0gPT09IDApIHJldHVybiBudW07XG4gIHRocm93IG5ldyBFcnJvcignS2FkaXJhOiBNYXRjaCBFcnJvcjogXCInK251bSsnXCIgaXMgbm90IGEgbnVtYmVyJyk7XG59O1xuXG5cbkthZGlyYS5fcGFyc2VFbnYucGFyc2VCb29sID0gZnVuY3Rpb24gKHN0cikge1xuICBzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgaWYoc3RyID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xuICBpZihzdHIgPT09ICdmYWxzZScpIHJldHVybiBmYWxzZTtcbiAgdGhyb3cgbmV3IEVycm9yKCdLYWRpcmE6IE1hdGNoIEVycm9yOiAnK3N0cisnIGlzIG5vdCBhIGJvb2xlYW4nKTtcbn07XG5cblxuS2FkaXJhLl9wYXJzZUVudi5wYXJzZVVybCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuS2FkaXJhLl9wYXJzZUVudi5wYXJzZVN0cmluZyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuS2FkaXJhLl9wYXJzZUVudi5fb3B0aW9ucyA9IHtcbiAgLy8gYXV0aFxuICBNT05USV9BUFBfSUQ6IHtcbiAgICBuYW1lOiAnYXBwSWQnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZVN0cmluZ1xuICB9LFxuICBNT05USV9BUFBfU0VDUkVUOiB7XG4gICAgbmFtZTogJ2FwcFNlY3JldCcsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlU3RyaW5nXG4gIH0sXG4gIC8vIGRlbGF5IHRvIHNlbmQgdGhlIGluaXRpYWwgcGluZyB0byB0aGUga2FkaXJhIGVuZ2luZSBhZnRlciBwYWdlIGxvYWRzXG4gIE1PTlRJX09QVElPTlNfQ0xJRU5UX0VOR0lORV9TWU5DX0RFTEFZOiB7XG4gICAgbmFtZTogJ2NsaWVudEVuZ2luZVN5bmNEZWxheScsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlSW50LFxuICB9LFxuICAvLyB0aW1lIGJldHdlZW4gc2VuZGluZyBlcnJvcnMgdG8gdGhlIGVuZ2luZVxuICBNT05USV9PUFRJT05TX0VSUk9SX0RVTVBfSU5URVJWQUw6IHtcbiAgICBuYW1lOiAnZXJyb3JEdW1wSW50ZXJ2YWwnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZUludCxcbiAgfSxcbiAgLy8gbm8gb2YgZXJyb3JzIGFsbG93ZWQgaW4gYSBnaXZlbiBpbnRlcnZhbFxuICBNT05USV9PUFRJT05TX01BWF9FUlJPUlNfUEVSX0lOVEVSVkFMOiB7XG4gICAgbmFtZTogJ21heEVycm9yc1BlckludGVydmFsJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VJbnQsXG4gIH0sXG4gIC8vIGEgem9uZS5qcyBzcGVjaWZpYyBvcHRpb24gdG8gY29sbGVjdCB0aGUgZnVsbCBzdGFjayB0cmFjZSh3aGljaCBpcyBub3QgbXVjaCB1c2VmdWwpXG4gIE1PTlRJX09QVElPTlNfQ09MTEVDVF9BTExfU1RBQ0tTOiB7XG4gICAgbmFtZTogJ2NvbGxlY3RBbGxTdGFja3MnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZUJvb2wsXG4gIH0sXG4gIC8vIGVuYWJsZSBlcnJvciB0cmFja2luZyAod2hpY2ggaXMgdHVybmVkIG9uIGJ5IGRlZmF1bHQpXG4gIE1PTlRJX09QVElPTlNfRU5BQkxFX0VSUk9SX1RSQUNLSU5HOiB7XG4gICAgbmFtZTogJ2VuYWJsZUVycm9yVHJhY2tpbmcnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZUJvb2wsXG4gIH0sXG4gIC8vIGthZGlyYSBlbmdpbmUgZW5kcG9pbnRcbiAgTU9OVElfT1BUSU9OU19FTkRQT0lOVDoge1xuICAgIG5hbWU6ICdlbmRwb2ludCcsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlVXJsLFxuICB9LFxuICAvLyBkZWZpbmUgdGhlIGhvc3RuYW1lIG9mIHRoZSBjdXJyZW50IHJ1bm5pbmcgcHJvY2Vzc1xuICBNT05USV9PUFRJT05TX0hPU1ROQU1FOiB7XG4gICAgbmFtZTogJ2hvc3RuYW1lJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VTdHJpbmcsXG4gIH0sXG4gIC8vIGludGVydmFsIGJldHdlZW4gc2VuZGluZyBkYXRhIHRvIHRoZSBrYWRpcmEgZW5naW5lIGZyb20gdGhlIHNlcnZlclxuICBNT05USV9PUFRJT05TX1BBWUxPQURfVElNRU9VVDoge1xuICAgIG5hbWU6ICdwYXlsb2FkVGltZW91dCcsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlSW50LFxuICB9LFxuICAvLyBzZXQgSFRUUC9IVFRQUyBwcm94eVxuICBNT05USV9PUFRJT05TX1BST1hZOiB7XG4gICAgbmFtZTogJ3Byb3h5JyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VVcmwsXG4gIH0sXG4gIC8vIG51bWJlciBvZiBpdGVtcyBjYWNoZWQgZm9yIHRyYWNraW5nIGRvY3VtZW50IHNpemVcbiAgTU9OVElfT1BUSU9OU19ET0NVTUVOVF9TSVpFX0NBQ0hFX1NJWkU6IHtcbiAgICBuYW1lOiAnZG9jdW1lbnRTaXplQ2FjaGVTaXplJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VJbnQsXG4gIH0sXG4gIC8vIGVuYWJsZSB1cGxvYWRpbmcgc291cmNlbWFwc1xuICBNT05USV9VUExPQURfU09VUkNFX01BUFM6IHtcbiAgICBuYW1lOiAndXBsb2FkU291cmNlTWFwcycsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlQm9vbFxuICB9LFxuICBNT05USV9SRUNPUkRfSVBfQUREUkVTUzoge1xuICAgIG5hbWU6ICdyZWNvcmRJUEFkZHJlc3MnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZVN0cmluZyxcbiAgfSxcbiAgTU9OVElfRVZFTlRfU1RBQ0tfVFJBQ0U6IHtcbiAgICBuYW1lOiAnZXZlbnRTdGFja1RyYWNlJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VCb29sLFxuICB9XG59O1xuIiwiS2FkaXJhLl9jb25uZWN0V2l0aEVudiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgb3B0aW9ucyA9IEthZGlyYS5fcGFyc2VFbnYocHJvY2Vzcy5lbnYpO1xuICBpZihvcHRpb25zLmFwcElkICYmIG9wdGlvbnMuYXBwU2VjcmV0KSB7XG5cbiAgICBLYWRpcmEuY29ubmVjdChcbiAgICAgIG9wdGlvbnMuYXBwSWQsXG4gICAgICBvcHRpb25zLmFwcFNlY3JldCxcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuXG4gICAgS2FkaXJhLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignS2FkaXJhIGhhcyBiZWVuIGFscmVhZHkgY29ubmVjdGVkIHVzaW5nIGNyZWRlbnRpYWxzIGZyb20gRW52aXJvbm1lbnQgVmFyaWFibGVzJyk7XG4gICAgfTtcbiAgfVxufTtcblxuXG5LYWRpcmEuX2Nvbm5lY3RXaXRoU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtb250aVNldHRpbmdzID0gTWV0ZW9yLnNldHRpbmdzLm1vbnRpIHx8IE1ldGVvci5zZXR0aW5ncy5rYWRpcmFcblxuICBpZihcbiAgICBtb250aVNldHRpbmdzICYmXG4gICAgbW9udGlTZXR0aW5ncy5hcHBJZCAmJlxuICAgIG1vbnRpU2V0dGluZ3MuYXBwU2VjcmV0XG4gICkge1xuICAgIEthZGlyYS5jb25uZWN0KFxuICAgICAgbW9udGlTZXR0aW5ncy5hcHBJZCxcbiAgICAgIG1vbnRpU2V0dGluZ3MuYXBwU2VjcmV0LFxuICAgICAgbW9udGlTZXR0aW5ncy5vcHRpb25zIHx8IHt9XG4gICAgKTtcblxuICAgIEthZGlyYS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0thZGlyYSBoYXMgYmVlbiBhbHJlYWR5IGNvbm5lY3RlZCB1c2luZyBjcmVkZW50aWFscyBmcm9tIE1ldGVvci5zZXR0aW5ncycpO1xuICAgIH07XG4gIH1cbn07XG5cblxuLy8gVHJ5IHRvIGNvbm5lY3QgYXV0b21hdGljYWxseVxuS2FkaXJhLl9jb25uZWN0V2l0aEVudigpO1xuS2FkaXJhLl9jb25uZWN0V2l0aFNldHRpbmdzKCk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuY29uc3QgY29uZmxpY3RpbmdQYWNrYWdlcyA9IFtcbiAgJ21kZzptZXRlb3ItYXBtLWFnZW50JyxcbiAgJ2xtYWNoZW5zOmthZGlyYScsXG4gICdtZXRlb3JoYWNrczprYWRpcmEnXG5dO1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIGNvbmZsaWN0aW5nUGFja2FnZXMuZm9yRWFjaChuYW1lID0+IHtcbiAgICBpZiAobmFtZSBpbiBQYWNrYWdlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYE1vbnRpIEFQTTogeW91ciBhcHAgaXMgdXNpbmcgdGhlICR7bmFtZX0gcGFja2FnZS4gVXNpbmcgbW9yZSB0aGFuIG9uZSBBUE0gYWdlbnQgaW4gYW4gYXBwIGNhbiBjYXVzZSB1bmV4cGVjdGVkIHByb2JsZW1zLmBcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn0pO1xuIl19
