
/**
 * 
 * 配置产品名称关键词,寻找精准产品名
 * 
 **/
module.exports = {
    products: [
        {
            name: '遵义红红茶',
            keywords: ['遵义红红', ]
        },
        {
            name: '壶中福清香菜籽油',
            keywords: ['壶中福清香']
        },
        {
            name: '壶中福炒香菜籽油',
            keywords: ['壶中福香炒香']
        },
        {
            name: '石阡苔茶功夫红茶',
            keywords: ['苔茶功夫']
        },
        {
            name: '石阡苔茶翠芽',
            keywords: ['苔茶翠芽']
        },

    ],
    //fa
    match: function (name) {
        const ps = this.products;
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