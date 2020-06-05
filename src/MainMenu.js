const electron = require('electron');
const {ipcRenderer} = electron;
const app = require('electron').remote.app;
const fs = require('electron').remote.require('fs');
var path = require('path');
var extract = require('extract-zip');
const {getCurrentWindow, globalShortcut} = require('electron').remote;
var request = require('request');
var child = require("child_process").execFile;
var online_version;
var maindir = app.getPath("userData");

//-----------------------------------------------------------
// Main App API (to be migrated to /src/)
//-----------------------------------------------------------
var App = {
    disableButtons: function(){
        buttons = document.getElementsByTagName("button");
        for(var i = 0; i < buttons.length; i++){
            buttons[i].disabled = true;
        }
    },
    enableButtons: function(){
        buttons = document.getElementsByTagName("button");
        for(var i = 0; i < buttons.length; i++){
            buttons[i].disabled = false;
        }
    },
    close: function () {
        ipcRenderer.send('close');
    },
    launch: function () {
        if(process.platform == 'darwin'){
            var mc = child(path.join(maindir, "process", "MultiMC.app"),["-l","NAM Pack"], function(err, data){
                if (err){
                    App.statebg("lightblue");
                    App.state("Error: could not launch MultiMC");
                    console.error(err);
                }
            });
            ipcRenderer.send("hide");
            mc.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
                App.close();
            });
        }else if(process.platform == 'win32'){
            var mc = child(path.join(maindir, "process", "MultiMC", "MultiMC.exe"),["-l","NAM Pack"], function(err, data){
                if (err){
                    App.statebg("lightblue");
                    App.state("Error: could not launch MultiMC");
                    console.error(err);
                }
            });
            ipcRenderer.send("hide");
            mc.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
                App.close();
            });
        }
    },
    launchNoArgs: function () {
        if(process.platform == 'darwin'){
            var mc = child(path.join(maindir, "process", "MultiMC.app"), function(err, data){
                if (err){
                    App.statebg("lightblue");
                    App.state("Error: could not launch MultiMC normally");
                    console.error(err);
                }
                
            });
            // TODO: fix stdout redirect
            mc.stdout.on('data', function(data) {
                App.statebg("lightblue");
                App.statebg(data);
                console.log(data);
            });
        }else if(process.platform == 'win32'){
            var mc = child(path.join(maindir, "process", "MultiMC", "MultiMC.exe"), function(err, data){
                if (err){
                    App.statebg("lightblue");
                    App.state("Error: could not launch MultiMC normally");
                    console.error(err);
                }
            });
            mc.stdout.on('data', function(data) {
                App.statebg("lightblue");
                App.statebg(data);
                console.log(data);
            });
        }
    },
    launchVanilla: function () {
        if(process.platform == 'darwin'){
            var mc = child(path.join(maindir, "process", "MultiMC.app"),["-l","Vanilla"], function(err, data){
                if (err){
                    App.statebg("lightblue");
                    App.state("Error: could not launch MultiMC");
                    console.error(err);
                }
            });
            ipcRenderer.send("hide");
            mc.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
                App.close();
            });
        }else if(process.platform == 'win32'){
            var mc = child(path.join(maindir, "process", "MultiMC", "MultiMC.exe"),["-l","Vanilla"], function(err, data){
                if (err){
                    App.statebg("lightblue");
                    App.state("Error: could not launch MultiMC");
                    console.error(err);
                }
            });
            ipcRenderer.send("hide");
            mc.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
                App.close();
            });
        }
    },

    changeButton: function (disable,action,message){
        document.getElementById("main-button").disabled = disable;
        document.getElementById("main-button").onclick = action;
        document.getElementById("main-button").innerHTML = message;
    },
    state: function(message){
        document.getElementById("state").innerText = message;
    },
    updateInfo: function(message){
        document.getElementById("update").innerText = message;
    },
    update: function(){
        ipcRenderer.send("checkUpdate");
    },
    statebg: function(color){
        document.getElementById("state").style = "background-color:" + color;
    },
    downloadmc: function(){
        App.disableButtons();
        App.statebg("transparent");
        App.state("Downloading from official website...");
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
        App.state("Import not implemented yet");
    },
    processDownload: function(pathname){
        if(process.platform == 'darwin'){
            App.state("OS X support for untar is under deveopment!");
            console.log("OS X support for untar is under deveopment!");
        }else if(process.platform == 'win32'){
            extract(pathname,{dir: path.join(maindir, "process")},function (err){
                if(err){
                    App.statebg("lightblue");
                    App.state("There was a error extracting the downloaded file\n" + err);
                    console.log(err);
                }
                // Delete the original downloaded file
                fs.unlink(pathname, function (err) {
                    if (err) throw err;
                    // App reload here instead of outside of function to ensure synchronous runtime
                    App.reload();
                });
            });
            App.state("Finished extracting, restarting...");
        }
        
    },
    reload: function(){
        // if there is no error
        if(document.getElementById("state").innerText.search(/error/i) == -1)
            getCurrentWindow().reload();
    },
    vanilla: function(){
        if(process.platform == 'darwin'){
            var mcpath = path.join(maindir, "process" ,"MultiMC.app");
        }else if(process.platform == 'win32'){
            var mcpath = path.join(maindir, "process" ,"MultiMC");
        }
        if(fs.existsSync(path.join(mcpath, "instances", "Vanilla"))){
            console.log("Vanilla exists");
            var instancePath = path.join(mcpath, "instances", "Vanilla");
            var man = require(path.join(instancePath,"manifest.json"));
            if(online_version > man.version){
                // Download the latest dist of Vanilla
                App.state("Updating Vanilla to: " + online_version);
                ipcRenderer.send("vanillaNewpack");
            }else{
                App.state("Vanilla release: " + man.version);
                App.changeButton(false, App.launch, "Launch");
            }
        }else{
            App.state("Downloading Vanilla");
            ipcRenderer.send("vanillaNewpack");
        }
        document.getElementById("vanilla").onclick = App.launchVanilla;
    }
};

App.state("Loading...");
App.changeButton(true, null, "Loading...");

// Check for application update
App.update();

ipcRenderer.on("latest", (event, file) => {
    // Check for existing MultiMC instance in userData
    if(process.platform == 'darwin'){
        var mcpath = path.join(maindir, "process" ,"MultiMC.app");
    }else if(process.platform == 'win32'){
        var mcpath = path.join(maindir, "process" ,"MultiMC");
    }

    if (fs.existsSync(mcpath)) {
        App.state("MultiMC instance found");
        // Check for NAM pack update using github releses
        var online_version;
        var r = request.get('https://github.com/borisliao/nam-dist/releases/latest', function (err, res, body) {
            // extract the last numbers from the url
            online_version = r.uri.href.substring(r.uri.href.lastIndexOf("/") + 1);
            // check current version of NAM Pack
            var instancePath = path.join(mcpath, "instances", "NAM Pack");
            if(fs.existsSync(path.join(mcpath, "instances", "NAM Pack","minecraft"))){
                console.log("NAM Pack exists");
                var man = require(path.join(instancePath,"manifest.json"));
                if(online_version > man.version){
                    // Download the latest dist of NAM pack
                    App.state("Updating NAM Pack to: " + online_version);
                    ipcRenderer.send("newpack");
                }else{
                    App.state("NAM Pack release: " + man.version);
                    App.changeButton(false, App.launch, "Launch");
                }
            }else{
                App.state("Downloading NAM Pack");
                ipcRenderer.send("newpack");
            }

        });
    } else {
        App.state('MultiMC does not exist.\nWould you like to download a new MultiMC or import a old MultiMC instance?');
        App.statebg("lightblue");
        App.changeButton(false, App.downloadmc, "Download New");
    }

    ipcRenderer.on("download complete", (event, file) => {
        App.state("Download finished! saved at: " + file);
        App.processDownload(file);
        // App.enableButtons()
    });

    ipcRenderer.on("modpack complete", (event, file) => {
        App.state("Download finished! saved at: " + file);
        App.processModpack(file);
        // App.enableButtons()
    });

    ipcRenderer.on("download progress", (event, progress) => {
        const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
        App.state("Downloading: " + cleanProgressInPercentages + '%');
    });
});
