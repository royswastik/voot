/**
 * This module is used to connect to invisible BrowserWindow with html fsHelper.html which reads data from file system.
 * To start the background service , open a new Session/or exisiting session by fsHelper.open().
 * To stop the background service, call fsHelper.close()
 */
let win;
module.exports = {
    window: {
        "loading": false,
        "win": null,
        "open": false,
        "parentWindowId": null
    },
    open: function() {
        if (this.window.open == false) {
            const windowID = BrowserWindow.getFocusedWindow().id;
            this.window.parentWindowId = windowID;
            let invisPath = 'file://' + path.join(__dirname, '../background/fsHelper.html');
            this.window.win = new BrowserWindow({
                width: 400,
                height: 400,
                show: false
            });
            this.window.win.loadURL(invisPath);
            this.window.loading = true;
            let winTemp = this.window;
            this.window.win.webContents.on('did-finish-load', function() {
                winTemp.loading = false;
                winTemp.open = true;
                const input = 100;
                console.log("Fs Helper Created");
            });
        } else {
            console.log("Window is already open");
        }

    },
    close: function() {
        if (this.window.open == true) {
            const windowID = this.window.parentWindowId;
            this.window.win.webContents.send("close-fs-helper", windowID);
            this.window.open = false;
            this.window.win = null;
            console.log(windowID);
        } else {
            console.log("Window is already closed");
        }

    }
}