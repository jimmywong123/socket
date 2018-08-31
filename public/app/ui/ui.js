"use strict"

import 'bootstrap'

import {form2obj} from '../util/form2obj'
import CropAvatar from '../plugin/CropAvatar'

export function initUi() {

    if ($('.js_upload_img').length > 0) {
        $('.js_upload_img').each(function() {
            new CropAvatar($(this))
        })
    }

    if ($('#editErrorModal').length > 0) {
        $('#editErrorModal').modal('show')
    }

    if ($('.js_select').length > 0
        || $('.js_select_multiple').length > 0){
        $.getJSON( apiHostPath + '/api/settings/all/json' ,function(json) {

            if ( json.status.code === 0){
                var data = json.data
                $('.js_select').each(function(){
                    var select = new Select(this,data)
                })
                $('.js_select_multiple').each(function(){
                    var selectMultiple = new SelectMultiple(this,data)
                })
            }
        })
    }

    if ($('.js_del_btn').length > 0){
        $('.js_del_btn').on('click',function() {
            var $this = $(this),
                url = $this.data('url')

            if (!window.confirm("Confirm to delete?")) {
                return window.event.returnValue = false
            }

            console.log(url)

            $.ajax({
                    type: "DELETE",
                    url: url
                })
                .done( function (res) {
                    if (res.status.code == 0) {
                        // alert( "Data delete: success " + res.status.msg )
                        window.location.href= location.href
                    } else {
                        alert( "Data delete fail: " + res.status.msg )
                    }
                })
        })
    }

    if ($('.js_edit_btn').length > 0){
        $('.js_edit_btn').on('click', function() {
            var $this = $(this),
                url = $this.data('url')

            console.log(url)
            if (url){
                if (!confirm("Confirm to submit?")) {
                    return window.event.returnValue = false
                }

                var form = document.querySelector('form')
                var data = form2obj(form)
                console.log(data)

                // return false
                $.ajax({
                        type: "PATCH",
                        url: url,
                        data : data
                    })
                    .done( function( res ) {
                        if (res.status.code == 0){
                            // alert( "Data delete: success " + res.status.msg )
                            window.location.href= res.data.redirect
                        } else {
                            alert( "Data submit fail: " + res.status.msg )
                        }
                    })

                return false
            } else {
                return true
            }
        })
    }

}

