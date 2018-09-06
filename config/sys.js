var config = {
    debug : true,
    name: 'socket', // 网站名名字
    description: 'socket', // 网站的描述
    keywords: '',

    site_headers: [
        '<meta name="author" content="Thomas Lau" />'
    ],
    site_logo: '/public/images/light.svg', // default is `name`
    site_icon: '/public/images/icon_32.png', // 默认没有 favicon, 这里填写网址

    session_secret: 'hired_base_secret', // 务必修改
    auth_cookie_name: 'hired_base',

    port: 3000,


    list_count : 20,

    //host: `http://base.test.hiredchina.cn`,
    host: `http://localhost:3000`,

    appId: 'adjfpqwj13120ca9r10cj',
    appSecret: 'jgpjq311nniocha1234',

}

if (process.env.NODE_ENV === 'production') {
    config.host = 'http://localhost:3000'

    config.debug = false
} else if (process.env.NODE_ENV === 'test') {
    // for test
}

config.menus = [
    {name:'Users', href:`/users`, roles: [Enumeration.roleType[0].value ]},
    {name:'Settings', href:`/settings`, roles: [Enumeration.roleType[0].value ]},
    {name:'Socket', href:`/socket`, roles: [Enumeration.roleType[0].value ]},
]

module.exports = config