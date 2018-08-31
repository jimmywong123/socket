'use strict'

import {initUi} from './ui/ui';
import {hichatfunction} from './socket/hichat';

import 'bootstrap';



import 'github:twbs/bootstrap@3.3.7/css/bootstrap.css!';
import '../css/style.css!';

$(function(){
    hichatfunction();
    initUi();
});

