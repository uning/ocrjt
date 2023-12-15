const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron/main')
const { exec } = require('child_process');
const path = require('node:path')
const os = require('node:os')
const dirOcr = require('./dirOcr');
const { createLoginWindow, loginWindow, loginUser } = require('./src/electron/login');
const apiConfig = require('./apiConfig');



let mainWindow;
const createdWindows = {};


function customLog(...args) {
  // 在函数内部处理参数
  // 这里可以根据需要添加其他逻辑
  if (mainWindow) {
    mainWindow.webContents.send('custom-log', args)
  }
  console.log(...args);  // 调用 console.log 打印参数
}


//创建窗口，加载页面
function createPageWindow(htmlPage, cached = true, openDevTools = true) {

  if (cached) {
    if (createdWindows[htmlPage]) {
      // createdWindows[htmlPage].active();
      //return createdWindows[htmlPage];
    }
  }
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  createdWindows[htmlPage] = win;
  win.loadFile(htmlPage);
  if (openDevTools) {
    win.webContents.openDevTools()
  }

  return win;

}



/**
 * 创建主窗口
 * @returns 
 */
function createWindow() {
  if (loginUser.localInit) {
    createLoginWindow(createWindow);
    return;
  }
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
  mainWindow = win
  return win;
}





app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});



//选择目录
async function chooseDir() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (!canceled) {
    return filePaths[0]
  }
}
//打开目录
async function openDir(dir) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ 
    properties: ['openDirectory'],
    defaultPath: dir,
   })
  if (!canceled) {
    return filePaths[0]
  }
}


app.whenReady().then(() => {

  //处理目录结果
  ipcMain.on('process-dir', async (_event, value) => {
    await dirOcr.processDir(value, customLog);
    console.log('process-dir', value) // will print value to Node console
    _event.reply('process-finished', value);
  })

  ipcMain.on('save-products', (_event, data) => {
    console.log('save-products:', data)
    apiConfig.saveProducts(data);
    _event.reply('save-success', '产品保存成功');

  })

  ipcMain.on('save-general', (_event, data) => {
    console.log('save-general:', data)
    apiConfig.saveGeneral(data);
    _event.reply('save-success', '配置保存成功');
  })

  //打开资源管理器查看目录
  ipcMain.on('show-directory', (event, directoryPath) => {
    // 使用系统命令打开资源管理器并查看指定目录
    const command = process.platform === 'win32' ? 'explorer' : 'open';
    exec(`${command} "${directoryPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening directory: ${error.message}`);
      }
    });
  });




  //选择目录
  ipcMain.handle('dialog:openDir', chooseDir)

  //获取产品名配置
  ipcMain.handle('get-products', () => {
    return apiConfig.products
  })

  //通用配置
  ipcMain.handle('get-general', () => {
    return apiConfig.general;
  })





  createWindow()



  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: '配置',
      submenu: [

        {
          click: () => createPageWindow('ui/product.html'),
          label: '识别产品名'
        },
      ]
    },
    {
      label: '配置',
      submenu: [

        {
          click: () => createPageWindow('ui/product.html'),
          label: '识别产品名'
        },
        {
          click: () => createPageWindow('ui/general.html'),
          label: '通用'
        },
      ]
    },
    {
      label: '帮助',
      submenu: [

        {
          click: () => createPageWindow('help/help.html'),
          label: '文档'
        },
        {
          click: () => createPageWindow('ui/about.html'),
          label: '关于'
        },
      ]
    },

  ])

  Menu.setApplicationMenu(menu);

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})