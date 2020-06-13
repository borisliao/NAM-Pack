const trash = require('trash')
const app = require('../main.js')
const { dialog, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
// -----------------------------------------------------------
// Electron Menu
// -----------------------------------------------------------
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Delete MultiMC folder',
        click () {
          const options = {
            buttons: ['Yes', 'Cancel'],
            message: 'Do you really want to delete MultiMC? This sends your MultiMC to the trash!'
          }
          const reloadMessage = {
            buttons: ['Ok'],
            message: 'Please close and restart the application to finish deleting'
          }
          var cancel = dialog.showMessageBoxSync(options)
          if (!cancel) {
            console.log('new')
            trash(path.join(process.env.APPDATA, 'NAM Pack', 'process'))
            dialog.showMessageBoxSync(reloadMessage)
          }
        }
      },
      {
        label: 'Launch MultiMC normally (Windows Only)',
        click () {
          spawn(path.join(process.env.APPDATA, 'NAM Pack', 'process', 'MultiMC', 'MultiMC.exe'), [], {
            detached: true,
            stdio: 'ignore'
          })
        }
      },
      {
        label: 'Open process folder',
        click () {
          shell.openPath(path.join(app.getPath('userData'), 'process'))
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click () {
          app.quit()
        }
      }
    ]
  },
  // Add developer tools
  {
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click (item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  }
]

// If on a mac, add a empty object on the menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({})
}

module.exports = mainMenuTemplate
