'use strict'

import { app, protocol, BrowserWindow, Menu, globalShortcut } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
import { window as windowData } from './config/electron-config'

/**
 * 保持窗口对象的全局引用，如果不这样，
 * 窗口就会当垃圾收集JavaScript对象时自动关闭。
 */
let win: BrowserWindow | null

// 必须在应用程序准备好之前注册 Scheme
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])

function createWindow() {
  // 创建浏览器窗口.
  win = new BrowserWindow({
    ...windowData.windowStyle,
    webPreferences: {
      ...windowData.webPreferences
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // 如果处于开发模式，请加载开发服务器的URL
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // 不在开发中时加载index.html
    win.loadURL(windowData.produceUrl)
  }

  win.on('closed', () => {
    win = null
  })
  win.webContents.closeDevTools()
  win.setProgressBar(windowData.schedule)

  createMenu()
}


// 关闭所有窗户后退出。
app.on('window-all-closed', () => {
  /**
   * 在macOS上，应用程序及其菜单栏通常保持活动状态，
   * 直到用户使用Cmd+Q显式退出
   */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  /**
   * 在macOS上，当单击停靠图标并且没有其他窗口打开时，
   * 通常会在应用程序中重新创建一个窗口。
   */
  if (win === null) {
    createWindow()
  }
})

/**
 * 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。
 * 某些API只能在此事件发生后使用。
 */
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // 安装View Devtools
    // Devools扩展在Electron 6.0.0及更高版本中被破坏
    // 请参阅 https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 了解更多信息
    // 使用暗模式在Windows 10上安装Devtools扩展时，Electron将无法启动
    // 如果使用Windows 10黑暗模式，则需要注释下面代码
    // 此外，如果关联的问题已关闭，您可以升级electron并取消注释这些行
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }

  }
  
  // 在开发环境和生产环境均可通过快捷键打开devTools
  globalShortcut.register(windowData.hotKey.devTools, function () {
    win && win.webContents.toggleDevTools()
  })

  createWindow()
})

// 在开发模式下根据父进程的请求干净地退出。
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 设置菜单栏
function createMenu() {
  // darwin表示macOS，针对macOS的设置
  if (process.platform === 'darwin') {
    let menu = Menu.buildFromTemplate(windowData.macSubmenu)
    Menu.setApplicationMenu(menu)
  } else {
    // windows及linux系统
    Menu.setApplicationMenu(windowData.winRoLinuxSubmenu)
  }
}