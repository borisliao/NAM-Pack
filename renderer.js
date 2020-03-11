// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
const {ipcRenderer} = electron;

// Main internal API for the main window 
var App = {
    close: function () {
        ipcRenderer.send('close');
    },
    changeButton: function (state,action){
        document.getElementsByTagName("button")[0].disabled = state;
        document.getElementsByTagName("button")[0].onclick = action;
    }
}

console.log("On")
// Enable the button
App.changeButton(false, App.close);
