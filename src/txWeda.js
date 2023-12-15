const fetch = require('node-fetch');

const EnvId = 'lowcode-2gexp0oub13a679d'; // 环境 ID，例如 lowcode-2gay8jgh25
const SecretId = 'AKIDVw96o7jVbRDn9EnEQJwRijZDdrkNABJC';
const SecretKey = 'sX0B6tVpunaAUiwxiFb7NNBn9F5g49yX';


// 域名
const domain = `https://${EnvId}.ap-shanghai.tcb-api.tencentcloudapi.com`;

let TOKEN = '';
/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
async function getAccessToken() {

    if (TOKEN != '') { return TOKEN; }
    const tokenResponse = await fetch(`${domain}/auth/v1/token/clientCredential`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(`${SecretId}:${SecretKey}`).toString('base64')}`
        },
        body: JSON.stringify({
            grant_type: 'client_credentials',
        })
    });

    const { access_token } = await tokenResponse.json();
    return TOKEN = access_token;
}


//https://docs.cloudbase.net/lowcode/manage/datasource#%E6%A0%B9%E6%8D%AEfilter%E6%9F%A5%E8%AF%A2%E6%95%B0%E6%8D%AE%E6%BA%90%E8%AE%B0%E5%BD%95
const weda = {

    /**
     * 
     * @param {*} filters string 
     * @param {*} datasourceName string
     * @param {*} envType string
     */
    find: async function (filters, datasourceName = 'sys_user', envType = 'prod') {
        const access_token = await getAccessToken();

        // 请求某个服务端 API
        const queryResponse = await fetch(`${domain}/weda/odata/v1/${envType}/${datasourceName}?$filter=${filters}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        });

        const ret = await queryResponse.json();
        //console.log(ret);
        return ret;
    }
}

    module.exports = weda;

    
//weda.find("name eq 'admin'");
// weda.find("yhbs eq '"+'index'+"'",'dlyhb_pc7zmvv');

