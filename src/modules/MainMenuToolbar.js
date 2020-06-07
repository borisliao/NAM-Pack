const trash = require('trash');
const app = require('../../main.js')
//-----------------------------------------------------------
// Electron Menu
//-----------------------------------------------------------
const mainMenuTemplate = [
  {
    label: "File",
    submenu:[
      {
        label:'Delete MultiMC folder',
        click(){
          let options  = {
            buttons: ["Yes","Cancel"],
            message: "Do you really want to delete MultiMC? This sends your MultiMC to the trash!"
          };
          var cancel = dialog.showMessageBox(options);
          if(!cancel){
            trash(path.join(app.getPath("userData"), "process")).then(function(){
              mainWindow.reload();
            });
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
          shell.openItem(path.join(app.getPath("userData"), "process"));
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
  },
  // Add developer tools
  {
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
  }
];

// If on a mac, add a empty object on the menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

module.exports = mainMenuTemplate;