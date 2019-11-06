(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const lookup = require("binlookup")();

//bank.name & country.name & scheme & type
// AMEX =
// Visa =
// MCard =

const validate = require("./validate");
const validateEl = document.getElementById("validate");
const resultEl = document.getElementById("result");
const merchantEl = document.getElementById("merchant");
const inputVal = document.getElementById("input");

validateEl.addEventListener("click", () => {
	const firstEight = inputVal.value.substring(0, 8);
	//console.log(firstEight);
	const fetchData = async () => {
		const result = await lookup(firstEight);
		const name = result.bank.name;
		const country = result.country.name;
		const { scheme, type } = result;
		console.log(name, country, scheme, type);

		const icon =
			scheme === "amex"
				? '<i class="fab fa-cc-amex fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country
				: scheme === "visa"
				? '<i class="fab fa-cc-visa fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country
				: scheme === "mastercard"
				? '<i class="fab fa-cc-mastercard fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country
				: '<i class="fas fa-credit-card fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country;

		merchantEl.innerHTML = icon;
	};

	if (validate(inputVal.value)) {
		resultEl.innerHTML = "Valid Credit Card Number";
		fetchData();
	} else {
		resultEl.innerHTML = "Card Number Not Valid";
	}
});

inputVal.addEventListener("keyup", event => {
	if (event.keyCode === 13) {
		validateEl.click();
	}
});

},{"./validate":19,"binlookup":3}],2:[function(require,module,exports){
'use strict';

function find(array, predicate, context) {
  if (typeof Array.prototype.find === 'function') {
    return array.find(predicate, context);
  }

  context = context || this;
  var length = array.length;
  var i;

  if (typeof predicate !== 'function') {
    throw new TypeError(predicate + ' is not a function');
  }

  for (i = 0; i < length; i++) {
    if (predicate.call(context, array[i], i, array)) {
      return array[i];
    }
  }
}

module.exports = find;

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var defined = require('defined');
var fetch = require('pull-fetch-iso');
var collect = require('pull-stream/sinks/collect');

module.exports = binlookup;

function binlookup( opts ){
	if (typeof opts === 'string')
		opts = {
			key: opts,
		};

	if (typeof opts === 'undefined')
		opts = {};

	var url = defined(opts.url, 'https://lookup.binlist.net/');

	var Promise = defined(opts.Promise, global.Promise);

	return function( bin, cb ){
		var source = fetch({
			host: url,
			path: bin,
			headers: Object.assign({
				'Accept-Version': '3',
				'X-Client': 'Node.js 2.0.1',
			}, opts.key && {
				'Authorization': 'Basic '+fetch.btoa(opts.key+':'),
			}),
		});

		if (cb === undefined)
			return new Promise(function( rs, rj ){
				collect(function( err, ranges){
					if (err)
						return rj(err);

					rs(ranges[0]);
				})(source);
			});

		collect(function( err, ranges ){
			if (err)
				return cb(err);

			cb(null, ranges[0]);
		})(source);
	}
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"defined":5,"pull-fetch-iso":9,"pull-stream/sinks/collect":16}],4:[function(require,module,exports){
module.exports = function _btoa(str) {
  return btoa(str)
}

},{}],5:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],6:[function(require,module,exports){
'use strict';

toQuerystring.serialize = serialize;
toQuerystring.shake = shake;
toQuerystring.normalize = normalize;

module.exports = toQuerystring;

function toQuerystring( i ){
	var shaken = shake(normalize(i));

	if (shaken === undefined)
		return '';

	return serialize(shaken);
}

function serialize( i, prefix ){
	if (Array.isArray(i)) {
		var hasComplex = i.some(isComplex);

		return i.map(function( i, idx ){
			return serialize(i, prefix+(hasComplex
				? '['+idx+']'
				: '[]'));
		}).join('&');
	}

	if (typeof i === 'object')
		return Object.keys(i).map(function( key ){
			return serialize(i[key], prefix === undefined
				? encodeURIComponent(key)
				: prefix+'['+encodeURIComponent(key)+']');
		}).join('&');

	return prefix+'='+encodeURIComponent(i);
}

function shake( i ){
	if (i === undefined)
		return;

	if (Array.isArray(i)) {
		var shaken = i.map(shake).filter(isDefined);

		if (shaken.length === 0)
			return;

		return shaken;
	}

	if (typeof i === 'object') {
		var empty = true;

		var shaken = Object.keys(i).reduce(function( o, key ){
			var shaken = shake(i[key]);

			if (shaken !== undefined) {
				empty = false;

				o[key] = shaken;
			}

			return o;
		}, {});

		if (empty)
			return;

		return shaken;
	}

	return i;
}

function normalize( i ){
	if (i === undefined)
		return undefined;

	if (i === null)
		return '';

	if (i === true)
		return 'y';

	if (i === false)
		return 'n';

	if (typeof i.toJSON === 'function')
		return normalize(i.toJSON());

	var type = typeof i;

	if (type === 'string')
		return i;

	if (Array.isArray(i))
		return i.map(normalize);

	if (type === 'object')
		return Object.keys(i).reduce(function( o, key ){
			o[key] = normalize(i[key]);

			return o;
		}, {});

	return i+'';
}

function isDefined( i ){
	return i !== undefined;
}

function isComplex( i ){
	if (Array.isArray(i))
		return true;

	if (typeof i === 'object')
		return true;

	return false;
}

},{}],7:[function(require,module,exports){
'use strict';

var stringify = require('http-querystring-stringify');

module.exports = appendQuery;

function appendQuery( url, data ){
	if (data === undefined || data === null || data === false)
		return url;

	var query = typeof data === 'string'
		? data
		: stringify(data);

	if (!query)
		return url;

	var delimiter = url.indexOf('?') === -1
		? '?'
		: '&';

	return url+delimiter+query;
}

},{"http-querystring-stringify":6}],8:[function(require,module,exports){
'use strict';

var Promise = require('./promise-standin');

fetch.isPony = true;

module.exports = fetch;

function fetch( url, opts ){
	var r = new XMLHttpRequest();

	r.open(opts.method, url);

	Object.keys(opts.headers).forEach(function( key ){
		r.setRequestHeader(key, opts.headers[key]);
	});

	var promise = new Promise();

	r.addEventListener('readystatechange', function(){
		if (r.readyState !== 4)
			return;

		var code;
		var message;
		var body;

		try { code = r.status } catch(e) { code = 0; }
		try { message = r.statusText } catch(e) {}
		try { body = r.responseText; } catch(e) {}

		if (code === 0)
			return promise.settle(new TypeError('Connection trouble'), true);

		promise.settle({
			status: code,
			statusText: message,
			ok: code >= 200 && code < 300,
			text: function(){
				return new Promise().settle(body);
			},
			json: function(){
				return new Promise().settle(JSON.parse(body));
			},
			headers: {
				get: function( key ){
					try {
						return r.getResponseHeader(key);
					} catch(e) {}
				},
			},
		});
	});

	r.send(opts.body);

	return promise;
}

},{"./promise-standin":12}],9:[function(require,module,exports){
'use strict';

var find = require('array-find');
var btoa = require('btoa-lite');
var jsonParse = require('pull-json-parse');
var promiseToPull = require('pull-from-promise');
var toQs = require('http-querystring-stringify');

var appendQuery = require('./append-query');
var responses = require('./responses');
var isContentType = require('./is-content-type');
var isAccept = require('./is-accept');
var ponyFetch = require('./fetch-ponyfill');

var fetch = typeof window !== 'undefined' && window.fetch || ponyFetch;
var FormData = typeof window !== 'undefined' && window.FormData;
var File = typeof window !== 'undefined' && window.File;
var TextDecoder = typeof window !== 'undefined' && window.TextDecoder;

var responseMap = {
	1: responses.Error,
	2: responses.Success,
	3: responses.Error,
	4: responses.ClientError,
	5: responses.ServerError,
};

var methodsWithoutBody = [ 'GET', 'DELETE' ];

request.response = responses;
request.toQs = toQs;
request.btoa = btoa;

module.exports = request;

function request( opts ){
	var pump = null;
	var retries = 0;

	return source;

	function source( abort, cb ){
		if (abort)
			return cb && cb(abort);

		if (pump)
			return pump(null, cb);

		send(opts)
			.then(function( response ){
				var code = response.status;

				var contentType = response.headers.get('content-type');

				var json = contentType && contentType.indexOf('json') !== -1;

				if (!response.ok)
					return (json ? response.json() : response.text())
						.then(function( body ){
							var statusIdentifier = code && (code / 100 | 0);
							var responseType = responseMap[statusIdentifier] || responses.Error;

							return cb(new responseType(code, response.statusText || 'Connection trouble', null, body));
						});

				if (code === 204 || code === 205)
					return cb(true);

				pump = json
					? pumpJson(response)
					: pumpBinary(response);

				return pump(null, cb);
			})
			.catch(function( err ){
				if (!opts.retries)
					return cb(err);

				var retry = opts.retries[retries];

				if (retry === undefined)
					return cb(err);

				retries++;

				if (!retry.delay)
					return source(null, cb);

				setTimeout(function(){
					source(null, cb);
				}, retry.delay);
			})
			.catch(cb);
	}
}

function send( opts ){
	var url = typeof opts === 'string'
		? opts
		: appendQuery(opts.url || opts.host+(opts.path || ''), opts.query);

	var method = opts.method || (opts.data ? 'POST' : 'GET');
	var headers = opts.headers || {};
	var data = opts.data;

	var isMethodWithBody = methodsWithoutBody.indexOf(method) === -1;

	var headerKeys = Object.keys(headers);

	var contentTypeHeader = find(headerKeys, isContentType);
	var acceptHeader = find(headerKeys, isAccept);

	if (
		isMethodWithBody
		&& contentTypeHeader === undefined
		&& !(File && data instanceof File)
		&& !(FormData && data instanceof FormData)
	)
		headers['Content-Type'] = 'application/json';

	if (acceptHeader === undefined)
		headers.Accept = 'application/json';

	var contentType = headers[contentTypeHeader || 'Content-Type'];

	var body;

	if (data) {
		if (!isMethodWithBody)
			throw new Error('You should not send data for DELETE or GET requests');

		if (contentType === 'application/json') {
			body = JSON.stringify(data);
		} else {
			body = data;
		}
	}

	return fetch(url, {
		method: method,
		headers: fetch.isPony
			? headers
			: Object.keys(headers).reduce(function( c, key ){
				c.append(key, headers[key]);

				return c;
			}, new Headers()),
		body: body,
	});
}

function pumpJson( response ){
	if (response.source)
		return jsonParse(response.source);

	var reader = TextDecoder && response.body && response.body.getReader();

	if (!reader)
		return jsonParse(promiseToPull(response.text()));

	var decoder = new TextDecoder();
	var done = false;

	return jsonParse(function( abort, cb ){
		if (abort) {
			reader.cancel();

			return cb(abort);
		}

		if (done)
			return cb(true)

		return reader.read().then(function( chunk ){
			done = chunk.done;

			return cb(null, decoder.decode(chunk.value || new Uint8Array, {
				stream: chunk.done,
			}));
		}).catch(cb);
	});
}

function pumpBinary( response ){
	if (response.source)
		return response.source;

	var reader = response.body && response.body.getReader();

	if (!reader)
		return promiseToPull(response.text());

	return function pump( abort, cb ){
		if (abort) {
			reader.cancel();

			return cb(abort);
		}

		return reader.read().then(function( chunk ){
			if (chunk.done)
				return cb(true);

			return cb(null, chunk.value);
		}).catch(cb);
	}
}

},{"./append-query":7,"./fetch-ponyfill":8,"./is-accept":10,"./is-content-type":11,"./responses":13,"array-find":2,"btoa-lite":4,"http-querystring-stringify":6,"pull-from-promise":14,"pull-json-parse":15}],10:[function(require,module,exports){
'use strict';

module.exports = isAccept;

function isAccept( header ){
	return header.toLowerCase() === 'accept';
}

},{}],11:[function(require,module,exports){
'use strict';

module.exports = isContentType;

function isContentType( header ){
	return header.toLowerCase() === 'content-type';
}

},{}],12:[function(require,module,exports){
'use strict';

module.exports = Promise;

function Promise( value ){
	this.then = then;
	this.catch = fail;
	this.settle = settle;
}

function settle( value, reject ){
	this.value = value;
	this.settled = true;
	this.rejected = reject;

	if (reject && this.onFail)
		this.onFail(this.value);

	if (!reject && this.onSuccess)
		this.onSuccess(this.value);

	return this;
}

function then( success ){
	this.onSuccess = success;

	if (this.settled && !this.rejected)
		this.onSuccess(this.value);

	return this;
}

function fail( fail ){
	this.onFail = fail;

	if (this.settled && this.rejected)
		this.onFail(this.value);

	return this;
}

},{}],13:[function(require,module,exports){
'use strict';

module.exports = {
	Success: Success,
	Error: ErrorResponse,
	Redirect: Redirect,
	ClientError: ClientError,
	ServerError: ServerError,
};

function Response( code, message, headers, body ){
	this.code = code;
	this.message = message;
	this.headers = headers;
	this.body = body;
}

Response.prototype.toString = responseToString;

function ErrorResponse(){
	Response.apply(this, arguments);
}

ErrorResponse.prototype = Object.create(Error.prototype);
ErrorResponse.prototype.toString = responseToString;

// 200 - success (resolved)
function Success(){
	Response.apply(this, arguments);
}

Success.prototype = Object.create(Response.prototype);

// 300 - redirection (resolved)
function Redirect(){
	Response.apply(this, arguments);
}

Redirect.prototype = Object.create(Response.prototype);

// 400 - client error (rejected)
function ClientError(){
	Response.apply(this, arguments);
}

ClientError.prototype = Object.create(ErrorResponse.prototype);

// 500 - server error (rejected)
function ServerError(){
	Response.apply(this, arguments);
}

ServerError.prototype = Object.create(ErrorResponse.prototype);

function responseToString(){
	return this.code+': '+this.message;
}

},{}],14:[function(require,module,exports){
'use strict';

module.exports = promiseToPull;

function promiseToPull( promise, spread ){
	var done = false;
	var queue = false;
	var pos = 0;

	return function again( abort, cb ){
		if (abort)
			return cb(abort);

		if (queue) {
			if (queue.length > pos)
				return cb(null, queue[pos++]);

			return cb(true);
		}

		if (done)
			return cb(true);

		return promise
			.then(function( value ){
				done = true;

				if (!spread)
					return cb(null, value);

				if (!Array.isArray(value))
					throw new Error('promise-to-pull expected an array but got '+value);

				queue = value;

				return again(null, cb);
			})
			.catch(cb);
	}	
}

},{}],15:[function(require,module,exports){
'use strict';

var COMMA = 0x2c;
var BRACKET_START = 0x5b;
var BRACKET_END = 0x5d;
var NEWLINE = 0xa;

module.exports = parse;

function parse( read ){
	var done = false;
	var queue = [];
	var pos = 0;
	var ni = 0;
	var head = '';
	var tail = '';
	var line = '';
	var cc = 0;
	var ll = 0;

	return function again( abort, cb ){
		if (abort)
			return read(abort, cb);

		if (queue.length > 0)
			return cb(null, queue.shift());

		if (done)
			return cb(true);

		return read(null, function( end, data ){
			if (end !== null) {
				if (end !== true)
					return cb(end);	// error

				if (head === '')
					return cb(true);

				done = true;
				data = '\n';
			}

			pos = 0;

			if (typeof data !== 'string')
				data = data.toString();

			while ((ni = data.indexOf('\n', pos)) !== -1) {
				tail = data.slice(pos, data.charCodeAt(ni - 1) === COMMA
					? ni - 1
					: ni);

				line = (pos === 0
					? (ni === 0 && head.charCodeAt(head.length - 1) === COMMA
						? head.slice(0, -1)
						: head)
					: '')+tail;

				pos = ni + 1;

				ll = line.length;

				if (ll === 0)
					continue;

				if (ll === 1) {
					cc = line.charCodeAt(0);

					if (cc === BRACKET_START
						|| cc === BRACKET_END
						|| cc === NEWLINE)
						continue;
				}

				queue.push(JSON.parse(line));
			}

			head = (pos === 0 ? head : '')+data.slice(pos);

			return again(null, cb);
		});
	}
}

},{}],16:[function(require,module,exports){
'use strict'

var reduce = require('./reduce')

module.exports = function collect (cb) {
  return reduce(function (arr, item) {
    arr.push(item)
    return arr
  }, [], cb)
}

},{"./reduce":18}],17:[function(require,module,exports){
'use strict'

module.exports = function drain (op, done) {
  var read, abort

  function sink (_read) {
    read = _read
    if(abort) return sink.abort()
    //this function is much simpler to write if you
    //just use recursion, but by using a while loop
    //we do not blow the stack if the stream happens to be sync.
    ;(function next() {
        var loop = true, cbed = false
        while(loop) {
          cbed = false
          read(null, function (end, data) {
            cbed = true
            if(end = end || abort) {
              loop = false
              if(done) done(end === true ? null : end)
              else if(end && end !== true)
                throw end
            }
            else if(op && false === op(data) || abort) {
              loop = false
              read(abort || true, done || function () {})
            }
            else if(!loop){
              next()
            }
          })
          if(!cbed) {
            loop = false
            return
          }
        }
      })()
  }

  sink.abort = function (err, cb) {
    if('function' == typeof err)
      cb = err, err = true
    abort = err || true
    if(read) return read(abort, cb || function () {})
  }

  return sink
}

},{}],18:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function reduce (reducer, acc, cb ) {
  if(!cb) cb = acc, acc = null
  var sink = drain(function (data) {
    acc = reducer(acc, data)
  }, function (err) {
    cb(err, acc)
  })
  if (arguments.length === 2)
    return function (source) {
      source(null, function (end, data) {
        //if ended immediately, and no initial...
        if(end) return cb(end === true ? null : end)
        acc = data; sink(source)
      })
    }
  else
    return sink
}

},{"./drain":17}],19:[function(require,module,exports){
const to_digits = numString =>
	numString
		.replace(/[^0-9]/g, "")
		.split("")
		.map(Number);

const condTransform = (predicate, value, fn) => {
	if (predicate) {
		return fn(value);
	} else {
		return value;
	}
};

const doubleEveryOther = (current, idx) =>
	condTransform(idx % 2 === 0, current, x => x * 2);

const reduceMultiDigitVals = current =>
	condTransform(current > 9, current, x => x - 9);

const validate = numString => {
	const digits = to_digits(numString);
	const len = digits.length;
	const luhn_digit = digits[len - 1];

	if (len < 15) {
		return false;
	}

	const total = digits
		.slice(0, len - 1)
		.reverse()
		.map(doubleEveryOther)
		.map(reduceMultiDigitVals)
		.reduce((acc, cur) => acc + cur, luhn_digit);

	return total % 10 === 0;
};

module.exports = validate;

},{}]},{},[1]);
