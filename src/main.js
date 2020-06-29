/**
 * * Created by lee on 2018/12/8
 * 主进程
 * ipcServer 负责ipc通信
 * rendererManager 窗口生命周期管理
 */

const Server = require('post-message-im/dist/server');
const RendererManager = require('./lib/rendererManager');

const { dataFilter: _dataFilter, validator: _validator } = require('./lib/utils');

class Main {
    constructor (props = {}) {
        let { debug = false, ipcMain, BrowserWindow, channel = 'main-renderer', globalVariable = 'rendererManager', pipeType = 'pipe', capacity = 100, dataFilter = _dataFilter, validator = _validator } = props;

        // 窗口管理
        const rendererManager = new RendererManager({
            debug: debug,
            BrowserWindow: BrowserWindow
        });
        // 挂在到全局，保证主窗口能获取到
        global[globalVariable] = rendererManager;

        this.rendererManager = rendererManager;

        /**
         * 消息透传
         * Server中的方法，this绑定到Server实例上
         */

        this.ipcServer = new Server({
            capacity: capacity,
            validator: validator,
            dataFilter: dataFilter,
            subscribe: function() {
                let $$symbol = this.$$symbol;
                let distribute = this.distribute;

                ipcMain.on(channel, (event, data) => {
                    if(data && (data.$$symbol === $$symbol)) {
                        data.meta = Object.assign({}, data.meta || {}, {
                            fromContentsId: event.sender.id
                        })
                        distribute(data);
                    }
                });
            },
            getFrameWindow: function(id) {
                return rendererManager.getWin(id);
            },
            postMessageToChild: function(win, data) {
                // 向窗口派发
                win.webContents.send(channel, data);
                // 向窗口所属子窗口派发
                if (typeof win.getBrowserViews === 'function') { // 1.x~4.x
                    win.getBrowserViews().forEach((view) => {
                        view.webContents.send(channel, data)
                    })
                } else if (typeof win.getBrowserView === 'function') { // 5.x+
                    const view = win.getBrowserView()
                    if (view) {
                        view.webContents.send(channel, data)
                    }
                }                
            }
        });

        const ipcServer = this.ipcServer;
        ipcServer.on({
            type: pipeType,
            callback: (err, res) => {
                let { from, to, data } = res.params;
                // 响应请求
                ipcServer.response(Object.assign({}, res, { data: { ok: true } }));
                // 转发消息
                // 这步特别重要，保证on pipe 能拿到数据
                ipcServer.response(to, pipeType, { rescode: 0, data: { from, to, data } });
            }
        });
    }
}

module.exports = Main;
