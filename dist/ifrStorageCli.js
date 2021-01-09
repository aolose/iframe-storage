!function(e,t){"function"==typeof define&&define.amd?define(["exports"],t):"undefined"!=typeof exports?t(exports):(t(t={}),e.ifrStorageCli=t)}("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:this,function(e){"use strict";function i(n,o,r){const s={};function i(e,t,n){return n={name:"iframeStorage",storage:o,method:e,key:t,value:n},JSON.stringify(n)}var e=new Proxy({getItem:function(e){return s[e]},setItem:function(e,t){n.postMessage(i("setItem",e,t),r),s[e]=t},removeItem:function(e){n.postMessage(i("removeItem",e),r),delete s[e]},clear:function(){n.postMessage(i("clear"),r),Object.keys(s).forEach(e=>delete s[e])}},{get:function(e,t){switch(t){case"getItem":return e.getItem;case"setItem":return e.setItem;case"removeItem":return e.removeItem;case"clear":return e.clear;default:return e.getItem(t)}},set:function(e,t,n){return e.setItem(t,n),!0}});return Object.defineProperty(window,o,{get:function(){return e}}),s}Object.defineProperty(e,"__esModule",{value:!0}),e.init=function(e){const o={targetOrigin:"*",when:null,localStorage:!0,sessionStorage:!0,scope:"",target:window.top,ready:null,sync:null};Object.assign(o,e);e={ready:function(e){"function"==typeof e&&(o.ready=e)},sync:function(e){void 0!==e&&(o.sync=e),o.target.postMessage(JSON.stringify({type:"iframeStorage.sync"}),o.targetOrigin)}};if("function"==typeof o.when&&!o.when())return setTimeout(function(){"function"==typeof o.ready&&o.ready()},0),e;const r={localStorage:o.localStorage&&i(o.target,"localStorage",o.targetOrigin),sessionStorage:o.sessionStorage&&i(o.target,"sessionStorage",o.targetOrigin)},s=e=>!e.data||Array.isArray(o.targetOrigin)&&-1===o.targetOrigin.indexOf(e.origin);function t(e,t){if(!s(e))try{var n=JSON.parse(e.data);"iframeStorage.sync"===n.type&&(o.localStorage&&Object.assign(r.localStorage,n.localStorage),o.sessionStorage&&Object.assign(r.sessionStorage,n.sessionStorage),"function"==typeof t&&t(),"function"==typeof o.sync&&o.sync())}catch(e){}}const n=function(e){t(e,function(){window.removeEventListener("message",n),window.addEventListener("message",t),"function"==typeof o.ready&&o.ready()})};return window.addEventListener("message",n),o.target.postMessage(JSON.stringify({type:"iframeStorage.init",scope:o.scope,localStorage:o.localStorage,sessionStorage:o.sessionStorage}),o.targetOrigin),e}});