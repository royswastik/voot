const electron = require('electron');
const glob = require('glob');
const path = require('path');


// Module to control application life.
const app = electron.app;
// Module to create native browser window.

const BrowserWindow = electron.BrowserWindow
const ipc = require('electron').ipcMain;

const Menu = electron.Menu;
const Tray = electron.Tray

app.commandLine.appendSwitch('enable-transparent-visuals');

const notifier = require('node-notifier');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    createTrayIcon();
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        show: true
    });

    // and load the index.html of the app.
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    let filePath = `${__dirname}`;
    console.log('file://' + filePath + '/background/reminderService.html');
    filePath2 = filePath.replace(new RegExp("\\".replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), "/");


    mainWindow.loadURL('file://' + filePath2 + '/background/reminderService.html');
  // mainWindow.loadURL('file://' + filePath2 + '/app.html');
    console.log('file://' + filePath2 + '/background/reminderService.html');

    // Open the DevTools.

    mainWindow.webContents.openDevTools();


    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    })
}

/*
function loadMainFiles () {
  var files = glob.sync(path.join(__dirname, 'main-process/*.js'))
  files.forEach(function (file) {
    require(file)
  })
}
function initialize () {
	loadMainFiles();
}

initialize();*/


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})

function createTrayIcon(){
    const iconName = process.platform === 'win32' ? 'assets/images/letter-v-blue-icon.png' : 'iconTemplate.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
        label: 'Remove',
        click: function () {
        event.sender.send('tray-removed')
        appIcon.destroy()
        }
    },
    {
        label: 'Configuration',
        click: function () {
             openConfigWindow();
        }
    },
    {
        label: 'Quit',
        click: function () {
             app.quit();
        }
    }
    
  ])
  appIcon.setToolTip('Electron Demo in the tray.')
  appIcon.setContextMenu(contextMenu)
}

function removeTrayIcon(){
appIcon.destroy();
}

ipc.on('put-in-tray', function (event) {
  createTrayIcon();
})

ipc.on('remove-tray', function () {
  removeTrayIcon();
})

ipc.on('show-notification', function(event, notObj) {
    // Object
    
    notifier.notify(notObj, function (err, response) {
     // Response is response from notification
     console.log("Response from notification");
    });
    
});

ipc.on('new-timer-set', function(event, timerObj){
    mainWindow.webContents.send("set-new-timer", timerObj);
    /**
     * timerObj:{
     *  "h": 2,
     *  "m": 2,
     *  "s": 2
     * }
     */
});

ipc.on('timer-not-set', function(event){
    openConfigWindow();
});


notifier.on('click', function (notifierObject,options) {//notifierObject, options
    	console.log("Notification clicked");
     //   console.log(notifierObject);
        console.log(options);
        openWordCard(options);
    });

function openWordCard(wordObj){
            let winPath = 'file://' + path.join(__dirname, 'wordCard.html');
            let win = new BrowserWindow({
                width: 400,
                height: 400,
                show: true
            });
            win.loadURL(winPath);
            win.webContents.on('did-finish-load', function() {
                win.webContents.send('set-word', wordObj);
            });
}

let configWin = null;
function openConfigWindow(){
    if(configWin != null){
        configWin.focus();
        return;
    }
    let winPath = 'file://' + path.join(__dirname, 'app.html');
            configWin = new BrowserWindow({
                width: 400,
                height: 400,
                show: true
            });
            configWin.loadURL(winPath);
            configWin.webContents.on('did-finish-load', function() {
                
            });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.