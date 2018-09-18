"use strict"

import { format } from '../util/dateUtil'
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
        //this.socket = io.connect('http://192.168.31.107:3001/hiredchina');
        this.socket = io.connect('http://120.79.243.235:3001/hiredchina');
        //查询最近的聊天群
        this.socket.emit('queryLastContacts', { 'token': window.location.search.split('token=')[1] }, (...args) => lastContacts(...args));
        //监听客户端返回的最近的聊天群
        function lastContacts(groups, sender, isNew) {
            $.each(groups, function (i, group) {
                let html = `<li class='group' groupId='${group.id}' lastTime='${group.lastTime}' isPrivate='${group.isPrivate}'>`;
                if (group.isPrivate == true) {
                    $.each(group.userList, function (i, user) {
                        html += `
                            <div class='name' receiverId='${user.id}'>${user.name}</div>
                            <img class='img' src='${user.img}' style='width:50px;height:50px'/>
                            <div class='lastTime'>${format(group.lastTime)}</div>`;
                        if (group.type == 0)
                            html += `<div class='lastContent'> ${group.lastContent}</div>`;
                        else if (group.type == 1)
                            html += `[图片]`;
                        else
                            html += `<div class='lastContent'></div>`;
                        if (group.noRead > 0)
                            html += `<div class='noRead'>${group.noRead}</div>`;
                        else
                            html += `<div class='noRead'></div>`;
                        html += `<div class='status'>${user.status}</div>`;
                    })
                } else {
                    html += `
                        <div class='name'>${group.name}</div>
                        <img class='img' src='${group.img}' style='width:50px;height:50px'/>
                        <div class='lastTime'>${format(group.lastTime)}</div>`;
                    if (msg.type == 0)
                        html += `<div class='lastContent'>${group.lastContent}</div>`;
                    else if (msg.type == 1)
                        html += `[图片]`;
                    else
                        html += `<div class='lastContent'></div>`;
                    if (group.noRead > 0)
                        html += `<div class='noRead'>${group.noRead}</div>`;
                    else
                        html += `<div class='noRead'></div>`;
                }
                html += "</li>";
                $('#userList').append(html);
            })
            if (isNew) {
                if (sender.curGroup) {//读取前面页面传递过来的聊天窗口id
                    $('#userList').children().each(function () {
                        if ($(this).attr('groupId') == sender.curGroup.id)
                            $(this).click();
                    })
                } else
                    $('#userList').children('li:first-child').click();//打开联系人列表时默认选中第一个对话框
                $('#sendBtn').attr('senderId', sender.id);
                $('#sendBtn').attr('senderIp', sender.ip);
            }
        }
        //点击头像时查询最近的聊天记录
        $(document).on("click", '.group', function () {
            $('#selectedChat').css('background-color', '');
            $('#selectedChat').removeAttr('id');
            $(this).css("background-color", "#E8E8E8");
            $(this).attr('id', 'selectedChat');
            that.socket.emit('queryChat', { 'groupId': $(this).attr('groupId'), 'noRead': $(this).children('.noRead').html() }, (...args) => lastChat(...args));
            that.socket.emit('haveRead', { 'groupId': $(this).attr('groupId'), 'noRead': $(this).children('.noRead').html() }, () => {
                console.log(this);
                $(this).children('.noRead').html('');
            });
        });
        //监听服务端返回的最近聊天信息
        function lastChat(msgs, isNew) {
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
                if (msg.senderId == $('#sendBtn').attr('senderId'))
                    html = `<li msgId='${msg.id}' createDate='${msg.createDate}' style='text-align: right'>`;
                else
                    html = `<li msgId='${msg.id}' createDate='${msg.createDate}'>`;
                html += `<img src='${msg.sender.img}' style='width:40px;height:40px'/>
                <div>${msg.sender.name}</div>
                <div>${format(msg.createDate)}</div>`;
                if (msg.type == 0)
                    html += `<div>${msg.content}</div>`;
                else if (msg.type == 1)
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
        }
        //监听用户列表下拉事件
        $('#userList').scroll(function () {
            let scrollTop = $(this).scrollTop();//滚动条位置
            let windowHeight = $(this).height();//窗口外框高度
            let scrollHeight = 0;//窗口内部高度
            $(this).children().each(function () {
                scrollHeight += $(this).height();
            })
            if (scrollTop + windowHeight == scrollHeight)  //滚动到底部执行事件  
                that.socket.emit('queryLastContacts', { 'lastTime': $(this).children('li:last-child').attr('lastTime') },
                    (...args) => lastContacts(...args));
        });
        //监听聊天窗口上拉事件
        $('#chat').scroll(function () {
            let scrollTop = $(this).scrollTop();//滚动条位置
            if (scrollTop == 0)  //滚动到头部执行事件  
                that.socket.emit('queryChat', { 'groupId': $('#selectedChat').attr('groupId'), 'createDate': $(this).children('li:first-child').attr('createDate') },
                    (...args) => lastChat(...args));
        });
        //发送消息
        $('#sendBtn').click(function () {
            if ($.trim($('#message').val()) == "") {
                alert("发送内容不能为空");
            } else {
                //'ip':window.location.host,
                that.socket.emit('sendMsg', { 'groupId': $('#selectedChat').attr('groupId'), 'content': $('#message').val(), type: 0 },
                    (...args) => showNewMsg(...args));
                $('#message').val('');
            }
        })
        //接收消息
        this.socket.on('newMsg', (...args) => showNewMsg(...args))
        function showNewMsg(msg, isCallBack) {
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
                if (isCallBack)
                    html = `<li createDate='${msg.createDate}' style='text-align: right'>`;
                else
                    html = `<li createDate='${msg.createDate}'>`;
                html += `<img src='${msg.sender.img}' style='width:40px;height:40px'/>
                <div>${msg.sender.name}</div>
                <div>${format(msg.createDate)}</div>`;
                if (msg.type == 0)
                    html += `<div>${msg.content}</div>`;
                else if (msg.type == 1)
                    html += `<img src='${msg.content}'></div>`;

                html += "</li>";
                $('#chat').append(html);//最新的消息显示在最下面

                if (isBottom) {
                    scrollHeight = 0;
                    $('#chat').children().each(function () {
                        scrollHeight += $(this).height();
                    })
                    $('#chat').scrollTop(scrollHeight);//滑动到最底端
                }
                $('#selectedChat').children('.lastTime').html(format(msg.createDate));
                msg.type == 0 ? $('#selectedChat').children('.lastContent').html(msg.content) : $('#selectedChat').children('.lastContent').html(`[图片]`)
                //向客户端发送已读回执
                that.socket.emit('haveRead', { 'groupId': $('#selectedChat').attr('groupId'), 'noRead': 1 });
            } else {//如果用户没有停留在有新消息的窗口，此窗口应当显示未读的数量
                //没有停留在当前窗口又分为两种情况，一种是新的对话窗口，一种是新的消息
                let chatOrMsg = 'chat';
                $('#userList').children().each(function () {
                    if ($(this).attr('groupId') == msg.groupId) {//已有窗口的新消息
                        $(this).children('.lastTime').html(format(msg.createDate));
                        msg.type == 0 ? $(this).children('.lastContent').html(msg.content) : $(this).children('.lastContent').html(`[图片]`)
                        $(this).children('.noRead').html(msg.noRead);
                        chatOrMsg = 'msg';
                        return;
                    }
                })
                if (chatOrMsg == 'chat') {
                    let chatHtml = `<li class='group' groupId='${msg.group.id}' lastTime='${msg.group.lastTime}' isPrivate='${msg.group.isPrivate}'>`;
                    if (msg.group.isPrivate == true) {
                        chatHtml += `<div class='name' receiverId='${msg.sender.id}'>${msg.sender.name}</div>
                        <img class='img' src='${msg.sender.img}' style='width:50px;height:50px'/>
                        <div class='lastTime'>${format(msg.createDate)}</div>`;
                        if (msg.type == 0)
                            chatHtml += `<div>${msg.content}</div>`;
                        else if (msg.type == 1)
                            chatHtml += `<img src='${msg.content}'></div>`;
                        chatHtml += `<div class='noRead'>${msg.noRead}</div>
                        <div class='status'>online</div>`;
                    } else {
                        chatHtml += `<div class='name'>${msg.group.name}</div>
                            <img class='img' src='${msg.group.img}' style='width:50px;height:50px'/>
                            <div class='lastTime'>${format(msg.group.lastTime)}</div>`;
                        if (msg.type == 0)
                            chatHtml += `<div class='lastContent'>${msg.group.lastContent}</div>`;
                        else if (msg.type == 1)
                            chatHtml += `[图片]`;
                        chatHtml += `<div class='noRead'>${msg.noRead}</div>`;
                    }
                    chatHtml += `</li>`;
                    $('#userList').prepend(chatHtml);
                    //如果是新的群聊，则msg应包含isprivate属性，并包含群信息。。。
                }
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
        }
        //点击图片按钮，选择图片后进行发送
        $('#sendImg').click(function () {
            $('#img').click();
        })
        $('#img').on('change', function () {
            if ($('#img').val() != '') {
                let formData = new FormData();
                formData.append("files", $('#img').get(0).files[0]);
                $.ajax({
                    url: "upload",
                    type: "POST",
                    data: formData,
                    contentType: false,//必须false才会自动加上正确的Content-Type
                    processData: false,//必须false才会避开jQuery对 formdata 的默认处理，XMLHttpRequest会对 formdata 进行正确的处理
                    success: function (data) {
                        //上传到七牛后，将链接发给socket
                        that.socket.emit('sendMsg', { 'groupId': $('#selectedChat').attr('groupId'), 'content': data.result, type: 1 }, (...args) => showNewMsg(...args));
                        $('#img').replaceWith($('#img').val('').clone(true));
                    },
                    error: function () {
                        alert("上传失败！");
                    }
                });
            }
        })
        this.socket.on('changeStatus', (sender) => {
            $('.group').each(function () {
                if ($(this).attr('isPrivate') == 'true') {
                    if ($(this).children(':first').attr('receiverId') == sender.id) {
                        $(this).children('.status').html(sender.status);
                        return;
                    }
                }
            })
        })
        $(window).on("unload", function () {
            that.socket.emit('offline');
        });
    }
};