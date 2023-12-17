
const { BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const TOOLS = require('../../tools');
const weda = require('../txWeda');
const apiConfig = require('../../apiConfig');


let onLoginSucc,loginWindow;

function getLoginUser(){
    if (_login.loginUser)
        return _login.loginUser;
    const filePath = path.join(apiConfig.saveDir, 'loginUser.yaml');
    _login.loginUser = apiConfig.readYamlFileJson(filePath) || {};
    _login.loginUser.localInit = true;
    console.log('handleLoginUser', _login.loginUser)
    return _login.loginUser
}

//创建登录窗口
function createLoginWindow(callback) {
    loginWindow = new BrowserWindow({
        icon: '../../icons/icon.png',
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../../preload.js'),
        },
    });

    loginWindow.loadFile(path.join(__dirname, '../../ui/login/index.html'));

    loginWindow.on('closed', function () {
        loginWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
        // 在开发模式下加载调试工具或其他开发配置
        loginWindow.webContents.openDevTools({ mode: 'bottom' });
    }
    //
    onLoginSucc = callback;
    return loginWindow;
}

const _login = {
    createLoginWindow,
    loginWindow,
    getLoginUser,
}

module.exports = _login;

//处理登录
ipcMain.on('login', async (event, userData) => {
    try {
        const loginUser = getLoginUser();
        // const response = { data: { username: 'tingkun', nickname: '廷坤' } }//await axios.post('http://example.com/login', userData);
        const response = await weda.find("yhbs eq '" + userData.username + "'", 'dlyhb_pc7zmvv');
        if (response && response.value && response.value.length > 0) {
            const ru = response.value[0];
            console.log('login ru:', userData, ru);
            if (!ru.password || ru.password === TOOLS.hashPassword(userData.password)) {
                loginUser.username = ru.yhbs;
                loginUser.nickname = ru.yhnc;
                loginUser.autoLogin = userData.autoLogin;
                loginUser.localInit = false;

                if (loginUser.autoLogin) {
                    loginUser.password = userData.password;
                }
                const filePath = path.join(apiConfig.saveDir, 'loginUser.yaml');
                apiConfig.saveJsonAsYaml(loginUser, filePath);


                event.reply('login-success', loginUser);
                loginWindow.close();
                onLoginSucc();
            } else {
                event.reply('login-fail', { message: '密码错误' });
            }
        } else {
            event.reply('login-fail', { message: '没有找到该用户' });
        }


    } catch (error) {
        event.reply('login-fail', { message: '错误：' + error });
    }
});



ipcMain.handle('loginUser', getLoginUser);

