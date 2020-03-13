// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
const {ipcRenderer} = electron;
const app = require('electron').remote.app
const fs = require('electron').remote.require('fs')
var path = require('path');
var extract = require('extract-zip');
const {getCurrentWindow, globalShortcut} = require('electron').remote;
var request = require('request');
var child = require("child_process").execFile;

var maindir = app.getPath("userData")
// Main internal API for the main window 
var App = {
    disableButtons: function(){
        buttons = document.getElementsByTagName("button")
        for(var i = 0; i < buttons.length; i++){
            buttons[i].disabled = true
        }
    },
    enableButtons: function(){
        buttons = document.getElementsByTagName("button")
        for(var i = 0; i < buttons.length; i++){
            buttons[i].disabled = false
        }
    },
    close: function () {
        ipcRenderer.send('close');
    },
    launch: function () {
        if(process.platform == 'darwin'){
            child(path.join(maindir, "process", "MultiMC.app"), function(err, data){
                if (err){
                    App.statebg("lightblue")
                    App.state("Error: could not launch MultiMC")
                    console.error(err);
                }
            });
        }else if(process.platform == 'win32'){
            child(path.join(maindir, "process", "MultiMC", "MultiMC.exe"), function(err, data){
                if (err){
                    App.statebg("lightblue")
                    App.state("Error: could not launch MultiMC")
                    console.error(err);
                }
            });
        }
    },
    changeButton: function (disable,action,message){
        document.getElementById("main-button").disabled = disable;
        document.getElementById("main-button").onclick = action;
        document.getElementById("main-button").innerHTML = message;
    },
    state: function(message){
        document.getElementById("state").innerText = message
    },
    statebg: function(color){
        document.getElementById("state").style = "background-color:" + color
    },
    downloadmc: function(){
        App.disableButtons()
        App.statebg("transparent")
        App.state("Downloading from official website...")
        if(process.platform == 'darwin'){
            ipcRenderer.send("download", {
                url: "https://files.multimc.org/downloads/mmc-stable-osx64.tar.gz",
                properties: {directory: maindir}
            });
        }else if(process.platform == 'win32'){
            ipcRenderer.send("download", {
                url: "https://files.multimc.org/downloads/mmc-stable-win32.zip",
                properties: {directory: maindir}
            });
        }
    },
    import: function(){
        console.log("import")
    },
    processDownload: function(pathname){
        if(process.platform == 'darwin'){
            App.state("OS X support for untar is under deveopment!")
            console.log("OS X support for untar is under deveopment!")
        }else if(process.platform == 'win32'){
            extract(pathname,{dir: path.join(maindir, "process")},function (err){
                if(err){
                    App.statebg("lightblue")
                    App.state("There was a error extracting the downloaded file\n" + err);
                    console.log(err)
                }
                // Delete the original downloaded file
                fs.unlink(pathname, function (err) {
                    if (err) throw err;
                    // App reload here instead of outside of function to ensure synchronous runtime
                    App.reload()
                });
            })
            App.state("Finished extracting, restarting...")
        }
        
    },
    reload: function(){
        // if there is no error
        if(document.getElementById("state").innerText.search(/error/i) == -1)
            getCurrentWindow().reload()
    }
}

App.state("Loading...")
App.changeButton(true, null, "Loading...")

// Check for existing MultiMC instance in userData
if(process.platform == 'darwin'){
    var mcpath = path.join(maindir, "process" ,"MultiMC.app")
}else if(process.platform == 'win32'){
    var mcpath = path.join(maindir, "process" ,"MultiMC")
}

if (fs.existsSync(mcpath)) {
    App.state("MultiMC instance found")
    // Check for NAM pack update using github releses
    var online_version
    var r = request.get('https://github.com/MultiMC/MultiMC5/releases/latest', function (err, res, body) {
        // extract the last numbers from the url
        online_version = r.uri.href.substring(r.uri.href.lastIndexOf("/") + 1)
        // check current version of NAM Pack
        if(fs.existsSync(path.join(mcpath, "instances", "NAM Pack"))){
            console.log("NAM Pack exists")
        }

    });
    App.changeButton(false, App.launch, "Launch");
} else {
    App.state('MultiMC does not exist.\nWould you like to download a new MultiMC or import a old MultiMC instance?')
    App.statebg("lightblue")
    App.changeButton(false, App.downloadmc, "Download New");
}

ipcRenderer.on("download complete", (event, file) => {
    App.state("Download finished! saved at: " + file)
    App.processDownload(file)
    App.enableButtons()
});

ipcRenderer.on("download progress", (event, progress) => {
    const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
    App.state("Downloading: " + cleanProgressInPercentages + '%')
});