const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');


const cryptoJson = {
    algorithm: 'aes-256-cbc',
    key: Buffer.from('Your father'.padEnd(32, '\0'), 'binary'),
    iv: Buffer.from('is here'.padEnd(16, '\0'), 'binary'), // 16 bytes IV for added security





    // 加密函数
    encryptData: function (data) {
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), this.iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },

    // 解密函数
    decryptData: function (encryptedData) {
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), this.iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return JSON.parse(decrypted);
    },

    // 将加密后的数据存入文件
    saveToFile: function (data, filename) {
        const encryptedData = this.encryptData(data);
        fs.writeFileSync(filename, encryptedData, 'utf-8');
        //console.log('Data saved to file:', filename);
    },

    // 从文件读取数据并解密
    readFromFile: function (filename) {
        const encryptedData = fs.readFileSync(filename, 'utf-8');
        const decryptedData = this.decryptData(encryptedData);
        // console.log('Data read from file:', filename,decryptedData,encryptedData);
        return decryptedData;
    }
};




/**
 * 
 * 配置产品名称关键词,寻找精准产品名
 * 
 **/
module.exports = {
    cryptoJson,
    matchCpm: function (name,ps) {
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
    readImageFiles: function (dir, results, maxDepth = 2,ignoreDir) {
        const queue = [{ dir, depth: 0 }];
        while (queue.length > 0) {
            const { dir, depth } = queue.shift();
            if (depth > maxDepth) continue;
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory() && file != ignoreDir) {
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
    },

    hashPassword: function (password) {
        // 使用 SHA-256 算法
        const hash = crypto.createHash('sha256');

        // 更新哈希对象的数据
        hash.update(password);

        // 获取十六进制编码的哈希值
        const hashedPassword = hash.digest('hex').substring(0, 64);
        return hashedPassword;
    },

}