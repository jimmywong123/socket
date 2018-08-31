

"use strict";

import $ from 'jquery'

export function Select(t,data) {
    var $this = $(t),
        type = $this.data('type'),
        value = $this.data('value'),
        $baseOption = $(`<option value="0">Please Select</option>`);

    $this.append($baseOption);

    var dataArray = data[type];
    for (var index in dataArray) {

        var item = dataArray[index],
            selected = value === item.id ? 'selected' : '',
            $option = $(`<option value="${item.id}" ${selected}>${item.title}</option>`);

        $this.append($option);
    }
}