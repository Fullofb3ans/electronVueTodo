import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: './build/icon.ico',
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  // mainWindow.setIcon('./build/icon.ico')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const fs = require('fs')
const path = require('path')

function fixIndexes(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].id = i + 1
  }
}

const actionHandle = (task, groupName, action) => {
  const filePath = path.join(process.cwd(), 'taskGroups.json')
  if (fs.existsSync(filePath)) {
    let taskGroups = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const group = taskGroups.find((g) => g.name == groupName)
    if (group) {
      if (action == 'addTask') {
        const newTask = { id: group.tasks.length + 1, name: task, status: '', star: false }
        group.tasks.push(newTask)
        fs.writeFileSync(filePath, JSON.stringify(taskGroups, null, 2))
      } else if (action == 'removeTask') {
        group.tasks = group.tasks.filter((item) => item.id !== Number(task))
        fixIndexes(group.tasks)
        fs.writeFileSync(filePath, JSON.stringify(taskGroups, null, 2))
      }
    }
  }
}

const groupHandle = (groupName, action) => {
  const filePath = path.join(process.cwd(), 'taskGroups.json')
  let taskGroups = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (fs.existsSync(filePath)) {
    if (action == 'addGroup') {
      const newGroup = { id: taskGroups.length + 1, name: groupName, tasks: [] }
      taskGroups.push(newGroup)
      fs.writeFileSync(filePath, JSON.stringify(taskGroups, null, 2))
      return newGroup
    } else if (action == 'removeGroup') {
      taskGroups = taskGroups.filter((group) => group.name !== groupName)
      fs.writeFileSync(filePath, JSON.stringify(taskGroups, null, 2))
    }
  }
}

const changeTask = (id, groupName, action) => {
  const filePath = path.join(process.cwd(), 'taskGroups.json')
  if (fs.existsSync(filePath)) {
    let taskGroups = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const group = taskGroups.find((g) => g.name == groupName)
    if (group) {
      if (action == 'changeStatus') {
        group.tasks.map((item) => {
          if (item.id == id && item.status !== 'done') {
            item.status = 'done'
          } else if (item.id == id && item.status == 'done') {
            item.status = ''
          }
        })
      } else if (action == 'changeStar') {
        group.tasks.map((item) => {
          if (item.id == id) {
            item.star = !item.star
          }
        })
      }
      fs.writeFileSync(filePath, JSON.stringify(taskGroups, null, 2))
    }
  }
}

const getData = (taskGroup, action) => {
  const filePath = path.join(process.cwd(), 'taskGroups.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const taskGroups = JSON.parse(fileContent)
  if (fs.existsSync(filePath)) {
    if (action == 'tasks') {
      const group = taskGroups.find((g) => g.name == taskGroup)
      return group ? group.tasks : []
    } else if (action == 'groups') {
      const tabs = []
      taskGroups.map((item) => {
        tabs.push(item.name)
      })
      return tabs
    }
    return []
  }
}

ipcMain.handle('addTaskGroup', (_, groupName) => groupHandle(groupName, 'addGroup'))
ipcMain.handle('removeTaskGroup', (_, groupName) => groupHandle(groupName, 'removeGroup'))

ipcMain.handle('addNewTask', (_, task, groupName) => actionHandle(task, groupName, 'addTask'))
ipcMain.handle('removeTask', (_, task, groupName) => actionHandle(task, groupName, 'removeTask'))

ipcMain.handle('confirmTask', (_, taskId, groupName) =>
  changeTask(taskId, groupName, 'changeStatus')
)
ipcMain.handle('claimStar', (_, taskId, groupName) => changeTask(taskId, groupName, 'changeStar'))

ipcMain.handle('getTasks', (_, taskGroup) => getData(taskGroup, 'tasks'))
ipcMain.handle('getGroups', (_) => getData(_, 'groups'))
