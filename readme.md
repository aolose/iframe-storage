# iframe-storage

proxy your iframe storage to parent.

to fix some  local storage issues in iOS Safari. [link](https://stackoverflow.com/questions/52730903/persistent-local-storage-in-ios-safari-issues/52897329)

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
| target | window |  window.top | use target's storage, default |
| scope | string |  |  to isolate storage, empty means use parent's storage directly |
| targetOrigin | string丨array | * | postmessage's targetOrigin |
| localStorage | boolean | true | handle localStorage |
| sessionStorage | boolean | true | handle sessionStorage |
| when | function | null | execute if return true ,empty means always execute |
| ready | function | null | same as init().ready(fn) |
