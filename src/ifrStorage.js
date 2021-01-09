const ls = [];

function attach(s, cfg) {
    const o = {
        type: "iframeStorage.sync",
        localStorage: {},
        sessionStorage: {},
    }
    const fn = function (e) {
        if (e.source !== s) return;
        if (!e.source.parent) {
            const idx = ls.indexOf(fn);
            if (idx !== -fn) {
                window.removeEventListener("message", fn)
                ls.splice(idx, 1)
            }
            return;
        }
        try {
            const d = JSON.parse(e.data);
            if (d.name === "iframeStorage") {
                const sto = o[d.storage];
                switch (d.method) {
                    case "setItem":
                        sto[d.key] = d.value;
                        break;
                    case "removeItem":
                        delete sto[d.key];
                        break
                    case "clear":
                        Object.keys(sto).forEach(function (k) {
                            delete sto[k]
                        });
                        break
                }
                if (cfg.scope) {
                    window[d.storage][cfg.scope] = JSON.stringify(sto);
                }

            } else if (d.type === "iframeStorage.sync") {
                s.postMessage(JSON.stringify(o), "*")
            }
        } catch (e) {
        }
    }
    ls.push(fn);
    window.addEventListener("message", fn)
    if (cfg.localStorage) {
        if (cfg.scope) {
            try {
                Object.assign(o.localStorage, JSON.parse(localStorage[cfg.scope]))

            } catch (e) {
            }
        } else o.localStorage = localStorage
    }
    if (cfg.sessionStorage) {
        if (cfg.scope) {
            try {
                Object.assign(o.sessionStorage, JSON.parse(sessionStorage[cfg.scope]))

            } catch (e) {
            }
        } else o.sessionStorage = sessionStorage
    }
    s.postMessage(JSON.stringify(o), "*")
}

/**
 * use in top page
 * @returns {{stop: stop}} remove all message Listener
 */
const onMsg = function (e) {
    try {
        const d = JSON.parse(e.data)
        if (d.type === "iframeStorage.init") {
            attach(e.source, d)
        }
    } catch (e) {
    }
}
window.addEventListener("message", onMsg)

export function stop() {
    ls.forEach(function (fn) {
        window.removeEventListener("message", fn)
    })
    window.removeEventListener("message", onMsg)
}
