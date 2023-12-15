const dirOcr = require('./dirOcr');
const fs = require('fs');
const path = require('path');

const { argv } = require('process');
const ApiConfig = require('./apiConfig');






const helpStr = `
会在输出目录下,将截图目录扁平化建立目录,将识别结果写入该目录下ocr.xlst,ocr.csv
出错的文件写入 ocr.csv.err
node ocr.js  截图目录 bd pt 
结果写入  ${__dirname}/output/713龚洋_test
 node ${__filename} 目录 方法 输出目录 处理子目录层级
  截图目录       ---   截图所在目录
  平台          ---   bd(百度) tx（腾讯) (默认配置文件)
  方法          ---   acc(高精度) pt(普通)  ptl(标准+位置) accl(高精+位置) (默认pt)
  输出目录       ---   输出结果目录（默认 ./output）
  处理子目录层级  ---   默认 5

`;

function usage() {
  console.log(helpStr);
  process.exit(0);
}










/*
 sjh: '15698470326',
  xdr: '何宇轩',
  shdz: '河南省郑州市管城回族区河南省郑州市管城区陇海',
  sfk: '1408',
  ddzt: '待发货',
  ddh1: '11224710003333',
  xdsj: '2023-07-12 13:54:03',
  spzj: '1408',
  cpm: '路通讯新天地4D15|遵义红红茶|实付:￥608|送608积分|￥608|遵义红红茶|实付:￥800|送800积分|008夫|lX|',
  qtsbxx: '13:57|23.6|HD|4G|5G|56|KB/s|..l|ol|订单详情|待发货|何宇轩|15698470326|河南省郑州市管城回族区河南省郑州市管城区陇海|订单编号|11224710003333|下单时间|2023-07-12 13:54:03|商品总价|￥1408|运费|￥0|实付款￥1408|申请售后|联系客服|前往首页|'
*/
async function processAll() {
  const args = process.argv.slice(2);
  const imgdir = args[0];
  if (!fs.existsSync(imgdir)) {
    console.log(`截图目录 ${imgdir} 不存在`);
    usage();
  }

  const generalConf = ApiConfig.general;

  const platform = args[1] || generalConf.defaultPt || 'bd';
  const method = args[2] || 'pt';


  const maxDepth = args[4] || 5;

  await dirOcr.processDir(imgdir,console.log,platform,method,maxDepth);


}



processAll();









