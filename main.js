const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron/main')

// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();

const { exec } = require('child_process');
const path = require('node:path')
const os = require('node:os')
const dirOcr = require('./dirOcr');
const tools = require('./tools');
const { createLoginWindow, getLoginUser } = require('./src/electron/login');
const apiConfig = require('./apiConfig');

//创建存放配置目录
try {
  const configPath = path.join(app.getPath('home'), '.ocrjt');
  console.log('app init: configPath:', configPath);
  apiConfig.saveDir = configPath;
  tools.mkdirp(configPath);
} catch (err) {
}






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
    icon: './icons/icon.png',
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  createdWindows[htmlPage] = win;
  win.loadFile(htmlPage);

  if (process.env.NODE_ENV === 'development' || openDevTools) {
    // 在开发模式下加载调试工具或其他开发配置
    win.webContents.openDevTools({ mode: 'bottom' });
  }

  return win;

}



/**
 * 创建主窗口
 * @returns 
 */
function createWindow() {
  const loginUser = getLoginUser();
  if (!loginUser ||  loginUser.localInit) {
    createLoginWindow(createWindow);
    return;
  }
  const win = new BrowserWindow({
    icon: './icons/icon.png',
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools({ mode: 'bottom' })
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
    try {
      customLog('process-dir:start', value) // will print value to Node console
      const params = await dirOcr.processDir(value, customLog);
      customLog('process-dir:end', value) // will print value to Node console
      _event.reply('process-finished', params);
    } catch (err) {
      customLog('process-dir err:', err)
    }


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
    return apiConfig.getProducts();
  })

  //通用配置
  ipcMain.handle('get-general', () => {
    return apiConfig.getGeneral();
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
          label: '产品名'
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