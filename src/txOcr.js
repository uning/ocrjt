
const fs = require('fs');
const path = require('path');
const TOOLS = require('../tools');
const ApiConfig = require('../apiConfig');


// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs-ocr");
const OcrClient = tencentcloud.ocr.v20181119.Client;

// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取

module.exports = {
  general: async function (filename, cachedir, method = 'pt',logFunc = console.log) {

    const ret = {};
    let result = false;
    let apimethod = 'GeneralBasicOCR'
    if (method === 'acc') {
      apimethod = 'GeneralAccurateOCR';
      params.EnableDetectSplit = true;
    }

    const cachefile = path.join(cachedir,encodeURIComponent(filename) + apimethod+'.json');
    if (fs.existsSync(cachefile)) {
      result = JSON.parse(fs.readFileSync(cachefile));
      if (result) {
        logFunc('api cache ok:', apimethod, filename)
      }
    }

    if (!result) {
      const imageBuffer = fs.readFileSync(filename);

      // Convert the binary data to a base64 encoded string
      const base64Image = imageBuffer.toString('base64');
      const params = {
        "ImageBase64": base64Image,
        "IsWords": true
      };

      // 实例化要请求产品的client对象,clientProfile是可选的
      const client = new OcrClient(ApiConfig.clientConfig);

      result = await client[apimethod](params);
      if (result){
        fs.writeFileSync(cachefile, JSON.stringify(result));               
       logFunc('api ok',apimethod, filename, JSON.stringify(result));
      }

    }

    const sitems = result.TextDetections;
    //寻找 订单编号
    let i = 0,
      val = '',
      name = '',
      words = [],
      phoneNumber = '', num = 0,
      idxPhone = -1, allIdx = {},
      findPhone = false


    ret.cpmArr = [];
    ret.cpSfArr = [];


    for (i = 0; i < sitems.length; i += 1) {
      val = sitems[i].DetectedText;
      words = sitems[i].Words.map((ii) => { return ii.Character; });
      //找姓名电话
      if (!findPhone && words.length >= 11) { //电话号码
        phoneNumber = words.slice(-11).join(''); // 获取数组中后面11个元素，并将它们连接成一个字符串
        // 检测手机号的条件（手机号全为数字，且第一位数字是1）
        findPhone = /^1\d{10}$/.test(phoneNumber);
        if (findPhone) {
          //$w.inputPhone1.setValue(phoneNumber); //
          ret.sjh = phoneNumber;
          idxPhone = i;
          if (words.length > 11) {//姓名电话一起了
            name = words.slice(0, words.length - 11).join('').trim();
          }
          if (name == '' && i > 0) { //前一个识别的是名字
            name = sitems[i - 1].DetectedText.trim();
          }
          //$w.input3.setValue(name); //input3
          ret.xdr = name;
        }
      }
      if (findPhone && idxPhone + 1 == i) {//电话号码下面是地址
        ret.shdz = val;
      }
      if (val.startsWith('实付')) {
        if (words.length > 4) {
          num = val.replace(/\D/g, "");
          if ('' == num) {
            num = 0;
          }
          //$w.input5.setValue(spzj); //input3
          ret.sfk = num;

        }
      }
      if (val.startsWith('订单编号')) {
        if (words.length > 5) {
          ret.ddh1 = val.replace(/\D\S/g, "");

        }
      }
      if (val.startsWith('商品总价')) {
        if (words.length > 5) {
          num = val.replace(/\D/g, "");
          if ('' == num) {
            num = 0;
          }
          ret.spzj = num; //input3

        }
      }
      const pname = TOOLS.matchCpm(val,ApiConfig.products);
      if (pname) {
        ret.cpmArr.push(pname);
        const cpsf = sitems[i+1].DetectedText||'';
        ret.cpSfArr.push(cpsf.replace(/\D/g, ""));
      }

      allIdx[val] = i;    //记录文字出现标号

    }
    if ('待发货' in allIdx) {
      ret.ddzt = '待发货';
    }
    if ('订单编号' in allIdx) {
      ret.ddh1 = sitems[allIdx['订单编号'] + 1].DetectedText.trim();

    }
    if ('下单时间' in allIdx) {
      ret.xdsj = sitems[allIdx['下单时间'] + 1].DetectedText.trim();

    }
    if ('商品总价' in allIdx) {
      num = sitems[allIdx['商品总价'] + 1].DetectedText.replace(/\D/g, "");
      if ('' == num) num = 0;
      ret.spzj = num; //input3
    }
    if ('实付款' in allIdx) {
      num = sitems[allIdx['实付款'] + 1].DetectedText.replace(/\D/g, "");
      if ('' === num) num = 0;
      ret.sfk = num;

    }
    //找商品名
    let cpm = '';
    val = '';
    const ddbhIdx = allIdx['订单编号'];
    for (i = 0; i < sitems.length; ++i) {
      if (i > idxPhone + 1 && i < ddbhIdx)
        cpm += sitems[i].DetectedText + '|';
      val += sitems[i].DetectedText.trim() + '|';
    }
    cpm.replace(/\s+/g, "");
    ret.cpm = cpm;

    ret.qtsbxx = val;
    ret.rq = ret.xdsj && ret.xdsj.substring(0, 10);
    ret.filename = path.basename(filename);


    return ret;
  },


}