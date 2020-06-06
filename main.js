const {app, BrowserWindow, Menu, ipcMain, dialog, shell} = require('electron');
const url = require('url');
const path = require('path');
const {download} = require("electron-dl");
const fs = require("fs");
const {autoUpdater} = require("electron-updater");
var extract = require('extract-zip');
var request = require('request');
const fse = require('fs-extra');

//-----------------------------------------------------------
// Electron Window Process
//-----------------------------------------------------------

let mainWindow;

function createWindow () {
  // Add react dev tools (from local google-chrome installation)
  BrowserWindow.addDevToolsExtension(process.env.LOCALAPPDATA+'\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.7.0_0');
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  let mainMenuToolbar = require("./modules/MainMenuToolbar.js");
  const mainMenu = Menu.buildFromTemplate(mainMenuToolbar);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Turn on dev tools if in test
  if(process.env.NODE_ENV == 'test'){
    mainWindow.toggleDevTools();
  }

  ipcMain.on("download", (event, info) => {
    info.properties.onProgress = status => mainWindow.webContents.send("download progress", status);
    download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
        .then(dl => mainWindow.webContents.send("download complete", dl.getSavePath()));
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
    app.quit();
  });
}

app.on('ready', function(){
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});

app.on('activate', function () {
    createWindow();
});

//-----------------------------------------------------------
// Macro functions
//-----------------------------------------------------------

function sendStatusToWindow(text) {
  mainWindow.webContents.executeJavaScript('App.updateInfo("'+text+'")');
}

function getFilenameFromUrl(url){
  return url.substring(url.lastIndexOf('/') + 1);
}

//-----------------------------------------------------------
// Electron Builder auto update
//-----------------------------------------------------------

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('You are up to date.');
  mainWindow.send("latest");
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. You might not be up to date. Check console for more details.');
  mainWindow.webContents.executeJavaScript('console.error("'+err+'")');
  mainWindow.send("latest");
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded, installing...');
  autoUpdater.quitAndInstall();
});

//-----------------------------------------------------------
// Node.js ipc backend tasks
//-----------------------------------------------------------

var callTimes = 0;

ipcMain.on('vanillaNewpack',function(){
  var modpackDir = path.join(app.getPath("userData"), "process", "MultiMC", "instances");
  var info = {
    url: "https://github.com/borisliao/nam-dist/releases/latest/download/vanilla.zip",
    properties: {directory: modpackDir}
  };
  console.log("Dl");
  var vanilla_dl = download(BrowserWindow.getFocusedWindow(), info.url, info.properties);
  vanilla_dl.then(dl => extract(path.join(modpackDir,"vanilla.zip"),{dir: modpackDir},function (err){
    if(err){
        console.log(err);
    }
  }));
});

// download and process a new pack
ipcMain.on('newpack',function(){
  var modpackDir = path.join(app.getPath("userData"), "process", "MultiMC", "instances", "NAM Pack");

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
        fs.unlink(path.join(modpackDir,"minecraft","mods"),function(err){console.error(err);});
      }
      // Delete overrides folder
      if(fs.existsSync(path.join(modpackDir,"overrides"))){
        fs.unlink(path.join(modpackDir,"overrides"),function(err){console.error(err);});
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
                callTimes+=1;
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

// Hide window function
ipcMain.on('hide',function(){
  mainWindow.hide();
});

// Check for updates
ipcMain.on('checkUpdate',function(){
  autoUpdater.checkForUpdates();
});

// catch close call
ipcMain.on('close',function(e){
  mainWindow.close();
});