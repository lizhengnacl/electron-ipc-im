/**
 * * Created by lee on 2018/12/9
 * ipcClient ipc通信客户端，与ipcServer匹配
 * imClient 非主窗口抽象
 */

const _Client = require('post-message-im/dist/client');

class Client {
    constructor (props) {
        let { channel = 'main-renderer', serverId = 'im', id, ipcRenderer, pipeType = 'pipe', contentsId } = props;

        /**
         * ipcClient
         */
        const ipcClient = new _Client({
            id: id,
            postMessage: function(data) {
                data.meta = Object.assign({}, data.meta || {}, {
                    fromContentsId: contentsId
                })
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

        const imClient = new _Client({
            id: id,
            postMessage: function(data) {
                ipcClient.request({
                    type: pipeType,
                    params: {
                        from: id,
                        to: serverId,
                        data: data
                    },
                    callback: (err, res) => {}
                });
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
                    type: 'offline',
                    callback: (err, res) => {
                        ipcClient.distribute(res);
                    }
                });
            }
        });

        return imClient;
    }
}

module.exports = Client;
