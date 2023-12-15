
const fs = require('fs');
const yaml = require('js-yaml');

const productsFile = './config/products.yaml';
const generalFile = './config/general.yaml';


// Function to read a YAML file and convert it to JSON
function readYamlFileJson(filePath = productsFile) {
    try {
        const yamlContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = yaml.load(yamlContent);
        return jsonData;
    } catch (error) {
        console.error(`Error reading YAML file: ${error.message}`);
        return null;
    }
}

// Function to convert JSON to YAML and save it to a file
function saveJsonAsYaml(jsonData,filePath = productsFile) {
    try {
        const yamlContent = yaml.dump(jsonData);
        fs.writeFileSync(filePath, yamlContent, 'utf8');
        console.log(`JSON converted to YAML and saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving YAML file: ${error.message}`);
    }
}

//api config
// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
  credential: {
    secretId: "AKIDVw96o7jVbRDn9EnEQJwRijZDdrkNABJC",
    secretKey: "sX0B6tVpunaAUiwxiFb7NNBn9F5g49yX"
  },
  region: "ap-guangzhou",
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com"
    }
  }
};


const config = {
  clientConfig,
  readYamlFileJson,
  saveJsonAsYaml
};
config.general = readYamlFileJson(generalFile);
config.products = readYamlFileJson(productsFile);
config.saveProducts = function(pts){
  config.products = pts;
  saveJsonAsYaml(pts,productsFile);
}
config.readYamlFileJson = readYamlFileJson;
config.saveJsonAsYaml = saveJsonAsYaml;

config.saveGeneral = function(data){
  config.general = data;
  saveJsonAsYaml(data,generalFile);
}
module.exports =  config;
