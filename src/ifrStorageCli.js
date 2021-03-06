'use strict';

function wrap(target, storage, origin) {
    const sto = {}
    const msg = function (method, key, value) {
        const o = {
            name: "iframeStorage",
            storage: storage,
            method: method,
            key: key,
            value: value
        }
        return JSON.stringify(o)
    }
    const p = {
        getItem(s) {
            if (!sto.hasOwnProperty(s)) return null
            return sto[s]
        },
        setItem(s, v) {
            target.postMessage(msg("setItem", s, v), origin)
            sto[s] = v;
        },
        removeItem(s) {
            target.postMessage(msg("removeItem", s), origin)
            delete sto[s]
        },
        clear() {
            target.postMessage(msg("clear"), origin)
            Object.keys(sto).forEach(k => delete sto[k])
        }
    }
    const o = Object.create(p)
    const store = new Proxy(o, {
        get: function (obj, prop) {
            switch (prop) {
                case 'getItem':
                    return obj.getItem;
                case 'setItem':
                    return obj.setItem;
                case 'removeItem':
                    return obj.removeItem;
                case 'clear':
                    return obj.clear;
                default:
                    return obj.getItem(prop);
            }
        },
        set: function (obj, prop, value) {
            if (p.hasOwnProperty(prop)) {
                obj[prop] = value
            } else obj.setItem(prop, value)
            return true;
        },
        deleteProperty: function (obj, prop) {
            if (obj.hasOwnProperty(prop)) {
                delete obj[prop]
            } else if (sto.hasOwnProperty(prop)) {
                obj.removeItem(prop)
            }
        }
    });
    Object.defineProperty(window, storage, {
        get: function () {
            return store
        }
    })
    return sto;
}


/**
 * use it in iframe
 * @param {object} [config]
 * @param {window} [config.target]     - use target's storage, default window.top
 * @param {function} [config.ready]    - run when storage sync finished
 * @param {string} [config.scope]  - to isolate storage, empty means use parent's storage directly,default empty
 * @param {string|array} [config.targetOrigin]   - default *
 * @param {boolean} [config.localStorage]        - true: proxy  localStorage , default true
 * @param {boolean} [config.sessionStorage]      - true: proxy  sessionStorage , default true
 * @param {function} [config.when] - execute if return true ,empty means always execute,default empty
 */
export function init(config) {
    let done = 0;
    const cfg = {
        targetOrigin: "*",
        when: null,
        localStorage: true,
        sessionStorage: true,
        scope: "",
        target: window.top,
        ready: null,
        sync: null
    }
    Object.assign(cfg, config)
    const ready = {
        ready: function (fn) {
            if ('function' === typeof fn) {
                cfg.ready = fn
            }
        },
        stop: function () {
            cfg.target.postMessage(JSON.stringify({
                type: "iframeStorage.stop"
            }), cfg.targetOrigin);
        },
        sync: function (fn) {
            if (fn !== undefined) {
                cfg.sync = fn
            }
            cfg.target.postMessage(JSON.stringify({type: "iframeStorage.sync"}), cfg.targetOrigin)
        }
    }
    if ('function' === typeof cfg.when && !cfg.when()) {
        setTimeout(function () {
            if ('function' === typeof cfg.ready) cfg.ready()
        }, 0)
        return ready;
    }
    const storage = {
        localStorage: cfg.localStorage && wrap(cfg.target, 'localStorage', cfg.targetOrigin),
        sessionStorage: cfg.sessionStorage && wrap(cfg.target, 'sessionStorage', cfg.targetOrigin)
    }

    function block(e) {
        return !e.data || Array.isArray(cfg.targetOrigin) && cfg.targetOrigin.indexOf(e.origin) === -1
    }

    function sync(e, fn) {
        if (block(e)) return;
        try {
            const msg = JSON.parse(e.data);
            if (msg.type === "iframeStorage.sync") {
                if (cfg.localStorage) {
                    Object.assign(storage.localStorage, msg.localStorage)
                }
                if (cfg.sessionStorage) {
                    Object.assign(storage.sessionStorage, msg.sessionStorage)
                }
                if ('function' === typeof fn) {
                    fn()
                }
                if ('function' === typeof cfg.sync) {
                    cfg.sync()
                }
            }
        } catch (e) {
        }
    }

    function onReady(e) {
        sync(e, function () {
            done = 1;
            window.removeEventListener("message", onReady)
            window.addEventListener("message", sync)
            if ('function' === typeof cfg.ready) cfg.ready()
        })
    }

    window.addEventListener("message", onReady)

    function wait() {
        if (done) return;
        requestAnimationFrame(function () {
            cfg.target.postMessage(JSON.stringify({
                type: "iframeStorage.init",
                scope: cfg.scope,
                localStorage: cfg.localStorage,
                sessionStorage: cfg.sessionStorage,
            }), cfg.targetOrigin);
            wait()
        })
    }

    wait();
    return ready
}

