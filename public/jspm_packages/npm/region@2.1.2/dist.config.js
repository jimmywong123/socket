/* */ 
module.exports = {
    entry: './index',
    output: {
        path         : __dirname + "/dist",
        libraryTarget: 'umd',
        library      : 'Region',
        filename     : 'region.js'
    }
}