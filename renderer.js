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
        App.statebg("transparent")
        App.state("Downloading from official website...")
        if(process.platform == 'darwin'){
            ipcRenderer.send("download", {
                url: "https://files.multimc.org/downloads/mmc-stable-osx64.tar.gz",
                properties: {directory: app.getPath("userData")}
            });
        }else{
            ipcRenderer.send("download", {
                url: "https://files.multimc.org/downloads/mmc-stable-win32.zip",
                properties: {directory: app.getPath("userData")}
            });
        }
    },
    import: function(){
        console.log("import")
    }
}

App.state("Loading...")
App.changeButton(true, null, "Loading...")

// Check for existing MultiMC instance in userData
if(process.platform == 'darwin'){
    var mcpath = path.join(app.getPath("userData"), "MultiMC.app")
}else{
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

ipcRenderer.on("download complete", (event, file) => {
    App.state("Download finished! saved at: " + file)
});

ipcRenderer.on("download progress", (event, progress) => {
    const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
    App.state("Downloading: " + cleanProgressInPercentages + '%')
});