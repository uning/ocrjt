
const ApiConfig = require('./apiConfig');

/**
 * 
 * 配置产品名称关键词,寻找精准产品名
 * 
 **/
module.exports = {
    matchCpm: function (name) {
        const ps = ApiConfig.products;
        let  find = false;
        for (let i = 0; i < ps.length; ++i) {
            if (name.includes(ps[i].name)) {
                find = true;
                return  ps[i].name;
               // break;
            }
            const ks = ps[i].keywords;
            for(let j = 0 ; j < ks.length; ++j){
                if(name.includes(ks[j])){
                    find = true;
                    return  ps[i].name;
                    //break;
                }
            }
            if(find){
                break;
            }
        }
    }
}