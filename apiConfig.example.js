
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

module.exports = {
    clientConfig,
   AK:"M8nXRA44bHin5hbQq8zH9Tsx",
   SK:"Os8uHktmPFl2CUwU3vXky2YlGpFCHaWk"
}