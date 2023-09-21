
//api config
// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
  credential: {
    secretId: "",
    secretKey: ""
  },
  region: "ap-guangzhou",
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com"
    }
  }
};
const products = [
  {
    name: '遵义红红茶',
    keywords: ['遵义红红',]
  },
  {
    name: '壶中福清香菜籽油',
    keywords: ['中福清香']
  },
  {
    name: '壶中福炒香菜籽油',
    keywords: ['中福炒香']
  },
  {
    name: '石阡苔茶功夫红茶',
    keywords: ['苔茶功夫']
  },
  {
    name: '石阡苔茶翠芽',
    keywords: ['苔茶翠芽']
  },
  {
    name: '凤莎红茶',
    keywords: []
  },
];

module.exports = {
  clientConfig,
  byCp: false,//按产品分类到目录
  AK: "", //百度AK
  SK: "",//百度OCR SK
  products,
  defaultPt: 'bd',
  OUTDIR: 'output',
}