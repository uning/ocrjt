
const ApiConfig = require('./apiConfig');
const fs = require('fs');
const readline = require('readline');
const path = require('path');



/**
 * 
 * 配置产品名称关键词,寻找精准产品名
 * 
 **/
module.exports = {
    matchCpm: function (name) {
        const ps = ApiConfig.products;
        let find = false;
        for (let i = 0; i < ps.length; ++i) {
            if (name.includes(ps[i].name)) {
                find = true;
                return ps[i].name;
                // break;
            }
            const ks = ps[i].keywords;
            for (let j = 0; j < ks.length; ++j) {
                if (name.includes(ks[j])) {
                    find = true;
                    return ps[i].name;
                    //break;
                }
            }
            if (find) {
                break;
            }
        }
    },




    //等待时间
    wait: async function (ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    },

    mkdirp: function (directory) {
        try {
            fs.mkdirSync(directory, { recursive: true });
            //console.log(directory, '目录已创建或已存在');
        } catch (err) {
            if (!err.code === 'EEXIST') {
                console.error('无法创建目录:', err);
            }
        }
    },

    /*
    读取文件夹dir下文件夹
    */
    readImageFiles: function (dir, results, maxDepth = 2) {
        const queue = [{ dir, depth: 0 }];
        while (queue.length > 0) {
            const { dir, depth } = queue.shift();
            if (depth > maxDepth) continue;
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory() && file != ApiConfig.OUTDIR) {
                    queue.push({ dir: filePath, depth: depth + 1 });
                } else {
                    if (file.toLocaleLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                        results.push(filePath);
                    }
                }
            });
        }
    },
    readKeys: async function (file) {
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

}