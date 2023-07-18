# txyocr

在输出目录下,将截图目录扁平化建立目录,将识别结果写入该目录下ocr.xlst,ocr.csv
出错的文件写入 ocr.csv.err
node ${__filename} 713龚洋/test bd pt 
结果写入  ${__dirname}/output/713龚洋_test
 node ${__filename} 目录 方法 输出目录 处理子目录层级
  截图目录       ---   截图所在目录
  平台          ---   bd(百度) tx（腾讯) (默认bd)
  方法          ---   acc(高精度) pt(普通)  ptl(标准+位置) accl(高精+位置) (默认pt)
  输出目录       ---   输出结果目录（默认 截图目录/output）
  处理子目录层级  ---   默认 2
