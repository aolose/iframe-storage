# iframe-storage

proxy your iframe storage to parent, to fix some  local storage issues in iOS Safari. [link](https://stackoverflow.com/questions/52730903/persistent-local-storage-in-ios-safari-issues/52897329)


scan to visit the [demo](https://aolose.github.io/ifrstordemo/index.html)

![](q.png)



#### How it work:

```
 ----------------------------------------
|  domainA     storage                   |
|                  ^                     |
|                  |   postmessage       |
|    -------------------------------     |
|   | domainB      |                |    |
|   |              V                |    |
|   |          a fake storage       |    |
|   |                               |    |
-----------------------------------------
```

### install
```
npm i iframe-storage
```
#### or insert directly 
##### top page,make sure insert it before your iframe
```
<script src="https://cdn.jsdelivr.net/npm/iframe-storage@0.0.5/dist/ifrStorage.js"></script>
```
##### iframe
```
<script src="https://cdn.jsdelivr.net/npm/iframe-storage@0.0.5/dist/ifrStorageCli.js"></script>
```



### usage
top page
```
import "iframe-storage/src/ifrStorage"

```


iframe:
```
import {init} from "iframe-storage/src/ifrStorageCli"

init({scope:"demo"}).ready(function (){
  localstorage.test=1  
})
```


### ifrStorageCli config

| name | type | default | desc |
| ---- | ---- | --- |---- |
| target | window |  window.top | use target's storage |
| scope | string |  |  to isolate storage, empty means use parent's storage directly |
| targetOrigin | string丨array | * | postmessage's targetOrigin |
| localStorage | boolean | true | handle localStorage |
| sessionStorage | boolean | true | handle sessionStorage |
| when | function | null | execute if return true ,empty means always execute |
| ready | function | null | same as init().ready(fn) |
