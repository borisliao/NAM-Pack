// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
const url = require('url');
const path = require('path');
const {download} = require("electron-dl");
const fs = require("fs")
const trash = require('trash');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let loginWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // mainWindow.setMenu(null);
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Turn on dev tools if in test
  if(process.env.NODE_ENV == 'test'){
    mainWindow.toggleDevTools()
  }

  ipcMain.on("download", (event, info) => {
    info.properties.onProgress = status => mainWindow.webContents.send("download progress", status);
    download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
        .then(dl => mainWindow.webContents.send("download complete", dl.getSavePath()));
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    app.quit();
  })
}

function logWindow () {
  // Create the browser window.
  loginWindow = new BrowserWindow({width: 400, height: 200})

  // and load the login.html of the app.
  loginWindow.loadFile('login.html')

  // loginWindow.setMenu(null);
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Emitted when the window is closed.
  loginWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    loginWindow = null
  })
}

// catch credentials
ipcMain.on('credentials',function(e,item){
  console.log(item);
  mainWindow.webContents.send('credentials', item);
  loginWindow.close();
})

// Hide window function
ipcMain.on('hide',function(){
  mainWindow.hide();
})


// catch close call
ipcMain.on('close',function(e){
  mainWindow.close();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
    createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const mainMenuTemplate = [
  {
    label: "File",
    submenu:[
      {
        label:'Login',
        click(){
          logWindow();
        }
      },
      {
        label:'Delete MultiMC folder',
        click(){
          let options  = {
            buttons: ["Yes","Cancel"],
            message: "Do you really want to delete MultiMC? This sends your MultiMC to the trash!"
          }
          var cancel = dialog.showMessageBox(options)
          if(!cancel){
            trash(path.join(app.getPath("userData"), "process")).then(function(){
              mainWindow.reload();
            })
          }
        }
      },
      {
        label:'Launch MultiMC normally',
        click(){
          mainWindow.webContents.executeJavaScript('App.launchNoArgs()');
        }
      },
      {
        label:'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If on a mac, add a empty object on the menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools item if in test
// if(process.env.NODE_ENV == 'test'){
mainMenuTemplate.push({
  label: 'Developer Tools',
  submenu:[
    {
      label: "Toggle DevTools",
      accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, focusedWindow){
        focusedWindow.toggleDevTools();
      }
    },
    {
      role: 'reload'
    }
  ]
})
// }