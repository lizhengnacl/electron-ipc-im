/**
 * * Created by lee on 2018/12/8
 */

class RendererManager {
    constructor (props) {
        this.BrowserWindow = props.BrowserWindow;
        this.state = {};
        this.registers = [];
        this.debug = props.debug || false;
    }

    _broadcast (id, status) {
        this.registers.forEach(fn => fn(id, status));
    }

    _load (id, winId) {
        this.state[id] = winId;
    }

    _unload (id) {
        delete this.state[id];
    }

    getWin (id) {
        if(this.exists(id)) {
            return this.BrowserWindow.fromId(this.state[id]);
        }
        return null;
    }

    _monitor (id, win) {
        win.on('close', (e) => {
            e.preventDefault();
            this.unload(id);
            this._broadcast(id, 'close');
        });
        win.on('blur', () => {this._broadcast(id, 'blur');});
        win.on('focus', () => {this._broadcast(id, 'focus');});
    }

    focus (id) {
        if(this.exists(id)) {
            let win = this.getWin(id);
            win && typeof win.focus === 'function' && win.focus();
        }
    }

    blur(id){
        if(this.exists(id)) {
            let win = this.getWin(id);
            win && typeof win.blur === 'function' && win.blur();
        }
    }

    load (url, id, options = {}) {
        if(this.exists(id)) {
            this.focus(id);
            return this.getWin(id);
        }

        const defaultOptions = {
            width: 800,
            height: 600,
            // frame: false
        };

        let win = new this.BrowserWindow(Object.assign({}, defaultOptions, options));
        win.loadURL(url);
        if(this.debug === true) {
            win.webContents.openDevTools();
        }
        this._load(id, win.id);

        win.webContents.on('did-finish-load', () => {});

        // 注册win事件监听
        this._monitor(id, win);
        return win;
    }

    exists (id) {
        return this.state[id] !== void 0;
    }

    unload (id) {
        let win = this.getWin(id);
        if(win !== null) {
            win.destroy();
            // win.close();
            this._unload(id);
        }
    }

    // 订阅事件，窗口事件close blur focus
    register (fn) {
        this.registers.push(fn);
    }

    unregister (fn) {
        let index = this.registers.indexOf(fn);
        if(index !== -1) {
            this.registers.splice(index, 1);
        }
    }

    // 设置主窗口
    setMain (id, winId) {
        this.state[id] = winId;
    }
}

module.exports = RendererManager;
