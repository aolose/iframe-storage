'use strict';
function warp(target, storage, origin) {
    const sto = {}
    const msg = function (method, key, value) {
        const o = {
            name: "proxyStorage",
            storage: storage,
            method: method,
            key: key,
            value: value
        }
        return JSON.stringify(o)
    }
    const o = {
        getItem(s) {
            target.postMessage(msg("getItem", s), origin)
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
            obj.setItem(prop, value)
            return true;
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
function proxyStorage(config) {
    const ready = {
        ready: function (fn) {
            if ('function' === typeof fn) {
                cfg.ready = fn
            }
        }
    }
    const cfg = {
        targetOrigin: "*",
        when: null,
        localStorage: true,
        sessionStorage: true,
        scope: "",
        target: window.top,
        ready: null
    }
    Object.assign(cfg, config)
    if ('function' === typeof config.when && !config.when()) {
        setTimeout(function () {
            if ('function' === typeof cfg.ready) cfg.ready()
        }, 0)
        return ready;
    }
    const storage = {
        localStorage: cfg.localStorage && warp(cfg.target, 'localStorage', cfg.targetOrigin),
        sessionStorage: cfg.sessionStorage && warp(cfg.target, 'sessionStorage', cfg.targetOrigin)
    }
    const block = (e) => {
        return !e.data || Array.isArray(cfg.targetOrigin) && cfg.targetOrigin.indexOf(e.origin) === -1
    }
    const onReady = function (e) {
        if (block(e)) return;
        try {
            const msg = JSON.parse(e.data);
            if (msg.type === "proxyStorage.sync") {
                if (cfg.localStorage) {
                    Object.assign(storage.localStorage, msg.localStorage)
                }
                if (cfg.sessionStorage) {
                    Object.assign(storage.sessionStorage, msg.sessionStorage)
                }
                window.removeEventListener("message", onReady)
                window.addEventListener("message", onSet)
                if ('function' === typeof cfg.ready) cfg.ready()
            }
        } catch (e) {
        }

    }
    const onSet = function (e) {
        if (block(e)) return;
        try {
            const msg = JSON.parse(e.data);
            if (msg.type === "proxyStorage.get") {
                storage[msg.storage].setItem(msg.key, msg.value)
            }
        } catch (e) {
        }
    }
    window.addEventListener("message", onReady)
    cfg.target.postMessage(JSON.stringify({
        type: "proxyStorage.init",
        scope: cfg.scope,
        localStorage: cfg.localStorage,
        sessionStorage: cfg.sessionStorage,
    }), cfg.targetOrigin)
}

module.exports = proxyStorage;
