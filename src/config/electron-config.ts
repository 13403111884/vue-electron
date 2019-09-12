export const window = {
  schedule: 0.4,
  windowStyle: {
    width: 800,
    height: 600,
    transparent: true
  },
  produceUrl: 'app://./index.html',
  macSubmenu: [],
  winRoLinuxSubmenu: null,
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false,
    devTools: true
  },
  hotKey: {
    devTools: 'Control+Shift+i'
  },
  toggle: {}
}
export const client = {
  theme: 'ddd'
}

export default { ...client, ...window }

