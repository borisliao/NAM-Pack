// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, dialog, shell} = require('electron')
const url = require('url');
const path = require('path');
const {download} = require("electron-dl");
const fs = require("fs")
const trash = require('trash');
const {autoUpdater} = require("electron-updater");
var extract = require('extract-zip');
var request = require('request');
const fse = require('fs-extra')

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

function sendStatusToWindow(text) {
  mainWindow.webContents.executeJavaScript('App.updateInfo("'+text+'")');
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('You are up to date.');
  mainWindow.send("latest");
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. You might not be up to date. Check console for more details.');
  mainWindow.webContents.executeJavaScript('console.error("'+err+'")');
  mainWindow.send("latest");
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded, installing...');
  autoUpdater.quitAndInstall();
});

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

function getFilenameFromUrl(url){
  return url.substring(url.lastIndexOf('/') + 1);
}
var callTimes = 0;

ipcMain.on('vanillaNewpack',function(){
  var modpackDir = path.join(app.getPath("userData"), "process", "MultiMC", "instances")
  var info = {
    url: "https://github.com/borisliao/nam-dist/releases/latest/download/vanilla.zip",
    properties: {directory: modpackDir}
  };
  console.log("Dl")
  var vanilla_dl = download(BrowserWindow.getFocusedWindow(), info.url, info.properties);
  vanilla_dl.then(dl => extract(path.join(modpackDir,"vanilla.zip"),{dir: modpackDir},function (err){
    if(err){
        console.log(err);
    }
  }));
});

// download and process a new pack
ipcMain.on('newpack',function(){
  var modpackDir = path.join(app.getPath("userData"), "process", "MultiMC", "instances", "NAM Pack")

  // Download twitch pack
  var info = {
    url: "https://github.com/borisliao/nam-dist/releases/latest/download/NAM-pack.zip",
    properties: {directory: modpackDir}
  };
  var nam_download = download(BrowserWindow.getFocusedWindow(), info.url, info.properties);
  nam_download.then(dl => extract(path.join(modpackDir,"NAM-Pack.zip"),{dir: modpackDir},function (err){
      if(err){
          console.log(err);
      }
      // Delete the original downloaded file
      fs.unlink(path.join(modpackDir,"NAM-Pack.zip"), function (err) {
          if (err) throw err;
        });
      // Delete original mods folder and rebuild from manifest.json
      if(fs.existsSync(path.join(modpackDir,"minecraft","mods"))){
        fs.unlink(path.join(modpackDir,"minecraft","mods"),function(err){console.error(err)});
      }
      // Delete overrides folder
      if(fs.existsSync(path.join(modpackDir,"overrides"))){
        fs.unlink(path.join(modpackDir,"overrides"),function(err){console.error(err)});
      }

      if (!fs.existsSync(path.join(modpackDir,"minecraft"))){
        fs.mkdirSync(path.join(modpackDir,"minecraft"));
        fs.mkdirSync(path.join(modpackDir,"minecraft","mods"));
      }
      var man = require(path.join(modpackDir,"manifest.json"));

      for(var i in man.files){
          projectID = man.files[i].projectID;
          fileID = man.files[i].fileID;
          var r = request.get('https://addons-ecs.forgesvc.net/api/v2/addon/'+projectID+'/file/'+fileID+'/download-url', function (err, res, body) {
            request.get(body).pipe(fs.createWriteStream(path.join(modpackDir,"minecraft","mods",getFilenameFromUrl(body)))).on('finish', function(){
                callTimes+=1
                mainWindow.webContents.executeJavaScript('App.state('+ callTimes.toString() +'/'+ man.files.length +')');
                if(callTimes == man.files.length){
                  mainWindow.webContents.executeJavaScript('App.state("mod download finished!")');
                  // Copy overrides folder
                  var mc_folder = path.join(modpackDir,"minecraft");
                  var sourceDir = path.join(modpackDir, "overrides");
                  var destinationDir = mc_folder;
                  fse.copy(sourceDir, destinationDir, function (err) {
                    if (err) {
                      throw err;
                    } else {
                      console.log("success!");
                      mainWindow.webContents.executeJavaScript('App.changeButton(false, App.launch, "Launch")');
                    }
                  }); 
                }
            });
        });
      }
    }));
});


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

// Check for updates
ipcMain.on('checkUpdate',function(){
  autoUpdater.checkForUpdates();
})

// catch close call
ipcMain.on('close',function(e){
  mainWindow.close();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  createWindow();
});

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
        label:'Open process folder',
        click(){
          shell.openItem(path.join(app.getPath("userData"), "process"))
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