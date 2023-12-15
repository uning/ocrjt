
// 使用 contextBridge 向渲染进程提供主进程通信功能

electronAPI = window.electronAPI;

function login() {


  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const autoLogin = document.getElementById('autoLogin').checked;

  const loadingDiv = document.getElementById('loading');

  // 简单的输入检查
  if (!username || !password) {
    alert('请输入用户名和密码');
    return;
  }

  // 显示 loading
  loadingDiv.style.display = 'block';


  // 使用预加载脚本中提供的函数发送登录事件到主进程
  electronAPI.sendLoginRequest({ username, password, autoLogin });
}

//
window.addEventListener('DOMContentLoaded', async () => {
  const loginUser = await electronAPI.loginUser();
  //console.log('login:',loginUser)
  if(loginUser && loginUser.autoLogin ){
    document.getElementById('username').value = loginUser.username;
    document.getElementById('password').value = loginUser.password;
    document.getElementById('autoLogin').checked = loginUser.autoLogin;
  }

});