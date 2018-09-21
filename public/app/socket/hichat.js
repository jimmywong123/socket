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
                let html = `<li class='group list-group-item form-inline' groupId='${group.id}' lastTime='${group.lastTime}' isPrivate='${group.isPrivate}' style='padding:10px;border-radius:0;border:1px solid #D8D8D8;border-style:none none solid none;margin-bottom:0px;cursor:default'>`;
                if (group.isPrivate == true) {
                    $.each(group.userList, function (i, user) {
                        html += `<div class='form-group' style='width:60px;height:60px'><img class='img' src='${user.img}' style='width:50px;height:50px;border-radius:2px'>`;
                        if (group.noRead > 0 && group.noRead <= 99)
                            html += `<span class='noRead badge' style='float:right;background-color:red'>${group.noRead}</span>`;
                        else if (group.noRead >= 100)
                            html += `<span class='noRead badge' style='float:right;background-color:red'>99+</span>`;
                        else
                            html += `<span class='noRead badge' style='float:right;background-color:red'></span>`;
                        html += `</div><div class='form-group' style='width:72%;height:60px'><div class='name form-group' receiverId='${user.id}' style='font-size:130%;width:75%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap'>${user.name}</div>
                            <div class='lastTime form-group' style='color:#989898'>${format(group.lastTime)}</div><br>`;
                        if (group.type == 0) {
                            html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'> ${replaceEmoji(group.lastContent, '20px')}</div></div>`;
                        } else if (group.type == 1)
                            html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                        else if (group.type == 2) {
                            let fileName = group.lastContent.split('#file#')[1];
                            if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                                || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                                html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                            } else
                                html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[文件]</div></div>`;
                        } else
                            html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'></div></div>`;
                        if (user.status == 'online')
                            html += `<div class='status form-inline'><div class='form-group' style='width:8px;height:8px;background-color:#33CC33;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;margin-right:5px'></div>${user.status}</div>`;
                        else
                            html += `<div class='status form-inline'><div class='form-group' style='width:8px;height:8px;background-color:#A0A0A0;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;margin-right:5px'></div>${user.status}</div>`;
                    })
                } else {
                    html += `<div class='form-group' style='width:60px;height:60px'><img class='img' src='${group.img}' style='width:50px;height:50px;border-radius:2px'>`;
                    if (group.noRead > 0 && group.noRead <= 99)
                        html += `<span class='noRead badge' style='float:right;background-color:red'>${group.noRead}</span>`;
                    else if (group.noRead >= 100)
                        html += `<span class='noRead badge' style='float:right;background-color:red'>99+</span>`;
                    else
                        html += `<span class='noRead badge'></span>`;
                    html += `</div><div class='form-group' style='width:72%;height:60px'><div class='name form-group' style='font-size:130%;width:75%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap'>${group.name}</div>
                            <div class='lastTime form-group'>${format(group.lastTime)}</div><br>`;
                    if (group.type == 0) {
                        html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'> ${replaceEmoji(group.lastContent, '20px')}</div></div>`;
                    } else if (group.type == 1)
                        html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                    else if (group.type == 2) {
                        let fileName = group.lastContent.split('#file#')[1];
                        if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                            || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                            html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                        } else
                            html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[文件]</div></div>`;
                    } else
                        html += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'></div></div>`;
                    // html += `
                    //     <div class='name'>${group.name}</div>
                    //     <img class='img' src='${group.img}' style='width:50px;height:50px'/>
                    //     <div class='lastTime'>${format(group.lastTime)}</div>`;
                    // if (msg.type == 0)
                    //     html += `<div class='lastContent'>${group.lastContent}</div>`;
                    // else if (msg.type == 1)
                    //     html += `[图片]`;
                    // else
                    //     html += `<div class='lastContent'></div>`;
                    // if (group.noRead > 0)
                    //     html += `<div class='noRead'>${group.noRead}</div>`;
                    // else
                    //     html += `<div class='noRead'></div>`;
                }
                html += "</li>";
                $('#userList').append(html);
                $('#photo').attr('src', sender.img);
            })
            if (isNew) {
                if (sender.curGroup) {//读取前面页面传递过来的聊天窗口id
                    $('#userList').children().each(function () {
                        if ($(this).attr('groupId') == sender.curGroup.id)
                            $(this).click();
                    })
                } else
                    $('#userList').children('li:first-child').click();//打开联系人列表时默认选中第一个对话框
                $('#message').attr('senderId', sender.id);
            }
        }
        //点击头像时查询最近的聊天记录
        $(document).on("click", '.group', function () {
            if (!$(this).attr('id'))
                $('#message').html('');
            $('#selectedChat').css('background-color', '');
            $('#selectedChat').removeAttr('id');
            $(this).css("background-color", "#D8D8D8");
            $(this).attr('id', 'selectedChat');
            $('#receiverName').html($(this).children().eq(1).children('.name').html());
            that.socket.emit('queryChat', { 'groupId': $(this).attr('groupId'), 'noRead': $(this).children(':first').children('.noRead').html() }, (...args) => lastChat(...args));
            that.socket.emit('haveRead', { 'groupId': $(this).attr('groupId'), 'noRead': $(this).children(':first').children('.noRead').html() }, () => {
                $(this).children(':first').children('.noRead').html('');
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
                if (msg.senderId == $('#message').attr('senderId')) {
                    html = `<li msgId='${msg.id}' createDate='${msg.createDate}' class='form-inline' style='margin-top:10px;text-align: right'>`;
                    if (msg.type == 0) {
                        html += `<div class='form-group bubble-right'>${replaceEmoji(msg.content)}</div>`;
                        html += `<div class='form-group triangle-right'></div>`;
                    } else if (msg.type == 1) {
                        html += `<div class='form-group bubble-right thumbnail' style='max-width:40%'><img src='${msg.content}'></div>`;
                        html += `<div class='form-group triangle-right'></div>`;
                    } else if (msg.type == 2) {
                        let href = msg.content.split('#file#')[0];
                        let fileName = msg.content.split('#file#')[1];
                        if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                            || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                            html += `<div class='form-group bubble-right thumbnail' style='max-width:40%'><img src='${href}'></div>`;
                            html += `<div class='form-group triangle-right'></div>`;
                        } else {
                            html += `<div class='form-group file-right'>
                                    <div class='form-inline'>
                                        <img class='form-group' style='width:35px;height:50px' src='/img/file.jpg'>
                                        <div class='form-group' style='max-width:86%'><a href='${href}' style='text-decoration:none'>${fileName}</a></div>
                                    </div>
                                </div>`;
                        }
                    }
                    html += `<div class='form-group'><img src='${msg.sender.img}' style='width:40px;height:40px'/>
                        <div style='color:#A0A0A0;font-size:90%'>${format(msg.createDate)}</div></div>`;
                } else {
                    html = `<li msgId='${msg.id}' createDate='${msg.createDate}' class='form-inline' style='margin-top:10px;'>`;
                    html += `<div class='form-group'><img src='${msg.sender.img}' style='width:40px;height:40px'/>
                        <div style='color:#A0A0A0;font-size:90%'>${format(msg.createDate)}</div></div>`;
                    if (msg.type == 0) {
                        html += `<div class='form-group triangle-left'></div>`;
                        html += `<div class='form-group bubble-left'>${replaceEmoji(msg.content)}</div>`;
                    } else if (msg.type == 1) {
                        html += `<div class='form-group triangle-left'></div>`;
                        html += `<div class='form-group bubble-left thumbnail' style='max-width:40%'><img src='${msg.content}'></div>`;
                    } else if (msg.type == 2) {
                        let href = msg.content.split('#file#')[0];
                        let fileName = msg.content.split('#file#')[1];
                        if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                            || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                            html += `<div class='form-group triangle-left'></div>`;
                            html += `<div class='form-group bubble-left thumbnail' style='max-width:40%'><img src='${href}'></div>`;
                        } else {
                            html += `<div class='form-group file-left'>
                                    <div class='form-inline'>
                                        <img class='form-group' style='width:35px;height:50px' src='/img/file.jpg'>
                                        <div class='form-group' style='max-width:86%'><a href='${href}' style='text-decoration:none'>${fileName}</a></div>
                                    </div>
                                </div>`;
                        }
                    }

                }
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
                scrollHeight += $(this).height() + 21;
            })
            if (scrollTop + windowHeight == scrollHeight) {  //滚动到底部执行事件
                that.socket.emit('queryLastContacts', { 'lastTime': $(this).children('li:last-child').attr('lastTime') },
                    (...args) => lastContacts(...args));
            }
        });
        //监听聊天窗口上拉事件
        $('#chat').scroll(function () {
            let scrollTop = $(this).scrollTop();//滚动条位置
            if (scrollTop == 0)  //滚动到头部执行事件  
                that.socket.emit('queryChat', { 'groupId': $('#selectedChat').attr('groupId'), 'createDate': $(this).children('li:first-child').attr('createDate') },
                    (...args) => lastChat(...args));
        });
        //发送消息
        // $('#sendBtn').click(function () {
        //     if ($.trim($('#message').val()) == "") {
        //         alert("发送内容不能为空");
        //     } else {
        //         //'ip':window.location.host,
        //         that.socket.emit('sendMsg', { 'groupId': $('#selectedChat').attr('groupId'), 'content': $('#message').val(), type: 0 },
        //             (...args) => showNewMsg(...args));
        //         $('#message').val('');
        //     }
        // })
        $('#message').keyup(function (event) {
            if (event.keyCode == 13 && $('#selectedChat').html() != undefined) {
                if ($.trim($('#message').html().replace(new RegExp('&nbsp;', 'g'), '')) != "") {
                    if ($('#message').html().length > 1024) {
                        alert(`您发送消息太长了，最大长度不能超过1024`);
                        return;
                    }
                    //发送表情前，将其替换为字符串
                    $('#message').children('.chatEmojiImg').each(function () {
                        $(this).replaceWith(`[${$(this).attr('src').split('/img/emoji/')[1].split('.png')[0]}]`);
                    });
                    that.socket.emit('sendMsg', { 'groupId': $('#selectedChat').attr('groupId'), 'content': $('#message').html(), type: 0 },
                        (...args) => showNewMsg(...args));
                    $('#message').html('');
                }
            }
        });
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
                if (isCallBack) {
                    html = `<li msgId='${msg.id}' createDate='${msg.createDate}' class='form-inline' style='margin-top:10px;text-align: right'>`;
                    if (msg.type == 0) {
                        html += `<div class='form-group bubble-right'>${replaceEmoji(msg.content)}</div>`;
                        html += `<div class='form-group triangle-right'></div>`;
                    } else if (msg.type == 1) {
                        html += `<div class='form-group bubble-right thumbnail' style='max-width:40%'><img src='${msg.content}'></div>`;
                        html += `<div class='form-group triangle-right'></div>`;
                    } else if (msg.type == 2) {
                        let href = msg.content.split('#file#')[0];
                        let fileName = msg.content.split('#file#')[1];
                        if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                            || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                            html += `<div class='form-group bubble-right thumbnail' style='max-width:40%'><img src='${href}'></div>`;
                            html += `<div class='form-group triangle-right'></div>`;
                        } else {
                            html += `<div class='form-group file-right'>
                                    <div class='form-inline'>
                                        <img class='form-group' style='width:35px;height:50px' src='/img/file.jpg'>
                                        <div class='form-group' style='max-width:86%'><a href='${href}' style='text-decoration:none'>${fileName}</a></div>
                                    </div>
                                </div>`;
                        }
                    }
                    html += `<div class='form-group'><img src='${msg.sender.img}' style='width:40px;height:40px'/>
                        <div style='color:#A0A0A0;font-size:90%'>${format(msg.createDate)}</div></div>`;
                } else {
                    html = `<li msgId='${msg.id}' createDate='${msg.createDate}' class='form-inline' style='margin-top:10px;'>`;
                    html += `<div class='form-group'><img src='${msg.sender.img}' style='width:40px;height:40px'/>
                        <div style='color:#A0A0A0;font-size:90%'>${format(msg.createDate)}</div></div>`;
                    if (msg.type == 0) {
                        html += `<div class='form-group triangle-left'></div>`;
                        html += `<div class='form-group bubble-left'>${replaceEmoji(msg.content)}</div>`;
                    } else if (msg.type == 1) {
                        html += `<div class='form-group triangle-left'></div>`;
                        html += `<div class='form-group bubble-left thumbnail' style='max-width:40%'><img src='${msg.content}'></div>`;
                    } else if (msg.type == 2) {
                        let href = msg.content.split('#file#')[0];
                        let fileName = msg.content.split('#file#')[1];
                        if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                            || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                            html += `<div class='form-group triangle-left'></div>`;
                            html += `<div class='form-group bubble-left thumbnail' style='max-width:40%'><img src='${href}'></div>`;
                        } else {
                            html += `<div class='form-group file-left'>
                                    <div class='form-inline'>
                                        <img class='form-group' style='width:35px;height:50px' src='/img/file.jpg'>
                                        <div class='form-group' style='max-width:86%'><a href='${href}' style='text-decoration:none'>${fileName}</a></div>
                                    </div>
                                </div>`;
                        }
                    }
                }
                html += "</li>";
                // if (isCallBack)
                //     html = `<li class='form-inline' createDate='${msg.createDate}' style='text-align: right'>`;
                // else
                //     html = `<li class='form-inline' createDate='${msg.createDate}'>`;
                // if (msg.type == 0)
                //     html += `<div class='form-group'>${msg.content}</div>`;
                // else if (msg.type == 1)
                //     html += `<div class='form-group'><img src='${msg.content}'></div>`;
                // else if (msg.type == 2)
                //     html += `<div class='form-group'>文件</div>`;
                // html += `<div class='form-group'><img src='${msg.sender.img}' style='width:40px;height:40px'/>
                // <div>${format(msg.createDate)}</div></div>`;

                $('#chat').append(html);//最新的消息显示在最下面

                if (isBottom) {
                    scrollHeight = 0;
                    $('#chat').children().each(function () {
                        scrollHeight += $(this).height();
                    })
                    $('#chat').scrollTop(scrollHeight);//滑动到最底端
                }
                $('#selectedChat').children().eq(1).children('.lastTime').html(format(msg.createDate));
                //msg.type == 0 ? $('#selectedChat').children('.lastContent').html(msg.content) : $('#selectedChat').children('.lastContent').html(`[图片]`)
                if (msg.type == 0)
                    $('#selectedChat').children().eq(1).children('.lastContent').html(replaceEmoji(msg.content, '20px'))
                else if (msg.type == 1)
                    $('#selectedChat').children().eq(1).children('.lastContent').html(`[图片]`)
                else if (msg.type == 2) {
                    let fileName = msg.content.split('#file#')[1];
                    if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                        || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                        $('#selectedChat').children().eq(1).children('.lastContent').html(`[图片]`)
                    } else {
                        $('#selectedChat').children().eq(1).children('.lastContent').html(`[文件]`)
                    }
                }
                //向客户端发送已读回执
                that.socket.emit('haveRead', { 'groupId': $('#selectedChat').attr('groupId'), 'noRead': 1 });
            } else {//如果用户没有停留在有新消息的窗口，此窗口应当显示未读的数量
                //没有停留在当前窗口又分为两种情况，一种是新的对话窗口，一种是新的消息
                let chatOrMsg = 'chat';
                $('#userList').children().each(function () {
                    if ($(this).attr('groupId') == msg.groupId) {//已有窗口的新消息
                        $(this).children().eq(1).children('.lastTime').html(format(msg.createDate));
                        //msg.type == 0 ? $(this).children('.lastContent').html(msg.content) : $(this).children('.lastContent').html(`[图片]`)
                        if (msg.type == 0)
                            $(this).children().eq(1).children('.lastContent').html(replaceEmoji(msg.content, '20px'))
                        else if (msg.type == 1)
                            $(this).children().eq(1).children('.lastContent').html(`[图片]`)
                        else if (msg.type == 2) {
                            let fileName = msg.content.split('#file#')[1];
                            if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                                || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                                $(this).children().eq(1).children('.lastContent').html(`[图片]`)
                            } else {
                                $(this).children().eq(1).children('.lastContent').html(`[文件]`)
                            }
                        }
                        $(this).children(':first').children('.noRead').html(msg.noRead);
                        chatOrMsg = 'msg';
                        return;
                    }
                })
                if (chatOrMsg == 'chat') {
                    let chatHtml = `<li class='group list-group-item' groupId='${msg.group.id}' lastTime='${msg.group.lastTime}' isPrivate='${msg.group.isPrivate}' style='padding:10px;border-radius:0;border:1px solid #D8D8D8;border-style:none none solid none;margin-bottom:0px;cursor:default'>`;
                    if (msg.group.isPrivate == true) {
                        chatHtml += `<div class='form-group' style='width:60px;height:60px'><img class='img' src='${msg.sender.img}' style='width:50px;height:50px;border-radius:2px'>`;
                        if (msg.noRead > 0 && msg.noRead <= 99)
                            chatHtml += `<span class='noRead badge' style='float:right;background-color:red'>${msg.noRead}</span>`;
                        else if (msg.noRead >= 100)
                            chatHtml += `<span class='noRead badge' style='float:right;background-color:red'>99+</span>`;
                        else
                            chatHtml += `<span class='noRead badge'></span>`;
                        chatHtml += `</div><div class='form-group' style='width:72%;height:60px'><div class='name form-group' receiverId='${msg.sender.id}' style='font-size:130%;width:75%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap'>${msg.sender.name}</div>
                            <div class='lastTime form-group' style='color:#989898'>${format(msg.createDate)}</div><br>`;
                        if (msg.type == 0) {
                            chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'> ${replaceEmoji(msg.content, '20px')}</div></div>`;
                        } else if (msg.type == 1)
                            chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                        else  if (msg.type == 2) {
                            let fileName = msg.content.split('#file#')[1];
                            if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                                || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                                    chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                            } else {
                                chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[文件]</div></div>`;
                            }
                        }else
                            chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'></div></div>`;
                        chatHtml += `<div class='status form-inline'><div class='form-group' style='width:8px;height:8px;background-color:#33CC33;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;margin-right:5px'></div>online</div>`;

                    } else {
                        chatHtml += `<div class='form-group' style='width:60px;height:60px'><img class='img' src='${msg.group.img}' style='width:50px;height:50px;border-radius:2px'>`;
                        if (msg.noRead > 0 && msg.noRead <= 99)
                            chatHtml += `<span class='noRead badge' style='float:right;background-color:red'>${msg.noRead}</span>`;
                        else if (msg.noRead >= 100)
                            chatHtml += `<span class='noRead badge' style='float:right;background-color:red'>99+</span>`;
                        else
                            chatHtml += `<span class='noRead badge'></span>`;
                        chatHtml += `</div><div class='form-group' style='width:72%;height:60px'><div class='name form-group' style='font-size:130%;width:50%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap'>${msg.group.name}</div>
                            <div class='lastTime form-group'>${format(msg.group.lastTime)}</div><br>`;
                        if (msg.type == 0) {
                            chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'> ${replaceEmoji(msg.group.lastContent, '20px')}</div></div>`;
                        } else if (msg.type == 1)
                            chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                        else  if (msg.type == 2) {
                            let fileName = msg.content.split('#file#')[1];
                            if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                                || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
                                    chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[图片]</div></div>`;
                            } else {
                                chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'>[文件]</div></div>`;
                            }
                        }else
                            chatHtml += `<div class='lastContent' style='width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#989898'></div></div>`;

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
        //替换表情字符串为表情
        function replaceEmoji(content, px) {
            $('#emojiPackage').children().each(function () {
                let emoji = $(this).attr('src').split('/img/emoji/')[1].split('.png')[0];
                if (px)
                    content = content.replace(new RegExp(`\\[${emoji}\\]`, 'g'), `<img src=\'/img/emoji/${emoji}.png\' style='width:${px}'>`);
                else
                    content = content.replace(new RegExp(`\\[${emoji}\\]`, 'g'), `<img src=\'/img/emoji/${emoji}.png\'>`);
            })
            return content;
        }
        //点击图片按钮，选择图片后进行发送
        $('#sendImg').click(function () {
            $('#img').click();
        })
        $('#img').on('change', function () {
            if ($('#img').val() != '') {
                let fileName = $('#img').get(0).files[0].name;
                if (endWith(fileName, '.jpg') || endWith(fileName, '.jpeg') || endWith(fileName, '.png')
                    || endWith(fileName, '.bmp') || endWith(fileName, '.gif')) {
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
                } else {
                    $('#img').replaceWith($('#img').val('').clone(true));
                    alert(`仅支持图片`);
                }
            }
        })
        //点击文件按钮，选择文件后进行发送
        $('#sendFile').click(function () {
            $('#file').click();
        })
        $('#file').on('change', function () {
            if ($('#file').val() != '') {
                let formData = new FormData();
                formData.append("files", $('#file').get(0).files[0]);
                $.ajax({
                    url: "upload",
                    type: "POST",
                    data: formData,
                    contentType: false,//必须false才会自动加上正确的Content-Type
                    processData: false,//必须false才会避开jQuery对 formdata 的默认处理，XMLHttpRequest会对 formdata 进行正确的处理
                    success: function (data) {
                        //上传到七牛后，将链接发给socket
                        that.socket.emit('sendMsg', { 'groupId': $('#selectedChat').attr('groupId'), 'content': `${data.result}#file#${$('#file').get(0).files[0].name}`, type: 2 }, (...args) => showNewMsg(...args));
                        $('#file').replaceWith($('#file').val('').clone(true));
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
                    if ($(this).children().eq(1).children(':first').attr('receiverId') == sender.id) {
                        let html = '';
                        if (sender.status == 'online')
                            html += `<div class='status form-inline'><div class='form-group' style='width:10px;height:10px;background-color:#33CC33;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;margin-right:5px'></div>${sender.status}</div>`;
                        else
                            html += `<div class='status form-inline'><div class='form-group' style='width:10px;height:10px;background-color:#A0A0A0;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;margin-right:5px'></div>${sender.status}</div>`;
                        $(this).children('.status').html(html);
                        return;
                    }
                }
            })
        })
        $(window).on("unload", function () {
            that.socket.emit('offline');
        });
        function endWith(str, end) {
            if (end == null || end == "" || str.length == 0 || end.length > str.length) {
                return false;
            }
            if (str.substring(str.length - end.length) == end) {
                let i = str.substring(str.length - end.length);
                return true;
            } else {
                return false;
            }
        };
        //绑定表情
        $('#emoji').popover({
            html: true,
            placement: 'top',
            title: null,
            content: $('#emojiWrapper').html()
        });
        $('#emoji').blur(function () {
            $('#emoji').click();
        })
        //点击表情时将其放入输入框
        $(document).on("click", '.emojiImg', function () {
            $('#message').append($(this));
            $('#message').children().each(function () {
                if ($(this).hasClass('emojiImg')) {
                    $(this).removeClass('emojiImg');
                    $(this).addClass('chatEmojiImg');
                    $(this).css('cursor', 'default');
                }
            })
        })

    },
};