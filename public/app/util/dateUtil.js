//'format es6'
// 格式化时间
export function format (date){
    if (date == null)
        return null;
    date = new Date(date);
    let format = 'MM-dd hh:mm';
    let o = {
        "M+": date.getMonth() + 1,                 //月份   
        "d+": date.getDate(),                    //日   
        "h+": date.getHours(),                   //小时   
        "m+": date.getMinutes(),                 //分   
        "s+": date.getSeconds(),                 //秒   
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
        "S": date.getMilliseconds()             //毫秒   
    };
    date = new Date(date + '');
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return format;
}
// if (date.length == 19) {
    //     console.log(date);
    //     var dateArr = date.split(' ')[0].split('-');
    //     var timeArr = date.split(' ')[1].split(':');
    //     var year = parseInt(dateArr[0]);
    //     var month;
    //     //处理月份为04这样的情况                         
    //     if (dateArr[1].indexOf("0") == 0) {
    //         month = parseInt(dateArr[1].substring(1));
    //     } else {
    //         month = parseInt(dateArr[1]);
    //     }
    //     var day = parseInt(dateArr[2]);
    //     date = new Date(year, month - 1, day,timeArr[0],timeArr[1],timeArr[2]);
    // } else