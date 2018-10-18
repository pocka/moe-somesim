const { app, BrowserWindow, Menu } = require('electron')

let win

const createWindow = () => {
  win = new BrowserWindow({ width: 800, height: 600 })

  win.loadFile('renderer/index.html')

  Menu.setApplicationMenu(null)

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!win) {
    createWindow()
  }
})
