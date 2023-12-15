const OCR = {};
OCR.tx = require('./src/txOcr');
OCR.bd = require('./src/bdOcr');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');
const XLSX = require("xlsx");
const ApiConfig = require('./apiConfig');
const Tools = require('./tools');
const currentTimeStamp = new Date().getTime();



XLSX.set_fs(fs);



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
async function processDir(imgdir, logFunc = console.log, platform = 'bd', method = 'pt', maxDepth = 5) {
  if (!fs.existsSync(imgdir)) {
    logFunc(`截图目录 ${imgdir} 不存在`);
    return;
  }

  

    const generalConf = ApiConfig.general;

    const outputDir = path.join(imgdir, generalConf.OUTDIR||'output');

    logFunc('process:',1);




    const fn = imgdir.replace(/\./g, '').replace(/\//g, '_').replace(/\\/, '_');
    let sourceDir = imgdir; // 指定目录的路径
    if (!path.isAbsolute(sourceDir))
      sourceDir = path.resolve(imgdir);


    const processedResultFile = path.join(outputDir, '.processed.txt'); // 输出文件的路径

    let outputFilePath = path.join(outputDir, 'ocr.csv'); // 输出文件的路径
    let outputXlsFilePath = path.join(outputDir, 'ocr.xlsx'); // 输出文件的路径

    const cacheDir = path.join(outputDir, 'cache');
    Tools.mkdirp(cacheDir);







  const csvhead = '文件,日期,来源,归属,备注,下单人,手机号,地址,实付款,订单号,下单时间,商品总价,商品名,其他信息' + "\n";
  const xlsxHead = ['文件(可点击打开)', '日期', '来源', '归属', '备注', '下单人', '手机号', '地址', '实付款', '订单号', '下单时间', '商品总价', '商品名', '其他信息'];
  logFunc('params', {
    platform,
    method,
    maxDepth,
    outputDir,
    outputFilePath,
    outputXlsFilePath,
    sourceDir,
    processedResultFile,
  });

  //读取已经处理的文件
  let processedFiles = {}

  fs.writeFileSync(outputFilePath, csvhead);
  fs.writeFileSync(outputFilePath + '.err', '');





  const imageFiles = [];
  Tools.readImageFiles(sourceDir, imageFiles, maxDepth);
  const totalFileNum = imageFiles.length;
  logFunc('procees ', sourceDir, ': 总共 ' + imageFiles.length + ' 个文件');
  // return;
  // 遍历每个文件
  let i = 0;
  const wsData = [];
  wsData.push(xlsxHead);


  for (i = 0; i < imageFiles.length; ++i) {

    const filePath = imageFiles[i];
    if (processedFiles[filePath]) {
      logFunc('processed :', filePath);
      continue;
    }

    try {
      const ret = await OCR[platform].general(filePath, cacheDir, method,logFunc);

      ret.filename = path.relative(outputDir, filePath);
      ret.fnflag = encodeURIComponent(ret.filename.substr(2));

      ret._from = path.dirname(ret.filename);
      if (ret.cpmArr.length > 0) {
        ret.cpm = ret.cpmArr.join('|');
        ret._to = '|';
        for (let j = 0; j < ret.cpmArr.length; j++) {
          //logFunc(cp);  
          const cp = ret.cpmArr[j];
          const to = cp + '_' + ret.cpSfArr[j] || ret.sfk;
          //按产品名分类
          if (generalConf.byCp) {
            const toDir = path.join(outputDir, 'cp', to);
            try {
              Tools.mkdirp(toDir);
              fs.copyFileSync(filePath, path.join(toDir, ret.fnflag));
            } catch (err) {
              //console.error('cp Error:', filePath, toDir, err);
            }
          }
          ret._to += to + '|';
        }
      }



      const csvData = `${ret.filename},${ret.rq},${ret._from},${ret._to},,${ret.xdr},${ret.sjh},${ret.shdz},${ret.sfk},${ret.ddh1},${ret.xdsj},${ret.spzj},${ret.cpm},${ret.qtsbxx}\n`;
      fs.appendFileSync(outputFilePath, csvData);
      wsData.push([ret.filename, ret.rq, ret._from, ret._to, , ret.xdr, ret.sjh, ret.shdz, ret.sfk, ret.ddh1, ret.xdsj, ret.spzj, ret.cpm, ret.qtsbxx]);
      fs.appendFileSync(processedResultFile, filePath + "\n");
      logFunc('process file ok :', i + 1, '/', totalFileNum, filePath, ret);
      await Tools.wait(200);
    } catch (err) {
      logFunc('process file err :', filePath, err);
      fs.appendFileSync(outputFilePath + '.err', filePath + ':' + err.toString() + "\n");
    }
  }

  //写excel文件
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  let crname = '', filename = '';

  for (i = 0; i < wsData.length; ++i) {
    crname = 'A' + (i + 1);
    filename = wsData[i][0];
    ws[crname].l = {
      Target: "file:///" + filename,
      Tooltip: '点击打开' + filename
    };
  }

  const wsName = 'output';


  /* Create workbook */
  const wb = XLSX.utils.book_new();

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, wsName);
  /* Write to file */
  XLSX.writeFile(wb, outputXlsFilePath);


  logFunc('处理完成');





}



module.exports = {
  processDir
}







