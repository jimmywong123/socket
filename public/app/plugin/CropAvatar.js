'use strict';
import bootstrap from 'bootstrap'
import cropper from 'cropper'
import 'npm:cropper@2.3.4/dist/cropper.css!'

class CropAvatar {
    constructor($element) {
        this.$container = $element;
        var value = $element.data('value');
        this.imgUrl = value;
        var name = $element.data('name') || '';
        this.inputName = name;

        this.$input = $(`<input type="hidden" name="${name}" value="${value}">`);
        this.$container.append(this.$input);

        this.$avatarView = $('<div class="avatar-view" title="Change the avatar">');
        this.$avatar = $(`<img src="${this.imgUrl}" alt="Avatar">`);

        this.$avatarView.append(this.$avatar).appendTo(this.$container);

        this.$avatarModal = $(`<div class="modal fade" id="avatar-modal-${name}" aria-hidden="true" aria-labelledby="avatar-modal-label-${name}" role="dialog" tabindex="-1">`);

        var $modalDialog = $('<div class="modal-dialog modal-lg">');
        var $modalContent = $('<div class="modal-content">');

        this.$avatarModal.append($modalDialog).appendTo($('body'));
        $modalDialog.append($modalContent);

        this.$loading = $('<div class="loading" aria-label="Loading" role="img" tabindex="-1"></div>');

        this.$loading.appendTo(this.$container);

        this.$avatarForm = $(`<form class="avatar-form" action="/upload" enctype="multipart/form-data" method="post">`);

        var $modalHeader = $(`<div class="modal-header">
              <button class="close" data-dismiss="modal" type="button">&times;</button>
              <h4 class="modal-title" id="avatar-modal-label-${name}">Change Avatar</h4>
            </div>`);
        var $modalBody = $('<div class="modal-body">');
        var $avatarBody = $('<div class="avatar-body">');

        this.$avatarForm.append($modalHeader).appendTo($modalContent);
        $modalBody.append($avatarBody).appendTo(this.$avatarForm);

        this.$avatarUpload = $('<div class="avatar-upload">');
        this.$avatarSrc = $('<input class="avatar-src" name="avatar_src" type="hidden">');
        this.$avatarData = $('<input class="avatar-data" name="avatar_data" type="hidden">');
        this.$avatarInput = $(`<input class="avatar-input" id="avatarInput-${name}" name="avatar_file" type="file">`);

        var $label = $('<label for="avatarInput">Local upload</label>');

        this.$avatarUpload.append(this.$avatarSrc);
        this.$avatarUpload.append(this.$avatarData);
        this.$avatarUpload.append($label);
        this.$avatarUpload.append(this.$avatarInput).appendTo($avatarBody);

        var $preview = $(`<div class="row">
                  <div class="col-md-9">
                    <div class="avatar-wrapper"></div>
                  </div>
                  <div class="col-md-3">
                    <div class="avatar-preview preview-lg"></div>
                    <div class="avatar-preview preview-md"></div>
                    <div class="avatar-preview preview-sm"></div>
                  </div>
                </div>`);

        $avatarBody.append($preview);

        this.$avatarWrapper = this.$avatarModal.find('.avatar-wrapper');
        this.$avatarPreview = this.$avatarModal.find('.avatar-preview');

        var $btns = $(`<div class="row avatar-btns">
                  <div class="col-md-9">
                    <div class="btn-group">
                      <button class="btn btn-primary" data-method="rotate" data-option="-90" type="button" title="Rotate -90 degrees">Rotate Left</button>
                      <button class="btn btn-primary" data-method="rotate" data-option="-15" type="button">-15deg</button>
                      <button class="btn btn-primary" data-method="rotate" data-option="-30" type="button">-30deg</button>
                      <button class="btn btn-primary" data-method="rotate" data-option="-45" type="button">-45deg</button>
                    </div>
                    <div class="btn-group">
                      <button class="btn btn-primary" data-method="rotate" data-option="90" type="button" title="Rotate 90 degrees">Rotate Right</button>
                      <button class="btn btn-primary" data-method="rotate" data-option="15" type="button">15deg</button>
                      <button class="btn btn-primary" data-method="rotate" data-option="30" type="button">30deg</button>
                      <button class="btn btn-primary" data-method="rotate" data-option="45" type="button">45deg</button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-primary btn-block avatar-save" type="submit">Done</button>
                  </div>
                </div>`);

        $avatarBody.append($btns);

        this.$avatarSave = this.$avatarForm.find('.avatar-save');
        this.$avatarBtns = this.$avatarForm.find('.avatar-btns');

        this.support = {
            fileList: !!$('<input type="file">').prop('files'),
            blobURLs: !!window.URL && URL.createObjectURL,
            formData: !!window.FormData
        };

        this.init();
        //console.log(this);
    }



    init () {
        //console.log(`init`);
        this.support.datauri = this.support.fileList && this.support.blobURLs;

        if (!this.support.formData) {
            this.initIframe();
        }

        this.initTooltip();
        this.initModal();
        this.addListener();
    }

    addListener() {
        //console.log(`addListener`,this.$avatarView,this.$avatarInput,this.$avatarForm,this.$avatarBtns);
        this.$avatarView.on('click', $.proxy(this.click, this));
        this.$avatarInput.on('change', $.proxy(this.change, this));
        this.$avatarForm.on('submit', $.proxy(this.submit, this));
        this.$avatarBtns.on('click', $.proxy(this.rotate, this));
    }

    initTooltip() {
        //console.log(`initTooltip`,this.$avatarView);
        this.$avatarView.tooltip({
            placement: 'bottom'
        });
    }

    initModal() {
        //console.log(`initModal`,this.$avatarModal);
        this.$avatarModal.modal({
            show: false
        });
    }

    initPreview() {
        //console.log(`initPreview`,this.$avatar,this.$avatarPreview);
        var url = this.$avatar.attr('src');

        this.$avatarPreview.empty().html('<img src="' + url + '">');
    }

    initIframe() {
        //console.log(`initIframe`,this.$avatarForm);
        var target = 'upload-iframe-' + (new Date()).getTime(),
            $iframe = $('<iframe>').attr({
                name: target,
                src: ''
            }),
            _this = this;

        // Ready ifrmae
        $iframe.one('load', function () {

            // respond response
            $iframe.on('load', function () {
                var data;

                try {
                    data = $(this).contents().find('body').text();
                } catch (e) {
                    //console.log(e.message);
                }

                if (data) {
                    try {
                        data = $.parseJSON(data);
                    } catch (e) {
                        //console.log(e.message);
                    }

                    _this.submitDone(data);
                } else {
                    _this.submitFail('Image upload failed!');
                }

                _this.submitEnd();

            });
        });

        this.$iframe = $iframe;
        this.$avatarForm.attr('target', target).after($iframe.hide());
    }

    click() {
        //console.log(`click`,this.$avatarModal);
        this.$avatarModal.modal('show');
        this.initPreview();
    }

    change() {
        //console.log(`change`,this.$avatarInput);
        var files,
            file;

        if (this.support.datauri) {
            files = this.$avatarInput.prop('files');

            if (files.length > 0) {
                file = files[0];

                if (this.isImageFile(file)) {
                    if (this.url) {
                        URL.revokeObjectURL(this.url); // Revoke the old one
                    }

                    this.url = URL.createObjectURL(file);
                    this.startCropper();
                }
            }
        } else {
            file = this.$avatarInput.val();

            if (this.isImageFile(file)) {
                this.syncUpload();
            }
        }
    }

    submit() {
        //console.log(`submit`,this.$avatarSrc,this.$avatarInput);
        if (!this.$avatarSrc.val() && !this.$avatarInput.val()) {
            return false;
        }

        if (this.support.formData) {
            this.ajaxUpload();
            return false;
        }
    }

    rotate(e) {
        //console.log(`rotate`,e.target,this.active,this.$img);
        var data;

        if (this.active) {
            data = $(e.target).data();

            if (data.method) {
                this.$img.cropper(data.method, data.option);
            }
        }
    }

    isImageFile(file) {
        //console.log(`isImageFile`,file,file.type);
        if (file.type) {
            return /^image\/\w+$/.test(file.type);
        } else {
            return /\.(jpg|jpeg|png|gif)$/.test(file);
        }
    }

    startCropper() {
        //console.log(`startCropper`,this.url,this.active,this.$img,this.$avatarPreview,this.$avatarWrapper);
        var _this = this;

        if (this.active) {
            this.$img.cropper('replace', this.url);
        } else {
            this.$img = $('<img src="' + this.url + '">');
            this.$avatarWrapper.empty().html(this.$img);
            this.$img.cropper({
                aspectRatio: 1,
                preview: '.avatar-preview',
                strict: false,
                crop: function (data) {
                    var json = [
                        '{"x":' + data.x,
                        '"y":' + data.y,
                        '"height":' + data.height,
                        '"width":' + data.width,
                        '"rotate":' + data.rotate + '}'
                    ].join();

                    _this.$avatarData.val(json);
                }
            });

            this.active = true;
        }
    }

    stopCropper() {
        //console.log(`stopCropper`,this.active,this.$img);
        if (this.active) {
            this.$img.cropper('destroy');
            this.$img.remove();
            this.active = false;
        }
    }

    ajaxUpload() {
        //console.log(`ajaxUpload`,this.$avatarForm);
        var url = this.$avatarForm.attr('action'),
            data = new FormData(this.$avatarForm[0]),
            _this = this;

        $.ajax(url, {
            type: 'post',
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false,

            beforeSend: function () {
                _this.submitStart();
            },

            success: function (data) {
                _this.submitDone(data);
            },

            error: function (XMLHttpRequest, textStatus, errorThrown) {
                _this.submitFail(textStatus || errorThrown);
            },

            complete: function () {
                _this.submitEnd();
            }
        });
    }

    syncUpload() {
        //console.log(`syncUpload`,this.$avatarSave);
        this.$avatarSave.click();
    }

    submitStart() {
        //console.log(`submitStart`,this.$loading);
        this.$loading.fadeIn();
    }

    submitDone(data) {
        //console.log(`submitDone`,data);

        if ($.isPlainObject(data) && data.state === 200) {
            if (data.result) {
                this.url = data.result;

                if (this.support.datauri || this.uploaded) {
                    this.uploaded = false;
                    this.cropDone();
                } else {
                    this.uploaded = true;
                    this.$avatarSrc.val(this.url);
                    this.startCropper();
                }

                this.$avatarInput.val('');
            } else if (data.message) {
                this.alert(data.message);
            }
        } else {
            this.alert('Failed to response');
        }
    }

    submitFail(msg) {
        //console.log(`submitFail`,msg);
        this.alert(msg);
    }

    submitEnd() {
        //console.log(`submitEnd`,this.$loading);
        this.$loading.fadeOut();
    }

    cropDone() {
        //console.log(`cropDone`,this.$avatarForm,this.$avatar,this.$avatarModal);
        this.$avatarForm.get(0).reset();
        this.$avatar.attr('src', this.url);
        this.$input.val(this.url);
        this.stopCropper();
        this.$avatarModal.modal('hide');
    }

    alert(msg) {
        //console.log(`alert`,msg,this.$avatarUpload);
        var $alert = [
            '<div class="alert alert-danger avater-alert">',
            '<button type="button" class="close" data-dismiss="alert">&times;</button>',
            msg,
            '</div>'
        ].join('');

        this.$avatarUpload.after($alert);
    }
}

export default CropAvatar