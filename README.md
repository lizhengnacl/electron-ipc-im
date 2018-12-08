[![NPM version][npm-image]][npm-url]


## 概述
主窗口`server`与其他窗口`client`的通信过程，可以用一种简易的消息模型来理解。

## Feature
* 支持离线消息模型

## 安装

```
npm i electron-ipc-im
```

## 非主窗口

```
const Client = require('electron-ipc-im/src/client');

const imClient = new Client({
    ipcRenderer: require('electron').ipcRenderer,
    channel: 'main-renderer',
    serverId: 'im',
    id: 'plugin',
    // pipeType: 'pipe',
});

imClient.on({
    type: 'some type',
    callback: (err, data) => {}
})

imClient.request({
    type: 'offline',
    callback: (err, res) => {
        imClient.distribute(res);
    }
})
```

callback返回值

```
{
    rescode: 0, // 0 正确 401 鉴权失败 403 用户未授权 404 协议类型错误，协议过期 408 超时
    data: {}
}
```

##  主窗口

```
const Server = require('electron-ipc-im/src/server');

let imServer = new Server({
    channel: 'main-renderer',
    serverId: 'im',
    pipeType: 'pipe',
    offlineType: 'offline',
    ipcRenderer: require('electron').ipcRenderer,
    rendererManager: require('electron').remote.getGlobal('rendererManager'),
    winId: require('electron').remote.getCurrentWindow().id,
});

imServer.on({
    type: 'some type',
    callback: (err, res) => {
        imServer.response(Object.assign({}, res, { data: { rescode: 0, data: { name: 'lizheng' } } }))
    }
})

// 窗口管理
let plugin = {
    url: 'file:///Users/lizhengnacl/liz/learn/electron-quick-start/plugin/plugin.html',
    id: 'plugin'
};
imServer.rendererManager.load(plugin.url, plugin.id);
imServer.rendererManager.unload(plugin.id);
```

## 主进程

```
const Main = require('electron-ipc-im/src/main');
try {
    new Main({
        debug: true,
        ipcMain: require('electron').ipcMain,
        BrowserWindow: require('electron').BrowserWindow,
        channel: 'main-renderer',
        globalVariable: 'rendererManager', // rendererManager
        pipeType: 'pipe',
        capacity: 10 // 每个窗体缓存的消息量
    })
} catch(e) {}
```

##  Promisify

可以选择业界任意一个标准的promisify库，例如：
- bluebird 模块里有 promisify 方法
- es6-promisify 模块
- ThinkJS 里的 promisify 方法

当然，也可以直接使用下面的示例代码
```
let promisify = (fn, receiver = null) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(receiver, [...args, (err, data) => {
                return err? reject(err): resolve(data);
            }]);
        });
    };
};

client.request = promisify(c.request, c);

client.request({
    type: '',
}).then((data) => {})

// 显式的callback参数优先级会更高，但不建议这么使用
c.request({
    type: '',
    callback: (err, data) => {}
}).then((data) => {})
```


[npm-image]: https://img.shields.io/npm/v/electron-ipc-im.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/electron-ipc-im
