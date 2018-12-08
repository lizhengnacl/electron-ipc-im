/**
 * * Created by lee on 2018/12/8
 * 主窗口使用
 * ipcClient ipc通信客户端，与ipcServer匹配
 * imServer 主窗口抽象
 */

const _Server = require('post-message-im/dist/server');
const _Client = require('post-message-im/dist/client');

class Server {
    constructor (props) {
        let { channel = 'main-renderer', serverId = 'im', ipcRenderer, rendererManager, winId, pipeType = 'pipe', offlineType = 'offline' } = props;

        // 设置主窗口
        rendererManager.setMain(serverId, winId);

        /**
         * ipcClient
         */
        const ipcClient = new _Client({
            id: serverId,
            postMessage: function(data) {
                ipcRenderer.send(channel, data);
            },
            subscribe: function() {
                let $$symbol = this.$$symbol;
                let distribute = this.distribute;

                ipcRenderer.on(channel, (event, data) => {
                    if(data && (data.$$symbol === $$symbol)) {
                        distribute(data);
                    }
                });
            }
        });

        const imServer = new _Server({
            validator: function({ id }) {
                this.status.load(id);
                return true;
            },
            subscribe: function() {
                let $$symbol = this.$$symbol;
                let distribute = this.distribute;

                ipcClient.on({
                    type: pipeType,
                    callback: (err, { rescode, data: { from, to, data } }) => {
                        if(data && (data.$$symbol === $$symbol)) {
                            distribute(data);
                        }
                    }
                });

                ipcClient.request({
                    type: offlineType,
                    callback: (err, res) => {
                        ipcClient.distribute(res);
                    }
                });
            },
            getFrameWindow: function(id) {
                return rendererManager.getWin(id);
            },
            postMessageToChild: function(win, data) {
                let { id } = data.token;
                ipcClient.request({
                    type: pipeType,
                    params: {
                        from: serverId,
                        to: id,
                        data: data
                    },
                    callback: (err, res) => {}
                });
            }
        });

        imServer.rendererManager = rendererManager;

        return imServer;
    }
}

module.exports = Server;
