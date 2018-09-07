"use strict"

//import io from '../../jspm_packages/npm/socket.io-client@2.1.1/dist/socket.io'
import {format} from '../util/dateUtil'
import io from 'socket.io-client'

export function hichatfunction() {
    //实例并初始化我们的hichat程序
    if ($('#userList').length > 0) {
        var hichat = new HiChat();
        hichat.init();
    }
};

//定义我们的hichat类
var HiChat = function () {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function () {//此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        //this.socket = io.connect('http://120.79.243.235:3000');
        this.socket = io.connect('http://localhost:3000');
        //查询最近的聊天群
        this.socket.emit('queryLastContacts', { 'senderId': 1 ,'ip':window.location.search.split('ip=')[1].split('&')[0]});
        //监听客户端返回的最近的聊天群
        this.socket.on('lastContacts', function (groups, isNew) {
            $.each(groups, function (i, group) {
                let html = `<li class='group' groupId='${group.id}' lastTime='${group.lastTime}'>`;
                if (group.isPrivate == true) {
                    $.each(group.userList, function (i, user) {
                        html += `
                            <div>${user.name}</div>
                            <img src='${user.img}' style='width:50px;height:50px'/>
                            <div>${format(group.lastTime)}</div>
                            <div>${group.lastContent}</div>
                            <div>${group.noRead}</div>`;
                    })
                } else {
                    html += `
                        <div>${group.name}</div>
                        <img src='${group.img}' style='width:50px;height:50px'/>
                        <div>${format(group.lastTime)}</div>
                        <div>${group.lastContent}</div>
                        <div>${group.noRead}</div>
                    `;
                }
                html += "</li>";
                $('#userList').append(html);
            })
            if (isNew)
                $('#userList').children('li:first-child').click();//打开联系人列表时默认选中第一个对话框
        })
        //点击头像时查询最近的聊天记录
        $(document).on("click", '.group', function () {
            $('#selectedChat').css('background-color', '');
            $('#selectedChat').removeAttr('id');
            $(this).css("background-color", "#E8E8E8");
            $(this).attr('id', 'selectedChat');
            that.socket.emit('queryChat', { 'groupId': $(this).attr('groupId') });
        });
        //监听服务端返回的最近聊天信息
        this.socket.on('lastChat', function (msgs, isNew) {
            let scrollTop;//记录滑动块的初始位置
            let startScrollHeight = 0;//记录聊天窗口的初始滑动高度

            if (isNew)
                $('#chat').html('');
            else {//加载额外信息时才需要记录这些滑块位置
                scrollTop = $('#chat').scrollTop();
                $('#chat').children().each(function () {
                    startScrollHeight += $(this).height();
                })
            }
            $.each(msgs, function (i, msg) {
                let html;
                if (msg.sender.originalId == 1)
                    html = `<li createDate='${msg.createDate}' style='text-align: right'>`;
                else
                    html = `<li createDate='${msg.createDate}'>`;
                html += `<img src='${msg.sender.img}' style='width:40px;height:40px'/>
                <div>${msg.sender.name}</div>
                <div>${format(msg.createDate)}</div>`;
                if(msg.type==0)
                    html += `<div>${msg.content}</div>`;
                else if(msg.type==1)
                    html += `<img src='${msg.content}'>`;
                html += "</li>";
                $('#chat').prepend(html);//最新的消息显示在最下面
            })
            if (isNew)
                $('#chat').scrollTop($('#chat')[0].scrollHeight);
            else {//防止加载信息后的窗口抖动
                let endScrollHeight = 0;//加载额外聊天信息后的内部高度
                $('#chat').children().each(function () {
                    endScrollHeight += $(this).height();
                })
                $('#chat').scrollTop(scrollTop + (endScrollHeight - startScrollHeight));
            }

        })
        //监听用户列表下拉事件
        $('#userList').scroll(function () {
            let scrollTop = $(this).scrollTop();//滚动条位置
            let windowHeight = $(this).height();//窗口外框高度
            let scrollHeight = 0;//窗口内部高度
            $(this).children().each(function () {
                scrollHeight += $(this).height();
            })
            if (scrollTop + windowHeight == scrollHeight)  //滚动到底部执行事件  
                that.socket.emit('queryLastContacts', { 'senderId': 1, 'lastTime': $(this).children('li:last-child').attr('lastTime') });
        });
        //监听聊天窗口上拉事件
        $('#chat').scroll(function () {
            let scrollTop = $(this).scrollTop();//滚动条位置
            if (scrollTop == 0)  //滚动到头部执行事件  
                that.socket.emit('queryChat', { 'groupId': $('#selectedChat').attr('groupId'), 'createDate': $(this).children('li:first-child').attr('createDate') });
        });
        //发送消息
        $('#sendBtn').click(function () {
            if ($.trim($('#message').val()) == "") {
                alert("发送内容不能为空");
            } else {
                //'ip':window.location.host,
                that.socket.emit('sendMsg', { 'senderId': 1, 'userName': '1号用户', 'groupId': $('#selectedChat').attr('groupId'), 'content': $('#message').val(), type: 0 });
                $('#message').val('');
            }
        })
        //接收消息
        this.socket.on('newMsg', function (msg) {
            //如果用户正停留在此聊天窗口最底端，有新消息时滚动条应滑动到最底端
            if ($('#selectedChat').attr('groupId') == msg.groupId) {
                let scrollHeight = 0;
                let isBottom;
                $('#chat').children().each(function () {
                    scrollHeight += $(this).height();
                })
                if (typeof ($('#caht').scrollTop()) == 'undefined' || $('#chat').scrollTop() == scrollHeight)
                    isBottom = true;

                let html;
                if (msg.sender.originalId == 1)
                    html = `<li createDate='${msg.createDate}' style='text-align: right'>`;
                else
                    html = `<li createDate='${msg.createDate}'>`;
                html += `<img src='${msg.sender.img}' style='width:40px;height:40px'/>
                <div>${msg.sender.name}</div>
                <div>${format(msg.createDate)}</div>
                <div>${msg.text}</div>`;
                if(msg.type==0)
                    html+=`<div>${msg.content}</div>`;
                else if(msg.type==1)
                    html+=`<img src='${msg.content}'></div>`;

                html += "</li>";
                $('#chat').append(html);//最新的消息显示在最下面

                if (isBottom) {
                    scrollHeight = 0;
                    $('#chat').children().each(function () {
                        scrollHeight += $(this).height();
                    })
                    $('#chat').scrollTop(scrollHeight);//滑动到最底端
                }
            } else {//如果用户没有停留在有新消息的窗口，此窗口应当显示未读的数量

            }
            //有新消息的聊天群应浮动到最上方
            $('#userList').children().each(function () {
                if ($(this).attr('groupId') == msg.groupId) {
                    let li = this;
                    $(this).remove();
                    $('#userList').prepend(li);
                    $('#userList').scrollTop(0);
                    return;
                }
            })
        })
        //点击图片按钮，选择图片后进行发送
        $('#sendImg').click(function () {
            $('#img').click();
        })
        $('#img').on('change', function () {
            if ($('#img').val() != '') {
                var formData = new FormData();
                formData.append("files", $('#img').get(0).files[0]);
                $.ajax({
                    url: "upload",
                    type: "POST",
                    data: formData,
                    contentType: false,//必须false才会自动加上正确的Content-Type
                    processData: false,//必须false才会避开jQuery对 formdata 的默认处理，XMLHttpRequest会对 formdata 进行正确的处理
                    success: function (data) {
                        //上传到七牛后，将链接发给socket
                        console.log(data);
                        that.socket.emit('sendMsg', { 'senderId': 1, 'userName': '1号用户', 'groupId': $('#selectedChat').attr('groupId'), 'content': data.result, type: 1 });
                    },
                    error: function () {
                        alert("上传失败！");
                    }
                });
                // let file = $('#img').get(0).files[0];    //得到该图片
                // let reader = new FileReader();           //创建一个FileReader对象，进行下一步的操作
                // reader.readAsDataURL(file);              //通过readAsDataURL读取图片
                // reader.onload = function () {            //读取完毕会自动触发，读取结果保存在result中
                //     that.socket.emit('sendMsg', { 'senderId': 1, 'userName': '1号用户', 'groupId': $('#selectedChat').attr('groupId'), 'content': this.result, type: 1 });
                // }
            }
        })
        // $.ajax({
        //     type: "post",
        //     url: "/socket/sendMsg",
        //     data: { id: '1' },
        //     dataType: "json",
        //     success: function (data) {
        //         alert(`ajax-${data}`);
        //     }
        // });
        // this.socket.on('test', function (test) {
        //     alert(`test-${test}`);
        // })
    }
};