/**
 * * Created by lee on 2018/12/10
 */

const { app, ipcMain, BrowserWindow } = require('electron');
const Main = require('../src/main');

app.on('window-all-closed', () => {
    app.quit()
})
app.on('ready', ready)

function ready () {
    try {
        new Main({
            debug: true,
            ipcMain: ipcMain,
            BrowserWindow: BrowserWindow,
            channel: 'main-renderer',
            globalVariable: 'rendererManager', // rendererManager
            pipeType: 'pipe',
            capacity: 10 // 每个窗体缓存的消息量
        })
    } catch(e) {
    }

    let url = `file:///Users/lizhengnacl/liz/electron-ipc-im/example/im/im.html`;
    // 任何方法加载都行
    global['rendererManager'].load(url);
}
