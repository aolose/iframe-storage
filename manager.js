const ls = [];
function attach(s,cfg){
    const fn = function (e){
        if(e.source!==s)return;
        if(!e.source.parent){
            const idx = ls.indexOf(fn);
            if(idx!==-fn){
                window.removeEventListener("message", fn)
                ls.splice(idx,1)
            }
            return;
        }
        try {
            const d = JSON.parse(e.data);
            if(d.name==="proxyStorage"){
                const r=window[d.storage][d.method](d.key,d.value);
                if(r!==undefined){
                    s.postMessage(JSON.stringify({
                        type:"proxyStorage.get",
                        key:d.key,
                        value:d.value,
                        storage:d.storage
                    }),"*")
                }
            }
        }catch (e){}
    }
    ls.push(fn);
    window.addEventListener("message", fn)
    const o={
        type:"proxyStorage.sync",
        localStorage:{},
        sessionStorage:{},
    }
    if(cfg.localStorage){
        Object.assign(localStorage,o.localStorage)
    }
    if(cfg.sessionStorage){
        Object.assign(localStorage,o.sessionStorage)
    }
    s.postMessage(JSON.stringify(o),"*")
}

/**
 * use in top page
 * @returns {{stop: stop}} remove all message Listener
 */
function proxyStorageManager(){
    const onMsg = function (e){
        try{
            const d = JSON.parse(e.data)
            if(d.type==="proxyStorage.init"){
                attach(d.source,d)
            }
        }catch (e){}
    }
    window.addEventListener("message", onMsg)
    return {
        stop:function (){
            ls.forEach(function (fn){
                window.removeEventListener("message", fn)
            })
            window.removeEventListener("message", onMsg)
        }
    }
}
module.exports = proxyStorageManager;
