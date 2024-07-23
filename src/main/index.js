import { app, shell, BrowserWindow, ipcMain, Tray } from 'electron'
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

ipcMain.handle('getTasks', () => {
  const filePath = path.join(process.cwd(), 'tasks.json')
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  }
  return []
})

const addNewTask = (task) => {
  console.log('работаем с сервера')
  const filePath = path.join(process.cwd(), 'tasks.json')

  // Чтение существующего файла или создание пустого массива
  let tasks = [{}]
  let index
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    tasks = JSON.parse(fileContent)
    index = tasks.length + 2
  }

  // Добавление новой задачи
  tasks.push({ id: index, name: task })
  console.log(tasks)

  // Запись обновленного списка задач в файл
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
}
const removeTask = (taskId) => {
  console.log('работаем с сервера')
  const filePath = path.join(process.cwd(), 'tasks.json')

  let tasks = []
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    tasks = JSON.parse(fileContent)
  }

  // Remove the task with the given taskId
  tasks = tasks.filter((task) => task.id !== taskId)

  // Reassign IDs in order
  tasks = tasks.map((task, index) => ({
    ...task,
    id: index + 1
  }))

  console.log(tasks)

  // Write the updated task list back to the file
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
}

ipcMain.handle('addNewTask', (_, task) => addNewTask(task))
ipcMain.handle('removeTask', (_, taskId) => removeTask(taskId))
