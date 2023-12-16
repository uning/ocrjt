const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer,
  openDir: () => ipcRenderer.invoke('dialog:openDir'),
  process: (dir) => ipcRenderer.send('process-dir', dir),
  counterValue: (value) => ipcRenderer.send('counter-value', value),
  sendLoginRequest: (userData) => ipcRenderer.send('login', userData),
  saveProducts: (products) => ipcRenderer.send('save-products', products),
  getProducts: () => ipcRenderer.invoke('get-products'),
  getGeneral: () => ipcRenderer.invoke('get-general'),
  saveGeneral: (data) => ipcRenderer.send('save-general', data),
  loginUser: async () => await ipcRenderer.invoke('loginUser'),//获取登录用户
  //打开目录
  showDir: (dir) => {
    // 发送 IPC 事件给主进程，请求展示目录
    ipcRenderer.send('show-directory', dir);
  }
})


window.addEventListener('DOMContentLoaded', async () => {

  ipcRenderer.on('custom-log', (event, args) => {
    /*
    const pstatusElement = document.getElementById('pstatus');
    const oldContent = pstatusElement.textContent 
    if (pstatusElement) {
      args.forEach(function (arg) {
        if (Array.isArray(arg)) {
          pstatusElement.textContent = "Array: " + JSON.stringify(arg) +"\n"+oldContent;
        } else if (typeof arg === 'object' && arg !== null) {
          pstatusElement.textContent = 'Object: ' + JSON.stringify(arg)  +"\n"+oldContent;
        } else {
          pstatusElement.textContent =  arg +" "+oldContent;
        }
      });

    }
    */

    // 启用 eruda
    //eruda && eruda.init();
    console.log('custom-log:', ...args);
  });




  // 监听主进程发送的登录成功事件
  ipcRenderer.on('login-success', (event, userData) => {
    // 更新页面显示用户信息
    document.getElementById('userInfo').innerHTML = `欢迎, ${userData.username} (${userData.nickname})`;
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';

  });

  // 监听主进程发送的登录失败事件
  ipcRenderer.on('login-fail', (event, error) => {
    // 显示登录失败的错误信息
    alert(error.message);
  });

  //文件处理完成
  ipcRenderer.on('process-finished', (event, params) => {
    // 显示登录失败的错误信息
    alert("处理完成,打开" + params.outputDir + '目录查看数据');
    document.getElementById('openLink').style.display = 'inline';
    document.getElementById('outDir').value = params.outputDir;
    ipcRenderer.send('show-directory', params.outputDir);


  });

  // 提示成功
  ipcRenderer.on('save-success', (event, msg) => {
    alert(msg);
  });




  //处理登录
  const loginUser = await ipcRenderer.invoke('loginUser');
  //console.log('preload.js loginUser:', loginUser);
  const userElement = document.getElementById('userInfo');
  if (userElement && loginUser && loginUser.username && !loginUser.localInit) {
    userElement.innerHTML = `欢迎, ${loginUser.username} (${loginUser.nickname})`;
  }

})
