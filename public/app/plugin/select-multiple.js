"use strict";

import $ from 'jquery'

export function SelectMultiple(t,data){
    var $this = this.$this = $(t),
        $ul = $('<ul class="list-inline">');
    this.$ul = $ul;
    $this.before($ul);

    var type = this.type = $this.data('type');
    this.name = $this.data('name');
    var value = this.value = $this.data('value');

    if (type) {
        var dataArray = data[type];
        this.dataArray = dataArray;
        this.initOption();
    }

    this.init_on_change();

    if (value){
        var valueArray = (value + '').split(',');
        $this.val(valueArray);
        this.setValue(value);
    }

    $this.data('this',this)
}

SelectMultiple.prototype = {
    reset: function(){
        this.$ul.empty();
        this.$this.empty();
        this.initOption();
    },
    setValue: function(value) {
        this.reset();
        var valueArray = (value + '').split(',');
        for(var index in valueArray){
            var item = valueArray[index],
                $option = $(`option[value="${item}"]`, this.$this);
            this.init_li(item, $option);
        }
    },
    initOption: function() {
        for (var index in this.dataArray) {
            var item = this.dataArray[index],
                $option = $(`<option value="${item.id}">${item.title}</option>`);
            this.$this.append($option);
        }
    },
    resetInputIndex : function() {
        var $inputs = $(`.js_select_multiple_input_${this.name}`);
        $inputs.each(function(index){
            var $this = $(this),
                name = $this.attr('name');
            var start = name.indexOf('[') + 1;
            var end = name.indexOf(']');
            var beginName = name.substring(0,start);
            var lastName = name.substring(end);
            var newName = beginName + index + lastName;
            $this.attr('name',newName);
        });
    },
    init_li : function(val,$option) {
        var text = $option.text(),
            $input = $(`<input class="js_select_multiple_input_${this.name}" type="hidden" name="${this.name}[0]" value="${val}">`),
            $label = $(`<span class="label label-primary">${text} &times;</span>`),
            $li = $('<li>');
        $li.append($input).append($label);
        $li.hide();
        this.$this.prev().append($li);
        $li.fadeIn("slow");
        $li.data('name',this.name).data('value',val).data('text',text);
        this.resetInputIndex();
        $option.remove();

        $li.on('click',function(){
            var $thisLi = $(this),
                liValue = $thisLi.data('value'),
                liText = $thisLi.data('text'),
                $thisOption = $(`<option value="${liValue}">${liText}</option>`),
                $ul = $thisLi.closest('ul'),
                $select = $ul.next();


            $li.fadeOut("slow",function(){
                $thisLi.remove();
                $select.data('this').resetInputIndex();
                $select.append($thisOption);
            });
        });
    },
    init_on_change : function(){
        this.$this.on('change', function(){
            var $thisSelect = $(this),
                val = $thisSelect.val(),
                $option = $(`option[value="${val}"]`, $thisSelect);

            $thisSelect.data('this').init_li(val,$option);
        })
    }
}

