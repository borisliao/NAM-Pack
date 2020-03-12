// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
const {ipcRenderer} = electron;
const app = require('electron').remote.app
const fs = require('electron').remote.require('fs')
var path = require('path');

// Main internal API for the main window 
var App = {
    disableButtons: function(){
        buttons = document.getElementsByTagName("button")
        for(var i = 0; i < buttons.length; i++){
            console.log(buttons[i])
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
                properties: {directory: app.getPath("userData")}
            });
        }else if(process.platform == 'win32'){
            ipcRenderer.send("download", {
                url: "https://files.multimc.org/downloads/mmc-stable-win32.zip",
                properties: {directory: app.getPath("userData")}
            });
        }
    },
    import: function(){
        console.log("import")
    },
    processDownload: function(filename){
        if(process.platform == 'darwin'){
            App.state("OS X support for untar is under deveopment!")
            console.log("OS X support for untar is under deveopment!")
        }else if(process.platform == 'win32'){

        }
    }
}

App.state("Loading...")
App.changeButton(true, null, "Loading...")

// Check for existing MultiMC instance in userData
if(process.platform == 'darwin'){
    var mcpath = path.join(app.getPath("userData"), "MultiMC.app")
}else if(process.platform == 'win32'){
    var mcpath = path.join(app.getPath("userData"), "MultiMC")
}

if (fs.existsSync(mcpath)) {
    App.state("MultiMC instance found")
    App.changeButton(false, App.close, "Close");
} else {
    App.state('MultiMC does not exist.\nWould you like to download a new MultiMC or import a old MultiMC instance?')
    App.statebg("lightblue")
    App.changeButton(false, App.downloadmc, "Download New");
}

ipcRenderer.on("download complete", (event, file, filename) => {
    App.state("Download finished! saved at: " + file)
    App.processDownload(filename)
    App.enableButtons()
});

ipcRenderer.on("download progress", (event, progress) => {
    const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
    App.state("Downloading: " + cleanProgressInPercentages + '%')
});