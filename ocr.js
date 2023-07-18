
const OCR = {};
OCR.tx = require('./src/txOcr');
OCR.bd = require('./src/bdOcr');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');
const XLSX = require("xlsx");
const readline = require('readline');

XLSX.set_fs(fs);




const helpStr = `
会在输出目录下,将截图目录扁平化建立目录,将识别结果写入该目录下ocr.xlst,ocr.csv
出错的文件写入 ocr.csv.err
node ${__filename} 713龚洋/test bd pt 
结果写入  ${__dirname}/output/713龚洋_test
 node ${__filename} 目录 方法 输出目录 处理子目录层级
  截图目录       ---   截图所在目录
  平台          ---   bd(百度) tx（腾讯) (默认bd)
  方法          ---   acc(高精度) pt(普通)  ptl(标准+位置) accl(高精+位置) (默认pt)
  输出目录       ---   输出结果目录（默认 ./output）
  处理子目录层级  ---   默认 2

`;

function usage() {
  console.log(helpStr);
  process.exit(0);
}








//等待时间
async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function mkdirp(directory) {
  try {
    fs.mkdirSync(directory, { recursive: true });
    console.log(directory, '目录已创建或已存在');
  } catch (err) {
    if (!err.code === 'EEXIST') {
      console.error('无法创建目录:', err);
    }
  }
}

/*
读取文件夹dir下文件夹
*/
function readImageFiles(dir, results, maxDepth = 2) {
  const queue = [{ dir, depth: 0 }];
  while (queue.length > 0) {
    const { dir, depth } = queue.shift();
    if (depth > maxDepth) continue;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        queue.push({ dir: filePath, depth: depth + 1 });
      } else {
        if (file.toLocaleLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
          results.push(filePath);
        }
      }
    });
  }
}


async function readKeys(file) {
  const keys = {};
  const fileStream = fs.createReadStream(file);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    keys[line] = true;
  }
  return keys;
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

  const platform = args[1] || 'bd';
  const method = args[2] || 'pt';
  //const outputDir = args[3] || path.join(__dirname, 'output');
  const outputDir = args[3] || path.join(imgdir, 'output');;

  const maxDepth = args[4] || 2;




  const fn = imgdir.replace(/\./g, '').replace(/\//g, '_');
  let sourceDirectory = imgdir; // 指定目录的路径
  if (!path.isAbsolute(sourceDirectory))
    sourceDirectory = path.resolve(imgdir);

  mkdirp(outputDir);

  const processedResultFile = path.join(outputDir, '.' + fn + '.processed.txt'); // 输出文件的路径

  const outputFilePath = path.join(outputDir, fn + 'ocr.csv'); // 输出文件的路径
  const outputXlsFilePath = path.join(outputDir, fn + 'ocr.xlsx'); // 输出文件的路径

  const csvhead = '文件,日期,备注,下单人,手机号,地址,实付款,订单号,下单时间,商品总价,商品名,其他信息' + "\n";

  fs.writeFileSync(outputFilePath, csvhead);
  fs.writeFileSync(outputFilePath + '.err', '');


  //读取已经处理的文件
  let processedFiles = {}
  try {
    processedFiles = await readKeys(processedResultFile);
  } catch (e) {
  }
  console.log('processedFiles:', processedFiles);





  const imageFiles = [];
  readImageFiles(sourceDirectory, imageFiles,maxDepth);
  console.log('procees ',sourceDirectory,': 总共 ' + imageFiles.length + ' 个文件');
  // return;
  // 遍历每个文件
  let i = 0;

  const wsData = [];
  wsData.push(['文件(可点击打开)', '日期','备注', '下单人', '手机号', '地址', '实付款', '订单号', '下单时间', '商品总价', '商品名', '其他信息']);
  for (i = 0; i < imageFiles.length; ++i) {
    //const filePath = path.join(sourceDirectory, imageFiles[i]);
    const filePath = imageFiles[i];
    if (processedFiles[filePath]) {
      console.log('processed :', filePath);
      continue;
    }

    try {
      const ret = await OCR[platform].general(filePath, method);

      ret.filename = path.relative(outputDir, filePath);
      const csvData = `${ret.filename},${ret.rq},,${ret.xdr},${ret.sjh},${ret.shdz},${ret.sfk},${ret.ddh1},${ret.xdsj},${ret.spzj},${ret.cpm},${ret.qtsbxx}\n`;
      fs.appendFileSync(outputFilePath, csvData);
      wsData.push([ret.filename, ret.rq,, ret.xdr, ret.sjh, ret.shdz, ret.sfk, ret.ddh1, ret.xdsj, ret.spzj, ret.cpm, ret.qtsbxx]);

      fs.appendFileSync(processedResultFile, filePath + "\n");
      console.log('process file ok :', csvData, filePath, ret);


      await wait(200);


    } catch (err) {
      console.log('process file err :', filePath, err);
      fs.appendFileSync(outputFilePath + '.err', filePath + ':' + err.toString() + "\n");
    }
  }

  //写excel文件
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  let crname = '', filname = '';

  for (i = 0; i < wsData.length; ++i) {
    crname = 'A' + (i + 1);
    filname = wsData[i][0];
    ws[crname].l = {
      Target: "file:///" + filname,
      Tooltip: '点击打开' + filname
    };
  }

  const wsName = fn;


  /* Create workbook */
  const wb = XLSX.utils.book_new();

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, wsName);
  /* Write to file */
  XLSX.writeFile(wb, outputXlsFilePath);



}



processAll();

/*
const results = [];
readImageFiles(args[0],results,args[1]);
console.log(results);
*/








