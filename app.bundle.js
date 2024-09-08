/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@ocdla/lib-http/HttpClient.js":
/*!****************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/HttpClient.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HttpClient)
/* harmony export */ });
/* harmony import */ var _caches_HttpCache_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./caches/HttpCache.js */ "./node_modules/@ocdla/lib-http/caches/HttpCache.js");
/* harmony import */ var _caches_LocalStorageCache_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./caches/LocalStorageCache.js */ "./node_modules/@ocdla/lib-http/caches/LocalStorageCache.js");
/* harmony import */ var _Url_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Url.js */ "./node_modules/@ocdla/lib-http/Url.js");
/* harmony import */ var _HttpHeader_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./HttpHeader.js */ "./node_modules/@ocdla/lib-http/HttpHeader.js");






console.log("I am local HTTP module");

class HttpClient {

  // Store references to mocking classes.
  // Mocking classes are registered against domains.
  static mocks = {};

  // For performance reasons, store outbound requests.
  // This enables what would otherwise be multiple requests to
  // the same URL to resolve to the same fetch request.
  static outbound = {};


  /**
   * 
   * @param {Request} req 
   * @returns Response
   */


  /*
  @param cacheOptions - Object with two keys: 'cache' and 'params'. Constructor is the name of our cache implementation. Params is an object that will be passed to that constructor.
  */
  constructor(config = {}) {
    // Turns on and off hashing
    this.debug = config.debug || false;
    let cache = config['cacheOptions'] || null;
    this.cache = cache ? new cache['cache'](cache['params']) : null; // Dynamically instantiate our cache service from the config. Leave null to use browser cache.
  }


  send(req) {
    if (navigator.onLine == false) {
      throw new Error("Network offline.");
    }

      
    // Will hold any reference to a mocking class for the request.
    let mock;

    // Will hold a reference to the cached response, if there is one.
    let cached; 

    // Reference to the pending outbound request.
    let pending;

    // Key for our cache. If we are debugging, don't hash it. Otherwise, hash it.
    let key = this.debug ? req.method + req.url : HttpClient.cyrb53(req.method + req.url);

    // Get the cache control from our request headers. If there is no cache control, use an empty string.
    let cacheHeader = req.headers.get("cache-control") || "";
    let cacheControl = new _HttpHeader_js__WEBPACK_IMPORTED_MODULE_3__["default"](
      "cache-control",
      cacheHeader
    );

    // Store our complex condition in a variable. If the request is a GET, we have a caching solution, and the cache control doesn't specify no-cache.
    let usingCaching = req.method == "GET" && this.cache && !cacheControl.hasValue("no-cache"); 

    try {

      mock = this.getMock(req);

      if(mock)
      {
        return mock.getResponse(req);
      }


      // Check the cache for a response.
      if (usingCaching)
      {
        // cached = HttpCache.get(req);
        // check the cache for a matching response;
        // if nothing's there we return null.
        cached = this.cache.match(key);
        // Prefer a completed response, if one already happens to be in the cache.
        if(cached) return cached;
      }


      // If there is a pending request to the same URL, return it.
      if (false)
      {}


      // If we've made it this far, we need to go to the network to get the resource.
      pending = fetch(req).then((resp) => {

        // Remove the pending request, as we've now fulfilled it.
        delete HttpClient.outbound[key];


        // If we are using caching, store the response in the cache.
        if (usingCaching) {
            this.cache.put(key, resp.clone());
        } 


        return resp;
      });


      // Store the pending request.
      // This will prevent multiple unfulfilled requests to the same URL.
      HttpClient.outbound[key] = pending;


      return pending;

    } catch (e) {

      console.error(e);
      if (req.headers.get("Accept") == "application/json") {
        return Response.json({
          success: false,
          error: true,
          code: e.cause,
          message: e.message
        }, {status: 500});
      }

      else return new Response(e.message, {status: 500});
    }


  }

  static register(domain, mock) {
    let url = new _Url_js__WEBPACK_IMPORTED_MODULE_2__["default"](domain);
    domain = url.getDomain();

    HttpClient.mocks[domain] = mock;
  }

  getMock(req) {
    let url = new _Url_js__WEBPACK_IMPORTED_MODULE_2__["default"](req.url);
    let domain = url.getDomain();

    return HttpClient.mocks[domain];
  }

  static cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

}







/***/ }),

/***/ "./node_modules/@ocdla/lib-http/HttpHeader.js":
/*!****************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/HttpHeader.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HttpHeader)
/* harmony export */ });

class HttpHeader {

    constructor(name, value) {
        this.name = name;
        this.values = HttpHeader.parseValues(value);
    }

    // 1. theres 1 value, no commas: pass
    // 2. theres multiple value, commas: pass
    // 3. some of those values are parameters, semicolons and commas: 
    // 4. some of those parameters have values, semicolons, commas, and equals:

    static parseValues(value) {
        let map = {};
        let values = value.split(",");
        
        for (let i = 0; i < values.length; i++) {
            let current = values[i].trim();
            let [k,v] = current.split("="); // at index 0, when no "=", k = current, v = undefined
            map[k] = v;
        }

        return map;
    }

    /**
   * 
   * @returns {bool}
   */
    hasValue(v) {
        // if v doesn't exist, it returns undefined which is falsy
        return this.values.hasOwnProperty(v);
    }

    getParameter(k) {
        return this.values[k];
    }
    
    getName() {
        return this.name;
    }
} 

/***/ }),

/***/ "./node_modules/@ocdla/lib-http/HttpMock.js":
/*!**************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/HttpMock.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HttpMock)
/* harmony export */ });




// Mocking classes should extend this.
class HttpMock {

    constructor() {
        
    }

    /**
     * 
     * @param {Request} req 
     */
    getResponse(req) {
        
        switch (req.method) {
            case "GET":
                return this.get(req);
            case "POST":
                return this.post(req);
            case "PUT":
                return this.put(req);
            case "DELETE":
                return this.delete(req);
            default:
                return Response.error();
        }

        
    }
}



/***/ }),

/***/ "./node_modules/@ocdla/lib-http/Url.js":
/*!*********************************************!*\
  !*** ./node_modules/@ocdla/lib-http/Url.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Url)
/* harmony export */ });

const URL_SCHEME_SEPARATOR = "://";

const URL_PATH_SEPARATOR = "/";

const URL_QUERYSTRING_SEPARATOR = "?";

const URL_FRAGMENT_SEPARATOR = "#";

const SCHEME_HTTP = "http";

const SCHEME_HTTPS = "https";

const SCHEME_FILE = "file";


class Url {
    
    url = null;

    scheme = SCHEME_HTTP;

    domain = null;

    path = "";

    query = {};

    constructor(url) {

        this.url = url;
        
        let re = /:\/\/|\?/gis;

        let parts = this.url.split(re);

        this.scheme = parts.shift();

        let qs;

        if (parts.length == 2) {
            qs = parts.pop();
        }

        let d = parts[0];

        parts = d.split(URL_PATH_SEPARATOR);

        this.domain = parts.shift();

        this.path = URL_PATH_SEPARATOR + parts.join(URL_PATH_SEPARATOR);
        
        if (qs != null) {
            this.query = Url.parseQueryString(qs);
        }
    }

    static parseQueryString(qs) {
        let queryParts = qs.split("&");
        let query = {};
        for (let i = 0; i < queryParts.length; i++) {
            let kvp = queryParts[i];
            let parts = kvp.split("=");
            let key = parts[0];
            let value = parts[1];
            query[key] = value;
        }

        return query;
    }


    static formatQueryString(obj) {
        let params = [];
        for (let prop in obj) {
            let kvp;
            kvp = prop + "=" + obj[prop];
            params.push(kvp);
        };
        return params.join("&");
    }

    getLastPathSegment() {
        let parts = this.path.split("/");
        let last = parts.pop();
        return last;
    }


    getDomain() {
        return this.domain;
    }

    getScheme() {
        return this.scheme;
    }

    getPath() {
        return this.path;
    }

    getQuery() {
        return this.query;
    }

    buildQuery(key, value) {
        this.query[key] = value;
    }

    toString() {
        let queryString = "";
        let fragment = "";

        let kvpa = [];
        // start with our query object and build a string
        for (var prop in this.query) {

            let value = this.query[prop];
            let kvp = !value ? prop : (prop + "=" + this.query[prop]);
            kvpa.push(kvp);
        }

        queryString = !kvpa.length ? "" : (URL_QUERYSTRING_SEPARATOR + kvpa.join("&"));

        return this.scheme + URL_SCHEME_SEPARATOR + this.domain + this.path + queryString + fragment;
    }
} 

/***/ }),

/***/ "./node_modules/@ocdla/lib-http/caches/HttpCache.js":
/*!**********************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/caches/HttpCache.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HttpCache)
/* harmony export */ });
class HttpCache {

    static cache = {};

    put(key, resp) {
        HttpCache.cache[key] = resp;
    }

    get(key) {
        return HttpCache.cache[key] || null;
    }

    // Stay compatible with other cache interfaces.
    match(key) {
        return this.get(key);
    }


}

/***/ }),

/***/ "./node_modules/@ocdla/lib-http/caches/LocalStorage/LocalStorage.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/caches/LocalStorage/LocalStorage.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocalStorage)
/* harmony export */ });
class LocalStorage {
    // JSON Object that holds default string key names and default values if no values exist
    static DEFAULTS = {};

    constructor(config = {}) {
        // Define the default string keys to access the local storage. Expects JSON object with string keys and default value types.
        // EX. {"news": {lastFetch: new Date(), stories: null},  "favorites": new Array()}
        if (config.defaults !== undefined)
            LocalStorage.DEFAULTS = config.defaults;
    }

    // Using the string key, return from local storage the value stored. If it is undefined, search on the defaults object for a base structure
    getValue(key) { 
        return localStorage[key] === undefined ? LocalStorage.DEFAULTS[key] : JSON.parse(localStorage[key]); 
    }

    // Using the string key, set local storage to the passed value
    setValue(key, value) { 
        if (value !== undefined) 
            localStorage[key] = JSON.stringify(value); 
    }
   
    // Clear all local storage
    clearAll() { 
        // TODO: This should really be constrained to the keys that it accesses.
        localStorage.clear(); 
    }    
}

/***/ }),

/***/ "./node_modules/@ocdla/lib-http/caches/LocalStorage/LocalStorageResponse.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/caches/LocalStorage/LocalStorageResponse.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocalStorageResponse)
/* harmony export */ });
class LocalStorageResponse {

    headers = {};

    body = null;

    expires = null;

    constructor(body, headers, expires) {
        this.body = body;
        this.headers = headers || this.headers;
        this.expires = expires || this.expires;
    }

    addHeader(k, v) {
        this.headers[k] = v;
    }

    getHeaders() {
        return this.headers;
    }

    getBody() {
        return this.body;
    }


    toString() {
        return JSON.stringify(this);
    }

    /*
     Convert this object to a standard JavaScript Response object.
    */
    toResponse() {
        return Response.json(JSON.parse(this.body), {headers: this.headers});
    }

    // Convert stored JSON in the format '{"headers":{"h1":"h1","h2":"h2","h3":"h3"},"body":"{"prop1":"val1"}"}'.
    static fromJson(cachedJson) {
        const {body,headers,expires} = JSON.parse(cachedJson);

        return new LocalStorageResponse(body,headers,expires);
    }

    // Convert an instance JavaScript Response to an instance of this class.
    static fromHttpResponse(httpResp, expires=null) {
        let headers = new Headers(httpResp.headers);
        return httpResp.text().then( body => new LocalStorageResponse(body,headers,expires) );
    }
}

/***/ }),

/***/ "./node_modules/@ocdla/lib-http/caches/LocalStorageCache.js":
/*!******************************************************************!*\
  !*** ./node_modules/@ocdla/lib-http/caches/LocalStorageCache.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocalStorageCache)
/* harmony export */ });
/* harmony import */ var _LocalStorage_LocalStorageResponse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./LocalStorage/LocalStorageResponse.js */ "./node_modules/@ocdla/lib-http/caches/LocalStorage/LocalStorageResponse.js");
/* harmony import */ var _LocalStorage_LocalStorage_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LocalStorage/LocalStorage.js */ "./node_modules/@ocdla/lib-http/caches/LocalStorage/LocalStorage.js");




class LocalStorageCache {
    // @params: refresh - If refresh is specified, the cache will be refreshed every refresh seconds.
    constructor(config = {}) {
        this.refreshTime = config.refresh || null;
    }
    put(key, httpResp) {
        let expires = this.refreshTime >= 0 ? Date.now() + (this.refreshTime * 1000) : false
        let resp = _LocalStorage_LocalStorageResponse_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromHttpResponse(httpResp, expires);
        resp.then( resp => {      
            let localStorage = new _LocalStorage_LocalStorage_js__WEBPACK_IMPORTED_MODULE_1__["default"]();
            localStorage.setValue(key, resp.toString());
        });
    }

    get(key) {
        const localStorageParams = {
            defaults: {
                [key]: null
            }
        };

        // We get the value of the key. If there is nothing, we expect to get back null.
        let localStorage = new _LocalStorage_LocalStorage_js__WEBPACK_IMPORTED_MODULE_1__["default"](localStorageParams);
        let json = localStorage.getValue(key);

        if (json) {
            let cachedResp;
            cachedResp = _LocalStorage_LocalStorageResponse_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromJson(json);
            if (LocalStorageCache.isResponseFresh(cachedResp))
                return cachedResp.toResponse();
        }
        
        return null;

    }

    match(key) {
        return this.get(key);
    }

    // Returns true if the cached response is fresh: i.e. not stale.
    static isResponseFresh(entry) {
        let expires = entry.expires;
        if (!expires) return true;
        return Date.now() < new Date(expires).getTime();
    }
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Body.jsx":
/*!************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Body.jsx ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Body)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */

function Body(_ref) {
  var typeOrs = _ref.typeOrs,
    children = _ref.children;
  return /* prettier-ignore */(
    (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("section", {
      id: "body",
      "class": "".concat(typeOrs ? '[&_*]:mb-4 ' : '', "flex w-full flex-col gap-4 p-4 lg:col-span-4 lg:col-start-2 lg:me-auto lg:border-x lg:p-8")
    }, children)
  );
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/BreadcrumbItem.jsx":
/*!**********************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/BreadcrumbItem.jsx ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BreadcrumbItem)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function BreadcrumbItem(_ref) {
  var href = _ref.href,
    label = _ref.label;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: href
  }, label));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Breadcrumbs.jsx":
/*!*******************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Breadcrumbs.jsx ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Breadcrumbs)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _BreadcrumbItem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BreadcrumbItem */ "./node_modules/@ocdla/global-components/src/BreadcrumbItem.jsx");
/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Breadcrumbs(_ref) {
  var _ref$crumbs = _ref.crumbs,
    crumbs = _ref$crumbs === void 0 ? [] : _ref$crumbs;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("section", {
    "class": "flex items-center border border-t-0 p-4 capitalize text-black lg:h-16"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-wrap items-center whitespace-pre"
  }, crumbs.map(function (crumb, i) {
    var seperatorString = i !== crumbs.length - 1 ? ' / ' : ' ';
    return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_BreadcrumbItem__WEBPACK_IMPORTED_MODULE_1__["default"], crumb), seperatorString);
  })));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Button.jsx":
/*!**************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Button.jsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Button)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/global-components/src/Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */


function Button(_ref) {
  var href = _ref.href,
    label = _ref.label;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("a", {
    "class": "group flex items-center p-4",
    href: href
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("span", {
    "class": _ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_1__.defaultButtonStyle
  }, label)));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Defaults.jsx":
/*!****************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Defaults.jsx ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Link),
/* harmony export */   defaultButtonStyle: () => (/* binding */ defaultButtonStyle),
/* harmony export */   defaultLinkStyle: () => (/* binding */ defaultLinkStyle)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */

var defaultLinkStyle = 'hover:underline-blue-500 text-blue-400 hover:opacity-[67.5%] hover:underline hover:underline-offset-2';
var defaultButtonStyle = 'text-nowrap rounded-md border border-black bg-black px-3 py-2 font-bold text-white';
function Link(_ref) {
  var _ref$classes = _ref.classes,
    classes = _ref$classes === void 0 ? defaultLinkStyle : _ref$classes,
    extraClasses = _ref.extraClasses,
    href = _ref.href,
    children = _ref.children,
    id = _ref.id;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("a", {
    id: id || null,
    "class": "".concat(classes).concat(extraClasses ? " ".concat(extraClasses) : ''),
    href: href || null
  }, children);
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Dividers.jsx":
/*!****************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Dividers.jsx ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DividerDesktop: () => (/* binding */ DividerDesktop),
/* harmony export */   DividerMobile: () => (/* binding */ DividerMobile)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */

var DividerDesktop = function DividerDesktop() {
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "hidden text-neutral-300 lg:block"
  }, "|");
};
var DividerMobile = function DividerMobile() {
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "block size-full lg:hidden"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("hr", null));
};

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Dropdown.jsx":
/*!****************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Dropdown.jsx ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dropdown)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Dropdown(_ref) {
  var href = _ref.href,
    label = _ref.label;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    classes: "border lg:border-t-0 hover:border-neutral-200 bg-neutral-50 px-12 py-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600",
    href: href
  }, label));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Footer.jsx":
/*!**************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Footer.jsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Footer)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/* harmony import */ var _Logo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Logo */ "./node_modules/@ocdla/global-components/src/Logo.jsx");
/* harmony import */ var _Social__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Social */ "./node_modules/@ocdla/global-components/src/Social.jsx");
/* harmony import */ var _GoogleMaps__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./GoogleMaps */ "./node_modules/@ocdla/global-components/src/GoogleMaps.jsx");
/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */





/* eslint-enable */

function Footer(_ref) {
  var showFacebook = _ref.showFacebook,
    showTwitter = _ref.showTwitter,
    showYouTube = _ref.showYouTube,
    useGoogleMapsIFrame = _ref.useGoogleMapsIFrame;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("footer", {
    "class": "container mx-auto border border-b-0 p-4 pb-16 lg:p-8 lg:pb-32"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-4"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-4 lg:flex-row lg:gap-8"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-1"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex items-center gap-1"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Logo__WEBPACK_IMPORTED_MODULE_2__["default"], null), showFacebook ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Social__WEBPACK_IMPORTED_MODULE_3__["default"], {
    type: "facebook",
    handle: "OregonCriminalDefenseLawyersAssociation"
  }) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null), showTwitter ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Social__WEBPACK_IMPORTED_MODULE_3__["default"], {
    type: "twitter",
    handle: "oregondefense"
  }) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null), showYouTube ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Social__WEBPACK_IMPORTED_MODULE_3__["default"], {
    type: "youtube",
    handle: "oregoncriminaldefenselawye4822"
  }) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null))), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "text-[0.625rem] font-thin leading-[0.75rem] text-neutral-500"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, "\xA9 2024 Oregon Criminal Defense Lawyers Association"), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full text-wrap"
  }, "Oregon Criminal Defense Lawyers Association is a 501(c)(3) nonprofit educational association. Contributions to OCDLA may be tax deductible - check with your tax advisor. Electronic downloads are for the sole use of the purchasing member. Files may not be distributed to others."))), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "text-neutral-300"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://ocdla.org"
  }, "ocdla.org"), ' ', !useGoogleMapsIFrame ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null, "|", ' ', (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://maps.app.goo.gl/7dCYKBEyJbmo8tzS7"
  }, "101 East 14th Ave, Eugene, OR 97401"), ' ') : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null), "|", ' ', (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "mailto:info@ocdla.org"
  }, "info@ocdla.org"), ' ', "|", ' ', (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "tel:+15416868716"
  }, "(+1) 541-686-8716"))))), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-8 text-nowrap text-[#516490] lg:flex-row lg:gap-16"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-1"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("p", {
    "class": "text-base font-bold"
  }, "SERVICES")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://pubs.ocdla.org/directory/members"
  }, "Membership Directory")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://pubs.ocdla.org/directory/experts"
  }, "Expert Directory")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "/"
  }, "Online store")))), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-1"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("p", {
    "class": "text-base font-bold"
  }, "RESEARCH")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://pubs.ocdla.org/car/list"
  }, "Research Criminal Appellate Review")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://lod.ocdla.org/"
  }, "Library of Defense")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://lod.ocdla.org/Public:Subscriptions"
  }, "Books Online")))), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-1"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("p", {
    "class": "text-base font-bold"
  }, "RESOURCES")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "/"
  }, "CLEs")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "/"
  }, "Videos")), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "/"
  }, "Seminars & Events")))))))), useGoogleMapsIFrame ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_GoogleMaps__WEBPACK_IMPORTED_MODULE_4__["default"], {
    src: "https://google.com/maps/embed?pb=!1m18!1m12!1m3!1d2867.8775315978623!2d-123.09091950000001!3d44.0445852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54c11e41b2e3f7ad%3A0xa7600cd512aa10ed!2s101%20E%2014th%20Ave%2C%20Eugene%2C%20OR%2097401!5e0!3m2!1sen!2sus!4v1722628072318!5m2!1sen!2sus"
  }) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null)));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/GoogleMaps.jsx":
/*!******************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/GoogleMaps.jsx ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GoogleMaps)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */

function GoogleMaps(_ref) {
  var src = _ref.src;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("iframe", {
    "class": "aspect-square w-full border-0 lg:w-64",
    src: src,
    allowfullscreen: true,
    referrerpolicy: "no-referrer-when-downgrade"
  })));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Logo.jsx":
/*!************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Logo.jsx ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Logo)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _images_logo_ocdla_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./images/logo_ocdla.png */ "./node_modules/@ocdla/global-components/src/images/logo_ocdla.png");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */


function Logo(_ref) {
  var typeNavbar = _ref.typeNavbar;
  // Default = 'footer'
  var li = typeNavbar ? 'size-full' : '';
  var a = typeNavbar ? 'flex px-4' : '';
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": li
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("a", {
    "class": a,
    href: "/"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("img", {
    "class": "h-16",
    src: _images_logo_ocdla_png__WEBPACK_IMPORTED_MODULE_1__
  })));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Navbar.jsx":
/*!**************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Navbar.jsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Navbar)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Logo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Logo */ "./node_modules/@ocdla/global-components/src/Logo.jsx");
/* harmony import */ var _Navlink__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Navlink */ "./node_modules/@ocdla/global-components/src/Navlink.jsx");
/* harmony import */ var _Dividers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Dividers */ "./node_modules/@ocdla/global-components/src/Dividers.jsx");
/* harmony import */ var _Search__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Search */ "./node_modules/@ocdla/global-components/src/Search.jsx");
/* harmony import */ var _Profile__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Profile */ "./node_modules/@ocdla/global-components/src/Profile.jsx");
/* harmony import */ var _Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Button */ "./node_modules/@ocdla/global-components/src/Button.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */







/* eslint-enable */

function Navbar() {
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("nav", {
    "class": "flex flex-col border border-0 border-b lg:h-16 lg:flex-row lg:border lg:border-t-0"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex size-full flex-col items-start lg:flex-row lg:items-center"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full lg:size-max"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col items-center lg:flex-row"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Logo__WEBPACK_IMPORTED_MODULE_1__["default"], {
    typeNavbar: true
  }), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Navlink__WEBPACK_IMPORTED_MODULE_2__["default"], {
    href: "https://oregon.public.law/rules"
  }, "Oregon Administrative Rules"), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Navlink__WEBPACK_IMPORTED_MODULE_2__["default"]
  // href='https://oregon.public.law/statutes'
  , {
    href: "/toc"
  }, "Oregon Revised Statutes"))), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Dividers__WEBPACK_IMPORTED_MODULE_3__.DividerMobile, null), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full lg:ms-auto lg:size-max"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("form", {
    "class": "m-4 flex flex-col items-start lg:m-0 lg:flex-row lg:items-center",
    onsubmit: function onsubmit(e) {
      e.preventDefault();
      window.location.pathname = '/';
    }
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Search__WEBPACK_IMPORTED_MODULE_4__["default"], {
    typeNavbar: true,
    placeholder: "Search"
  }), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Dividers__WEBPACK_IMPORTED_MODULE_3__.DividerDesktop, null), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-row-reverse items-center lg:flex-row"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Profile__WEBPACK_IMPORTED_MODULE_5__["default"], {
    bg: "bg-[#516490]",
    label: "G"
  }), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Dividers__WEBPACK_IMPORTED_MODULE_3__.DividerDesktop, null), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Button__WEBPACK_IMPORTED_MODULE_6__["default"], {
    href: "/",
    label: "GIVE FEEDBACK"
  })))))));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Navlink.jsx":
/*!***************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Navlink.jsx ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Navlink)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Navlink(_ref) {
  var active = _ref.active,
    href = _ref.href,
    children = _ref.children;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    classes: "".concat(active ? 'font-bold ' : '', "items-center lg:h-16 flex text-nowrap text-neutral-500 hover:opacity-[67.5%] hover:underline hover:underline-offset-2 p-4"),
    href: href
  }, children));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/NotFound.jsx":
/*!****************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/NotFound.jsx ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ NotFound)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */

function NotFound() {
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    "class": "flex flex-col items-center gap-4 bg-black p-32 text-white"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h1", {
    "class": "text-center text-7xl font-black tracking-tighter"
  }, "404"), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h6", {
    "class": "text-2xl font-thin"
  }, "Something Went Wrong"), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("a", {
    "class": "rounded-md border border-black bg-white p-4 font-bold text-black",
    href: "/"
  }, "RETURN HOME"));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Profile.jsx":
/*!***************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Profile.jsx ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Profile)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Dropdown__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Dropdown */ "./node_modules/@ocdla/global-components/src/Dropdown.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Profile(_ref) {
  var bg = _ref.bg,
    label = _ref.label;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "relative"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("button", {
    "class": "group peer flex h-16 items-center p-4",
    type: "button"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    "class": "".concat(bg ? "".concat(bg, " ") : '', "h-[34px] w-[34px] flex items-center text-white justify-center rounded-full group-hover:opacity-[67.5%] focus-within:opacity-[67.5%]")
  }, label)), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "absolute left-[-1rem] top-[calc(100%+0.5rem)] z-10 hidden -translate-x-1/2 flex-col text-nowrap shadow peer-focus-within:flex lg:left-1/2"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Dropdown__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: "https://oregon.public.law/users/sign_in",
    label: "Login"
  })));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Search.jsx":
/*!**************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Search.jsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Search)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/global-components/src/Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


function Search(_ref) {
  var typeNavbar = _ref.typeNavbar,
    placeholder = _ref.placeholder;
  // prettier-ignore
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "".concat(typeNavbar ? 'px-4 lg:p-4 ' : '', "flex size-full justify-center")
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("input", {
    "class": "size-full rounded-l-md border border-neutral-300 px-3 py-2 focus:border-neutral-200",
    type: "search",
    placeholder: placeholder
  }), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("button", {
    "class": "".concat(_ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_1__.defaultButtonStyle, " rounded-l-none")
  }, "GO"));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Sidebar.jsx":
/*!***************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Sidebar.jsx ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Sidebar)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable no-unused-vars */

function Sidebar(_ref) {
  var children = _ref.children,
    id = _ref.id,
    _ref$sticky = _ref.sticky,
    sticky = _ref$sticky === void 0 ? false : _ref$sticky;
  return /* prettier-ignore */(
    (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("aside", {
      id: id || null,
      "class": "".concat(sticky ? 'lg:sticky lg:top-0 ' : '', "hidden h-[87.5vh] list-none overflow-y-scroll lg:block")
    }, children)
  );
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/SidebarItemLeft.jsx":
/*!***********************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/SidebarItemLeft.jsx ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SidebarItemLeft)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */

function SidebarItemLeft(_ref) {
  var active = _ref.active,
    href = _ref.href,
    heading = _ref.heading,
    label = _ref.label,
    id = _ref.id;
  var a = 'group hover:bg-neutral-100';
  var h = 'text-blue-400 group-hover:text-blue-500 ';
  var p = '';
  if (active) {
    a = 'text-white border-black bg-black';
    h = '';
    p = 'text-white';
  }
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("a", {
    id: id || null,
    "class": "".concat(a, " flex flex-col gap-2 border-b px-4 py-2"),
    href: href
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h1", {
    "class": "".concat(h, "font-bold")
  }, heading), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("p", {
    "class": p
  }, label)));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/SidebarItemRight.jsx":
/*!************************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/SidebarItemRight.jsx ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SidebarItemRight)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function SidebarItemRight(_ref) {
  var href = _ref.href,
    label = _ref.label;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    extraClasses: "flex border-b px-4 py-2",
    href: href
  }, label));
}

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/Social.jsx":
/*!**************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/Social.jsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Social)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/* harmony import */ var _images_logo_facebook_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./images/logo_facebook.png */ "./node_modules/@ocdla/global-components/src/images/logo_facebook.png");
/* harmony import */ var _images_logo_twitter_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./images/logo_twitter.png */ "./node_modules/@ocdla/global-components/src/images/logo_twitter.png");
/* harmony import */ var _images_logo_youtube_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./images/logo_youtube.png */ "./node_modules/@ocdla/global-components/src/images/logo_youtube.png");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */
// import abc from './images';



function Social(_ref) {
  var type = _ref.type,
    handle = _ref.handle,
    src = _ref.src;
  // require.context('./', true, /\.(svg|png)$/gim);

  var domain;
  var alt;
  handle = handle || '';

  // console.log(abc);

  switch (type) {
    case 'facebook':
    case 'meta':
      domain = 'https://facebook.com/';
      src = src || _images_logo_facebook_png__WEBPACK_IMPORTED_MODULE_2__;
      alt = 'Facebook logo';
      break;
    case 'twitter':
    case 'x':
      domain = 'https://x.com/';
      src = src || _images_logo_twitter_png__WEBPACK_IMPORTED_MODULE_3__;
      alt = 'Twitter logo';
      break;
    case 'youtube':
      domain = 'https://youtube.com/@';
      // Temp
      src = src || _images_logo_youtube_png__WEBPACK_IMPORTED_MODULE_4__;
      alt = 'YouTube logo';
      break;
    case 'reddit':
      domain = 'https://reddit.com/r/';
      // TBD
      src = src || _images_logo_twitter_png__WEBPACK_IMPORTED_MODULE_3__;
      alt = 'Reddit logo';
      break;
  }
  var href = domain + handle;
  // const src = './images/' + type + '.png';

  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    classes: "hover:opacity-[67.5%]",
    href: href
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("img", {
    "class": "w-8",
    src: src,
    alt: alt
  })));
}

/***/ }),

/***/ "./src/js/App.jsx":
/*!************************!*\
  !*** ./src/js/App.jsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _ocdla_global_components_src_Navbar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/global-components/src/Navbar */ "./node_modules/@ocdla/global-components/src/Navbar.jsx");
/* harmony import */ var _ocdla_global_components_src_Breadcrumbs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ocdla/global-components/src/Breadcrumbs */ "./node_modules/@ocdla/global-components/src/Breadcrumbs.jsx");
/* harmony import */ var _ocdla_global_components_src_Footer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ocdla/global-components/src/Footer */ "./node_modules/@ocdla/global-components/src/Footer.jsx");
/**
 * @fileoverview This file is the meat-and-potatoes of the ORS Viewer application and contains the general layout.
 */

/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */



// import NotFound from '@ocdla/global-components/src/NotFound';

/* eslint-enable */

function App(_ref) {
  var headerPinned = _ref.headerPinned,
    breadcrumbs = _ref.breadcrumbs,
    children = _ref.children;
  // There is a component that can be used to render a nice 404 error.
  // return <NotFound />;

  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("header", {
    /* prettier-ignore */
    "class": "".concat(headerPinned ? 'sticky top-0 ' : '', "container mx-auto flex w-full flex-col bg-white lg:h-32")
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Navbar__WEBPACK_IMPORTED_MODULE_1__["default"], null), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Breadcrumbs__WEBPACK_IMPORTED_MODULE_2__["default"], {
    crumbs: breadcrumbs
  })), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("main", {
    "class": "container mx-auto border-x"
  }, children), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Footer__WEBPACK_IMPORTED_MODULE_3__["default"], {
    showFacebook: true,
    showTwitter: true,
    showYouTube: true,
    useGoogleMapsIFrame: true
  }));
}

/***/ }),

/***/ "./src/js/components/Chapter.jsx":
/*!***************************************!*\
  !*** ./src/js/components/Chapter.jsx ***!
  \***************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Chapter)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _ocdla_global_components_src_Sidebar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/global-components/src/Sidebar */ "./node_modules/@ocdla/global-components/src/Sidebar.jsx");
/* harmony import */ var _ocdla_global_components_src_SidebarItemLeft__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ocdla/global-components/src/SidebarItemLeft */ "./node_modules/@ocdla/global-components/src/SidebarItemLeft.jsx");
/* harmony import */ var _ocdla_global_components_src_SidebarItemRight__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ocdla/global-components/src/SidebarItemRight */ "./node_modules/@ocdla/global-components/src/SidebarItemRight.jsx");
/* harmony import */ var _css_chapter_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../css/chapter.css */ "./src/css/chapter.css");
/* harmony import */ var _ocdla_global_components_src_Body__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ocdla/global-components/src/Body */ "./node_modules/@ocdla/global-components/src/Body.jsx");
/* harmony import */ var _functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../functions/ors/fetch_data.js */ "./src/js/functions/ors/fetch_data.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__]);
_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */







/* eslint-enable */

function Chapter(_ref) {
  var chapter = _ref.chapter;
  // useEffect assigns a function (to be executed on each render) to a key.
  // The key can be used in getResult(key) to get the result of the function.
  (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.useEffect)('theChapter', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__.getBody)(chapter);
        case 2:
          return _context.abrupt("return", _context.sent);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  })));
  (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.useEffect)('sidebarFirst', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__.getSections)(chapter, window.location.hash, true);
        case 2:
          return _context2.abrupt("return", _context2.sent);
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  })));
  (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.useEffect)('sidebarSecond', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__.getSidebarSecond)(chapter, window.location.hash, true);
        case 2:
          return _context3.abrupt("return", _context3.sent);
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  })));
  var chapterContents = (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.getResult)('theChapter');
  var sidebarFirst = (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.getResult)('sidebarFirst');
  var sidebarSecond = (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.getResult)('sidebarSecond');
  var title = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_6__.getNode)('ch-' + chapter).getAttribute('name');

  /*
      From React grammar for using innerHTML:
       <div dangerouslySetInnerHTML={
          { __html: htmlContent }
      } />
  */
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    "class": "lg:grid lg:grid-cols-6"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Sidebar__WEBPACK_IMPORTED_MODULE_1__["default"], {
    sticky: true
  }, sidebarFirst ? sidebarFirst.map(function (props) {
    return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_SidebarItemLeft__WEBPACK_IMPORTED_MODULE_2__["default"], props);
  }) : null), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Body__WEBPACK_IMPORTED_MODULE_5__["default"], {
    typeOrs: true
  }, ' ', (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h1", {
    "class": "text-2xl font-bold"
  }, "Chapter ", chapter, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("br", null), title), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    dangerouslySetInnerHTML: chapterContents
  }), ' '), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Sidebar__WEBPACK_IMPORTED_MODULE_1__["default"], {
    sticky: true
  }, sidebarSecond ? sidebarSecond.map(function (props) {
    return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_SidebarItemRight__WEBPACK_IMPORTED_MODULE_3__["default"], props);
  }) : null));
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "./src/js/components/Search.jsx":
/*!**************************************!*\
  !*** ./src/js/components/Search.jsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Search)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _ocdla_global_components_src_Search__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/global-components/src/Search */ "./node_modules/@ocdla/global-components/src/Search.jsx");
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Search() {
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    "class": "flex flex-col items-center gap-8 p-4 text-center lg:p-32"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h3", {
    "class": "text-5xl font-black tracking-tighter"
  }, "SEARCH THROUGH THE ORS"), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("form", {
    "class": "flex h-12 w-full justify-center rounded-md bg-red-600 lg:w-2/3",
    onsubmit: function onsubmit(e) {
      e.preventDefault();
      window.location.pathname = '/toc';
    }
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex size-full rounded-md bg-blue-600"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Search__WEBPACK_IMPORTED_MODULE_1__["default"], {
    placeholder: "Search"
  }))));
}

/***/ }),

/***/ "./src/js/components/toc/Chapters_Toc.jsx":
/*!************************************************!*\
  !*** ./src/js/components/toc/Chapters_Toc.jsx ***!
  \************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Chapters_Toc)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Table_Of_Contents */ "./src/js/components/toc/Table_Of_Contents.jsx");
/* harmony import */ var _functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../functions/ors/fetch_data.js */ "./src/js/functions/ors/fetch_data.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__]);
_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Chapters_Toc(_ref) {
  var division = _ref.division,
    title = _ref.title;
  var _title = 'TITLE ' + title;
  var subtitle = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getNode)('title-' + title).getAttribute('name');
  var entries = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getChapters)(title);
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__["default"], {
    division: division,
    title: _title,
    subtitle: subtitle,
    entries: entries
  });
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "./src/js/components/toc/Entry.jsx":
/*!*****************************************!*\
  !*** ./src/js/components/toc/Entry.jsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Entry)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/global-components/src/Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Entry(_ref) {
  var href = _ref.href,
    id = _ref.id,
    heading = _ref.heading,
    label = _ref.label;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", {
    "class": "size-full"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("a", {
    "class": "flex size-full p-4 hover:bg-neutral-100",
    href: href
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex gap-4"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_1__["default"], {
    href: href,
    extraClasses: 'font-bold'
  }, id)), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "flex flex-col gap-2"
  }, heading ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h1", {
    "class": "font-bold"
  }, heading)) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null), label ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("p", {
    "class": "text-neutral-500"
  }, label)) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null))))));
}

/***/ }),

/***/ "./src/js/components/toc/Sections_Toc.jsx":
/*!************************************************!*\
  !*** ./src/js/components/toc/Sections_Toc.jsx ***!
  \************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Sections_Toc)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Table_Of_Contents */ "./src/js/components/toc/Table_Of_Contents.jsx");
/* harmony import */ var _functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../functions/ors/fetch_data.js */ "./src/js/functions/ors/fetch_data.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__]);
_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

var entries = window.location.pathname.includes('chapter') ? await (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getSections)(window.location.pathname.split('/').pop()) : null;
function Sections_Toc(_ref) {
  var division = _ref.division,
    chapter = _ref.chapter;
  var _chapter = 'CHAPTER ' + chapter;
  var subtitle = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getNode)('ch-' + chapter).getAttribute('name');
  // const entries = [];

  // new Promise()

  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__["default"], {
    division: division,
    title: _chapter,
    subtitle: subtitle,
    entries: entries
  });
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ "./src/js/components/toc/Table_Of_Contents.jsx":
/*!*****************************************************!*\
  !*** ./src/js/components/toc/Table_Of_Contents.jsx ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Table_Of_Contents)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Entry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Entry */ "./src/js/components/toc/Entry.jsx");
/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */

// import Statute from './Statute';

/* eslint-enable */

function Table_Of_Contents(_ref) {
  var division = _ref.division,
    title = _ref.title,
    subtitle = _ref.subtitle,
    _ref$entries = _ref.entries,
    entries = _ref$entries === void 0 ? [] : _ref$entries;
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    "class": "flex flex-col gap-8"
  }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("div", {
    "class": "flex flex-col gap-2 p-8 text-center"
  }, title ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h3", {
    "class": "text-5xl font-black tracking-tighter"
  }, title) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null), subtitle ? (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h6", {
    "class": "text-2xl font-thin"
  }, subtitle) : (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("Fragment", null)), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("h1", {
    "class": "p-4 text-3xl font-bold"
  }, division)), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("hr", null)), (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("li", null, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)("ul", {
    "class": "lg:grid lg:grid-flow-row lg:grid-cols-2 [&>*:nth-child(2n):last-child]:border-b-0 [&>*:nth-child(2n+1):nth-last-child(-n+2)]:border-b-0 [&>*:nth-child(2n+1)]:border-r [&>*]:border-b"
  }, entries.map(function (entry) {
    return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Entry__WEBPACK_IMPORTED_MODULE_1__["default"], entry);
  })))));
}

/***/ }),

/***/ "./src/js/components/toc/Titles_Toc.jsx":
/*!**********************************************!*\
  !*** ./src/js/components/toc/Titles_Toc.jsx ***!
  \**********************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Titles_Toc)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Table_Of_Contents */ "./src/js/components/toc/Table_Of_Contents.jsx");
/* harmony import */ var _functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../functions/ors/fetch_data.js */ "./src/js/functions/ors/fetch_data.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__]);
_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Titles_Toc(_ref) {
  var division = _ref.division,
    volume = _ref.volume;
  var entries = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getTitles)(volume);
  var title = 'VOLUME ' + volume;
  var subtitle = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getNode)('vol-' + volume).getAttribute('name');
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__["default"], {
    division: division,
    title: title,
    subtitle: subtitle,
    entries: entries
  });
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "./src/js/components/toc/Volumes_Toc.jsx":
/*!***********************************************!*\
  !*** ./src/js/components/toc/Volumes_Toc.jsx ***!
  \***********************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Volumes_Toc)
/* harmony export */ });
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Table_Of_Contents */ "./src/js/components/toc/Table_Of_Contents.jsx");
/* harmony import */ var _functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../functions/ors/fetch_data.js */ "./src/js/functions/ors/fetch_data.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__]);
_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
/** @jsx vNode */
/* eslint-disable no-unused-vars */


/* eslint-enable */

function Volumes_Toc(_ref) {
  var division = _ref.division,
    title = _ref.title;
  var entries = (0,_functions_ors_fetch_data_js__WEBPACK_IMPORTED_MODULE_2__.getVolumes)();
  return (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_0__.vNode)(_Table_Of_Contents__WEBPACK_IMPORTED_MODULE_1__["default"], {
    division: division,
    title: title,
    entries: entries
  });
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "./src/js/functions/ors/fetch_data.js":
/*!********************************************!*\
  !*** ./src/js/functions/ors/fetch_data.js ***!
  \********************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getBody: () => (/* binding */ getBody),
/* harmony export */   getBreadcrumbs: () => (/* binding */ getBreadcrumbs),
/* harmony export */   getChapters: () => (/* binding */ getChapters),
/* harmony export */   getNode: () => (/* binding */ getNode),
/* harmony export */   getSections: () => (/* binding */ getSections),
/* harmony export */   getSidebarSecond: () => (/* binding */ getSidebarSecond),
/* harmony export */   getTitles: () => (/* binding */ getTitles),
/* harmony export */   getVolumes: () => (/* binding */ getVolumes)
/* harmony export */ });
/* harmony import */ var _mock_OrsMock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../mock/OrsMock */ "./src/js/mock/OrsMock.js");
/* harmony import */ var _ocdla_lib_http_Url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/lib-http/Url */ "./node_modules/@ocdla/lib-http/Url.js");
/* harmony import */ var _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ocdla/lib-http/HttpClient */ "./node_modules/@ocdla/lib-http/HttpClient.js");
/* harmony import */ var _ocdla_ors_src_Chapter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ocdla/ors/src/Chapter */ "./node_modules/@ocdla/ors/src/Chapter.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * @fileoverview This file contains ORS Viewer fetch functions.
 */





if (true) _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_2__["default"].register('https://ors.ocdla.org', new _mock_OrsMock__WEBPACK_IMPORTED_MODULE_0__["default"]());
var baseUrl = '/toc';
var client = new _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_2__["default"]();
var req = new Request('https://ors.ocdla.org/index.xml');
// const req = new Request(
//     'https://raw.githubusercontent.com/ocdladefense/ors-viewer/toc/src/data/xml/ors_viewer/statutes.xml'
// );
var resp = await client.send(req);
var xml = await resp.text();
var parser = new DOMParser();
var parsedXML = parser.parseFromString(xml, 'application/xml');

/**
 * @description Gets a certain element from a previously fetched XML file.
 * @example
 *  getNode(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted element.
 * @returns {HTMLElement} Returns an array of [volume] objects.
 */

var getNode = function getNode(paramId) {
  return parsedXML.getElementById(paramId);
};

/**
 * @description Gets all of the volumes from a previously fetched XML file.
 * @example
 * getVolumes()
 * @returns {string} Returns an array of [volume] objects.
 */

var getVolumes = function getVolumes() {
  var xmlVolumes = parsedXML.getElementsByTagName('volume');
  var jsonArray = [];
  Array.from(xmlVolumes).forEach(function ($volume) {
    var volumeId = $volume.getAttribute('id').split('-')[1];
    var volumeHref = baseUrl + '/volume/' + volumeId;
    var volumeName = $volume.getAttribute('name');
    var volumeVolumes = $volume.getElementsByTagName('title');
    var volumeFirstChild = volumeVolumes[0];
    var volumeLastChild = volumeVolumes[Object.keys(volumeVolumes).at(-1)];
    // volumeVolumes[volumeVolumes.length - 1];
    var volumeChapterRange = 'Chapters ' + volumeFirstChild.getAttribute('range').split('-')[0] + '-' + volumeLastChild.getAttribute('range').split('-')[1];
    jsonArray.push({
      href: volumeHref,
      id: volumeId,
      heading: volumeName,
      label: volumeChapterRange
    });
  });
  return jsonArray;
};

/**
 * @description Gets all of the chapters for a title from a previously fetched XML file.
 * @example
 * getTitles(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted title.
 * @returns {string} Returns an array of [chapter] objects.
 */

var getTitles = function getTitles(paramId) {
  var xmlTitles = parsedXML.getElementsByTagName('title');
  var jsonArray = [];
  Array.from(xmlTitles).forEach(function ($title) {
    var titleId = $title.getAttribute('id').split('-')[1];
    var titleHref = baseUrl + '/title/' + titleId;
    var titleName = $title.getAttribute('name');
    var titleChapterRange = 'Chapters ' + $title.getAttribute('range');
    var volumeId = $title.parentElement.getAttribute('id').split('-')[1];
    if (paramId === volumeId) {
      jsonArray.push({
        href: titleHref,
        id: titleId,
        heading: titleName,
        label: titleChapterRange
      });
    }
  });
  return jsonArray;
};

/**
 * @description Gets all of the sections for a chapter from a previously fetched XML file.
 * @example
 * getChapters(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @returns {string} Returns an array of [section] objects.
 */

var getChapters = function getChapters(paramId) {
  var xmlChapters = parsedXML.getElementsByTagName('chapter');
  var jsonArray = [];
  Array.from(xmlChapters).forEach(function ($chapter) {
    var titleId = $chapter.parentElement.getAttribute('id').split('-')[1];
    var chapterId = $chapter.getAttribute('id').split('-')[1];
    var chapterHref = baseUrl + '/chapter/' + chapterId;
    var chapterName = $chapter.getAttribute('name');
    if (paramId === titleId) {
      jsonArray.push({
        href: chapterHref,
        id: chapterId,
        label: chapterName
      });
    }
  });
  return jsonArray;
};

/**
 * @description Gets all of the sections for a chapter from fetched data from a remote PHP file.
 * @example
 * getSections(7, '1010', true)
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @param {string} hash - Accepts a string as the id of the wanted section.
 * @param {boolean} [fromSidebar] - Optionally accepts a boolean to determine whether the fetched sections are for sidebar first.
 * @returns {string} Returns an array of [section] objects.
 */

var getSections = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(paramId, hash, fromSidebar) {
    var url, client, req, resp, msword, xml, jsonArray;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          // const url = new Url('https://ors.ocdla.org/index.xml');
          url = new _ocdla_lib_http_Url__WEBPACK_IMPORTED_MODULE_1__["default"]('https://appdev.ocdla.org/books-online/index.php');
          url.buildQuery('chapter', paramId.toString());
          client = new _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_2__["default"]();
          req = new Request(url.toString());
          _context.next = 6;
          return client.send(req);
        case 6:
          resp = _context.sent;
          _context.next = 9;
          return _ocdla_ors_src_Chapter__WEBPACK_IMPORTED_MODULE_3__["default"].fromResponse(resp);
        case 9:
          msword = _context.sent;
          xml = _ocdla_ors_src_Chapter__WEBPACK_IMPORTED_MODULE_3__["default"].toStructuredChapter(msword);
          jsonArray = [];
          xml.sectionTitles.map(function ($section, sectionIndex) {
            var chapterName = parsedXML.getElementById('ch-' + paramId).getAttribute('name');
            var chapterString = paramId + '.' + sectionIndex.toString().padStart(3, '0');
            var matchFound = paramId === chapterString.split('.')[0];
            if (matchFound) {
              var hashId = hash ? hash.split('-')[1] : null;
              jsonArray.push({
                chapterName: chapterName,
                id: chapterString,
                active: fromSidebar && hashId ? sectionIndex === parseInt(hashId) : null,
                href: '/chapter/' + paramId + '#section-' + sectionIndex,
                heading: fromSidebar ? chapterString : null,
                label: $section
              });
            }
          });
          return _context.abrupt("return", jsonArray);
        case 14:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function getSections(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * @description Gets one or more breadcrumb links (default, active volume, active title, active chapter or active section).
 * @example
 * getBreadcrumbs('titles', 7, '1010')
 * @param {string} [type] - Optionally accepts a string to determine which element type is wanted.
 * @param {number} [paramId] - Optionally accepts an integer as the id of the wanted volume, title or chapter.
 * @param {string} [hash] - Optionally accepts a string as the id of the wanted section.
 * @returns {string} Returns an array of [hyperlink] objects.
 */

var getBreadcrumbs = function getBreadcrumbs(type, paramId, hash) {
  var node;
  var jsonArray = [];
  switch (type) {
    case 'titles':
      node = getNode('vol-' + paramId);
      break;
    case 'chapters':
      node = getNode('title-' + paramId);
      break;
    case 'sections':
    case 'chapter':
      node = getNode('ch-' + paramId);
      break;
  }
  if (node) {
    var URL_FRONT_SLASH = '/';
    var CHAR_SPACE = ' ';
    var hashId = hash ? hash.split('-')[1] : paramId ? paramId : '';
    var sectionString = paramId + '.' + hashId.toString().padStart(3, '0');

    // VolumeId, TitleId, ChapterId
    do {
      jsonArray.push({
        href: [baseUrl, node.tagName, node.id.split('-')[1]].join(URL_FRONT_SLASH),
        label: [node.tagName, node.id.split('-')[1]].join(CHAR_SPACE)
      });
    } while ((node = node.parentNode) !== null && node.parentNode.nodeType !== Node.DOCUMENT_NODE);

    // SectionId
    if (hash) {
      jsonArray.unshift({
        href: '/chapter/' + paramId + '#section-' + hashId,
        label: '§ ' + sectionString
      });
    }
    jsonArray = jsonArray.reverse();
  }

  // Default ORS
  jsonArray.unshift({
    href: baseUrl,
    label: 'ORS'
  });
  return jsonArray;
};

/**
 * @description Gets HTML text for a chapter from fetched data from a remote PHP file.
 * @example
 * getBody(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @returns {string} Returns HTML text.
 */

var getBody = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(paramId) {
    var url, client, req, resp, msword, xml;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          url = new _ocdla_lib_http_Url__WEBPACK_IMPORTED_MODULE_1__["default"]('https://appdev.ocdla.org/books-online/index.php');
          url.buildQuery('chapter', paramId.toString());
          client = new _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_2__["default"]();
          req = new Request(url.toString());
          _context2.next = 6;
          return client.send(req);
        case 6:
          resp = _context2.sent;
          _context2.next = 9;
          return _ocdla_ors_src_Chapter__WEBPACK_IMPORTED_MODULE_3__["default"].fromResponse(resp);
        case 9:
          msword = _context2.sent;
          xml = _ocdla_ors_src_Chapter__WEBPACK_IMPORTED_MODULE_3__["default"].toStructuredChapter(msword);
          return _context2.abrupt("return", xml.toString());
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getBody(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * @description Gets miscellaneous data for a chapter.
 * @example
 * getSidebarSecond(7, '1010')
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @returns {string} Returns a miscellaneous array of [hyperlink] objects'.
 */

var getSidebarSecond = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(paramId, hash) {
    var hashId, label;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          hashId = hash ? hash.split('-')[1] : paramId ? paramId : ''; // prettier-ignore
          label = '§ ' + (hash ? paramId + '.' + hashId.toString().padStart(3, '0') : paramId) + '\'s source at oregon​.gov';
          return _context3.abrupt("return", [
          // {
          //     href: '/',
          //     label: 'Current through early 2024'
          // },
          {
            href: 'https://www.oregonlegislature.gov/bills_laws/ors/ors' + paramId + '.html',
            label: label
          }]);
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function getSidebarSecond(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ "./src/js/index.jsx":
/*!**************************!*\
  !*** ./src/js/index.jsx ***!
  \**************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_input_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/input.css */ "./src/css/input.css");
/* harmony import */ var _ocdla_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/view */ "./node_modules/@ocdla/view/view.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./App */ "./src/js/App.jsx");
/* harmony import */ var _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ocdla/lib-http/HttpClient */ "./node_modules/@ocdla/lib-http/HttpClient.js");
/* harmony import */ var _mock_OrsMock__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mock/OrsMock */ "./src/js/mock/OrsMock.js");
/* harmony import */ var _routes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./routes */ "./src/js/routes.js");
/* harmony import */ var _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/toc/Titles_Toc */ "./src/js/components/toc/Titles_Toc.jsx");
/* harmony import */ var _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/toc/Chapters_Toc */ "./src/js/components/toc/Chapters_Toc.jsx");
/* harmony import */ var _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/toc/Sections_Toc */ "./src/js/components/toc/Sections_Toc.jsx");
/* harmony import */ var _components_Chapter__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/Chapter */ "./src/js/components/Chapter.jsx");
/* harmony import */ var _functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./functions/ors/fetch_data */ "./src/js/functions/ors/fetch_data.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_routes__WEBPACK_IMPORTED_MODULE_5__, _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_6__, _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_7__, _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_8__, _components_Chapter__WEBPACK_IMPORTED_MODULE_9__, _functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__]);
([_routes__WEBPACK_IMPORTED_MODULE_5__, _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_6__, _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_7__, _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_8__, _components_Chapter__WEBPACK_IMPORTED_MODULE_9__, _functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * @fileoverview This file is the root of the ORS Viewer application.
 */

/** @jsx vNode */

/* eslint-disable no-unused-vars */


/* eslint-enable */








console.log("IS_PRODUCTION - ".concat("/ors-viewer/"));
if (true) _ocdla_lib_http_HttpClient__WEBPACK_IMPORTED_MODULE_3__["default"].register('https://ors.ocdla.org', new _mock_OrsMock__WEBPACK_IMPORTED_MODULE_4__["default"]());

// Available Types: 'bon' || 'ors'.
var currentAppType = "ors";
var headerPinned = false;
var $root = document.getElementById('root');
var root = _ocdla_view__WEBPACK_IMPORTED_MODULE_1__.View.createRoot($root);
var _router$match = _routes__WEBPACK_IMPORTED_MODULE_5__["default"].match(window.location.pathname, window.location.hash),
  _router$match2 = _slicedToArray(_router$match, 2),
  Component = _router$match2[0],
  props = _router$match2[1];
var breadcrumbItems;
switch (Component) {
  case _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_6__["default"]:
    breadcrumbItems = (0,_functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__.getBreadcrumbs)('titles', props.volume);
    break;
  case _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_7__["default"]:
    breadcrumbItems = (0,_functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__.getBreadcrumbs)('chapters', props.title);
    break;
  case _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_8__["default"]:
    breadcrumbItems = (0,_functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__.getBreadcrumbs)('sections', props.chapter);
    break;
  case _components_Chapter__WEBPACK_IMPORTED_MODULE_9__["default"]:
    breadcrumbItems = (0,_functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__.getBreadcrumbs)('chapter', props.chapter, props.hash);

    // window.addEventListener('hashchange', () => window.location.reload());

    window.addEventListener('hashchange', function (href) {
      breadcrumbItems = (0,_functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__.getBreadcrumbs)('chapter', props.chapter, href.newURL.split('#')[1]);
      root.render((0,_ocdla_view__WEBPACK_IMPORTED_MODULE_1__.vNode)(_App__WEBPACK_IMPORTED_MODULE_2__["default"], {
        view: root,
        currentAppType: currentAppType,
        headerPinned: headerPinned,
        breadcrumbs: breadcrumbItems
      }, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_1__.vNode)(Component, props)));
    });
    // const currentHash = window.location.hash;
    // window.location.hash = currentHash + '_temp';
    // window.location.hash = currentHash;

    // const currentHash = window.location.hash;
    // history.replaceState(null, '', currentHash + '_temp');
    // history.replaceState(null, '', currentHash);
    break;
  default:
    breadcrumbItems = (0,_functions_ors_fetch_data__WEBPACK_IMPORTED_MODULE_10__.getBreadcrumbs)();
    break;
}
root.render((0,_ocdla_view__WEBPACK_IMPORTED_MODULE_1__.vNode)(_App__WEBPACK_IMPORTED_MODULE_2__["default"], {
  view: root,
  currentAppType: currentAppType,
  headerPinned: headerPinned,
  breadcrumbs: breadcrumbItems
}, (0,_ocdla_view__WEBPACK_IMPORTED_MODULE_1__.vNode)(Component, props)));
if (true) {
  // const links = document.querySelectorAll('a');

  // links.forEach(link =>
  //     link.href && !link.href.startsWith('http')
  //         ? (link.href =
  //               BASE_PATH + link.getAttribute('href').replace(/^\//, ''))
  //         : ''
  // );
  console.log("/ors-viewer/");
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "./src/js/mock/OrsMock.js":
/*!********************************!*\
  !*** ./src/js/mock/OrsMock.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ OrsMock)
/* harmony export */ });
/* harmony import */ var _ocdla_lib_http_HttpMock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/lib-http/HttpMock */ "./node_modules/@ocdla/lib-http/HttpMock.js");
/* harmony import */ var _ocdla_lib_http_Url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ocdla/lib-http/Url */ "./node_modules/@ocdla/lib-http/Url.js");
/* harmony import */ var _data_xml_ors_viewer_statutes_xml__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../data/xml/ors_viewer/statutes.xml */ "./src/data/xml/ors_viewer/statutes.xml");
/* harmony import */ var _ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ocdla/global-components/src/Defaults */ "./node_modules/@ocdla/global-components/src/Defaults.jsx");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * @fileoverview This file checks whether the ORS Viewer application is being hosted locally or remotely (basically CORS checks) to return appropriate data accordingly.
 */




/* eslint-disable no-unused-vars */

/* eslint-enable */
var OrsMock = /*#__PURE__*/function (_HttpMock) {
  function OrsMock() {
    _classCallCheck(this, OrsMock);
    return _callSuper(this, OrsMock);
  }
  _inherits(OrsMock, _HttpMock);
  return _createClass(OrsMock, [{
    key: "getResponse",
    value: function getResponse(req) {
      var url = new _ocdla_lib_http_Url__WEBPACK_IMPORTED_MODULE_1__["default"](req.url);
      var id = url.getPath();

      /* eslint-disable indent */
      // Synesthetic responses.
      return id.includes('index') ? new Response(_data_xml_ors_viewer_statutes_xml__WEBPACK_IMPORTED_MODULE_2__, {
        headers: {
          'Content-Type': 'application/xml'
        }
      }) : new Response(this.imports[id]);
      /* eslint-enable */
    }

    // Left over code from the app switcher functionality for Books Online.
  }, {
    key: "getMock",
    value: function getMock() {
      // console.log('getBody: (b)');
      var styleTabActive = 'tab-btn rounded-t-md border border-b-transparent p-4';
      var styleTabInactive = 'tab-btn rounded-t-md border border-transparent border-b-inherit p-4 text-blue-400 hover:text-blue-500 hover:underline hover:underline-offset-2';
      var toggleTabs = function toggleTabs(tabBtnClicked) {
        var tabBtns = document.getElementsByClassName('tab-btn');
        var tabBodies = document.getElementsByClassName('tab-body');
        Array.from(tabBtns).forEach(function ($tabBtn) {
          $tabBtn.className = tabBtnClicked.target === $tabBtn ? styleTabActive : styleTabInactive;
        });
        Array.from(tabBodies).forEach(function ($tabBody) {
          return tabBtnClicked.target.id.split('-')[2] === $tabBody.id.split('-')[2] ? $tabBody.classList.remove('hidden') : $tabBody.classList.add('hidden');
        });
      };
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        "class": "mb-4"
      }, /*#__PURE__*/React.createElement("h3", {
        "class": "text-5xl font-black tracking-tighter"
      }, "ORS 1.001"), /*#__PURE__*/React.createElement("h6", {
        "class": "text-2xl font-thin"
      }, "State policy for courts")), /*#__PURE__*/React.createElement("div", {
        "class": "flex flex-col gap-4"
      }, /*#__PURE__*/React.createElement("ul", {
        "class": "flex"
      }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
        id: "tab-btn-1",
        "class": styleTabActive,
        onclick: toggleTabs
      }, "Text")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
        id: "tab-btn-2",
        "class": styleTabInactive,
        onclick: toggleTabs
      }, "Annotations")), /*#__PURE__*/React.createElement("li", {
        "class": "w-full border border-transparent border-b-inherit p-4"
      }, "\xA0"))), /*#__PURE__*/React.createElement("p", {
        id: "tab-body-1",
        "class": "tab-body flex flex-col gap-4"
      }, "The Legislative Assembly hereby declares that, as a matter of statewide concern, it is in the best interests of the people of this state that the judicial branch of state government, including the appellate, tax and circuit courts, be funded and operated at the state level. The Legislative Assembly finds that state funding and operation of the judicial branch can provide for best statewide allocation of governmental resources according to the actual needs of the people and of the judicial branch by establishing an accountable, equitably funded and uniformly administered system of justice for all the people of this state. [1981 s.s. c.3 \xA71]", /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("small", null, /*#__PURE__*/React.createElement("i", null, "Source: Section 1.001 \u2014 State policy for courts,", ' ', /*#__PURE__*/React.createElement(_ocdla_global_components_src_Defaults__WEBPACK_IMPORTED_MODULE_3__["default"], {
        href: "https://\xADoregonlegislature.\xADgov/bills_laws/ors/ors001.\xADhtml"
      }, "https://\xADoregonlegislature.\xADgov/bills_laws/ors/ors001.\xADhtml")))), /*#__PURE__*/React.createElement("p", {
        id: "tab-body-2",
        "class": "tab-body flex hidden flex-col gap-4"
      }, /*#__PURE__*/React.createElement("p", null, "Law Review Citations"), /*#__PURE__*/React.createElement("p", null, "50 WLR 291 (2014)")));
    }
  }]);
}(_ocdla_lib_http_HttpMock__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/js/routes.js":
/*!**************************!*\
  !*** ./src/js/routes.js ***!
  \**************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ocdla_routing_Router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/routing/Router */ "./node_modules/@ocdla/routing/Router.js");
/* harmony import */ var _components_Search__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/Search */ "./src/js/components/Search.jsx");
/* harmony import */ var _components_toc_Volumes_Toc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/toc/Volumes_Toc */ "./src/js/components/toc/Volumes_Toc.jsx");
/* harmony import */ var _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/toc/Titles_Toc */ "./src/js/components/toc/Titles_Toc.jsx");
/* harmony import */ var _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/toc/Chapters_Toc */ "./src/js/components/toc/Chapters_Toc.jsx");
/* harmony import */ var _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/toc/Sections_Toc */ "./src/js/components/toc/Sections_Toc.jsx");
/* harmony import */ var _components_Chapter__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/Chapter */ "./src/js/components/Chapter.jsx");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_toc_Volumes_Toc__WEBPACK_IMPORTED_MODULE_2__, _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_3__, _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_4__, _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_5__, _components_Chapter__WEBPACK_IMPORTED_MODULE_6__]);
([_components_toc_Volumes_Toc__WEBPACK_IMPORTED_MODULE_2__, _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_3__, _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_4__, _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_5__, _components_Chapter__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
/**
 * @fileoverview This file defines the browser URL routes for the ORS Viewer application.
 */

/** @jsx vNode */

// import NotFound from '@ocdla/global-components/src/NotFound';






var router = new _ocdla_routing_Router__WEBPACK_IMPORTED_MODULE_0__["default"]("/ors-viewer/" || 0);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);
switch ("ors") {
  case 'bon':
    router.addRoute('/', 'xyz');
    break;
  case 'ors':
    router.addRoute('/', _components_Search__WEBPACK_IMPORTED_MODULE_1__["default"]);
    router.addRoute('/toc', _components_toc_Volumes_Toc__WEBPACK_IMPORTED_MODULE_2__["default"], {
      division: 'Volumes',
      title: 'OREGON REVISED STATUTES'
    });
    router.addRoute('/toc/volume/(\\w+)', _components_toc_Titles_Toc__WEBPACK_IMPORTED_MODULE_3__["default"], {
      division: 'Titles'
    });
    router.addRoute('/toc/title/(\\w+)', _components_toc_Chapters_Toc__WEBPACK_IMPORTED_MODULE_4__["default"], {
      division: 'Chapters'
    });
    // router.addRoute('/chapter/[+-]?([0-9]*[.])?[0-9]+', Sections_Toc, {
    // router.addRoute('/chapter/(\\w+)', Chapter);
    router.addRoute('/chapter/(\\w+)', _components_Chapter__WEBPACK_IMPORTED_MODULE_6__["default"]);
    router.addRoute('/toc/chapter/(\\w+)', _components_toc_Sections_Toc__WEBPACK_IMPORTED_MODULE_5__["default"], {
      division: 'Sections'
    });
    // router.addRoute('/section/(\\w+)', Ors_Body);
    // router.addRoute('/toc/section/(\\w+)\\.(\\w+)', Chapter);
    // router.addRoute('/section/(\\d+)\\.(\\d+)', Ors_Body);
    // router.addRoute('/toc/section/(\\d+)\\.(\\d+)', Ors_Body, {
    // router.addRoute('/toc/section/[+-]?([0-9]*[.])?[0-9]+', Ors_Body);
    break;
}
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js!./src/css/chapter.css":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js!./src/css/chapter.css ***!
  \*************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.subsection {
    /* trying to hide duplicate labels. */
    /* display: none; */
}

.section-heading {
    margin-top: 2rem;
    font-weight: bold;
}

.level-1 {
    padding-left: 10px;
}

.level-2 {
    padding-left: 20px;
}
`, "",{"version":3,"sources":["webpack://./src/css/chapter.css"],"names":[],"mappings":"AAAA;IACI,qCAAqC;IACrC,mBAAmB;AACvB;;AAEA;IACI,gBAAgB;IAChB,iBAAiB;AACrB;;AAEA;IACI,kBAAkB;AACtB;;AAEA;IACI,kBAAkB;AACtB","sourcesContent":[".subsection {\n    /* trying to hide duplicate labels. */\n    /* display: none; */\n}\n\n.section-heading {\n    margin-top: 2rem;\n    font-weight: bold;\n}\n\n.level-1 {\n    padding-left: 10px;\n}\n\n.level-2 {\n    padding-left: 20px;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js!./src/css/input.css":
/*!***********************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js!./src/css/input.css ***!
  \***********************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
! tailwindcss v3.4.10 | MIT License | https://tailwindcss.com
*//*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box; /* 1 */
  border-width: 0; /* 2 */
  border-style: solid; /* 2 */
  border-color: #e5e7eb; /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
  -moz-tab-size: 4; /* 3 */
  -o-tab-size: 4;
     tab-size: 4; /* 3 */
  font-family: Open Sans, Verdana, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 4 */
  font-feature-settings: normal; /* 5 */
  font-variation-settings: normal; /* 6 */
  -webkit-tap-highlight-color: transparent; /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0; /* 1 */
  line-height: inherit; /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0; /* 1 */
  color: inherit; /* 2 */
  border-top-width: 1px; /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */
  font-feature-settings: normal; /* 2 */
  font-variation-settings: normal; /* 3 */
  font-size: 1em; /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0; /* 1 */
  border-color: inherit; /* 2 */
  border-collapse: collapse; /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-feature-settings: inherit; /* 1 */
  font-variation-settings: inherit; /* 1 */
  font-size: 100%; /* 1 */
  font-weight: inherit; /* 1 */
  line-height: inherit; /* 1 */
  letter-spacing: inherit; /* 1 */
  color: inherit; /* 1 */
  margin: 0; /* 2 */
  padding: 0; /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button; /* 1 */
  background-color: transparent; /* 2 */
  background-image: none; /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/
dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/
:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */
[hidden] {
  display: none;
}

*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}
.container {
  width: 100%;
}
@media (min-width: 640px) {

  .container {
    max-width: 640px;
  }
}
@media (min-width: 768px) {

  .container {
    max-width: 768px;
  }
}
@media (min-width: 1024px) {

  .container {
    max-width: 1024px;
  }
}
@media (min-width: 1280px) {

  .container {
    max-width: 1280px;
  }
}
@media (min-width: 1536px) {

  .container {
    max-width: 1536px;
  }
}
.visible {
  visibility: visible;
}
.collapse {
  visibility: collapse;
}
.static {
  position: static;
}
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.sticky {
  position: sticky;
}
.left-\\[-1rem\\] {
  left: -1rem;
}
.top-0 {
  top: 0px;
}
.top-\\[calc\\(100\\%\\+0\\.5rem\\)\\] {
  top: calc(100% + 0.5rem);
}
.isolate {
  isolation: isolate;
}
.z-10 {
  z-index: 10;
}
.m-0 {
  margin: 0px;
}
.m-4 {
  margin: 1rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.mb-4 {
  margin-bottom: 1rem;
}
.ml-4 {
  margin-left: 1rem;
}
.block {
  display: block;
}
.inline {
  display: inline;
}
.flex {
  display: flex;
}
.table {
  display: table;
}
.grid {
  display: grid;
}
.hidden {
  display: none;
}
.aspect-square {
  aspect-ratio: 1 / 1;
}
.size-full {
  width: 100%;
  height: 100%;
}
.h-12 {
  height: 3rem;
}
.h-16 {
  height: 4rem;
}
.h-\\[34px\\] {
  height: 34px;
}
.h-\\[87\\.5vh\\] {
  height: 87.5vh;
}
.w-8 {
  width: 2rem;
}
.w-\\[34px\\] {
  width: 34px;
}
.w-full {
  width: 100%;
}
.border-collapse {
  border-collapse: collapse;
}
.-translate-x-1\\/2 {
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.list-none {
  list-style-type: none;
}
.flex-row-reverse {
  flex-direction: row-reverse;
}
.flex-col {
  flex-direction: column;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-start {
  align-items: flex-start;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.gap-1 {
  gap: 0.25rem;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-4 {
  gap: 1rem;
}
.gap-8 {
  gap: 2rem;
}
.overflow-y-scroll {
  overflow-y: scroll;
}
.whitespace-pre {
  white-space: pre;
}
.text-wrap {
  text-wrap: wrap;
}
.text-nowrap {
  text-wrap: nowrap;
}
.rounded-full {
  border-radius: 9999px;
}
.rounded-md {
  border-radius: 0.375rem;
}
.rounded-l-md {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}
.rounded-l-none {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}
.rounded-t-md {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}
.border {
  border-width: 1px;
}
.border-0 {
  border-width: 0px;
}
.border-x {
  border-left-width: 1px;
  border-right-width: 1px;
}
.border-b {
  border-bottom-width: 1px;
}
.border-b-0 {
  border-bottom-width: 0px;
}
.border-l {
  border-left-width: 1px;
}
.border-l-8 {
  border-left-width: 8px;
}
.border-t-0 {
  border-top-width: 0px;
}
.border-black {
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity));
}
.border-blue-600 {
  --tw-border-opacity: 1;
  border-color: rgb(37 99 235 / var(--tw-border-opacity));
}
.border-neutral-200 {
  --tw-border-opacity: 1;
  border-color: rgb(229 229 229 / var(--tw-border-opacity));
}
.border-neutral-300 {
  --tw-border-opacity: 1;
  border-color: rgb(212 212 212 / var(--tw-border-opacity));
}
.border-transparent {
  border-color: transparent;
}
.border-b-inherit {
  border-bottom-color: inherit;
}
.border-b-transparent {
  border-bottom-color: transparent;
}
.border-l-blue-400 {
  --tw-border-opacity: 1;
  border-left-color: rgb(96 165 250 / var(--tw-border-opacity));
}
.border-l-yellow-400 {
  --tw-border-opacity: 1;
  border-left-color: rgb(250 204 21 / var(--tw-border-opacity));
}
.bg-\\[\\#516490\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(81 100 144 / var(--tw-bg-opacity));
}
.bg-black {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity));
}
.bg-blue-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(239 246 255 / var(--tw-bg-opacity));
}
.bg-blue-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
}
.bg-neutral-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(250 250 250 / var(--tw-bg-opacity));
}
.bg-red-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(220 38 38 / var(--tw-bg-opacity));
}
.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
.p-32 {
  padding: 8rem;
}
.p-4 {
  padding: 1rem;
}
.p-8 {
  padding: 2rem;
}
.px-12 {
  padding-left: 3rem;
  padding-right: 3rem;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.pb-16 {
  padding-bottom: 4rem;
}
.text-center {
  text-align: center;
}
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.text-5xl {
  font-size: 3rem;
  line-height: 1;
}
.text-7xl {
  font-size: 4.5rem;
  line-height: 1;
}
.text-\\[0\\.625rem\\] {
  font-size: 0.625rem;
}
.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.font-black {
  font-weight: 900;
}
.font-bold {
  font-weight: 700;
}
.font-thin {
  font-weight: 100;
}
.capitalize {
  text-transform: capitalize;
}
.italic {
  font-style: italic;
}
.lining-nums {
  --tw-numeric-figure: lining-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}
.leading-\\[0\\.75rem\\] {
  line-height: 0.75rem;
}
.tracking-tighter {
  letter-spacing: -0.05em;
}
.text-\\[\\#516490\\] {
  --tw-text-opacity: 1;
  color: rgb(81 100 144 / var(--tw-text-opacity));
}
.text-black {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
}
.text-blue-400 {
  --tw-text-opacity: 1;
  color: rgb(96 165 250 / var(--tw-text-opacity));
}
.text-blue-600 {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
.text-neutral-300 {
  --tw-text-opacity: 1;
  color: rgb(212 212 212 / var(--tw-text-opacity));
}
.text-neutral-500 {
  --tw-text-opacity: 1;
  color: rgb(115 115 115 / var(--tw-text-opacity));
}
.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.underline {
  text-decoration-line: underline;
}
.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.ring {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
.contrast-\\[0\\] {
  --tw-contrast: contrast(0);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.contrast-\\[200\\] {
  --tw-contrast: contrast(200);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.saturate-0 {
  --tw-saturate: saturate(0);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.focus-within\\:opacity-\\[67\\.5\\%\\]:focus-within {
  opacity: 67.5%;
}
.hover\\:border-neutral-200:hover {
  --tw-border-opacity: 1;
  border-color: rgb(229 229 229 / var(--tw-border-opacity));
}
.hover\\:bg-neutral-100:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(245 245 245 / var(--tw-bg-opacity));
}
.hover\\:text-blue-500:hover {
  --tw-text-opacity: 1;
  color: rgb(59 130 246 / var(--tw-text-opacity));
}
.hover\\:text-neutral-600:hover {
  --tw-text-opacity: 1;
  color: rgb(82 82 82 / var(--tw-text-opacity));
}
.hover\\:underline:hover {
  text-decoration-line: underline;
}
.hover\\:underline-offset-2:hover {
  text-underline-offset: 2px;
}
.hover\\:opacity-\\[67\\.5\\%\\]:hover {
  opacity: 67.5%;
}
.focus\\:border-neutral-200:focus {
  --tw-border-opacity: 1;
  border-color: rgb(229 229 229 / var(--tw-border-opacity));
}
.group:hover .group-hover\\:text-blue-500 {
  --tw-text-opacity: 1;
  color: rgb(59 130 246 / var(--tw-text-opacity));
}
.group:hover .group-hover\\:opacity-\\[67\\.5\\%\\] {
  opacity: 67.5%;
}
.peer:focus-within ~ .peer-focus-within\\:flex {
  display: flex;
}
@media (min-width: 1024px) {

  .lg\\:sticky {
    position: sticky;
  }

  .lg\\:left-1\\/2 {
    left: 50%;
  }

  .lg\\:top-0 {
    top: 0px;
  }

  .lg\\:col-span-4 {
    grid-column: span 4 / span 4;
  }

  .lg\\:col-start-2 {
    grid-column-start: 2;
  }

  .lg\\:m-0 {
    margin: 0px;
  }

  .lg\\:mx-8 {
    margin-left: 2rem;
    margin-right: 2rem;
  }

  .lg\\:me-auto {
    margin-inline-end: auto;
  }

  .lg\\:ms-auto {
    margin-inline-start: auto;
  }

  .lg\\:block {
    display: block;
  }

  .lg\\:grid {
    display: grid;
  }

  .lg\\:hidden {
    display: none;
  }

  .lg\\:size-max {
    width: -moz-max-content;
    width: max-content;
    height: -moz-max-content;
    height: max-content;
  }

  .lg\\:h-16 {
    height: 4rem;
  }

  .lg\\:h-32 {
    height: 8rem;
  }

  .lg\\:w-2\\/3 {
    width: 66.666667%;
  }

  .lg\\:w-64 {
    width: 16rem;
  }

  .lg\\:grid-flow-row {
    grid-auto-flow: row;
  }

  .lg\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lg\\:grid-cols-6 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .lg\\:flex-row {
    flex-direction: row;
  }

  .lg\\:items-center {
    align-items: center;
  }

  .lg\\:gap-16 {
    gap: 4rem;
  }

  .lg\\:gap-8 {
    gap: 2rem;
  }

  .lg\\:border {
    border-width: 1px;
  }

  .lg\\:border-x {
    border-left-width: 1px;
    border-right-width: 1px;
  }

  .lg\\:border-t-0 {
    border-top-width: 0px;
  }

  .lg\\:p-32 {
    padding: 8rem;
  }

  .lg\\:p-4 {
    padding: 1rem;
  }

  .lg\\:p-8 {
    padding: 2rem;
  }

  .lg\\:pb-32 {
    padding-bottom: 8rem;
  }
}
.\\[\\&\\>\\*\\:nth-child\\(2n\\)\\:last-child\\]\\:border-b-0>*:nth-child(2n):last-child {
  border-bottom-width: 0px;
}
.\\[\\&\\>\\*\\:nth-child\\(2n\\+1\\)\\:nth-last-child\\(-n\\+2\\)\\]\\:border-b-0>*:nth-child(2n+1):nth-last-child(-n+2) {
  border-bottom-width: 0px;
}
.\\[\\&\\>\\*\\:nth-child\\(2n\\+1\\)\\]\\:border-r>*:nth-child(2n+1) {
  border-right-width: 1px;
}
.\\[\\&\\>\\*\\]\\:border-b>* {
  border-bottom-width: 1px;
}
.\\[\\&_\\*\\]\\:mb-4 * {
  margin-bottom: 1rem;
}
`, "",{"version":3,"sources":["webpack://./src/css/input.css"],"names":[],"mappings":"AAAA;;CAAc,CAAd;;;CAAc;;AAAd;;;EAAA,sBAAc,EAAd,MAAc;EAAd,eAAc,EAAd,MAAc;EAAd,mBAAc,EAAd,MAAc;EAAd,qBAAc,EAAd,MAAc;AAAA;;AAAd;;EAAA,gBAAc;AAAA;;AAAd;;;;;;;;CAAc;;AAAd;;EAAA,gBAAc,EAAd,MAAc;EAAd,8BAAc,EAAd,MAAc;EAAd,gBAAc,EAAd,MAAc;EAAd,cAAc;KAAd,WAAc,EAAd,MAAc;EAAd,mJAAc,EAAd,MAAc;EAAd,6BAAc,EAAd,MAAc;EAAd,+BAAc,EAAd,MAAc;EAAd,wCAAc,EAAd,MAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,SAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;AAAA;;AAAd;;;;CAAc;;AAAd;EAAA,SAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;EAAd,qBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,yCAAc;UAAd,iCAAc;AAAA;;AAAd;;CAAc;;AAAd;;;;;;EAAA,kBAAc;EAAd,oBAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,cAAc;EAAd,wBAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,mBAAc;AAAA;;AAAd;;;;;CAAc;;AAAd;;;;EAAA,+GAAc,EAAd,MAAc;EAAd,6BAAc,EAAd,MAAc;EAAd,+BAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,cAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,cAAc;EAAd,cAAc;EAAd,kBAAc;EAAd,wBAAc;AAAA;;AAAd;EAAA,eAAc;AAAA;;AAAd;EAAA,WAAc;AAAA;;AAAd;;;;CAAc;;AAAd;EAAA,cAAc,EAAd,MAAc;EAAd,qBAAc,EAAd,MAAc;EAAd,yBAAc,EAAd,MAAc;AAAA;;AAAd;;;;CAAc;;AAAd;;;;;EAAA,oBAAc,EAAd,MAAc;EAAd,8BAAc,EAAd,MAAc;EAAd,gCAAc,EAAd,MAAc;EAAd,eAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;EAAd,uBAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;EAAd,SAAc,EAAd,MAAc;EAAd,UAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,oBAAc;AAAA;;AAAd;;;CAAc;;AAAd;;;;EAAA,0BAAc,EAAd,MAAc;EAAd,6BAAc,EAAd,MAAc;EAAd,sBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,aAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,gBAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,wBAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,YAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,6BAAc,EAAd,MAAc;EAAd,oBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,wBAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,0BAAc,EAAd,MAAc;EAAd,aAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,kBAAc;AAAA;;AAAd;;CAAc;;AAAd;;;;;;;;;;;;;EAAA,SAAc;AAAA;;AAAd;EAAA,SAAc;EAAd,UAAc;AAAA;;AAAd;EAAA,UAAc;AAAA;;AAAd;;;EAAA,gBAAc;EAAd,SAAc;EAAd,UAAc;AAAA;;AAAd;;CAAc;AAAd;EAAA,UAAc;AAAA;;AAAd;;CAAc;;AAAd;EAAA,gBAAc;AAAA;;AAAd;;;CAAc;;AAAd;EAAA,UAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;AAAA;;AAAd;;EAAA,UAAc,EAAd,MAAc;EAAd,cAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,eAAc;AAAA;;AAAd;;CAAc;AAAd;EAAA,eAAc;AAAA;;AAAd;;;;CAAc;;AAAd;;;;;;;;EAAA,cAAc,EAAd,MAAc;EAAd,sBAAc,EAAd,MAAc;AAAA;;AAAd;;CAAc;;AAAd;;EAAA,eAAc;EAAd,YAAc;AAAA;;AAAd,wEAAc;AAAd;EAAA,aAAc;AAAA;;AAAd;EAAA,wBAAc;EAAd,wBAAc;EAAd,mBAAc;EAAd,mBAAc;EAAd,cAAc;EAAd,cAAc;EAAd,cAAc;EAAd,eAAc;EAAd,eAAc;EAAd,aAAc;EAAd,aAAc;EAAd,kBAAc;EAAd,sCAAc;EAAd,8BAAc;EAAd,6BAAc;EAAd,4BAAc;EAAd,eAAc;EAAd,oBAAc;EAAd,sBAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,kBAAc;EAAd,2BAAc;EAAd,4BAAc;EAAd,sCAAc;EAAd,kCAAc;EAAd,2BAAc;EAAd,sBAAc;EAAd,8BAAc;EAAd,YAAc;EAAd,kBAAc;EAAd,gBAAc;EAAd,iBAAc;EAAd,kBAAc;EAAd,cAAc;EAAd,gBAAc;EAAd,aAAc;EAAd,mBAAc;EAAd,qBAAc;EAAd,2BAAc;EAAd,yBAAc;EAAd,0BAAc;EAAd,2BAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,yBAAc;EAAd,sBAAc;EAAd,oBAAc;EAAd,sBAAc;EAAd,qBAAc;EAAd;AAAc;;AAAd;EAAA,wBAAc;EAAd,wBAAc;EAAd,mBAAc;EAAd,mBAAc;EAAd,cAAc;EAAd,cAAc;EAAd,cAAc;EAAd,eAAc;EAAd,eAAc;EAAd,aAAc;EAAd,aAAc;EAAd,kBAAc;EAAd,sCAAc;EAAd,8BAAc;EAAd,6BAAc;EAAd,4BAAc;EAAd,eAAc;EAAd,oBAAc;EAAd,sBAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,kBAAc;EAAd,2BAAc;EAAd,4BAAc;EAAd,sCAAc;EAAd,kCAAc;EAAd,2BAAc;EAAd,sBAAc;EAAd,8BAAc;EAAd,YAAc;EAAd,kBAAc;EAAd,gBAAc;EAAd,iBAAc;EAAd,kBAAc;EAAd,cAAc;EAAd,gBAAc;EAAd,aAAc;EAAd,mBAAc;EAAd,qBAAc;EAAd,2BAAc;EAAd,yBAAc;EAAd,0BAAc;EAAd,2BAAc;EAAd,uBAAc;EAAd,wBAAc;EAAd,yBAAc;EAAd,sBAAc;EAAd,oBAAc;EAAd,sBAAc;EAAd,qBAAc;EAAd;AAAc;AACd;EAAA;AAAoB;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AAApB;;EAAA;IAAA;EAAoB;AAAA;AACpB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,WAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA,2BAAmB;EAAnB;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,sBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,qBAAmB;EAAnB;AAAmB;AAAnB;EAAA,kBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA,eAAmB;EAAnB;AAAmB;AAAnB;EAAA,iBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,eAAmB;EAAnB;AAAmB;AAAnB;EAAA,mBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,gCAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA,oBAAmB;EAAnB;AAAmB;AAAnB;EAAA;AAAmB;AAAnB;EAAA,0EAAmB;EAAnB,8FAAmB;EAAnB;AAAmB;AAAnB;EAAA,2GAAmB;EAAnB,yGAAmB;EAAnB;AAAmB;AAAnB;EAAA,0BAAmB;EAAnB;AAAmB;AAAnB;EAAA,4BAAmB;EAAnB;AAAmB;AAAnB;EAAA,0BAAmB;EAAnB;AAAmB;AAFnB;EAAA;AAGA;AAHA;EAAA,sBAGA;EAHA;AAGA;AAHA;EAAA,kBAGA;EAHA;AAGA;AAHA;EAAA,oBAGA;EAHA;AAGA;AAHA;EAAA,oBAGA;EAHA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA,sBAGA;EAHA;AAGA;AAHA;EAAA,oBAGA;EAHA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA;AAHA;;EAAA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA,iBAGA;IAHA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA,uBAGA;IAHA,kBAGA;IAHA,wBAGA;IAHA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA,sBAGA;IAHA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;;EAHA;IAAA;EAGA;AAAA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA;AAHA;EAAA;AAGA","sourcesContent":["@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/css/chapter.css":
/*!*****************************!*\
  !*** ./src/css/chapter.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_chapter_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/dist/cjs.js!./chapter.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js!./src/css/chapter.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_chapter_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_chapter_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_chapter_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_chapter_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/css/input.css":
/*!***************************!*\
  !*** ./src/css/input.css ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/dist/cjs.js!./input.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js!./src/css/input.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_input_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/images/logo_facebook.png":
/*!****************************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/images/logo_facebook.png ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "images/logo_facebook.png";

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/images/logo_ocdla.png":
/*!*************************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/images/logo_ocdla.png ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "images/logo_ocdla.png";

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/images/logo_twitter.png":
/*!***************************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/images/logo_twitter.png ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "images/logo_twitter.png";

/***/ }),

/***/ "./node_modules/@ocdla/global-components/src/images/logo_youtube.png":
/*!***************************************************************************!*\
  !*** ./node_modules/@ocdla/global-components/src/images/logo_youtube.png ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "images/logo_youtube.png";

/***/ }),

/***/ "./src/data/xml/ors_viewer/statutes.xml":
/*!**********************************************!*\
  !*** ./src/data/xml/ors_viewer/statutes.xml ***!
  \**********************************************/
/***/ ((module) => {

module.exports = "<volumes>\n    <volume id=\"vol-1\" name=\"Courts, Oregon Rules of Civil Procedure\">\n        <title id=\"title-1\" name=\"Courts of Record; Court Officers; Juries\" range=\"1-10\">\n            <chapter id=\"ch-1\" name=\"Courts and Judicial Officers Generally\" />\n            <chapter id=\"ch-2\" name=\"Supreme Court\" />\n            <chapter id=\"ch-3\" name=\"Circuit Courts Generally\" />\n            <chapter id=\"ch-5\" name=\"County Courts (Judicial Functions)\" />\n            <chapter id=\"ch-7\" name=\"Records and Files of Courts\" />\n            <chapter id=\"ch-8\" name=\"Court Officers and District Attorneys\" />\n            <chapter id=\"ch-9\" name=\"Attorneys\" />\n            <chapter id=\"ch-10\" name=\"Juries\" />\n        </title>\n        <title id=\"title-2\" name=\"Procedure in Civil Proceedings\" range=\"12-25\">\n            <chapter id=\"ch-12\" name=\"Limitations of Actions and Suits\" />\n            <chapter id=\"ch-14\" name=\"Jurisdiction\" />\n            <chapter id=\"ch-15\" name=\"Choice of Laws\" />\n            <chapter id=\"ch-17\" name=\"Compromise\" />\n            <chapter id=\"ch-18\" name=\"Judgments\" />\n            <chapter id=\"ch-19\" name=\"Appeals\" />\n            <chapter id=\"ch-20\" name=\"Attorney Fees\" />\n            <chapter id=\"ch-21\" name=\"State Court Fees\" />\n            <chapter id=\"ch-22\" name=\"Bonds and Other Security Deposits\" />\n            <chapter id=\"ch-24\" name=\"Enforcement and Recognition of Foreign Judgments\" />\n            <chapter id=\"ch-25\" name=\"Support Enforcement\" />\n        </title>\n        <title id=\"title-3\" name=\"Remedies and Special Actions and Proceedings\" range=\"28-37\">\n            <chapter id=\"ch-28\" name=\"Declaratory Judgments\" />\n            <chapter id=\"ch-30\" name=\"Actions and Suits in Particular Cases\" />\n            <chapter id=\"ch-31\" name=\"Tort Actions\" />\n            <chapter id=\"ch-33\" name=\"Special Proceedings and Procedures\" />\n            <chapter id=\"ch-34\" name=\"Writs\" />\n            <chapter id=\"ch-35\" name=\"Eminent Domain\" />\n            <chapter id=\"ch-36\" name=\"Mediation and Arbitration\" />\n            <chapter id=\"ch-37\" name=\"Receivership\" />\n        </title>\n        <title id=\"title-4\" name=\"Evidence and Witnesses\" range=\"40-45\">\n            <chapter id=\"ch-40\" name=\"Evidence Code\" />\n            <chapter id=\"ch-41\" name=\"Evidence Generally\" />\n            <chapter id=\"ch-42\" name=\"Execution, Formalities and Interpretation of Writings\" />\n            <chapter id=\"ch-43\" name=\"Public Writings\" />\n            <chapter id=\"ch-44\" name=\"Witnesses\" />\n            <chapter id=\"ch-45\" name=\"Testimony Generally\" />\n        </title>\n        <title id=\"title-5\" name=\"Small Claims Department of Circuit Court\" range=\"46-46\">\n            <chapter id=\"ch-46\" name=\"Small Claims Department of Circuit Court\" />\n        </title>\n        <title id=\"title-6\" name=\"Justice Courts\" range=\"51-55\">\n            <chapter id=\"ch-51\" name=\"Justice Courts\" />\n            <chapter id=\"ch-52\" name=\"Civil Actions\" />\n            <chapter id=\"ch-53\" name=\"Appeals in Civil Actions\" />\n            <chapter id=\"ch-54\" name=\"Juries\" />\n            <chapter id=\"ch-55\" name=\"Small Claims\" />\n        </title>\n    </volume>\n    <volume id=\"vol-2\" name=\"Business Organizations, Commercial Code\">\n        <title id=\"title-7\" name=\"Corporations and Partnerships\" range=\"56-70\">\n            <chapter id=\"ch-56\" name=\"Duties of Secretary of State\" />\n            <chapter id=\"ch-58\" name=\"Professional Corporations\" />\n            <chapter id=\"ch-59\" name=\"Securities Regulation\" />\n            <chapter id=\"ch-60\" name=\"Private Corporations\" />\n            <chapter id=\"ch-62\" name=\"Cooperatives\" />\n            <chapter id=\"ch-63\" name=\"Limited Liability Companies\" />\n            <chapter id=\"ch-65\" name=\"Nonprofit Corporations\" />\n            <chapter id=\"ch-67\" name=\"Partnerships\" />\n            <chapter id=\"ch-70\" name=\"Limited Partnerships\" />\n        </title>\n        <title id=\"title-8\" name=\"Commercial Transactions\" range=\"71-84\">\n            <chapter id=\"ch-71\" name=\"General Provisions for Uniform Commercial Code\" />\n            <chapter id=\"ch-72\" name=\"Sales\" />\n            <chapter id=\"ch-72A\" name=\"Leases\" />\n            <chapter id=\"ch-73\" name=\"Negotiable Instruments\" />\n            <chapter id=\"ch-74\" name=\"Bank Deposits and Collections\" />\n            <chapter id=\"ch-74A\" name=\"Funds Transfers\" />\n            <chapter id=\"ch-75\" name=\"Letters of Credit\" />\n            <chapter id=\"ch-77\" name=\"Warehouse Receipts, Bills of Lading and Other Documents of Title\" />\n            <chapter id=\"ch-78\" name=\"Investment Securities\" />\n            <chapter id=\"ch-79\" name=\"Secured Transactions\" />\n            <chapter id=\"ch-80\" name=\"Assignment\" />\n            <chapter id=\"ch-81\" name=\"Tender and Receipts\" />\n            <chapter id=\"ch-82\" name=\"Interest\" />\n            <chapter id=\"ch-83\" name=\"Retail Installment Contracts\" />\n            <chapter id=\"ch-84\" name=\"Electronic Transactions\" />\n        </title>\n        <title id=\"title-9\" name=\"Mortgages and Liens\" range=\"86-88\">\n            <chapter id=\"ch-86\" name=\"Mortgages\" />\n            <chapter id=\"ch-86A\" name=\"Mortgage Lending\" />\n            <chapter id=\"ch-87\" name=\"Statutory Liens\" />\n            <chapter id=\"ch-88\" name=\"Foreclosure of Mortgages and Other Liens\" />\n        </title>\n    </volume>\n    <volume id=\"vol-3\" name=\"Landlord-Tenant, Domestic Relations, Probate\">\n        <title id=\"title-10\" name=\"Property Rights and Transactions\" range=\"90-105\">\n            <chapter id=\"ch-90\" name=\"Residential Landlord and Tenant\" />\n            <chapter id=\"ch-91\" name=\"Tenancy\" />\n            <chapter id=\"ch-92\" name=\"Subdivisions and Partitions\" />\n            <chapter id=\"ch-93\" name=\"Conveyancing and Recording\" />\n            <chapter id=\"ch-94\" name=\"Real Property Development\" />\n            <chapter id=\"ch-95\" name=\"Fraudulent Transfers and Conveyances\" />\n            <chapter id=\"ch-96\" name=\"Line and Partition Fences\" />\n            <chapter id=\"ch-97\" name=\"Rights and Duties Relating to Cemeteries, Human Bodies and Anatomical Gift\" />\n            <chapter id=\"ch-98\" name=\"Lost, Unclaimed or Abandoned Property\" />\n            <chapter id=\"ch-99\" name=\"Property Removed by High Water\" />\n            <chapter id=\"ch-100\" name=\"Condominiums\" />\n            <chapter id=\"ch-101\" name=\"Continuing Care Retirement Communities\" />\n            <chapter id=\"ch-105\" name=\"Property Rights\" />\n        </title>\n        <title id=\"title-11\" name=\"Domestic Relations\" range=\"106-110\">\n            <chapter id=\"ch-106\" name=\"Marriage\" />\n            <chapter id=\"ch-107\" name=\"Marital Dissolution, Annulment and Separation\" />\n            <chapter id=\"ch-108\" name=\"Spousal Relationships\" />\n            <chapter id=\"ch-109\" name=\"Parent and Child Rights and Relationships\" />\n            <chapter id=\"ch-110\" name=\"Uniform Interstate Family Support Act\" />\n        </title>\n        <title id=\"title-12\" name=\"Probate Law\" range=\"111-119\">\n            <chapter id=\"ch-111\" name=\"General Provisions\" />\n            <chapter id=\"ch-112\" name=\"Intestate Succession and Wills\" />\n            <chapter id=\"ch-113\" name=\"Initiation of Estate Proceedings\" />\n            <chapter id=\"ch-114\" name=\"Administration of Estates Generally\" />\n            <chapter id=\"ch-115\" name=\"Claims\" />\n            <chapter id=\"ch-116\" name=\"Accounting, Distribution and Closing\" />\n            <chapter id=\"ch-117\" name=\"Estates of Absentees\" />\n            <chapter id=\"ch-118\" name=\"Estate Tax\" />\n            <chapter id=\"ch-119\" name=\"Revised Uniform Fiduciary Access to Digital Assets Act\" />\n        </title>\n        <title id=\"title-13\" name=\"Protective Proceedings; Powers of Attorney; Trusts\" range=\"124-130\">\n            <chapter id=\"ch-124\" name=\"Abuse Prevention and Reporting\" />\n            <chapter id=\"ch-125\" name=\"Protective Proceedings\" />\n            <chapter id=\"ch-126\" name=\"Property Held for the Benefit of Minors\" />\n            <chapter id=\"ch-127\" name=\"Powers of Attorney\" />\n            <chapter id=\"ch-128\" name=\"Trusts\" />\n            <chapter id=\"ch-129\" name=\"Uniform Principal and Income Act\" />\n            <chapter id=\"ch-130\" name=\"Uniform Trust Code\" />\n        </title>\n    </volume>\n    <volume id=\"vol-4\" name=\"Criminal Procedure, Crimes\">\n        <title id=\"title-14\" name=\"Procedure in Criminal Matters Generally\" range=\"131-153\">\n            <chapter id=\"ch-131\" name=\"Preliminary Provisions; Limitations; Jurisdiction; Venue; Criminal Forfeiture; Crime Prevention\" />\n            <chapter id=\"ch-131A\" name=\"Civil Forfeiture\" />\n            <chapter id=\"ch-132\" name=\"Grand Jury, Indictments and Other Accusatory Instruments\" />\n            <chapter id=\"ch-133\" name=\"Arrest and Related Procedures; Search and Seizure; Extradition\" />\n            <chapter id=\"ch-135\" name=\"Arraignment and Pretrial Provisions\" />\n            <chapter id=\"ch-136\" name=\"Criminal Trials\" />\n            <chapter id=\"ch-137\" name=\"Judgment and Execution; Parole and Probation by the Court\" />\n            <chapter id=\"ch-138\" name=\"Appeals; Post-Conviction Relief\" />\n            <chapter id=\"ch-142\" name=\"Stolen Property\" />\n            <chapter id=\"ch-144\" name=\"Parole; Post-Prison Supervision; Work Release; Executive Clemency; Standards for Prison Terms and Parole; Presentence Reports\" />\n            <chapter id=\"ch-146\" name=\"Investigations of Deaths, Injuries and Missing Persons\" />\n            <chapter id=\"ch-147\" name=\"Victims of Crime and Acts of Mass Destruction\" />\n            <chapter id=\"ch-151\" name=\"Public Defenders; Counsel for Financially Eligible Persons\" />\n            <chapter id=\"ch-153\" name=\"Violations and Fines\" />\n        </title>\n        <title id=\"title-15\" name=\"Procedure in Criminal Actions in Justice Courts\" range=\"156-157\">\n            <chapter id=\"ch-156\" name=\"Proceedings and Judgment in Criminal Actions\" />\n            <chapter id=\"ch-157\" name=\"Appeals in Criminal Actions; Writ of Review\" />\n        </title>\n        <title id=\"title-16\" name=\"Crimes and Punishments\" range=\"161-169\">\n            <chapter id=\"ch-161\" name=\"General Provisions\" />\n            <chapter id=\"ch-162\" name=\"Offenses Against the State and Public Justice\" />\n            <chapter id=\"ch-163\" name=\"Offenses Against Persons\" />\n            <chapter id=\"ch-163A\" name=\"Sex Offender Reporting and Classification\" />\n            <chapter id=\"ch-164\" name=\"Offenses Against Property\" />\n            <chapter id=\"ch-165\" name=\"Offenses Involving Fraud or Deception\" />\n            <chapter id=\"ch-166\" name=\"Offenses Against Public Order; Firearms and Other Weapons; Racketeering\" />\n            <chapter id=\"ch-167\" name=\"Offenses Against General Welfare and Animals\" />\n            <chapter id=\"ch-169\" name=\"Local and Regional Correctional Facilities; Prisoners; Juvenile Facilities\" />\n        </title>\n    </volume>\n    <volume id=\"vol-5\" name=\"State Government, Government Procedures, Land Use\">\n        <title id=\"title-17\" name=\"State Legislative Department and Laws\" range=\"171-174\">\n            <chapter id=\"ch-171\" name=\"State Legislature\" />\n            <chapter id=\"ch-172\" name=\"Commission on Uniform Laws; Commission on Indian Services\" />\n            <chapter id=\"ch-173\" name=\"Legislative Service Agencies\" />\n            <chapter id=\"ch-174\" name=\"Construction of Statutes; General Definitions\" />\n        </title>\n        <title id=\"title-18\" name=\"Executive Branch; Organization\" range=\"176-185\">\n            <chapter id=\"ch-176\" name=\"Governor\" />\n            <chapter id=\"ch-177\" name=\"Secretary of State\" />\n            <chapter id=\"ch-178\" name=\"State Treasurer; Oregon Retirement Savings Plan; Oregon 529 Savings Network\" />\n            <chapter id=\"ch-179\" name=\"Administration of State Institutions\" />\n            <chapter id=\"ch-180\" name=\"Attorney General; Department of Justice\" />\n            <chapter id=\"ch-181A\" name=\"State Police; Crime Reporting and Records; Public Safety Standards and Training; Private Security\" />\n            <chapter id=\"ch-182\" name=\"State Administrative Agencies\" />\n            <chapter id=\"ch-183\" name=\"Administrative Procedures Act; Review of Rules; Civil Penalties\" />\n            <chapter id=\"ch-184\" name=\"Administrative Services and Transportation Departments\" />\n            <chapter id=\"ch-185\" name=\"State Advocacy Commissions and Offices\" />\n        </title>\n        <title id=\"title-19\" name=\"Miscellaneous Matters Related to Government and Public Affairs\" range=\"186-200\">\n            <chapter id=\"ch-186\" name=\"State Emblems; State Boundary\" />\n            <chapter id=\"ch-187\" name=\"Holidays; Standard of Time; Commemorations\" />\n            <chapter id=\"ch-188\" name=\"Congressional and Legislative Districts; Reapportionment\" />\n            <chapter id=\"ch-190\" name=\"Cooperation of Governmental Units; State Census; Arbitration\" />\n            <chapter id=\"ch-191\" name=\"United States’ Surveys\" />\n            <chapter id=\"ch-192\" name=\"Records; Public Reports and Meetings\" />\n            <chapter id=\"ch-193\" name=\"Legal Notices\" />\n            <chapter id=\"ch-194\" name=\"Uniform Law on Notarial Acts; Unsworn Foreign Declarations\" />\n            <chapter id=\"ch-195\" name=\"Local Government Planning Coordination\" />\n            <chapter id=\"ch-196\" name=\"State Waters and Ocean Resources; Wetlands; Removal and Fill\" />\n            <chapter id=\"ch-197\" name=\"Comprehensive Land Use Planning I\" />\n            <chapter id=\"ch-197A\" name=\"Comprehensive Land Use Planning II\" />\n            <chapter id=\"ch-198\" name=\"Special Districts Generally\" />\n            <chapter id=\"ch-199\" name=\"Local Government Boundary Commissions; City-County Consolidation\" />\n            <chapter id=\"ch-200\" name=\"Disadvantaged Business Enterprises; Minority-Owned Businesses; Woman-Owned Businesses; Businesses Owned by Service-Disabled Veterans; Emerging Small Businesses\" />\n        </title>\n    </volume>\n    <volume id=\"vol-6\" name=\"Local Government, Public Employees, Elections\">\n        <title id=\"title-20\" name=\"Counties and County Officers\" range=\"201-215\">\n            <chapter id=\"ch-201\" name=\"Boundaries of Counties\" />\n            <chapter id=\"ch-202\" name=\"Establishment of New Counties; Change of Boundaries\" />\n            <chapter id=\"ch-203\" name=\"County Governing Bodies; County Home Rule\" />\n            <chapter id=\"ch-204\" name=\"County Officers\" />\n            <chapter id=\"ch-205\" name=\"County Clerks\" />\n            <chapter id=\"ch-206\" name=\"Sheriffs\" />\n            <chapter id=\"ch-208\" name=\"County Treasurers\" />\n            <chapter id=\"ch-209\" name=\"County Surveyors\" />\n            <chapter id=\"ch-210\" name=\"County Accountants\" />\n            <chapter id=\"ch-215\" name=\"County Planning; Zoning; Housing Codes\" />\n        </title>\n        <title id=\"title-21\" name=\"Cities\" range=\"221-227\">\n            <chapter id=\"ch-221\" name=\"Organization and Government of Cities\" />\n            <chapter id=\"ch-222\" name=\"City Boundary Changes; Mergers; Consolidations; Withdrawals\" />\n            <chapter id=\"ch-223\" name=\"Local Improvements and Works Generally\" />\n            <chapter id=\"ch-224\" name=\"City Sewers and Sanitation\" />\n            <chapter id=\"ch-225\" name=\"Municipal Utilities\" />\n            <chapter id=\"ch-226\" name=\"City Parks, Memorials and Cemeteries\" />\n            <chapter id=\"ch-227\" name=\"City Planning and Zoning\" />\n        </title>\n        <title id=\"title-22\" name=\"Public Officers and Employees\" range=\"236-244\">\n            <chapter id=\"ch-236\" name=\"Eligibility; Resignations, Removals and Vacancies; Discipline; Transfers\" />\n            <chapter id=\"ch-237\" name=\"Public Employee Retirement Generally\" />\n            <chapter id=\"ch-238\" name=\"Public Employees Retirement System\" />\n            <chapter id=\"ch-238A\" name=\"Oregon Public Service Retirement Plan\" />\n            <chapter id=\"ch-240\" name=\"State Personnel Relations\" />\n            <chapter id=\"ch-241\" name=\"Civil Service for County Employees\" />\n            <chapter id=\"ch-242\" name=\"Civil Service for City or School District Employees and Firefighters\" />\n            <chapter id=\"ch-243\" name=\"Public Employee Rights and Benefits\" />\n            <chapter id=\"ch-244\" name=\"Government Ethics\" />\n        </title>\n        <title id=\"title-23\" name=\"Elections\" range=\"246-260\">\n            <chapter id=\"ch-246\" name=\"Administration of Election Laws; Vote Recording Systems\" />\n            <chapter id=\"ch-247\" name=\"Qualification and Registration of Electors\" />\n            <chapter id=\"ch-248\" name=\"Political Parties; Presidential Electors\" />\n            <chapter id=\"ch-249\" name=\"Candidates; Recall\" />\n            <chapter id=\"ch-250\" name=\"Initiative and Referendum\" />\n            <chapter id=\"ch-251\" name=\"Voters’ Pamphlet\" />\n            <chapter id=\"ch-253\" name=\"Absent Electors\" />\n            <chapter id=\"ch-254\" name=\"Conduct of Elections\" />\n            <chapter id=\"ch-255\" name=\"Special District Elections\" />\n            <chapter id=\"ch-258\" name=\"Election Contests; Recounts\" />\n            <chapter id=\"ch-259\" name=\"Campaign Finance\" />\n            <chapter id=\"ch-260\" name=\"Campaign Finance Regulation; Election Offenses\" />\n        </title>\n    </volume>\n    <volume id=\"vol-7\" name=\"Public Facilities and Finance\">\n        <title id=\"title-24\" name=\"Public Organizations for Community Service\" range=\"261-268\">\n            <chapter id=\"ch-261\" name=\"People’s Utility Districts\" />\n            <chapter id=\"ch-262\" name=\"Joint Operating Agencies for Electric Power\" />\n            <chapter id=\"ch-263\" name=\"Convention Facilities\" />\n            <chapter id=\"ch-264\" name=\"Domestic Water Supply Districts\" />\n            <chapter id=\"ch-265\" name=\"Cemetery Maintenance Districts\" />\n            <chapter id=\"ch-266\" name=\"Park and Recreation Districts\" />\n            <chapter id=\"ch-267\" name=\"Mass Transit Districts; Transportation Districts\" />\n            <chapter id=\"ch-268\" name=\"Metropolitan Service Districts\" />\n        </title>\n        <title id=\"title-25\" name=\"Public Lands\" range=\"270-275\">\n            <chapter id=\"ch-270\" name=\"State Real Property\" />\n            <chapter id=\"ch-271\" name=\"Use and Disposition of Public Lands Generally; Easements\" />\n            <chapter id=\"ch-272\" name=\"Federal Lands\" />\n            <chapter id=\"ch-273\" name=\"State Lands Generally\" />\n            <chapter id=\"ch-274\" name=\"Submersible and Submerged Lands\" />\n            <chapter id=\"ch-275\" name=\"County Lands\" />\n        </title>\n        <title id=\"title-26\" name=\"Public Facilities, Contracting, and Insurance\" range=\"276-283\">\n            <chapter id=\"ch-276\" name=\"Public Facilities\" />\n            <chapter id=\"ch-276A\" name=\"Information Technology\" />\n            <chapter id=\"ch-278\" name=\"Insurance for Public Bodies\" />\n            <chapter id=\"ch-279\" name=\"Public Contracting - Miscellaneous Provisions\" />\n            <chapter id=\"ch-279A\" name=\"Public Contracting - General Provisions\" />\n            <chapter id=\"ch-279B\" name=\"Public Contracting - Public Procurements\" />\n            <chapter id=\"ch-279C\" name=\"Public Contracting - Public Improvements and Related Contracts\" />\n            <chapter id=\"ch-280\" name=\"Financing of Local Public Projects and Improvements; City and County Economic Development\" />\n            <chapter id=\"ch-282\" name=\"Public Printing\" />\n            <chapter id=\"ch-283\" name=\"Interagency Services\" />\n        </title>\n        <title id=\"title-26A\" name=\"Economic Development\" range=\"284-285C\">\n            <chapter id=\"ch-284\" name=\"Organizations for Economic Development\" />\n            <chapter id=\"ch-285A\" name=\"Economic Development I\" />\n            <chapter id=\"ch-285B\" name=\"Economic Development II\" />\n            <chapter id=\"ch-285C\" name=\"Economic Development III\" />\n        </title>\n        <title id=\"title-27\" name=\"Public Borrowing\" range=\"286A-289\">\n            <chapter id=\"ch-286A\" name=\"State Borrowing\" />\n            <chapter id=\"ch-287A\" name=\"Local Government Borrowing\" />\n            <chapter id=\"ch-289\" name=\"Oregon Facilities Financing\" />\n        </title>\n        <title id=\"title-28\" name=\"Public Financial Administration\" range=\"291-297\">\n            <chapter id=\"ch-291\" name=\"State Financial Administration\" />\n            <chapter id=\"ch-292\" name=\"Salaries and Expenses of State Officers and Employees\" />\n            <chapter id=\"ch-293\" name=\"Administration of Public Funds\" />\n            <chapter id=\"ch-294\" name=\"County and Municipal Financial Administration\" />\n            <chapter id=\"ch-295\" name=\"Depositories of Public Funds and Securities\" />\n            <chapter id=\"ch-297\" name=\"Audits of Public Funds and Financial Records\" />\n        </title>\n    </volume>\n    <volume id=\"vol-8\" name=\"Revenue and Taxation\">\n        <title id=\"title-29\" name=\"Revenue and Taxation\" range=\"305-324\">\n            <chapter id=\"ch-305\" name=\"Administration of Revenue and Tax Laws; Appeals\" />\n            <chapter id=\"ch-306\" name=\"Property Taxation Generally\" />\n            <chapter id=\"ch-307\" name=\"Property Subject to Taxation; Exemptions\" />\n            <chapter id=\"ch-308\" name=\"Assessment of Property for Taxation\" />\n            <chapter id=\"ch-308A\" name=\"Land Special Assessments\" />\n            <chapter id=\"ch-309\" name=\"Board of Property Tax Appeals; Ratio Studies\" />\n            <chapter id=\"ch-310\" name=\"Property Tax Rates and Amounts; Tax Limitations; Tax Reduction Programs\" />\n            <chapter id=\"ch-311\" name=\"Collection of Property Taxes\" />\n            <chapter id=\"ch-312\" name=\"Foreclosure of Property Tax Liens\" />\n            <chapter id=\"ch-314\" name=\"Taxes Imposed Upon or Measured by Net Income\" />\n            <chapter id=\"ch-315\" name=\"Personal and Corporate Income or Excise Tax Credits\" />\n            <chapter id=\"ch-316\" name=\"Personal Income Tax\" />\n            <chapter id=\"ch-317\" name=\"Corporation Excise Tax\" />\n            <chapter id=\"ch-317A\" name=\"Corporate Activity Tax\" />\n            <chapter id=\"ch-318\" name=\"Corporation Income Tax\" />\n            <chapter id=\"ch-319\" name=\"Motor Vehicle and Aircraft Fuel Taxes\" />\n            <chapter id=\"ch-320\" name=\"Miscellaneous Taxes\" />\n            <chapter id=\"ch-321\" name=\"Timber and Forestland Taxation\" />\n            <chapter id=\"ch-323\" name=\"Cigarettes and Tobacco Products\" />\n            <chapter id=\"ch-324\" name=\"Oil and Gas Tax\" />\n        </title>\n    </volume>\n    <volume id=\"vol-9\" name=\"Education and Culture\">\n        <title id=\"title-30\" name=\"Education and Culture\" range=\"326-359\">\n            <chapter id=\"ch-326\" name=\"State Administration of Education\" />\n            <chapter id=\"ch-327\" name=\"State Financing of Elementary and Secondary Education\" />\n            <chapter id=\"ch-328\" name=\"Local Financing of Education\" />\n            <chapter id=\"ch-329\" name=\"Oregon Educational Act for the 21st Century; Educational Improvement and Reform\" />\n            <chapter id=\"ch-329A\" name=\"Child Care\" />\n            <chapter id=\"ch-330\" name=\"Boundary Changes; Mergers\" />\n            <chapter id=\"ch-332\" name=\"Local Administration of Education\" />\n            <chapter id=\"ch-334\" name=\"Education Service Districts\" />\n            <chapter id=\"ch-335\" name=\"High Schools\" />\n            <chapter id=\"ch-336\" name=\"Conduct of Schools Generally\" />\n            <chapter id=\"ch-337\" name=\"Books and Instructional Materials\" />\n            <chapter id=\"ch-338\" name=\"Public Charter Schools\" />\n            <chapter id=\"ch-339\" name=\"School Attendance; Admission; Discipline; Safety\" />\n            <chapter id=\"ch-340\" name=\"College Credit Earned in High School\" />\n            <chapter id=\"ch-341\" name=\"Community Colleges\" />\n            <chapter id=\"ch-342\" name=\"Teachers and Other School Personnel\" />\n            <chapter id=\"ch-343\" name=\"Special Education and Other Specialized Education Services\" />\n            <chapter id=\"ch-344\" name=\"Career and Technical Education; Education Related to Employment\" />\n            <chapter id=\"ch-345\" name=\"Career Schools\" />\n            <chapter id=\"ch-346\" name=\"Programs for Persons Who Are Blind or Deaf\" />\n            <chapter id=\"ch-348\" name=\"Student Aid; Education Stability Fund; Planning\" />\n            <chapter id=\"ch-350\" name=\"Statewide Coordination of Higher Education\" />\n            <chapter id=\"ch-352\" name=\"Public Universities\" />\n            <chapter id=\"ch-353\" name=\"Oregon Health and Science University\" />\n            <chapter id=\"ch-354\" name=\"Educational Television and Radio; Distance Learning; Translator Districts\" />\n            <chapter id=\"ch-357\" name=\"Libraries; State Archivist; Poet Laureate\" />\n            <chapter id=\"ch-358\" name=\"Oregon Historical and Heritage Agencies, Programs and Tax Provisions; Museums; Local Symphonies and Bands; Archaeological Objects and Sites\" />\n            <chapter id=\"ch-359\" name=\"Art and Culture\" />\n        </title>\n    </volume>\n    <volume id=\"vol-10\" name=\"Highways, Military\">\n        <title id=\"title-31\" name=\"Highways, Roads, Bridges, and Ferries\" range=\"366-391\">\n            <chapter id=\"ch-366\" name=\"State Highways and State Highway Fund\" />\n            <chapter id=\"ch-367\" name=\"Transportation Financing; Projects\" />\n            <chapter id=\"ch-368\" name=\"County Roads\" />\n            <chapter id=\"ch-369\" name=\"Ways of Public Easement\" />\n            <chapter id=\"ch-370\" name=\"County Road Bonding Act\" />\n            <chapter id=\"ch-371\" name=\"Road Districts and Road Assessment Plans\" />\n            <chapter id=\"ch-372\" name=\"Highway Lighting Districts\" />\n            <chapter id=\"ch-373\" name=\"Roads and Highways Through Cities\" />\n            <chapter id=\"ch-374\" name=\"Control of Access to Public Highways\" />\n            <chapter id=\"ch-376\" name=\"Ways of Necessity; Special Ways; Pedestrian Malls\" />\n            <chapter id=\"ch-377\" name=\"Highway Beautification; Motorist Information Signs\" />\n            <chapter id=\"ch-381\" name=\"Interstate Bridges\" />\n            <chapter id=\"ch-382\" name=\"Intrastate Bridges\" />\n            <chapter id=\"ch-383\" name=\"Tollways\" />\n            <chapter id=\"ch-384\" name=\"Ferries\" />\n            <chapter id=\"ch-390\" name=\"State and Local Parks; Recreation Programs; Scenic Waterways; Recreation Trails\" />\n            <chapter id=\"ch-391\" name=\"Mass Transportation\" />\n        </title>\n        <title id=\"title-32\" name=\"Military Affairs; Emergency Services\" range=\"396-404\">\n            <chapter id=\"ch-396\" name=\"Militia Generally\" />\n            <chapter id=\"ch-398\" name=\"Military Justice\" />\n            <chapter id=\"ch-399\" name=\"Organized Militia\" />\n            <chapter id=\"ch-401\" name=\"Emergency Management and Services\" />\n            <chapter id=\"ch-402\" name=\"Emergency Mutual Assistance Agreements\" />\n            <chapter id=\"ch-403\" name=\"Emergency Communications System; 2-1-1 System; Public Safety Communications Systems\" />\n            <chapter id=\"ch-404\" name=\"Search and Rescue\" />\n        </title>\n        <title id=\"title-33\" name=\"Privileges and Benefits of Veterans and Service Personnel\" range=\"406-408\">\n            <chapter id=\"ch-406\" name=\"Department of Veterans’ Affairs\" />\n            <chapter id=\"ch-407\" name=\"Veterans Loans\" />\n            <chapter id=\"ch-408\" name=\"Miscellaneous Benefits for Veterans and Service Personnel\" />\n        </title>\n    </volume>\n    <volume id=\"vol-11\" name=\"Juvenile Code, Human Services\">\n        <title id=\"title-34\" name=\"Human Services; Juvenile Code; Corrections\" range=\"409-423\">\n            <chapter id=\"ch-409\" name=\"Department of Human Services\" />\n            <chapter id=\"ch-410\" name=\"Senior and Disability Services\" />\n            <chapter id=\"ch-411\" name=\"Public Assistance and Medical Assistance\" />\n            <chapter id=\"ch-412\" name=\"Temporary Assistance for Needy Families\" />\n            <chapter id=\"ch-413\" name=\"Oregon Health Authority\" />\n            <chapter id=\"ch-414\" name=\"Medical Assistance\" />\n            <chapter id=\"ch-415\" name=\"Regulation of Health Care Entities\" />\n            <chapter id=\"ch-416\" name=\"Recovery and Reimbursement of Aid\" />\n            <chapter id=\"ch-417\" name=\"Interstate Compacts on Juveniles and Children; Children and Family Services\" />\n            <chapter id=\"ch-418\" name=\"Child Welfare Services\" />\n            <chapter id=\"ch-419A\" name=\"Juvenile Code: General Provisions and Definitions\" />\n            <chapter id=\"ch-419B\" name=\"Juvenile Code: Dependency\" />\n            <chapter id=\"ch-419C\" name=\"Juvenile Code: Delinquency\" />\n            <chapter id=\"ch-420\" name=\"Youth Correction Facilities; Youth Care Centers\" />\n            <chapter id=\"ch-420A\" name=\"Oregon Youth Authority; Youth Correction Facilities\" />\n            <chapter id=\"ch-421\" name=\"Department of Corrections Institutions; Compacts\" />\n            <chapter id=\"ch-423\" name=\"Corrections and Crime Control Administration and Programs\" />\n        </title>\n        <title id=\"title-35\" name=\"Mental Health and Developmental Disabilities; Substance Use Disorder Treatment\" range=\"426-430\">\n            <chapter id=\"ch-426\" name=\"Persons With Mental Illness; Dangerous Persons; Commitment; Housing\" />\n            <chapter id=\"ch-427\" name=\"Persons With Intellectual or Developmental Disabilities\" />\n            <chapter id=\"ch-428\" name=\"Nonresident Persons With Mental Illness or Intellectual Disabilities\" />\n            <chapter id=\"ch-430\" name=\"Mental and Behavioral Health Treatment; Developmental Disabilities\" />\n        </title>\n    </volume>\n    <volume id=\"vol-12\" name=\"Public Health\">\n        <title id=\"title-36\" name=\"Public Health and Safety\" range=\"431-454\">\n            <chapter id=\"ch-431\" name=\"State and Local Administration and Enforcement of Public Health Laws\" />\n            <chapter id=\"ch-431A\" name=\"Public Health Programs and Activities\" />\n            <chapter id=\"ch-432\" name=\"Vital Statistics\" />\n            <chapter id=\"ch-433\" name=\"Disease and Condition Control; Mass Gatherings; Indoor Air\" />\n            <chapter id=\"ch-435\" name=\"Contraception; Termination of Pregnancy\" />\n            <chapter id=\"ch-436\" name=\"Sterilization\" />\n            <chapter id=\"ch-438\" name=\"Laboratories; Anatomical Material\" />\n            <chapter id=\"ch-440\" name=\"Regional Health Entities\" />\n            <chapter id=\"ch-441\" name=\"Health Care Facilities\" />\n            <chapter id=\"ch-442\" name=\"Health Planning\" />\n            <chapter id=\"ch-443\" name=\"Residential Care; Adult Foster Homes; Hospice Programs\" />\n            <chapter id=\"ch-444\" name=\"Special Medical Services for Children\" />\n            <chapter id=\"ch-446\" name=\"Manufactured Dwellings and Structures; Parks; Tourist Facilities; Ownership Records; Dealers and Dealerships\" />\n            <chapter id=\"ch-447\" name=\"Plumbing; Architectural Barriers\" />\n            <chapter id=\"ch-448\" name=\"Pool Facilities; Water and Sewage Systems\" />\n            <chapter id=\"ch-450\" name=\"Sanitary Districts and Authorities; Water Authorities\" />\n            <chapter id=\"ch-451\" name=\"County Service Facilities\" />\n            <chapter id=\"ch-452\" name=\"Vector Control\" />\n            <chapter id=\"ch-453\" name=\"Hazardous Substances; Radiation Sources\" />\n            <chapter id=\"ch-454\" name=\"Sewage Treatment and Disposal Systems\" />\n        </title>\n    </volume>\n    <volume id=\"vol-13\" name=\"Housing, Games, Environment\">\n        <title id=\"title-36A\" name=\"Housing; Lottery and Games; Environment\" range=\"455-470\">\n            <chapter id=\"ch-455\" name=\"Building Code\" />\n            <chapter id=\"ch-456\" name=\"Housing\" />\n            <chapter id=\"ch-457\" name=\"Urban Renewal\" />\n            <chapter id=\"ch-458\" name=\"Housing and Community Services Programs; Individual Development Accounts\" />\n            <chapter id=\"ch-459\" name=\"Solid Waste Management\" />\n            <chapter id=\"ch-459A\" name=\"Reuse and Recycling\" />\n            <chapter id=\"ch-460\" name=\"Elevators; Amusement Rides and Devices\" />\n            <chapter id=\"ch-461\" name=\"Oregon State Lottery\" />\n            <chapter id=\"ch-462\" name=\"Racing\" />\n            <chapter id=\"ch-463\" name=\"Unarmed Combat Sports and Entertainment Wrestling\" />\n            <chapter id=\"ch-464\" name=\"Games\" />\n            <chapter id=\"ch-465\" name=\"Hazardous Waste and Hazardous Materials I\" />\n            <chapter id=\"ch-466\" name=\"Hazardous Waste and Hazardous Materials II\" />\n            <chapter id=\"ch-467\" name=\"Noise Control\" />\n            <chapter id=\"ch-468\" name=\"Environmental Quality Generally\" />\n            <chapter id=\"ch-468A\" name=\"Air Quality\" />\n            <chapter id=\"ch-468B\" name=\"Water Quality\" />\n            <chapter id=\"ch-469\" name=\"Energy; Conservation Programs; Energy Facilities\" />\n            <chapter id=\"ch-469A\" name=\"Renewable Portfolio Standards; Nonemitting Electricity Targets\" />\n            <chapter id=\"ch-469B\" name=\"Energy Incentives; Tax Credits; Grants\" />\n            <chapter id=\"ch-470\" name=\"Small Scale Local Energy Projects\" />\n        </title>\n    </volume>\n    <volume id=\"vol-14\" name=\"Drugs and Alcohol, Fire Protection, Natural Resources\">\n        <title id=\"title-37\" name=\"Alcoholic Liquors; Controlled Substances; Drugs\" range=\"471-475C\">\n            <chapter id=\"ch-471\" name=\"Alcoholic Liquors Generally\" />\n            <chapter id=\"ch-473\" name=\"Wine, Cider and Malt Beverage Privilege Tax\" />\n            <chapter id=\"ch-474\" name=\"Trade Practices Relating to Malt Beverages\" />\n            <chapter id=\"ch-475\" name=\"Controlled Substances; Illegal Drug Cleanup; Miscellaneous Drugs; Paraphernalia; Precursors\" />\n            <chapter id=\"ch-475A\" name=\"Psilocybin Regulation\" />\n            <chapter id=\"ch-475C\" name=\"Cannabis Regulation\" />\n        </title>\n        <title id=\"title-38\" name=\"Protection from Fire\" range=\"476-480\">\n            <chapter id=\"ch-476\" name=\"State Fire Marshal; Protection From Fire Generally\" />\n            <chapter id=\"ch-477\" name=\"Fire Protection of Forests and Vegetation\" />\n            <chapter id=\"ch-478\" name=\"Rural Fire Protection Districts\" />\n            <chapter id=\"ch-479\" name=\"Protection of Buildings From Fire; Electrical Safety Law\" />\n            <chapter id=\"ch-480\" name=\"Explosives; Flammable Materials; Pressure Vessels\" />\n        </title>\n        <title id=\"title-41\" name=\"Wildlife\" range=\"496-501\">\n            <chapter id=\"ch-496\" name=\"Application, Administration and Enforcement of Wildlife Laws\" />\n            <chapter id=\"ch-497\" name=\"Licenses, Tags and Permits\" />\n            <chapter id=\"ch-498\" name=\"Hunting, Angling and Trapping Regulations; Miscellaneous Wildlife Protective Measures\" />\n            <chapter id=\"ch-501\" name=\"Refuges and Closures\" />\n        </title>\n        <title id=\"title-42\" name=\"Commercial Fishing and Fisheries\" range=\"506-513\">\n            <chapter id=\"ch-506\" name=\"Application, Administration and Enforcement of Commercial Fishing Laws\" />\n            <chapter id=\"ch-507\" name=\"Compacts with Other States\" />\n            <chapter id=\"ch-508\" name=\"Licenses and Permits\" />\n            <chapter id=\"ch-509\" name=\"General Protective Regulations\" />\n            <chapter id=\"ch-511\" name=\"Local and Special Regulations\" />\n            <chapter id=\"ch-513\" name=\"Packing Fish and Manufacture of Fish Products\" />\n        </title>\n        <title id=\"title-43\" name=\"Mineral Resources\" range=\"516-523\">\n            <chapter id=\"ch-516\" name=\"Department of Geology and Mineral Industries\" />\n            <chapter id=\"ch-517\" name=\"Mining and Mining Claims\" />\n            <chapter id=\"ch-520\" name=\"Conservation of Gas and Oil\" />\n            <chapter id=\"ch-522\" name=\"Geothermal Resources\" />\n            <chapter id=\"ch-523\" name=\"Geothermal Heating Districts\" />\n        </title>\n        <title id=\"title-44\" name=\"Forestry and Forest Products\" range=\"526-532\">\n            <chapter id=\"ch-526\" name=\"Forestry Administration\" />\n            <chapter id=\"ch-527\" name=\"Pest Control; Forest Practices\" />\n            <chapter id=\"ch-530\" name=\"State Forests; Community Forests\" />\n            <chapter id=\"ch-532\" name=\"Branding of Forest Products and Booming Equipment\" />\n        </title>\n    </volume>\n    <volume id=\"vol-15\" name=\"Water Resources, Agriculture and Food\">\n        <title id=\"title-45\" name=\"Water Resources: Irrigation, Drainage, Flood Control, Reclamation\" range=\"536-558\">\n            <chapter id=\"ch-536\" name=\"Water Resources Administration\" />\n            <chapter id=\"ch-537\" name=\"Appropriation of Water Generally\" />\n            <chapter id=\"ch-538\" name=\"Withdrawal of Certain Waters From Appropriation; Special Municipal and County Water Rights\" />\n            <chapter id=\"ch-539\" name=\"Determination of Water Rights Initiated Before February 24, 1909; Determination of Water Rights of Federally Recognized Indian Tribes\" />\n            <chapter id=\"ch-540\" name=\"Distribution and Storage of Water; Watermasters; Water Right Changes, Transfers and Forfeitures\" />\n            <chapter id=\"ch-541\" name=\"Water Distributors; Water Releases; Conservation and Storage; Water Development Projects; Watershed Management and Enhancement\" />\n            <chapter id=\"ch-542\" name=\"Water Resource Surveys and Projects; Compacts\" />\n            <chapter id=\"ch-543\" name=\"Hydroelectric Projects\" />\n            <chapter id=\"ch-543A\" name=\"Reauthorizing and Decommissioning Hydroelectric Projects\" />\n            <chapter id=\"ch-545\" name=\"Irrigation Districts\" />\n            <chapter id=\"ch-547\" name=\"Drainage Districts\" />\n            <chapter id=\"ch-548\" name=\"Provisions Applicable Both to Drainage Districts and to Irrigation Districts\" />\n            <chapter id=\"ch-549\" name=\"Drainage and Flood Control Generally\" />\n            <chapter id=\"ch-550\" name=\"Urban Flood Safety and Water Quality District\" />\n            <chapter id=\"ch-551\" name=\"Diking Districts\" />\n            <chapter id=\"ch-552\" name=\"Water Improvement Districts\" />\n            <chapter id=\"ch-553\" name=\"Water Control Districts\" />\n            <chapter id=\"ch-554\" name=\"Corporations for Irrigation, Drainage, Water Supply or Flood Control\" />\n            <chapter id=\"ch-555\" name=\"Reclamation Projects; Sand Control\" />\n            <chapter id=\"ch-558\" name=\"Weather Modification\" />\n        </title>\n        <title id=\"title-46\" name=\"Agriculture\" range=\"561-571\">\n            <chapter id=\"ch-561\" name=\"State Department of Agriculture\" />\n            <chapter id=\"ch-564\" name=\"Wildflowers; Threatened or Endangered Plants\" />\n            <chapter id=\"ch-565\" name=\"Fairs and Exhibits\" />\n            <chapter id=\"ch-566\" name=\"Extension and Field Work; Rural Rehabilitation\" />\n            <chapter id=\"ch-567\" name=\"Experiment Stations\" />\n            <chapter id=\"ch-568\" name=\"Soil and Water Conservation; Water Quality Management\" />\n            <chapter id=\"ch-569\" name=\"Weed Control\" />\n            <chapter id=\"ch-570\" name=\"Plant Pest Control; Invasive Species\" />\n            <chapter id=\"ch-571\" name=\"Nursery Stock; Licensed Agricultural Crops\" />\n        </title>\n        <title id=\"title-47\" name=\"Agricultural Marketing and Warehousing\" range=\"576-587\">\n            <chapter id=\"ch-576\" name=\"Agricultural Marketing Generally\" />\n            <chapter id=\"ch-577\" name=\"Oregon Beef Council\" />\n            <chapter id=\"ch-578\" name=\"Oregon Wheat Commission\" />\n            <chapter id=\"ch-586\" name=\"Warehouses\" />\n            <chapter id=\"ch-587\" name=\"Storage of Grain as Basis of Farm Credit\" />\n        </title>\n        <title id=\"title-48\" name=\"Animals\" range=\"596-610\">\n            <chapter id=\"ch-596\" name=\"Disease Control Generally\" />\n            <chapter id=\"ch-599\" name=\"Livestock Auction Markets; Stockyards; Auction Sales\" />\n            <chapter id=\"ch-600\" name=\"Swine\" />\n            <chapter id=\"ch-601\" name=\"Dead Animals\" />\n            <chapter id=\"ch-602\" name=\"Bees\" />\n            <chapter id=\"ch-603\" name=\"Meat Sellers and Slaughterers\" />\n            <chapter id=\"ch-604\" name=\"Brands and Marks; Feedlots\" />\n            <chapter id=\"ch-607\" name=\"Livestock Districts; Stock Running at Large\" />\n            <chapter id=\"ch-608\" name=\"Fences to Prevent Damage by or to Animals\" />\n            <chapter id=\"ch-609\" name=\"Dogs; Exotic Animals; Dealers\" />\n            <chapter id=\"ch-610\" name=\"Predatory Animals\" />\n        </title>\n        <title id=\"title-49\" name=\"Food and Other Commodities: Purity, Sanitation, Grades, Standards, Labels, Weights and Measures\" range=\"616-635\">\n            <chapter id=\"ch-616\" name=\"General and Miscellaneous Provisions\" />\n            <chapter id=\"ch-618\" name=\"Weights and Measures\" />\n            <chapter id=\"ch-619\" name=\"Labeling and Inspection of Meat and Meat Food Products\" />\n            <chapter id=\"ch-621\" name=\"Milk; Dairy Products; Substitutes\" />\n            <chapter id=\"ch-622\" name=\"Shellfish\" />\n            <chapter id=\"ch-624\" name=\"Food Service Facilities\" />\n            <chapter id=\"ch-625\" name=\"Bakeries and Bakery Products\" />\n            <chapter id=\"ch-628\" name=\"Refrigerated Locker Plants\" />\n            <chapter id=\"ch-632\" name=\"Production, Grading and Labeling Standards for Agricultural and Horticultural Products\" />\n            <chapter id=\"ch-633\" name=\"Grades, Standards and Labels for Feeds, Soil Enhancers and Seeds\" />\n            <chapter id=\"ch-634\" name=\"Pesticide Control\" />\n            <chapter id=\"ch-635\" name=\"Nonalcoholic Beverages\" />\n        </title>\n    </volume>\n    <volume id=\"vol-16\" name=\"Trade Regulations and Practices; Labor and Employment; Unlawful Discrimination\">\n        <title id=\"title-50\" name=\"Trade Regulations and Practices\" range=\"645-650\">\n            <chapter id=\"ch-645\" name=\"Commodity Transactions\" />\n            <chapter id=\"ch-646\" name=\"Trade Practices and Antitrust Regulation\" />\n            <chapter id=\"ch-646A\" name=\"Trade Regulation\" />\n            <chapter id=\"ch-647\" name=\"Trademarks and Service Marks; Music Royalties\" />\n            <chapter id=\"ch-648\" name=\"Assumed Business Names\" />\n            <chapter id=\"ch-649\" name=\"Insignia and Names of Organizations\" />\n            <chapter id=\"ch-650\" name=\"Franchise Transactions\" />\n        </title>\n        <title id=\"title-51\" name=\"Trade Practices, Labor and Employment\" range=\"651-663\">\n            <chapter id=\"ch-651\" name=\"Bureau of Labor and Industries\" />\n            <chapter id=\"ch-652\" name=\"Hours; Wages; Wage Claims; Records\" />\n            <chapter id=\"ch-653\" name=\"Minimum Wages; Employment Conditions; Minors\" />\n            <chapter id=\"ch-654\" name=\"Occupational Safety and Health\" />\n            <chapter id=\"ch-655\" name=\"Injured Trainees and Adults in Custody\" />\n            <chapter id=\"ch-656\" name=\"Workers’ Compensation\" />\n            <chapter id=\"ch-657\" name=\"Unemployment Insurance\" />\n            <chapter id=\"ch-657B\" name=\"Family and Medical Leave Insurance\" />\n            <chapter id=\"ch-658\" name=\"Employment Agencies; Farm Labor Contractors and Construction Labor Contractors; Farmworker Camps\" />\n            <chapter id=\"ch-659\" name=\"Miscellaneous Prohibitions Relating to Employment and Discrimination\" />\n            <chapter id=\"ch-659A\" name=\"Unlawful Discrimination in Employment, Public Accommodations and Real Property Transactions; Administrative and Civil Enforcement\" />\n            <chapter id=\"ch-660\" name=\"Apprenticeship and Training; Workforce Development; Volunteerism\" />\n            <chapter id=\"ch-661\" name=\"Organized Labor; Union Labels\" />\n            <chapter id=\"ch-662\" name=\"Labor Disputes\" />\n            <chapter id=\"ch-663\" name=\"Labor Relations Generally\" />\n        </title>\n    </volume>\n    <volume id=\"vol-17\" name=\"Occupations\">\n        <title id=\"title-52\" name=\"Occupations and Professions\" range=\"670-704\">\n            <chapter id=\"ch-670\" name=\"Occupations and Professions Generally\" />\n            <chapter id=\"ch-671\" name=\"Architects; Landscape Professions and Business\" />\n            <chapter id=\"ch-672\" name=\"Professional Engineers; Land Surveyors; Photogrammetrists; Geologists\" />\n            <chapter id=\"ch-673\" name=\"Accountants; Other Tax Professionals\" />\n            <chapter id=\"ch-674\" name=\"Real Estate Appraisers and Appraisal\" />\n            <chapter id=\"ch-675\" name=\"Psychologists; Occupational Therapists; Certified Sexual Offense Therapists; Regulated Social Workers; Licensed Professional Counselors and Marriage and Family Therapists\" />\n            <chapter id=\"ch-676\" name=\"Health Professions Generally\" />\n            <chapter id=\"ch-677\" name=\"Regulation of Medicine, Podiatry and Acupuncture\" />\n            <chapter id=\"ch-678\" name=\"Nurses; Long Term Care Administrators\" />\n            <chapter id=\"ch-679\" name=\"Dentists\" />\n            <chapter id=\"ch-680\" name=\"Dental Hygienists; Denturists\" />\n            <chapter id=\"ch-681\" name=\"Hearing, Speech, Music Therapy and Art Therapy Professionals\" />\n            <chapter id=\"ch-682\" name=\"Regulation of Ambulance Services and Emergency Medical Services Providers\" />\n            <chapter id=\"ch-683\" name=\"Optometrists; Opticians\" />\n            <chapter id=\"ch-684\" name=\"Chiropractors\" />\n            <chapter id=\"ch-685\" name=\"Naturopathic Physicians\" />\n            <chapter id=\"ch-686\" name=\"Veterinarians; Veterinary Technicians\" />\n            <chapter id=\"ch-687\" name=\"Massage Therapists; Direct Entry Midwives\" />\n            <chapter id=\"ch-688\" name=\"Therapeutic and Technical Services: Physical Therapists; Medical Imaging Practitioners and Limited X-Ray Machine Operators; Hemodialysis Technicians; Athletic Trainers; Respiratory Therapists and Polysomnographic Technologists\" />\n            <chapter id=\"ch-689\" name=\"Pharmacists; Drug Outlets; Drug Sales\" />\n            <chapter id=\"ch-690\" name=\"Cosmetic Professionals\" />\n            <chapter id=\"ch-691\" name=\"Dietitians\" />\n            <chapter id=\"ch-692\" name=\"Funeral Service Practitioners; Embalmers; Death Care Consultants; Funeral Establishments; Cemetery Operators; Crematory Operators and Alternative Disposition Facilities\" />\n            <chapter id=\"ch-693\" name=\"Plumbers\" />\n            <chapter id=\"ch-694\" name=\"Hearing Aid Specialists\" />\n            <chapter id=\"ch-695\" name=\"Watch Dealers\" />\n            <chapter id=\"ch-696\" name=\"Real Estate and Escrow Activities\" />\n            <chapter id=\"ch-697\" name=\"Collection Agencies; Check-Cashing Businesses; Debt Management Service Providers\" />\n            <chapter id=\"ch-698\" name=\"Auctions\" />\n            <chapter id=\"ch-699\" name=\"Innkeepers and Hotelkeepers\" />\n            <chapter id=\"ch-700\" name=\"Environmental Health Specialists; Waste Water Specialists\" />\n            <chapter id=\"ch-701\" name=\"Construction Contractors and Contracts\" />\n            <chapter id=\"ch-702\" name=\"Student Athletes\" />\n            <chapter id=\"ch-703\" name=\"Truth Verification and Deception Detection; Investigators\" />\n            <chapter id=\"ch-704\" name=\"Outfitters and Guides\" />\n        </title>\n    </volume>\n    <volume id=\"vol-18\" name=\"Financial Institutions, Insurance\">\n        <title id=\"title-52A\" name=\"Insurance and Finance Administration\" range=\"705\">\n            <chapter id=\"ch-705\" name=\"Department of Consumer and Business Services\" />\n        </title>\n        <title id=\"title-53\" name=\"Financial Institutions\" range=\"706-717\">\n            <chapter id=\"ch-706\" name=\"Administration and Enforcement of Banking Laws Generally\" />\n            <chapter id=\"ch-707\" name=\"Organization to Conduct Banking Business; Stockholders, Directors and Officers\" />\n            <chapter id=\"ch-708A\" name=\"Regulation of Institutions Generally\" />\n            <chapter id=\"ch-709\" name=\"Regulation of Trust Business\" />\n            <chapter id=\"ch-711\" name=\"Merger; Conversion; Share Exchange; Acquisition; Liquidation; Insolvency\" />\n            <chapter id=\"ch-713\" name=\"Out-of-State Banks and Extranational Institutions\" />\n            <chapter id=\"ch-714\" name=\"Branch Banking; Automated Teller Machines\" />\n            <chapter id=\"ch-715\" name=\"Bank Holding Companies; Financial Holding Companies\" />\n            <chapter id=\"ch-716\" name=\"Savings Banks\" />\n            <chapter id=\"ch-717\" name=\"Money Transmission\" />\n        </title>\n        <title id=\"title-54\" name=\"Credit Unions, Lending Institutions and Pawnbrokers\" range=\"723-726\">\n            <chapter id=\"ch-723\" name=\"Credit Unions\" />\n            <chapter id=\"ch-725\" name=\"Consumer Finance\" />\n            <chapter id=\"ch-725A\" name=\"Short-Term Loans and Student Loan Servicing\" />\n            <chapter id=\"ch-726\" name=\"Pawnbrokers\" />\n        </title>\n        <title id=\"title-56\" name=\"Insurance\" range=\"731-752\">\n            <chapter id=\"ch-731\" name=\"Administration and General Provisions\" />\n            <chapter id=\"ch-732\" name=\"Organization and Corporate Procedures of Domestic Insurers; Regulation of Insurers Generally\" />\n            <chapter id=\"ch-733\" name=\"Accounting and Investments\" />\n            <chapter id=\"ch-734\" name=\"Rehabilitation, Liquidation and Conservation of Insurers\" />\n            <chapter id=\"ch-735\" name=\"Alternative Insurance\" />\n            <chapter id=\"ch-737\" name=\"Rates and Rating Organizations\" />\n            <chapter id=\"ch-741\" name=\"Health Insurance Exchange\" />\n            <chapter id=\"ch-742\" name=\"Insurance Policies Generally; Property and Casualty Policies\" />\n            <chapter id=\"ch-743\" name=\"Health and Life Insurance\" />\n            <chapter id=\"ch-743A\" name=\"Health Insurance: Reimbursement of Claims\" />\n            <chapter id=\"ch-743B\" name=\"Health Benefit Plans: Individual and Group\" />\n            <chapter id=\"ch-744\" name=\"Insurance Producers; Life Settlement Providers, Brokers and Contracts; Adjusters; Consultants; Third Party Administrators; Reinsurance Intermediaries; Limited Licenses\" />\n            <chapter id=\"ch-746\" name=\"Trade Practices\" />\n            <chapter id=\"ch-748\" name=\"Fraternal Benefit Societies\" />\n            <chapter id=\"ch-750\" name=\"Health Care Service Contractors; Multiple Employer Welfare Arrangements; Legal Expense Organizations\" />\n            <chapter id=\"ch-752\" name=\"Professional Liability Funds\" />\n        </title>\n    </volume>\n    <volume id=\"vol-19\" name=\"Utilities, Vehicle Code, Watercraft, Aviation\">\n        <title id=\"title-57\" name=\"Utility Regulation\" range=\"756-774\">\n            <chapter id=\"ch-756\" name=\"Public Utility Commission\" />\n            <chapter id=\"ch-757\" name=\"Utility Regulation Generally\" />\n            <chapter id=\"ch-758\" name=\"Utility Rights of Way and Territory Allocation; Cogeneration\" />\n            <chapter id=\"ch-759\" name=\"Telecommunications Utility Regulation\" />\n            <chapter id=\"ch-772\" name=\"Rights of Way for Public Uses\" />\n            <chapter id=\"ch-774\" name=\"Citizens’ Utility Board\" />\n        </title>\n        <title id=\"title-58\" name=\"Shipping and Navigation\" range=\"776-783\">\n            <chapter id=\"ch-776\" name=\"Maritime Pilots and Pilotage\" />\n            <chapter id=\"ch-777\" name=\"Ports Generally\" />\n            <chapter id=\"ch-778\" name=\"Port of Portland\" />\n            <chapter id=\"ch-780\" name=\"Improvement and Use of Navigable Streams\" />\n            <chapter id=\"ch-783\" name=\"Liabilities and Offenses Connected With Shipping and Navigation; Shipbreaking; Ballast Water\" />\n        </title>\n        <title id=\"title-59\" name=\"Oregon Vehicle Code\" range=\"801-826\">\n            <chapter id=\"ch-801\" name=\"General Provisions and Definitions for Oregon Vehicle Code\" />\n            <chapter id=\"ch-802\" name=\"Administrative Provisions\" />\n            <chapter id=\"ch-803\" name=\"Vehicle Title and Registration\" />\n            <chapter id=\"ch-805\" name=\"Special Registration Provisions\" />\n            <chapter id=\"ch-806\" name=\"Financial Responsibility Law\" />\n            <chapter id=\"ch-807\" name=\"Driving Privileges and Identification Cards\" />\n            <chapter id=\"ch-809\" name=\"Refusal, Suspension, Cancellation and Revocation of Registration, Title, Driving Privileges and Identification Card; Vehicle Impoundment\" />\n            <chapter id=\"ch-810\" name=\"Road Authorities; Courts; Police; Other Enforcement Officials\" />\n            <chapter id=\"ch-811\" name=\"Rules of the Road for Drivers\" />\n            <chapter id=\"ch-813\" name=\"Driving Under the Influence of Intoxicants\" />\n            <chapter id=\"ch-814\" name=\"Pedestrians; Passengers; Livestock; Motorized Wheelchairs; Vehicles With Fewer Than Four Wheels\" />\n            <chapter id=\"ch-815\" name=\"Vehicle Equipment Generally\" />\n            <chapter id=\"ch-816\" name=\"Vehicle Equipment: Lights\" />\n            <chapter id=\"ch-818\" name=\"Vehicle Limits\" />\n            <chapter id=\"ch-819\" name=\"Destroyed, Totaled, Abandoned, Low-Value and Stolen Vehicles; Vehicle Identification Numbers; Vehicle Appraisers\" />\n            <chapter id=\"ch-820\" name=\"Special Provisions for Certain Vehicles\" />\n            <chapter id=\"ch-821\" name=\"Off-Road Vehicles; Snowmobiles; All-Terrain Vehicles\" />\n            <chapter id=\"ch-822\" name=\"Regulation of Vehicle Related Businesses\" />\n            <chapter id=\"ch-823\" name=\"Carrier Regulation Generally\" />\n            <chapter id=\"ch-824\" name=\"Railroads\" />\n            <chapter id=\"ch-825\" name=\"Motor Carriers\" />\n            <chapter id=\"ch-826\" name=\"Registration of Commercial Vehicles\" />\n        </title>\n        <title id=\"title-61\" name=\"Small Watercraft\" range=\"830\">\n            <chapter id=\"ch-830\" name=\"Small Watercraft\" />\n        </title>\n        <title id=\"title-62\" name=\"Aviation\" range=\"835-838\">\n            <chapter id=\"ch-835\" name=\"Aviation Administration\" />\n            <chapter id=\"ch-836\" name=\"Airports and Landing Fields\" />\n            <chapter id=\"ch-837\" name=\"Aircraft Operation\" />\n            <chapter id=\"ch-838\" name=\"Airport Districts\" />\n        </title>\n    </volume>\n</volumes>\n";

/***/ }),

/***/ "./node_modules/@ocdla/ors/src/Chapter.js":
/*!************************************************!*\
  !*** ./node_modules/@ocdla/ors/src/Chapter.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Chapter)
/* harmony export */ });
/* harmony import */ var _Outline_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Outline.js */ "./node_modules/@ocdla/ors/src/Outline.js");
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Parser.js */ "./node_modules/@ocdla/ors/src/Parser.js");



const gSubRe = /^\(([0-9a-zA-Z]+)\)(.*)/gm;
const subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;

// Fetches the contents of the original ORS chapter from the Oregon Legislature web site.
// Transforms it in to a well-formed HTML document.
class Chapter {
    // The chapter number.
    chapterNum = null;

    // Title of this chapter - must be a string.
    title;

    // The chapter's underlying XML document.
    doc = null;

    // Parsed title of each section of this chapter.
    sectionTitles = {};

    // Contains references to DOM node <b> elements.
    // Might be unused.
    sectionHeadings = {};

    constructor(chapterNum) {
        this.chapterNum = chapterNum;
        this.doc = new Document();
    }

    // Convert one unstructured chapter into a structured chapter.
    // Use the anchors in the unstructured chapter to build a structured chapter
    // where each section and subsection(s) are grouped and wrapped in the appropriate node hierarchy.
    static toStructuredChapter(chapter) {
        let ch = new Chapter(chapter.chapterNum);
        let doc = ch.doc;

        ch.chapterTitle = chapter.chapterTitle;
        ch.sectionTitles = chapter.sectionTitles;

        let wordSection = doc.createElement('div');
        wordSection.setAttribute('class', 'WordSection1');

        for (let sectionNumber in chapter.sectionTitles) {
            let sectionTitle = chapter.sectionTitles[sectionNumber];
            // Create a new section element.
            const section = doc.createElement('div');
            section.setAttribute('id', 'section-' + sectionNumber);

            // console.log(prop);
            let startId = 'section-' + parseInt(sectionNumber);
            let endId = chapter.getNextSectionId(startId);
            let clonedSection = chapter.cloneFromIds(startId, endId);
            let [header, matches] = chapter.retrievePTags(clonedSection);

            // If matches is a string, there are no subsections,
            // so we just build the element with the text that is stored in matches and append it to the section
            if (typeof matches == 'string') {
                // console.log(matches);
                let element = _Outline_js__WEBPACK_IMPORTED_MODULE_0__["default"].buildSection(
                    doc,
                    'description',
                    'section-' + sectionNumber + '-description',
                    matches,
                    0
                );
                section.appendChild(element);
            } else {
                chapter.iterateMatches(matches, 0, section, sectionNumber);
            }
            let heading = doc.createElement('h2');
            let anchor = doc.createElement('a');

            // Lets us link to this section.
            anchor.setAttribute('href', '#section-' + sectionNumber);
            anchor.appendChild(
                doc.createTextNode(
                    ch.chapterNum +
                        '.' +
                        sectionNumber.toString().padStart(3, '0') +
                        ' - ' +
                        sectionTitle
                )
            );

            // Display a section heading.
            heading.setAttribute('class', 'section-heading');
            heading.appendChild(anchor);

            wordSection.appendChild(heading);
            wordSection.appendChild(section);
        }
        doc.appendChild(wordSection);

        return ch;
    }

    static fromResponse(resp, chapterNum) {
        return resp
            .arrayBuffer()
            .then(function (buffer) {
                const decoder = new TextDecoder('iso-8859-1');
                return decoder.decode(buffer);
            })
            .then(html => {
                const parser = new DOMParser();

                let chapter = new Chapter(chapterNum);
                // Tell the parser to look for html
                chapter.doc = parser.parseFromString(html, 'text/html');

                let [sectionTitles, sectionHeadings] =
                    _Outline_js__WEBPACK_IMPORTED_MODULE_0__["default"].retrieveSectionTitles(chapter.doc);
                chapter.sectionTitles = sectionTitles;
                chapter.sectionHeadings = sectionHeadings;
                chapter.injectAnchors();

                return chapter;
            });
    }

    // Inserts anchors as <div> tags in the doc.
    // Note: this affects the underlying structure
    // of the XML document.
    injectAnchors() {
        for (var prop in this.sectionTitles) {
            let headingDiv = this.doc.createElement('div');
            headingDiv.setAttribute('id', 'section-' + prop);
            headingDiv.setAttribute('class', 'ocdla-heading');
            headingDiv.setAttribute('data-chapter', this.chapterNum);
            headingDiv.setAttribute('data-section', prop);

            let target = this.sectionHeadings[prop];
            target.parentNode.insertBefore(headingDiv, target);
        }
        var subset = this.doc.querySelector('.WordSection1');
        let headingDiv = this.doc.createElement('div');
        headingDiv.setAttribute('class', 'ocdla-heading');
        headingDiv.setAttribute('id', 'end');
        subset.appendChild(headingDiv);
    }

    /**
     *
     * @param {String} id
     * @returns DOMNode
     */
    getSection(id) {
        return this.doc.getElementById('section-' + id);
    }

    getAllTextNodes(node) {
        let textNodes = [];

        function recurse(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    recurse(node.childNodes[i]);
                }
            }
        }

        recurse(node);
        return textNodes;
    }

    /**
     *
     * @param {String} id
     * @returns DOMNode
     */
    querySelectorAll(references) {
        let nodes = [];

        if (!Array.isArray(references)) {
            return this.doc.querySelectorAll(references);
        }
        console.log('References length is: ', references);
        for (let i = 0; i < references.length; i++) {
            let reference = references[i];
            let chapter, section, subsection;
            let rangeStart, rangeEnd;
            [rangeStart, rangeEnd] = reference.split('-');
            console.log('Ranges', rangeStart, rangeEnd);
            [chapter, section, subsection] = Chapter.parseReference(rangeStart);
            console.log(chapter, section, subsection);
            let ids = subsection
                ? [parseInt(section), subsection].join('-')
                : parseInt(section);
            ids = '#section-' + ids;
            // console.log(ids);
            let node = this.doc.querySelector(ids);
            if (null == node) return null;

            // If the selector specifies a range of subsections retrieve only those.
            if (rangeEnd) {
                console.log('RANGE DETECTED!');
                node = node.parentNode.cloneNode(true);
                node = Chapter.extractRange(node, rangeStart, rangeEnd);
            }

            nodes.push(node);
            // console.log(nodes);
        }
        return nodes;
    }

    static extractRange(node, startRef, endRef) {
        // console.log(node, startRef, endRef);
        // check node.children
        // match (1)(a)(A)(i) etc.

        let start = Chapter.parseSubsections(startRef);
        let end = Chapter.parseSubsections(endRef);
        let remove = [];
        let regEx, regStart, regEnd;

        regStart = start.pop();
        regEnd = end.pop();
        regEx = new RegExp('[' + regStart + '-' + regEnd + ']');

        let children = node.children;
        for (var i = 0; i < children.length; i++) {
            let child = children[i];
            let id = child.getAttribute('id');
            if (!id) continue;
            let parts = id.split('-');
            let compare = parts.pop();
            console.log('Comparing ', compare, regEx);
            if (!compare.match(regEx)) {
                console.log('match not found');
                remove.push(child);
            } else {
                console.log('match found');
            }
        }

        for (var n of remove) {
            node.removeChild(n);
        }

        return node;
    }

    static parseSubsections(reference) {
        let subs = reference.match(/(?<=\()([0-9a-zA-Z]+)(?=\))/g);

        console.log('parseSubsections()', subs);

        return subs;
    }

    static parseReference(reference) {
        let chapter, section, subsection;
        let parts = reference.match(/([0-9a-zA-Z]+)/g);
        chapter = parts.shift();
        section = parts.shift();

        // Parse a range of subsections.
        // Parse a comma-delimitted series of subsections.
        //this.references = reference.split(",");
        subsection = parts.length > 0 ? parts.join('-') : null;
        return [chapter, section, subsection];
    }

    // there are exceptions!!!
    // such as (5)(a).
    // it will find the 5, and put subsection level to 0.
    // HOWEVER, we are actually supposed to be on (a).
    // the level is supposed to be 1.
    // the next subsection in the list is (A).
    // this is ONLY EXPECTED when level is 1. Not when level is 0.
    // so it breaks. Hurray!

    retrievePTags(section) {
        let text = '';
        let pTags = section.children;

        let fn = function (match, p1, offset, original) {
            let duo = match.split(')(');
            return duo.join(')\n(');
        };

        let header = pTags[0].querySelector('b');
        header = pTags[0].removeChild(header);
        header = header.innerText;

        for (var index in pTags) {
            let child = pTags[index];
            let childText = '';

            if (child != null) {
                childText = child.innerText;
            }

            if (childText == null || childText == '') {
                continue;
            }

            childText = childText.trim().replaceAll('\n', ' ');
            text += childText + '\n';
        }

        let matches = text.replaceAll(
            /(^\([0-9a-zA-Z]+\)\([0-9a-zA-Z]+\))/gm,
            fn
        );

        matches = matches.match(gSubRe);

        return matches === null ? [header, text] : [header, matches];
    }

    iterateMatches(
        matches,
        currentIndex,
        parent,
        sectionNumber,
        lastLevel = '0'
    ) {
        //if we leave off at a roman numeral then

        //console.log(matches);
        // console.log(sectionNumber);
        if (sectionNumber == 555) {
            // console.log(matches);
        }
        if (currentIndex >= matches.length) {
            return parent;
        }

        //for (var i = currentIndex; i < matches.length; i++) {
        // let match = fun(matches, currentIndex);
        let match = matches[currentIndex].match(subRe);
        let nextMatch = matches[currentIndex + 1];
        let id, divId, text, level;
        if (match == null) {
            // not a subsection
            // what do?
            // nothing. we shouldn't handle this case, this is either descriptive text or not..?
            // maybe handle for single section text like 701.002.
            id = 'description';
            text = matches[currentIndex];
            level = '0';
            return;
        } else {
            id = match[1];
            text = '(' + id + ')' + match[2];
            level = _Outline_js__WEBPACK_IMPORTED_MODULE_0__["default"].findLevel(id, nextMatch);
        }

        //console.log(match);
        // 0 should be full text?
        // 1 is id
        // 2 is text without subsection

        if (level > lastLevel) {
            parent = parent.lastChild;
        } else if (level < lastLevel) {
            if (lastLevel - level == 1) {
                parent = parent.parentNode;
            } else if (lastLevel - level == 2) {
                parent = parent.parentNode.parentNode;
            } else if (lastLevel - level == 3) {
                parent = parent.parentNode.parentNode.parentNode;
            }
        }
        if (parent == null) {
            console.warn('Parent is null', matches, sectionNumber);
            return;
        }
        divId = parent.getAttribute('id') + '-' + id;
        let element = _Outline_js__WEBPACK_IMPORTED_MODULE_0__["default"].buildSection(this.doc, id, divId, text, level);
        parent.appendChild(element);
        // identify subsections
        // build subsection grouping elements

        this.iterateMatches(
            matches,
            ++currentIndex,
            parent,
            sectionNumber,
            level
        );
    }

    removeNodes(selector) {
        let nodes = this.doc.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.parentNode.removeChild(node);
        }
    }

    buildToc() {
        let toc = [];

        for (let key in this.sectionTitles) {
            let val = this.sectionTitles[key];
            toc.push(
                `<li><span class="section-number">${this.chapterNum}.${key}</span><a data-action="view-section" data-section="${key}" href="#">${val}</a></li>`
            );
        }

        var joinedToc = toc.join(' ');
        return joinedToc;
    }

    cloneFromIds(startId, endId) {
        var startNode = this.doc.getElementById(startId);
        if (null == startNode) {
            throw new Error('NODE_NOT_FOUND_ERROR: (#' + startId + ')');
        }
        var endNode = this.doc.getElementById(endId);
        if (null == startNode) {
            throw new Error('NODE_NOT_FOUND_ERROR: (#' + endId + ')');
        }

        return this.clone(startNode, endNode);
    }

    // Clones the contents inside a range.
    clone(startNode, endNode) {
        let range = document.createRange();

        range.setStartBefore(startNode);
        range.setEndBefore(endNode);

        var contents = range.cloneContents();

        var spans = contents.querySelectorAll('span');
        // remove styling from each span
        for (var elements in spans) {
            let element = spans[elements];
            if (element.style) {
                element.style = null;
            }
        }
        // console.log(contents);
        return contents;
    }

    // Given a valid section number,
    // returns the next section in this ORS chapter.
    // Used for building ranges.
    getNextSectionId(sectionNum) {
        var headings = this.doc.querySelectorAll('.ocdla-heading');
        var section = this.doc.getElementById(sectionNum);

        if (null == section) {
            throw new Error(
                'NODE_NOT_FOUND_ERROR: Could not locate ' + sectionNum
            );
        }
        for (let i = 0; i < headings.length; i++) {
            if (headings.item(i) == section) {
                let nextSection = headings.item(i + 1);
                return nextSection.getAttribute('id');
            }
        }
    }

    // Outputs the document as an HTML string
    toString() {
        let xml = this;

        let work = [
            {
                explanation:
                    "Find all Oregon Laws (*not ORS) references with the pattern like '2019 c. 123 § 1'",
                patterns: [
                    /(?<year>\d{4})\s*c\.(?<chapter>\d+)\s+[§sS]+(?<section>\d+,*\s?)+/g
                ],
                replacer: function (groups) {
                    return `!OREGON LAWS ${groups.year}!`;
                }
            },
            {
                patterns: [
                    /ORS\s+(?<chapter>\w+)\.(?<section>\d+)(?:\s?\((?<subsection>[0-9a-zA-Z]{1,3})\))*/g,
                    /(?<!ORS\s+\d*)(?<chapter>\w+)\.(?<section>\d+)(?:\s?\((?<subsection>[0-9a-zA-Z]{1,3})\))*/g
                ],
                replacer: function (groups) {
                    let subsection = groups.subsection
                        ? `(${groups.subsection})`
                        : '';

                    return `<a href="/chapter/${groups.chapter}#section-${groups.section}" style="color:blue;" data-action="show-ors" data-chapter="${groups.chapter}" data-section="${groups.section}" data-subsection="${subsection}">ORS ${groups.chapter}.${groups.section}${subsection}</a>`;
                }
            }
        ];

        let transform = true;
        if (!transform) return xml.toString();
        for (let node of this.getAllTextNodes(xml.doc.documentElement)) {
            let parser,
                frag,
                html = node.data;

            // As the main goal here is to insert links, there should be no need to process links again.
            if (node.parentNode.nodeName == 'a') {
                continue;
            }

            for (let job of work) {
                parser = new _Parser_js__WEBPACK_IMPORTED_MODULE_1__["default"](job.patterns);
                parser.replaceWith(job.replacer);
                html = parser.parse(html);
            }

            frag = _Parser_js__WEBPACK_IMPORTED_MODULE_1__["default"].createDocumentFragment(html);
            node.parentNode.replaceChild(frag, node);
        }
        const serializer = new XMLSerializer();
        const subset = this.doc.querySelector('.WordSection1');

        return serializer.serializeToString(subset);
    }
}


/***/ }),

/***/ "./node_modules/@ocdla/ors/src/Outline.js":
/*!************************************************!*\
  !*** ./node_modules/@ocdla/ors/src/Outline.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Outline)
/* harmony export */ });
/**
 * @class Outline
 * @description This class is used to create an outline of the ORS chapter.
 */

class Outline {
    /**
     * In an ORS chapter, the section titles are bolded.
     * This method retrieves the section titles and their corresponding section numbers.
     */
    static retrieveSectionTitles(doc) {
        // Createa nodeList of all the <b> elements in the body
        let headings = doc.querySelectorAll('b');
        let titles = [],
            elems = [];

        for (var i = 0; i < headings.length; i++) {
            let boldParent = headings[i];
            var trimmed = headings[i].textContent.trim();
            if (trimmed.indexOf('Note') === 0) continue;
            let strings = trimmed.split('\n');
            let chapter, section, key, val;

            // If array has only one element,
            // Then we know this doesn't follow the regular statute pattern.
            if (strings.length === 1) {
                key = strings[0];
                val = boldParent.nextSibling
                    ? boldParent.nextSibling.textContent
                    : '';
            } else {
                // otherwise our normal case.
                key = strings[0];
                val = strings[1];

                let numbers = key.split('.');
                chapter = numbers[0];
                section = numbers[1];
            }

            // Might need to change this one to remove parseInt
            titles[parseInt(section)] = val;
            elems[parseInt(section)] = boldParent;
        }

        return [titles, elems];
    }

    static findLevel(text, nextMatch) {
        let subNumRe = /^[0-9]+/;
        let subUpperRe = /^[A-Z]+/;
        let subRe = /^\(([0-9a-zA-Z]+)\)(.*)/;

        let nextId;

        if (nextMatch != null) {
            nextId = nextMatch.match(subRe)[1];
        }

        if (text.match(subNumRe)) {
            return '0';
        } else if (
            !Outline.isRomanNumeral(text, nextId) &&
            !text.match(subUpperRe)
        ) {
            return '1';
        } else if (text.match(subUpperRe)) {
            return '2';
        } else if (Outline.isRomanNumeral(text, nextId)) {
            return '3';
        }
    }

    static isRomanNumeral(text, nextText) {
        let romanReg = /^[ivx]+/;
        if (nextText == null) {
            return text.match(romanReg);
        }
        return (
            text.match(romanReg) &&
            (nextText.match(romanReg) || text.length > 1)
        );
    }

    static buildSection(doc, id, divId, text, level) {
        let sub = doc.createElement('div');
        sub.setAttribute('id', divId);
        sub.setAttribute('class', 'level-' + level);

        let span = doc.createElement('span');
        span.setAttribute('class', 'subsection');

        if (id !== 'description') {
            span.innerText = '(' + id + ')';
        }

        let theText = doc.createTextNode(text);

        // sub.appendChild(span);
        sub.appendChild(theText);

        return sub;
    }
}


/***/ }),

/***/ "./node_modules/@ocdla/ors/src/Parser.js":
/*!***********************************************!*\
  !*** ./node_modules/@ocdla/ors/src/Parser.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * @class Parser
 * @description Parses ORS references in text and replaces them with links.
 * @example
 * let text = "ORS 123.123";
 * let linked = Parser.replaceAll(text);
 */
const Parser = (function () {
    function replacer(match, p1, p2, offset, string, g) {
        // console.log(arguments);
        let length = arguments.length - 3;
        let memorized = Array.prototype.slice.call(arguments, length);
        let groups = memorized.pop();
        // console.log(groups);

        return this.replaceFn(groups);
    }

    function Parser(patterns) {
        this.patterns = patterns;
        this.replaceFn = null;
    }

    function replaceWith(replacer) {
        this.replaceFn = replacer;
    }

    function parse(text) {
        let tmp = text;
        for (var regexp of this.patterns) {
            text = text.replaceAll(regexp, this.replacer.bind(this));
        }

        if (tmp == text) {
            console.log('No changes to node.');
        }

        return text;
    }

    Parser.prototype = {
        replaceWith: replaceWith,
        parse: parse,
        replacer: replacer
    };

    function createDocumentFragment(html) {
        const parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        let fragment = new DocumentFragment();
        fragment.append(doc.documentElement);

        return fragment;
    }

    Parser.createDocumentFragment = createDocumentFragment;

    return Parser;
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Parser);


/***/ }),

/***/ "./node_modules/@ocdla/routing/Router.js":
/*!***********************************************!*\
  !*** ./node_modules/@ocdla/routing/Router.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Router)
/* harmony export */ });
/* harmony import */ var _ocdla_global_components_src_NotFound_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ocdla/global-components/src/NotFound.jsx */ "./node_modules/@ocdla/global-components/src/NotFound.jsx");
// This import requires the defining of its extension type, otherwise there's an error.


class Router {
    constructor(basePath) {
        // constructor(route, component) {
        this.routes = [];
        this.basePath = basePath;
        // this.addRoute(route, component);

        // if (this.routes.length !== 0) {
        //     if (!sessionStorage.getItem('init')) {
        //         history.pushState({}, '', route);

        //         sessionStorage.setItem('init', 'false');
        //     }
        // }
    }

    addRoute(path, component = _ocdla_global_components_src_NotFound_jsx__WEBPACK_IMPORTED_MODULE_0__["default"], params = {}) {
        const routeExists = this.routes.find(r => r.route === path);

        if (routeExists) {
            routeExists.id = id;
            routeExists.component = component;
        } else this.routes.push({ route: path, component, params });
    }

    match(path, hash) {
        // Leave the root path alone; compensate for any trailing slashes.
        const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
        const parts = normalized.split('/');
        const _var = parts.length > 2 ? parts[parts.length - 2] : null;

        for (const r in this.routes.reverse()) {
            let { route, component, params } = this.routes[r];

            route = route.replaceAll('/', '\\/');

            // May need to add in modifiers / flags.
            const re = new RegExp(route);
            const matches = path.match(re);

            // If matches is null, then there wasn't a match.
            if (matches) {
                if (null !== _var) {
                    params[_var] = matches[1];
                    params['hash'] = hash;
                }

                return [component, params];
            }
        }

        return [_ocdla_global_components_src_NotFound_jsx__WEBPACK_IMPORTED_MODULE_0__["default"], {}];
    }
}


/***/ }),

/***/ "./node_modules/@ocdla/view/view.js":
/*!******************************************!*\
  !*** ./node_modules/@ocdla/view/view.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   View: () => (/* binding */ View),
/* harmony export */   getResult: () => (/* binding */ getResult),
/* harmony export */   useEffect: () => (/* binding */ useEffect),
/* harmony export */   vNode: () => (/* binding */ vNode)
/* harmony export */ });
/**
 * @ocdladefense/view
 *
 * @description Here is my description.
 *
 *
 *
 */

// Array of functions that will be executed before each view is rendered.
const effectsFns = {};

// Object containing the results of each effect function.
const results = {};


// import { CACHE, HISTORY } from "./cache.js";

function useEffect(key, fn) {
    effectsFns[key] = fn;
}

function getResult(key) {
    return results[key];
}

async function resolveEffects() {
    let foobar = Object.values(effectsFns);
    let _results = await Promise.all(foobar.map(fn => fn()));
    let i = 0;
    for (const key of Object.keys(effectsFns)) {
        results[key] = _results[i++];
    }
}

/**
 * @class View
 *
 * This is a description of the View class.
 */
const View = (function () {
    const NODE_CHANGED_STATES = [
        'NODE_NO_COMPARISON',
        'NODE_DIFFERENT_TYPE',
        'NODE_NOT_EQUAL',
        'NODE_DIFFERENT_ELEMENT',
        'NODE_PROPS_CHANGED',
        'TEXT_NODES_NOT_EQUAL'
    ];

    /**
     * @constructs View
     * @param root
     */
    function View(root) {
        this.root = root;
        //document.getElementById("order-history-main").addEventListener("click", myAppEventHandler);
        //root.addEventListener("click", myAppEventHandler);
    }

    /**
     * @memberof View
     * @method render
     * @instance
     * @description Perform an initial paint of a virtual node structure.
     * @param {Object} vNode A virtual node structure.
     */
    async function render(vNode) {
        // Components can register effects to be run before rendering.
        // These should be understood as "this component needs the effect (or result) of exeecuting some function before it can render".
        // Components can then use the result of these functions through the getResult(key) function.
        // This also implies that components are at least evaluated twice at startup: once to register the effect and once to start the initial render.

        // Run through the component functions once to gather all the effects.
        evaluateEffects(vNode);
        await resolveEffects();
        console.log('Effects resolved.');
        console.log(results);

        // Note render the tree.
        this.currentTree = vNode;
        let $newNode = createElement(vNode);

        this.root.innerHTML = '';
        this.root.appendChild($newNode);
    }

    function update(newNode) {
        updateElement(this.root, newNode, this.currentTree);

        this.currentTree = newNode;
    }

    /**
     * @memberof View
     * @method updateElement
     * @instance
     * @description Perform an initial paint of a virtual node structure.
     * @param {DOMNode} $parent
     * @param {vNode} newNode Then new virtual node tree to be rendered.
     * @param {vNode} oldNode The old virtual node tree to be diffed.
     * @param {Integer} index The current index of a recursive structure.
     */
    function updateElement($parent, newNode, oldNode, index = 0) {
        let state = getChangeState(newNode, oldNode);

        // Whether to use replaceChild to swap nodes.
        let shouldSwapNodes = changed(state);

        // Whether this current evaluation is a synthetic node.
        let isSynthetic = newNode && typeof newNode.type === 'function';

        if ($parent.nodeType == 3) {
            return;
        }

        if (!oldNode) {
            let n = View.createElement(newNode);
            $parent.appendChild(n);
        } else if (!newNode) {
            if (!$parent.children[index]) {
                $parent.removeChild(
                    $parent.children[$parent.children.length - 1]
                );
            } else {
                $parent.removeChild($parent.children[index]);
            }
        } else if (isSynthetic) {
            if (
                newNode.type &&
                newNode.type.prototype &&
                newNode.type.prototype.render
            ) {
                let obj = new newNode.type(newNode.props);
                newNode = obj.render();
            } else {
                newNode =
                    typeof newNode.type === 'function'
                        ? newNode.type(newNode.props)
                        : newNode;
            }

            if (
                oldNode.type &&
                oldNode.type.prototype &&
                oldNode.type.prototype.render
            ) {
                let obj = new oldNode.type(oldNode.props);
                oldNode = obj.render();
            } else
                oldNode =
                    typeof oldNode.type === 'function'
                        ? oldNode.type(oldNode.props)
                        : oldNode;
            updateElement($parent, newNode, oldNode, index);
        } else if (!isSynthetic && shouldSwapNodes) {
            let n = createElement(newNode);

            if (newNode.type) {
                $parent.replaceChild(n, $parent.childNodes[index]);
            } else {
                $parent.replaceChild(n, $parent.childNodes[index]);
            }
        }

        // Not obvious, but text nodes don"t have a type and should
        // have been handled before this block executes.
        else if (newNode.type && newNode.children) {
            const newLength = newNode.children.length;
            const oldLength = oldNode.children.length;

            for (let i = 0; i < newLength || i < oldLength; i++) {
                let nextParent = $parent.childNodes[index];
                let revisedNode = newNode.children[i];
                let expiredNode = oldNode.children[i];
                let equal = revisedNode == expiredNode;
                if (equal) continue;

                updateElement(nextParent, revisedNode, expiredNode, i);
            }
        }
    }

    function getChangeState(n1, n2) {
        if (n1 && !n2) return 'NODE_NO_COMPARISON';

        if (n1 == n2) return 'NODE_NO_CHANGE';

        // Comparing two text nodes that are obviously different.
        if (typeof n1 === 'string' && typeof n2 === 'string' && n1 !== n2) {
            return 'TEXT_NODES_NOT_EQUAL';
        }

        if (typeof n1 !== typeof n2) {
            return 'NODE_DIFFERENT_TYPE';
        }

        if (n1.type !== n2.type) {
            return 'NODE_DIFFERENT_ELEMENT';
        }

        if (propsChanged(n1, n2)) {
            return 'NODE_PROPS_CHANGED';
        }

        if (n1 != n2) {
            return 'NODE_RECURSIVE_EVALUATE';
        }

        return 'NODE_NO_CHANGE';
    }

    function changed(state) {
        return NODE_CHANGED_STATES.includes(state);
    }

    function propsChanged(node1, node2) {
        let node1Props = node1.props;
        let node2Props = node2.props;

        if (typeof node1Props != typeof node2Props) {
            return true;
        }

        if (!node1Props && !node2Props) {
            return false;
        }

        let aProps = Object.getOwnPropertyNames(node1Props);
        let bProps = Object.getOwnPropertyNames(node2Props);

        if (aProps.length != bProps.length) {
            return true;
        }

        for (let i = 0; i < aProps.length; i++) {
            let propName = aProps[i];

            if (node1Props[propName] !== node2Props[propName]) {
                return true;
            }
        }

        return false;
    }

    View.prototype = {
        render: render,
        update: update,
        createElement: createElement
    };

    return View;
})();

/**
 * Return a View instance from the given DOM element or selector.
 *
 * @param {string} selector
 * @returns {View}
 */
View.createRoot = function (selector) {
    let elem =
        typeof selector == 'string'
            ? document.querySelector(selector)
            : selector;
    let root = elem.cloneNode(false);
    elem.parentElement.replaceChild(root, elem);

    return new View(root);
};

function evaluateEffects(vnode) {
    return createElement(vnode);
}

/**
 * @memberof View
 * @method createElement
 * @description Recursively transform a virtual node structure into a DOM node tree.
 * @param {Object} vnode A virtual node structure.
 * @returns DOMElement
 */
function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode.toString());
    }
    if (vnode.type == 'text') {
        return document.createTextNode(vnode.children);
    }
    //first check to see if component references a class name
    if (
        typeof vnode.type == 'function' &&
        vnode.type.prototype &&
        vnode.type.prototype.render
    ) {
        console.log('vNode is a class reference');
        let obj = new vnode.type(vnode.props);
        let render = obj.render();
        let node = createElement(render);
        //BACKTO
        // Let the component know about its own root.
        // obj.setRoot(node);
        return node;
    }
    if (typeof vnode.type == 'function') {
        let fn = vnode.type(vnode.props);
        return createElement(fn);
    }

    var $el =
        vnode.type == 'Fragment'
            ? document.createDocumentFragment()
            : document.createElement(vnode.type);
    var theClassNames;
    var theEventKey;

    if (vnode.props) {
        //var html5 = "className" == prop ? "class" : prop;
        theClassNames = vnode.props['class'];
        if (theClassNames) {
            theClassNames = theClassNames.split(' '); //hack, get better way of obtaining names, this one only gets the first
            // theEventKey = theClassNames[0];
        }
    }

    //BACKTO
    for (var prop in vnode.props) {
        var html5 = 'className' == prop ? 'class' : prop;
        if ('children' == prop) continue;
        if ('dangerouslySetInnerHTML' == prop) {
            $el.innerHTML = vnode.props[prop];
            continue;
        }
        if (prop.indexOf('on') === 0) {
            $el.addEventListener(prop.substring(2), vnode.props[prop]);
            continue;
        } else if (vnode.props[prop] === null) {
            continue;
        } else {
            $el.setAttribute(html5, vnode.props[prop]);
        }
    }

    if (null != vnode.children) {
        vnode.children.map(createElement).forEach($el.appendChild.bind($el));
    }

    return $el;
}

View.createElement = createElement;

/**
 * JSX parsing function.
 */
function vNode(name, attributes, ...children) {
    attributes = attributes || {};
    let joined = [];
    if (
        children.length == 0 ||
        null == children[0] ||
        typeof children[0] == 'undefined'
    ) {
        joined = [];
    } else if (children.length == 1 && typeof children[0] == 'string') {
        joined = children;
    } else {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                joined = joined.concat(children[i]);
            } else {
                joined.push(children[i]);
            }
        }
    }

    attributes.children = joined;

    var vnode = {
        type: name,
        props: attributes,
        children: joined
    };

    return vnode;
}

async function refresh() {
    let hash;
    let params;
    [hash, params] = parseHash(window.location.hash);
    let tree;
    let c;

    let elem = document.querySelector('#job-container');
    if (elem) {
        elem.removeEventListener('click', this.currentComponent);
    }

    if (hash == '' || hash == '#') {
        c = new JobList();
    } else if (hash == '#new') {
        c = new JobForm();
    } else if (hash.startsWith('#edit')) {
        c = new JobForm(params.id);
    } else if (hash.startsWith('#details')) {
        c = new JobSearch(params.id);
    }

    c.listenTo('click', '#job-container');
    /*
        Listen for submit events
        c.listenTo("submit", "#record-form");
        */

    if (c.loadData) {
        await c.loadData();
    }
    tree = c.render();

    this.view.render(tree);
    this.currentComponent = c;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/index.jsx");
/******/ 	
/******/ })()
;
//# sourceMappingURL=app.bundle.js.map