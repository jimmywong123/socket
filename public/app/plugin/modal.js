"use strict";

import 'bootstrap'

export function Modal({id = 'newModal', title, content, footer}) {
    this.id = id

    this.$template = $(`<div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="${id}Label">
          <div class="modal-dialog" role="document"></div></div>`)
    this.$content = $(`<div class="modal-content"></div>`)
    this.$title = $(`<div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="${id}Label">Modal title</h4>
              </div>`)
    this.$body = $(`<div class="modal-body"></div>`)
    this.$footer = $(`<div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>

              </div>`)
    $('body').append(this.$template)
    $('.modal-dialog',this.$template).append(this.$content)

    if (title) {
        this.setTitle(title)
    }

    if (content) {
        this.setContent(content)
    }

    if (footer) {
        this.setFooter(footer)
    }
    $(`#${id}`).modal()
}

Modal.prototype = {
    setTitle : function(title){
        $('.modal-title',this.$title).text(title)

        if (this.$content.find('.modal-header').length === 0) {
            this.$content.append(this.$title)
        }
    },
    setContent : function(content){
        this.$body.text(content)

        if (this.$content.find('.modal-body').length === 0) {
            this.$content.append(this.$body)
        }
    },
    setFooter : function(footer){
        if (footer && footer.btns) {
            var $btn = $(`<button type="button" class="btn">Save changes</button>`)
            var btn = footer.btns[0]
            var className = `btn-primary`
            if (btn) {
                if (btn.text) {
                    $btn.text(btn.text)
                }
                if (btn.className) {
                    className = btn.className
                }
                if (btn.onClickFun) {
                    $btn.on('click',btn.onClickFun)
                }
                $btn.addClass(className)

                $('.modal-footer',this.$footer).append($btn)
            }
            this.$content.append(this.$footer)
        }
    },
    show : function(){
        $(`#${this.id}`).modal('show')
    },
    hide : function(){
        $(`#${this.id}`).modal('hide')
    }
}