var requireDirectory = require('require-directory');

function m(dir) {
    var a = dir.split('node_modules')

    if(a.length == 2){

    }else if(a.length !== 2){
        a = dir.split('/app');
    }else{
        throw  "mount-models ERROR: " + dir + "里没有node_modules目录";
    }

    var _dir = a[0] + "/app/models";
    return requireDirectory(module, _dir);
}

module.exports = m;