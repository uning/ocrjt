
const request = require('request');
const fs = require('fs');
const path = require('path');

const TOOLS = require('../tools');
const apiConfig = require('../apiConfig');


let TOKEN = ''




/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
async function getAccessToken() {

    if (TOKEN != '') { return TOKEN; }
    const conf = apiConfig.getGeneral();
    const { AK, SK } = conf;
    console.log('bdOcr:',{ AK, SK });

    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
    };

    return TOKEN = await new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) { reject(error) }
            else { resolve(JSON.parse(response.body).access_token) }
        })
    })
}
/**
 * 获取文件base64编码
 * @param string  path 文件路径
 * @return string base64编码信息，不带文件头
 */
function getFileContentAsBase64(path) {
    try {
        return fs.readFileSync(path, { encoding: 'base64' });
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {

    general: async function (filename, cachedir, method = 'pt', logFunc = console.log) {


        const ret = {}
        const pts = apiConfig.getProducts();

        let result = false;
        let apimethod = 'general_basic'
        if (method == 'ptl') {
            form.vertexes_location = true;
            apimethod = 'general'
        } else if (method == 'accl') {
            form.vertexes_location = true;
            apimethod = 'accurate'
        } else if (method == 'acc') {
            apimethod = 'accurate_basic'
        }

        const cachefile = path.join(cachedir, encodeURIComponent(filename) + apimethod + '.json');
        if (fs.existsSync(cachefile)) {
            result = JSON.parse(fs.readFileSync(cachefile));
            if (result) {
                logFunc('api cache ok:', filename)
            }
        }





        if (!result) {
            const options = {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
            };
            const form = {
                'image': getFileContentAsBase64(filename),
                'language_type': 'CHN_ENG',
                'detect_direction': 'true',
                'paragraph': 'true',
                'probability': 'true'
            };



            options.url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/' + apimethod + '?access_token=' + await getAccessToken(),
                options.form = form;
            result = await new Promise((resolve, reject) => {
                request(options, (error, response) => {
                    if (error) { reject(error) }
                    else { resolve(JSON.parse(response.body)) }
                })
            })
            if (result) {
                fs.writeFileSync(cachefile, JSON.stringify(result));
                logFunc('api ok', apimethod, filename, JSON.stringify(result));
            }
        }

        const sitems = result.words_result || [];

        //寻找 订单编号
        let i = 0,
            val = '',
            name = '',
            phoneNumber = '', num = 0,
            idxPhone = -1, allIdx = {},
            findPhone = false;
        ret.cpmArr = [];
        ret.cpSfArr = [];
        for (i = 0; i < sitems.length; i += 1) {
            sitems[i].words = sitems[i].words || '';
            val = sitems[i].words;
            //找姓名电话
            if (!findPhone && val.length >= 11) { //电话号码
                phoneNumber = val.slice(-11); // 获取数组中后面11个元素，并将它们连接成一个字符串
                // 检测手机号的条件（手机号全为数字，且第一位数字是1）
                findPhone = /^1\d{10}$/.test(phoneNumber);
                if (findPhone) {
                    ret.sjh = phoneNumber;
                    idxPhone = i;
                    if (val.length > 11) {//姓名电话一起了
                        name = val.slice(0, val.length - 11);
                    }
                    if (name == '' && i > 0) { //前一个识别的是名字
                        name = sitems[i - 1].words.trim();
                    }
                    //$w.input3.setValue(name); //input3
                    ret.xdr = name;
                }
            }
            if (findPhone && idxPhone + 1 == i) {//电话号码下面是地址
                ret.shdz = val;
            }
            if (val.startsWith('实付')) {
                if (val.length > 4) {
                    num = val.replace(/\D/g, "");
                    if ('' == num) {
                        num = 0;
                    }
                    //$w.input5.setValue(spzj); //input3
                    ret.sfk = num;

                }
            }
            if (val.startsWith('订单编号')) {
                if (val.length > 5) {
                    ret.ddh1 = val.replace(/\D\S/g, "");

                }
            }
            if (val.startsWith('商品总价')) {
                if (val.length > 8) {
                    num = val.replace(/\D/g, "");
                    if ('' == num) {
                        num = 0;
                    }
                    ret.spzj = num; //input3

                }
            }

            const pname = TOOLS.matchCpm(val, pts);
            if (pname) {
                ret.cpmArr.push(pname);
                const cpsf = sitems[i + 1].words || '';
                ret.cpSfArr.push(cpsf.replace(/\D/g, ""));
            }
            allIdx[val] = i;    //记录文字出现标号
        }
        if ('待发货' in allIdx) {
            ret.ddzt = '待发货';
        }
        if ('订单编号' in allIdx) {
            ret.ddh1 = sitems[allIdx['订单编号'] + 1].words.trim();

        }
        if ('下单时间' in allIdx) {
            ret.xdsj = sitems[allIdx['下单时间'] + 1].words.trim();

        }
        if ('商品总价' in allIdx) {
            num = sitems[allIdx['商品总价'] + 1].words.replace(/\D/g, "");
            if ('' == num) num = 0;
            ret.spzj = num; //input3
        }
        if ('实付款' in allIdx) {
            num = sitems[allIdx['实付款'] + 1].words.replace(/\D/g, "");
            if ('' == num) num = 0;
            ret.sfk = num;

        }
        //找商品名
        let cpm = '';
        val = '';
        const ddbhIdx = allIdx['订单编号'];
        for (i = 0; i < sitems.length; ++i) {
            val += sitems[i].words.trim() + '|';
            if (i > idxPhone + 1 && i < ddbhIdx) {
                cpm += sitems[i].words + '|';
            }
        }
        cpm.replace(/\s+/g, "");
        ret.cpm = cpm;
        ret.qtsbxx = val;
        ret.rq = ret.xdsj && ret.xdsj.substring(0, 10);

        return ret;


    }
}

