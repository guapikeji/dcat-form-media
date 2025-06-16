/**
 * LakeFormMedia-field.js v1.0.18
 *
 * @create 2020-11-28
 * @author deatil
 */
$(function () {
    var LakeFormMedia = {
        init: function() {
            var thiz = this;

            // 刷新预览
            this.onEvent('change', '.lake-form-media-input', function() {
                thiz.refreshInputPreview(this);
            });

            // 拖拽排序
            this.onEvent('mouseenter', '.js-dragsort', function() {
                var showRowCont = $(this).parents(".lake-form-media-img-show-row");
                if (showRowCont.hasClass('bind-dragsort')) {
                    return ;
                }

                var mediaCont = $(this).parents('.lake-form-media');
                var name = mediaCont.data('name');

                showRowCont.dragsort({
                    itemSelector: 'div.lake-form-media-preview-item',
                    dragSelector: ".js-dragsort",
                    dragEnd: function () {
                        thiz.refreshInputString(name);
                    },
                    placeHolderTemplate: $('<div class="lake-form-media-preview-item" />'),
                    scrollSpeed: 15
                });
                showRowCont.addClass('bind-dragsort')
            });

            // 删除
            this.onEvent("click", ".lake-form-media-img-show-item-delete", function(){
                var $this = $(this);

                var mediaCont = $this.parents('.lake-form-media');
                var name = mediaCont.data('name');

                var mediaShowCont = mediaCont.find('.lake-form-media-img-show');

                var options = mediaCont.data('options');

                var limit = options.limit;

                // 可多选时
                var multiplechoice = options.multiplechoice

                var itemurl = $this.data('url');

                layer.confirm(thiz.lang("remove_tip", {
                    data: itemurl,
                }), {
                    icon: 3,
                    title: thiz.lang("system_tip"),
                }, function(index) {

                    // 不是多选时
                    if (multiplechoice != 1 && limit > 1) {
                        var itemIndex = mediaCont
                            .find('.lake-form-media-preview-item')
                            .index($this.parents('.lake-form-media-preview-item'));

                        mediaCont.find('.lake-form-media-preview-item').eq(itemIndex).remove();
                    } else {
                        mediaCont.find('.lake-form-media-preview-item[data-src="' + itemurl + '"]').remove();
                    }

                    thiz.refreshInputString(name);

                    if (mediaShowCont.find('.lake-form-media-preview-item').length < 1) {
                        mediaShowCont.hide();
                    }

                    // 关闭提示框
                    layer.close(index);
                });

                return 1;
            });

            // 弹出选择器
            this.onEvent('click', '.lake-form-media-btn-file', function (event) {
                event.preventDefault();
                event.stopPropagation();

                var modal = $(this);
                var modalId = modal.data("target");

                $("#" + modalId).remove();
                $("#" + modalId + "Body")
                    .clone(true, true)
                    .find(".modal")
                    .attr("id", modalId)
                    .appendTo('body');

                $("#" + modalId).modal({
                    show: true,
                    backdrop: 'static',
                    keyboard: false
                });

                var title = modal.data('title');

                var mediaCont = $(this).parents('.lake-form-media');
                var name = mediaCont.data('name');

                var options = mediaCont.data('options');
                options = $.extend({}, options);

                var keywords = options.keywords;
                var path = options.path;
                var uploadUrl = options.upload_url;
                var createFolderUrl = options.create_folder_url;

                var mediaModalCont = $("#" + modalId);
                var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
                mediaModalPageCont.data('current-page', 1);

                var mediaModalDirInput = mediaModalCont.find(".lake-form-media-dir-input");
                mediaModalDirInput.val(keywords);

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                mediaModalNavOlCont.data('current-path', path);

                if (uploadUrl.length <= 0) {
                    mediaModalCont.find('.lake-form-media-upload-label').addClass('hidden');
                }
                if (createFolderUrl.length <= 0) {
                    mediaModalCont.find('.lake-form-media-create-folder-label').addClass('hidden');
                }

                mediaModalCont.find('.modal-title').text(thiz.lang("select_type", {
                    "title": title,
                }));

                thiz.getdata(name, path, options);
            });

            // 关闭弹出的选择器
            this.onEvent('click', '.lake-form-media-close', function (event) {
                var modalId = $(this).data("modal");
                $("#" + modalId).modal("hide");
            });

            // 点击排序切换
            this.onEvent('click', ".lake-form-media-modal-order", function() {
                var order = $(this).data('order');

                if (order == 'name') {
                    $(this).data('order', 'time');

                    $(this).find('.fa')
                        .removeClass('fa-sort-alpha-asc')
                        .addClass('fa-calendar-times-o');
                } else {
                    $(this).data('order', 'name');

                    $(this).find('.fa')
                        .removeClass('fa-calendar-times-o')
                        .addClass('fa-sort-alpha-asc');
                }

                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                var name = mediaCont.data('name');
                var path = mediaModalNavOlCont.data('current-path');
                var options = mediaCont.data('options');

                thiz.getdata(name, path, options)
            });

            // 双击复制文件名
            this.onEvent("dblclick", '.lake-form-media-row-col .row-title', function() {
                var data = $(this).text();

                thiz.copyData(data);

                return false;
            });

            // 点击文件夹
            this.onEvent('click', ".lake-form-media-dir-op", function() {
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');
                var path = $(this).data('path');

                var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
                mediaModalPageCont.data('current-page', 1);

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                mediaModalNavOlCont.data('current-path', path);

                var options = mediaCont.data('options');

                thiz.getdata(name, path, options)
            });

            // 点击 nav
            this.onEvent("click", ".lake-form-media-nav-li", function(){
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');
                var path = $(this).data('path');

                var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
                mediaModalPageCont.data('current-page', 1);

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                mediaModalNavOlCont.data('current-path', path);

                var options = mediaCont.data('options');

                thiz.getdata(name, path, options)
            });

            // 分页 - 上一页
            this.onEvent("click", '.lake-form-media-modal-prev-page', function() {
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');

                var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
                var currentPage = mediaModalPageCont.data('current-page');

                currentPage = parseInt(currentPage);
                if (currentPage > 1) {
                    currentPage -= 1;
                    mediaModalPageCont.data('current-page', currentPage);
                } else {
                    mediaModalPageCont.data('current-page', 1);
                }

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                var path = mediaModalNavOlCont.data('current-path');

                var options = mediaCont.data('options');

                thiz.getdata(name, path, options)
            });

            // 分页 - 下一页
            this.onEvent("click", '.lake-form-media-modal-next-page', function() {
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');

                var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
                var currentPage = mediaModalPageCont.data('current-page');
                var totalPage = mediaModalPageCont.data('total-page');

                currentPage = parseInt(currentPage);
                totalPage = parseInt(totalPage);
                if (currentPage < totalPage) {
                    currentPage += 1;
                    mediaModalPageCont.data('current-page', currentPage);
                } else {
                    mediaModalPageCont.data('current-page', totalPage);
                }

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                var path = mediaModalNavOlCont.data('current-path');

                var options = mediaCont.data('options');

                thiz.getdata(name, path, options)
            });

            // 页码提示
            this.onEvent('mouseover', '.lake-form-media-modal-prev-page,.lake-form-media-modal-next-page', function () {
                var pageCont = $(this).parents('.lake-form-media-modal-page');

                var currentPage = pageCont.data('current-page');
                var totalPage = pageCont.data('total-page');
                var pageSize = pageCont.data('page-size');
                var title = thiz.lang("page_render", {
                    page: currentPage,
                    total: totalPage,
                    perpage: pageSize,
                });
                var idx = layer.tips(title, this, {
                    tips: [1, '#586cb1'],
                    time: 0,
                    maxWidth: 210,
                });

                $(this).attr('layer-idx', idx);
            });
            this.onEvent('mouseleave', '.lake-form-media-modal-prev-page,.lake-form-media-modal-next-page', function () {
                layer.close($(this).attr('layer-idx'));

                $(this).attr('layer-idx', '');
            });

            // 新建文件夹 - 改为搜索提交
            this.onEvent('click', ".lake-form-media-dir-button", function(res){
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');

                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
                var currentPath = mediaModalNavOlCont.data('current-path');

                var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
                mediaModalPageCont.data('current-page', 1);


                var options = mediaCont.data('options');

                var path = options.path;

                var obj = mediaModalCont.find(".lake-form-media-dir-input");
                var dir = obj.val();

                var keywords = obj.val();
                options.keywords = keywords;

                thiz.getdata(name, path, options)


                // if (dir == "") {
                //     toastr.error(thiz.lang("dir_not_empty"));
                //     return false;
                // }
                //
                // var form = new FormData();
                // form.append("name", dir);
                // form.append("dir", currentPath);
                // form.append("disk", options.disk);
                // form.append("_token", Dcat.token);
                // $.ajax({
                //     type: 'post',
                //     url: options.create_folder_url,
                //     data: form,
                //     processData: false,
                //     contentType : false,
                //     success: function(data){
                //         if (data['code'] == 200) {
                //             toastr.success(data['msg']);
                //             obj.val('');
                //             thiz.getdata(name, currentPath, options)
                //         } else {
                //             toastr.error(data['msg']);
                //         }
                //     },
                //     error: function(XmlHttpRequest, textStatus, errorThrown){
                //         toastr.error(thiz.lang("create_dir_error"));
                //     }
                // });
            });

            // 上传图片
            this.onEvent('change', '.lake-form-media-upload', function() {
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');
                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');

                // var currentPath = mediaModalNavOlCont.data('current-path');
                var options = mediaCont.data('options');
                var currentPath = options.path;

                var files = $(this).prop('files');

                var form = new FormData();
                for (var i = 0; i < files.length; i++) {
                    form.append("files[]", files[i]);
                }

                form.append("path", currentPath);
                form.append("type", options.type);
                form.append("disk", options.disk);
                form.append("nametype", options.nametype);
                form.append("resize", options.resize);
                form.append("_token", Dcat.token);
                $.ajax({
                    type: 'post',
                    url: options.upload_url,
                    data: form,
                    processData: false,
                    contentType : false,
                    success: function(data){
                        if (data['code'] == 200) {
                            toastr.success(data['msg']);
                            thiz.getdata(name, currentPath, options)
                        } else {
                            toastr.error(data['msg']);
                        }
                    },
                    error: function(XmlHttpRequest, textStatus, errorThrown){
                        toastr.error(thiz.lang("upload_error"));
                    }
                });
            });

            // 提交
            this.onEvent('click', '.lake-form-media-submit', function(res){
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var name = mediaCont.data('name');
                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');

                var currentPath = mediaModalNavOlCont.data('current-path');
                var options = mediaCont.data('options');

                var inputCont = mediaCont.find('.lake-form-media-input');

                var limit = options.limit;
                var type = options.type

                var rootpath = options.rootpath
                var saveFullUrl = options.saveFullUrl
                var storeAsId = options.storeAsId;

                // 可多选时
                var multiplechoice = options.multiplechoice

                // 列表
                var urlList = [];
                var urlListStr = inputCont.val();
                if (urlListStr == '[]') {
                    urlListStr = '';
                }

                if (urlListStr) {
                    if (limit == 1) {
                        // 去掉预览
                        thiz.refreshPreview(name, [], options)
                    } else {
                        urlList = thiz.isJSON(urlListStr);
                    }
                }

                // 不是多选时
                if (multiplechoice != 1 && limit > 1) {
                    $('.lake-form-media-close').trigger("click");
                    return false;
                }

                // 选择的文件列表
                var selectedFiles = [];
                
                if (type == 'blend') {
                    select_true_list = mediaModalCont
                        .find('.lake-form-media-selected');
                } else {
                    select_true_list = mediaModalCont
                        .find('.lake-form-media-selected[data-type="'+type+'"]');
                }

                for (var i = 0; i < select_true_list.length; i++) {
                    var item = $(select_true_list[i]);
                    selectedFiles.push({
                        id: item.data('id'),
                        content: item.data('url')
                    });
                }
                
                // 使用selectFiles方法统一处理选择的文件
                thiz.selectFiles(name, selectedFiles);
                
                // 关闭模态框
                $('#LakeFormMediaModel'+name).modal('hide');
            });

            // 选中点击
            this.onEvent("click", ".lake-form-media-field-item-op", function(){
                var mediaModalCont = $(this).parents('.lake-form-media-modal');
                var mediaId = mediaModalCont.data('media');
                var mediaCont = $("." + mediaId);

                var itemType = $(this).data('type');

                var name = mediaCont.data('name');
                var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');

                var currentPath = mediaModalNavOlCont.data('current-path');
                var options = mediaCont.data('options');

                var inputCont = mediaCont.find('.lake-form-media-input');

                var type = options.type;
                var limit = options.limit;
                var storeAsId = options.storeAsId;

                // 可多选时
                var multiplechoice = options.multiplechoice

                if (type != 'blend') {
                    if (type != itemType) {
                        return false;
                    }
                }

                // 现有多少张
                var nowNumVal = inputCont.val();
                if (nowNumVal == '[]') {
                    nowNumVal = '';
                }
                
                var nowNumArr = [];
                if (nowNumVal) {
                    if (limit == 1) {
                        nowNumArr.push(nowNumVal)
                    } else {
                        nowNumArr = thiz.isJSON(nowNumVal);
                    }
                }

                // 不是多选时
                if (multiplechoice != 1 && limit > 1) {
                    // 添加当前选中
                    var selectedItem = {
                        id: $(this).data('id'),
                        content: $(this).data('url')
                    };
                    
                    // 使用selectFiles方法统一处理选择的文件
                    thiz.selectFiles(name, [selectedItem]);
                    
                    // 关闭模态框
                    $('#LakeFormMediaModel'+name).modal('hide');

                    return false;
                }

                var noNeedSelectArr = [];
                if (type != 'blend') {
                    var imgItem = mediaModalCont.find('.lake-form-media-field-item[data-type="'+itemType+'"]');
                } else {
                    var imgItem = mediaModalCont.find('.lake-form-media-field-item');
                }
                
                // 计算已选中的项
                for (var i = 0; i < imgItem.length; i++) {
                    var item = $(imgItem[i]);
                    var itemId = item.data('id');
                    var itemUrl = item.data('url');
                    
                    if (storeAsId == 1) {
                        // 当存储为ID时，通过ID匹配
                        if ($.inArray(itemId, nowNumArr) != -1) {
                            noNeedSelectArr.push(itemId);
                        }
                    } else {
                        // 当存储为URL时，通过URL匹配
                        if ($.inArray(itemUrl, nowNumArr) != -1) {
                            noNeedSelectArr.push(itemUrl);
                        }
                    }
                }
                
                var selectedItem = mediaModalCont.find('.lake-form-media-selected');
                var selectNum = nowNumArr.length - noNeedSelectArr.length + selectedItem.length;

                var tag = $(this).hasClass('lake-form-media-selected');

                if (tag) {
                    // 取消选中
                    $(this).removeClass('lake-form-media-selected');
                } else {
                    // 选中
                    if (limit == 1) {
                        // 取消之前选中的
                        mediaModalCont
                            .find('.lake-form-media-selected')
                            .removeClass('lake-form-media-selected')
                    } else {
                        if (selectNum >= limit) {
                            toastr.error(thiz.lang("selected_error", {
                                num: limit,
                            }));
                            return 1;
                        }
                    }

                    $(this).addClass('lake-form-media-selected');
                }

                return 1;
            });

            // 图片/视频预览
            this.onEvent('click', ".lake-form-media-img-show-item-preview", function() {
                var type = $(this).data('type');
                var url = $(this).data('url');

                var preview = '';
                var height = '85%';
                if (type == 'image') {
                    preview = '<img height="100%" src="' + url + '" />';
                } else if (type == 'video') {
                    preview = '<video height="100%" controls src="' + url + '"></video>';
                } else if (type == 'audio') {
                    height = 'auto';
                    preview = '<audio controls src="' + url + '"></audio>';
                }

                layer.open({
                    type: 1,
                    area: ['auto', height],
                    title: thiz.lang("preview_title"),
                    end: function(index, layero) {
                        return false;
                    },
                    content: '<div style="display: flex;align-items: center;justify-content: center;text-align: justify;height: 100%;">'+preview+'</div>',
                });
            });
        },

        onEvent: function(bind, elements, callback) {
            return $("body").off(bind, elements)
                .on(bind, elements, callback);
        },

        getdata: function(name, path = '/', options = []) {
            var mediaCont = $('.lake-form-media-' + name);

            var keywords = options.keywords;
            var type = options.type;
            var disk = options.disk;
            var limit = options.limit;
            var remove = options.remove;
            var pageSize = options.pagesize;
            var storeAsId = options.storeAsId;

            var mediaModalCont = $('#LakeFormMediaModel' + name);
            var mediaModalTableCont = mediaModalCont.find('.lake-form-media-body-table');
            var mediaModalNavOlCont = mediaModalCont.find('.lake-form-media-nav-ol');
            var mediaModalPageCont = mediaModalCont.find('.lake-form-media-modal-page');
            var mediaModalOrderCont = mediaModalCont.find('.lake-form-media-modal-order');

            var inputCont = mediaCont.find('.lake-form-media-input');

            var order = mediaModalOrderCont.data('order');
            var currentPath = mediaModalNavOlCont.data('current-path');
            var currentPage = mediaModalPageCont.data('current-page');
            var pageSize = mediaModalPageCont.data('page-size');

            var thiz = this;

            var baseUrl = options.get_files_url;
            if (baseUrl.indexOf("?") == -1) {
                baseUrl = baseUrl + "?";
            } else {
                baseUrl = baseUrl + "&";
            }

            $.ajax({
                url: baseUrl
                    + "keywords=" + keywords
                    + "&path=" + path
                    + "&type=" + type
                    + "&disk=" + disk
                    + "&order=" + order
                    + "&page=" + currentPage
                    + "&pageSize=" + pageSize,
                method: 'GET',
                datatype:'json',
                async: true,
                success: function (res) {
                    var list = res['data']['list'];
                    var nav = res['data']['nav'];

                    mediaModalTableCont.html('');
                    if (JSON.stringify(list) != '[]') {
                        for (var i in list) {
                            if (list[i]['isDir']) {
                                var htmltemp = '';
                                htmltemp += '<div class="col-xs-4 col-md-3">';
                                htmltemp +=     '<div class="thumbnail lake-form-media-field-item lake-form-media-dir-op" data-type="'+list[i]['type']+'" data-path="/'+list[i]['name']+'" title="'+list[i]['name']+'（'+list[i]['time']+'）">';
                                htmltemp +=         list[i]['preview'];
                                htmltemp +=         '<div class="file-info">';
                                htmltemp +=             '<a href="javascript:;" class="file-name">'+list[i]['namesmall']+'</a>';
                                htmltemp +=         '</div>';
                                htmltemp +=     '</div>';
                                htmltemp += '</div>';
                                mediaModalTableCont.append(htmltemp);
                            } else {
                                var htmltemp = '';
                                htmltemp += '<div class="col-xs-4 col-md-3">';

                                // 添加id属性到数据中，用于storeAsId模式
                                var dataId = list[i]['id'] || '';
                                var dataUrl = list[i]['content'] || '';
                                
                                htmltemp +=     '<div class="thumbnail lake-form-media-field-item lake-form-media-field-item-op" data-type="'+list[i]['type']+'" data-url="'+dataUrl+'" data-id="'+dataId+'" title="'+list[i]['name']+'（'+list[i]['time']+'）">';
                                htmltemp +=         list[i]['preview'];
                                htmltemp +=         '<div class="file-info">';
                                htmltemp +=             '<a href="javascript:;" class="file-name">'+list[i]['namesmall']+'</a>';
                                htmltemp +=         '</div>';
                                htmltemp +=     '</div>';
                                htmltemp += '</div>';

                                mediaModalTableCont.append(htmltemp);
                            }
                        }

                    } else {
                        var htmltemp = '<div class="col-12"><div class="lake-form-media-empty">' + thiz.lang("empty") + '</div></div>';
                        mediaModalTableCont.append(htmltemp);
                    }

                    mediaModalNavOlCont.html('<li class="breadcrumb-item lake-form-media-nav-li" data-path="/"><a href="javascript:;"><i class="fa fa-th-large"></i> </a></li>');
                    mediaModalNavOlCont.data('current-path', '/');
                    for (var i = 0; i < nav.length; i++) {
                        mediaModalNavOlCont.append('<li class="breadcrumb-item"><a class="lake-form-media-nav-li" href="javascript:;" data-path="'+nav[i]['url']+'"> '+nav[i]['name']+'</a></li>');
                        mediaModalNavOlCont.data('current-path', nav[i]['url']);
                    }

                    var urlListStr = inputCont.val();
                    var urlList = [];
                    
                    if (limit == 1) {
                        if (urlListStr && urlListStr != '') {
                            urlList = [urlListStr];
                        }
                        
                        if (storeAsId == 1) {
                            // 当存储为ID时，通过ID匹配选中项
                            for (var i = 0; i < urlList.length; i++) {
                                mediaModalTableCont.find('[data-id="'+urlList[i]+'"]')
                                    .addClass('lake-form-media-selected');
                            }
                        } else {
                            // 当存储为URL时，通过URL匹配选中项
                            for (var i = 0; i < urlList.length; i++) {
                                mediaModalTableCont.find('[data-url="'+urlList[i]+'"]')
                                    .addClass('lake-form-media-selected');
                            }
                        }
                    } else {
                        urlList = thiz.isJSON(urlListStr);
                        
                        if (storeAsId == 1) {
                            // 当存储为ID时，通过ID匹配选中项
                            for (var i = 0; i < urlList.length; i++) {
                                mediaModalTableCont.find('[data-id="'+urlList[i]+'"]')
                                    .addClass('lake-form-media-selected');
                            }
                        } else {
                            // 当存储为URL时，通过URL匹配选中项
                            for (var i = 0; i < urlList.length; i++) {
                                mediaModalTableCont.find('[data-url="'+urlList[i]+'"]')
                                    .addClass('lake-form-media-selected');
                            }
                        }
                    }

                    var totalPage = parseInt(res['data']['total_page']);
                    var currentPage = parseInt(res['data']['current_page']);
                    var perPage = parseInt(res['data']['per_page']);

                    mediaModalPageCont.data('current-page', currentPage);
                    mediaModalPageCont.data('total-page', totalPage);
                    mediaModalPageCont.data('page-size', perPage);

                    if (totalPage > 1) {
                        if (currentPage > 1) {
                            mediaModalPageCont.find('.lake-form-media-modal-prev-page').removeClass('hidden');
                        } else {
                            mediaModalPageCont.find('.lake-form-media-modal-prev-page').addClass('hidden');
                        }

                        if (currentPage < totalPage) {
                            mediaModalPageCont.find('.lake-form-media-modal-next-page').removeClass('hidden');
                        } else {
                            mediaModalPageCont.find('.lake-form-media-modal-next-page').addClass('hidden');
                        }
                    } else {
                        mediaModalPageCont.find('.lake-form-media-modal-prev-page').addClass('hidden');
                        mediaModalPageCont.find('.lake-form-media-modal-next-page').addClass('hidden');
                    }

                },
                error: function(XmlHttpRequest, textStatus, errorThrown){
                    toastr.error(thiz.lang("getdata_error"));
                },
                cache: false,
                contentType: false,
                processData: false
            });
        },

        // 刷新表单预览
        refreshInputPreview: function(input) {
            console.log('refreshInputPreview called');
            
            var mediaCont = $(input).parents('.lake-form-media');
            var name = mediaCont.data('name');
            var options = mediaCont.data('options');
            
            var mediaType = options.type || 'image';
            console.log('Media type:', mediaType);
            
            // 如果是视频类型，使用自定义处理方式
            if (mediaType === 'video') {
                console.log('Using custom video preview handler');
                // 不使用默认的刷新方法，而是让事件监听器处理
                return;
            }
            
            // 对于其他类型，使用原始逻辑
            var inputCont = mediaCont.find('.lake-form-media-input');
            var imgShowCont = mediaCont.find('.lake-form-media-img-show');
            var imgShowRowCont = mediaCont.find('.lake-form-media-img-show-row');
            
            var inputVal = inputCont.val();
            if (inputVal == '[]') {
                inputVal = '';
            }
            
            if (inputVal == '') {
                imgShowCont.hide();
                imgShowRowCont.html('');
                return;
            }
            
            imgShowCont.show();
            
            var rootpath = options.rootpath;
            var type = options.type;
            var limit = options.limit;
            var remove = options.remove;
            var showtitle = options.showtitle;
            var showicon = options.showicon;
            var saveFullUrl = options.save_full_url;
            var storeAsId = options.storeAsId;
            var isCover = options.is_cover;
            var videoUrl = options.video_url;
            
            imgShowRowCont.html('');
            
            var urlList = [];
            if (limit == 1) {
                urlList = [inputVal];
            } else {
                urlList = this.isJSON(inputVal);
            }
            
            this.refreshPreview(name, urlList, options);
        },

        // 刷新表单数据
        refreshInputString: function(name) {
            var mediaCont = $('.lake-form-media-'+name);
            var inputCont = mediaCont.find('.lake-form-media-input');

            var urlList = [];
            mediaCont.find('.lake-form-media-preview-item')
                .each(function(i, cont) {
                    urlList.push($(cont).data('src'));
                });

            var inputString = JSON.stringify( urlList );
            if (inputString == '[]' || inputString  == '[""]') {
                inputString = '';
            }

            inputCont.val(inputString);
        },

        // 刷新/显示 预览
        refreshPreview: function(name, urlList, options = []) {
            var thiz = this;

            // 过滤掉空值
            var filteredUrlList = [];
            for (var i = 0; i < urlList.length; i++) {
                if (urlList[i] && urlList[i].trim() !== '') {
                    filteredUrlList.push(urlList[i]);
                }
            }
            urlList = filteredUrlList;

            var limit = options.limit;
            var remove = options.remove;
            var rootpath = options.rootpath;
            var showtitle = options.showtitle;
            var showicon = options.showicon;
            var storeAsId = options.storeAsId;
            var isCover = options.isCover || false; // 是否是封面图片
            var videoUrl = options.videoUrl || ''; // 视频URL

            var saveFullUrl = options.saveFullUrl;

            var mediaCont = $('.lake-form-media-'+name);
            var imgShowCont = mediaCont.find('.lake-form-media-img-show');
            var imgShowRowCont = mediaCont.find('.lake-form-media-img-show-row');

            imgShowRowCont.html('');
            if (urlList.length > 0) {
                imgShowCont.show();
            } else {
                imgShowCont.hide();
            }

            // 如果启用了storeAsId，需要获取素材的实际内容
            if (storeAsId == 1) {
                // 对于存储为ID的情况，需要异步加载预览
                for (var i = 0; i < urlList.length; i++) {
                    var materialId = urlList[i];
                    
                    // 创建一个占位符
                    var html = '<div class="col-xs-6 col-sm-6 col-md-4 col-lg-3 lake-form-media-preview-item" data-src="'+materialId+'" data-loading="1">';
                    html += '<div class="thumbnail lake-form-media-row-col">';
                    html += '<div class="lake-form-media-row-img" title="加载中...">';
                    html += '<i class="fa fa-spinner fa-spin fa-fw lake-form-media-preview-fa"></i>';
                    html += '</div>';
                    
                    // 显示类型
                    if (showicon) {
                        html += '<span class="row-icon">';
                        html += '<i class="fa fa-file fa-fw lake-form-media-show-icon" title="loading"></i>';
                        html += '</span>';
                    }
                    
                    // 文件名
                    if (showtitle) {
                        html += '<div class="row-title" title="加载中...">';
                        html += '加载中...';
                        html += '</div>';
                    }
                    
                    html += '<div class="caption">';
                    if (remove) {
                        html += '<span class="btn btn-default file-delete-multiple lake-form-media-img-show-item-delete" data-url="'+materialId+'" title="' + thiz.lang("remove") + '"><i class="fa fa-trash-o"></i></span>';
                    }
                    if (limit > 1) {
                        html += '<span class="btn btn-default lake-form-media-img-show-item-dragsort js-dragsort" title="' + thiz.lang("dragsort") + '"><i class="fa fa-arrows"></i></span>';
                    }
                    html += '</div>';
                    
                    html += '</div>';
                    html += '</div>';
                    
                    imgShowRowCont.append(html);
                    
                    // 异步获取素材内容
                    (function(materialId, itemIndex) {
                        // 获取素材类型 - 确保传递正确的素材类型
                        var requestType = options.type || 'image';
                        
                        console.log('Requesting material:', materialId, 'type:', requestType);
                        
                        $.ajax({
                            url: '/admin/material/get-by-id',
                            method: 'GET',
                            dataType: 'json',
                            data: {
                                id: materialId,
                                type: requestType // 始终传递素材类型
                            },
                            success: function(res) {
                                console.log('Material response:', res);
                                
                                if (res.code == 200 && res.data) {
                                    var material = res.data;
                                    var materialUrl = material.content || '';
                                    var materialType = material.type || requestType; // 使用返回的类型或请求的类型
                                    var materialName = material.cname || materialId;
                                    
                                    // 查找对应的预览项
                                    var previewItem = imgShowRowCont.find('.lake-form-media-preview-item[data-src="'+materialId+'"]');
                                    if (previewItem.length > 0) {
                                        // 更新预览内容
                                        var imgCont = previewItem.find('.lake-form-media-row-img');
                                        imgCont.attr('title', materialName);
                                        
                                        // 设置预览内容
                                        imgCont.html(thiz.getFileDisplay(materialUrl, materialType, material.cover, isCover, videoUrl));
                                        
                                        // 更新图标
                                        if (showicon) {
                                            var iconCont = previewItem.find('.row-icon');
                                            iconCont.html(thiz.getFileShowType(materialUrl, materialType));
                                        }
                                        
                                        // 更新标题
                                        if (showtitle) {
                                            var titleCont = previewItem.find('.row-title');
                                            titleCont.attr('title', materialName);
                                            titleCont.text(materialName);
                                        }
                                        
                                        // 更新预览按钮
                                        var captionCont = previewItem.find('.caption');
                                        var suffix = thiz.getFileType(materialType);
                                        if (suffix == 'image' || suffix == 'video' || suffix == 'audio') {
                                            var previewBtn = '<span class="btn btn-default lake-form-media-img-show-item-preview" data-type="'+suffix+'" data-url="'+materialUrl+'" title="' + thiz.lang("preview") + '"><i class="fa fa-search-plus"></i></span>';
                                            captionCont.prepend(previewBtn);
                                        }
                                        
                                        // 标记为已加载
                                        previewItem.attr('data-loading', '0');
                                        previewItem.attr('data-material-url', materialUrl);
                                    }
                                } else {
                                    console.error('Failed to load material:', materialId, res);
                                    // 处理加载失败的情况
                                    var previewItem = imgShowRowCont.find('.lake-form-media-preview-item[data-src="'+materialId+'"]');
                                    if (previewItem.length > 0) {
                                        var imgCont = previewItem.find('.lake-form-media-row-img');
                                        imgCont.html('<i class="fa fa-exclamation-triangle fa-fw" style="color:red;"></i> 加载失败');
                                    }
                                }
                            },
                            error: function(xhr, status, error) {
                                console.error('AJAX error:', error);
                                // 处理AJAX错误的情况
                                var previewItem = imgShowRowCont.find('.lake-form-media-preview-item[data-src="'+materialId+'"]');
                                if (previewItem.length > 0) {
                                    var imgCont = previewItem.find('.lake-form-media-row-img');
                                    imgCont.html('<i class="fa fa-exclamation-triangle fa-fw" style="color:red;"></i> 请求出错');
                                }
                            }
                        });
                    })(materialId, i);
                }
            } else {
                // 常规URL处理方式
                for (var i = 0; i < urlList.length; i++) {
                    var src = urlList[i];
                    if (! this.isUrl(src)) {
                        if (saveFullUrl != 1) {
                            src = rootpath + urlList[i];
                        }
                    }

                    var html = '<div class="col-xs-6 col-sm-6 col-md-4 col-lg-3 lake-form-media-preview-item" data-src="'+urlList[i]+'">';
                    html += '<div class="thumbnail lake-form-media-row-col">';

                    html += '<div class="lake-form-media-row-img" title="' + urlList[i] + '">';
                    html += this.getFileDisplay(src, null, null, isCover, videoUrl);
                    html += '</div>';

                    var suffix = this.getFileSuffix(src);
                    var showType = this.getFileShowType(src);

                    // 显示类型
                    if (showicon) {
                        html += '<span class="row-icon">';
                        html += showType;
                        html += '</span>';
                    }

                    // 文件名
                    if (showtitle) {
                        html += '<div class="row-title" title="' + urlList[i] + '">';
                        html += urlList[i];
                        html += '</div>';
                    }

                    html += '<div class="caption">';
                    if (suffix == 'image' || suffix == 'video' || suffix == 'audio') {
                        html += '<span class="btn btn-default lake-form-media-img-show-item-preview" data-type="'+suffix+'" data-url="'+src+'" title="' + thiz.lang("preview") + '"><i class="fa fa-search-plus"></i></span>';
                    }
                    if (remove) {
                        html += '<span class="btn btn-default file-delete-multiple lake-form-media-img-show-item-delete" data-url="'+urlList[i]+'" title="' + thiz.lang("remove") + '"><i class="fa fa-trash-o"></i></span>';
                    }
                    if (limit > 1) {
                        html += '<span class="btn btn-default lake-form-media-img-show-item-dragsort js-dragsort" title="' + thiz.lang("dragsort") + '"><i class="fa fa-arrows"></i></span>';
                    }
                    html += '</div>';

                    html += '</div>';
                    html += '</div>';

                    imgShowRowCont.append(html);
                }
            }
        },

        unique: function (arr){
            var hash = [];
            for (var i = 0; i < arr.length; i++) {
                // 过滤掉空值和空字符串
                if(arr[i] && hash.indexOf(arr[i])==-1){
                    hash.push(arr[i]);
                }
            }

            return hash;
        },

        isJSON: function(str) {
            if (typeof str == 'string') {
                try {
                    return JSON.parse(str);
                } catch(e) {
                    return [str];
                }
            }
            return [];
        },

        isUrl: function(url) {
            if (url.substr(0, 7).toLowerCase() == "http://"
                || url.substr(0, 8).toLowerCase() == "https://"
                || url.substr(0, 2).toLowerCase() == "//"
            ) {
                return true;
            }

            return false;
        },

        // 判断是否是 object
        isObj: function(object) {
            return object
                && typeof (object) == 'object'
                && Object.prototype
                    .toString.call(object)
                    .toLowerCase() == "[object object]";
        },

        // 判断是否是 array
        isArray: function(object) {
            return Object.prototype
                .toString.call(object)
                .toLowerCase() === '[object array]';
        },

        getFileSuffix: function (src) {
            try {
                var srcArr = src.split('.');
                var suffix = srcArr[srcArr.length - 1];
            } catch(err) {
                var suffix = '';
            }

            if (suffix) {
                var type = this.getFileType(suffix.toLocaleLowerCase());
            } else {
                var type = '';
            }

            return type;
        },

        getFileExt: function (filename) {
            try {
                var srcArr = filename.split('.');
                var ext = srcArr[srcArr.length - 1];
            } catch(err) {
                var ext = '';
            }

            return ext;
        },

        getFileDisplay: function (src, type, cover, isCover, videoUrl) {
            // 如果提供了type参数，直接使用它
            var fileType = type ? this.getFileType(type) : this.getFileSuffix(src);
            
            console.log('getFileDisplay called:', {
                src: src,
                type: type,
                fileType: fileType,
                cover: cover,
                isCover: isCover,
                videoUrl: videoUrl
            });

            // 确保src不为空
            if (!src) {
                console.error('Empty src provided');
                return '<i class="fa fa-exclamation-triangle fa-fw" style="color:red;"></i> 无效链接';
            }

            var html = '';
            if (fileType === 'image') {
                // 添加错误处理，确保图片加载失败时显示错误图标
                html += '<img width="100%" src="' + src + '" alt="'+src+'" onerror="this.onerror=null;this.src=\'\';this.style.display=\'none\';this.parentNode.innerHTML=\'<i class=\\\'fa fa-exclamation-triangle fa-fw\\\' style=\\\'color:red;\\\'></i> 图片加载失败\'"/>';
            } else if (fileType === 'video' || type === 'video') {
                // 强制处理为视频类型，确保即使fileType判断错误也能正确显示
                console.log('Processing as video type');
                
                // 处理视频预览
                if (cover && cover !== 'http://') {
                    // 优先使用封面图片
                    html += '<div class="video-cover-container" style="position: relative;">';
                    html += '<img width="100%" src="' + cover + '" alt="视频封面" data-video-url="' + (videoUrl || src) + '" onerror="this.onerror=null;this.src=\'\';this.style.display=\'none\';this.parentNode.innerHTML=\'<i class=\\\'fa fa-video-camera fa-fw\\\' style=\\\'color:#666;\\\'></i> 视频封面加载失败\'"/>';
                    html += '<div class="video-play-icon" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 30px;">';
                    html += '<i class="fa fa-play-circle-o"></i>';
                    html += '</div>';
                    html += '</div>';
                } else if (isCover && videoUrl) {
                    // 如果是编辑模式下的封面图片预览
                    html += '<div class="video-cover-container" style="position: relative;">';
                    html += '<img width="100%" src="' + src + '" alt="视频封面" data-video-url="' + videoUrl + '" onerror="this.onerror=null;this.src=\'\';this.style.display=\'none\';this.parentNode.innerHTML=\'<i class=\\\'fa fa-video-camera fa-fw\\\' style=\\\'color:#666;\\\'></i> 封面加载失败\'"/>';
                    html += '<div class="video-play-icon" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 30px;">';
                    html += '<i class="fa fa-play-circle-o"></i>';
                    html += '</div>';
                    html += '</div>';
                } else if (this.isUrl(src) && src.indexOf('.mp4') > -1) {
                    html += '<video width="100%" height="100%" src="' + src + '" preload="metadata"></video>';
                } else {
                    html += '<i class="fa fa-file-video-o fa-fw lake-form-media-preview-fa"></i>';
                }
            } else if (fileType === 'audio') {
                html += '<i class="fa fa-file-audio-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'pdf') {
                html += '<i class="fa fa-file-pdf-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'word') {
                html += '<i class="fa fa-file-word-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'ppt') {
                html += '<i class="fa fa-file-powerpoint-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'xls') {
                html += '<i class="fa fa-file-excel-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'text') {
                html += '<i class="fa fa-file-text-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'code') {
                html += '<i class="fa fa-file-code-o fa-fw lake-form-media-preview-fa"></i>';
            } else if (fileType === 'zip') {
                html += '<i class="fa fa-file-zip-o fa-fw lake-form-media-preview-fa"></i>';
            } else {
                html += '<i class="fa fa-file fa-fw lake-form-media-preview-fa"></i>';
            }

            return html;
        },

        getFileShowType: function (src, type) {
            // 如果提供了type参数，直接使用它
            var fileType = type ? this.getFileType(type) : this.getFileSuffix(src);

            var html = '';
            if (fileType === 'image') {
                html += '<i class="fa fa-file-image-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'video') {
                html += '<i class="fa fa-file-video-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'audio') {
                html += '<i class="fa fa-file-audio-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'pdf') {
                html += '<i class="fa fa-file-pdf-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'word') {
                html += '<i class="fa fa-file-word-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'ppt') {
                html += '<i class="fa fa-file-powerpoint-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'xls') {
                html += '<i class="fa fa-file-excel-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'text') {
                html += '<i class="fa fa-file-text-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'code') {
                html += '<i class="fa fa-file-code-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else if (fileType === 'zip') {
                html += '<i class="fa fa-file-zip-o fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            } else {
                html += '<i class="fa fa-file fa-fw lake-form-media-show-icon" title="' + fileType + '"></i>';
            }

            return html;
        },

        getFileType: function (suffix) {
            console.log('getFileType called with:', suffix);
            
            // 如果传入的是类型字符串而不是后缀
            if (suffix === 'video' || suffix === 'image' || suffix === 'audio' || suffix === 'file') {
                console.log('Direct type provided:', suffix);
                return suffix;
            }
            
            // 如果是空值或无效值
            if (!suffix) {
                console.warn('Empty suffix provided');
                return 'file';
            }
            
            // 确保suffix是字符串
            if (typeof suffix !== 'string') {
                console.warn('Non-string suffix:', suffix);
                return 'file';
            }
            
            // 转换为小写
            suffix = suffix.toLowerCase();
            
            // 图片类型
            var imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'svg'];
            if ($.inArray(suffix, imageTypes) != -1) {
                return 'image';
            }

            // 视频类型
            var videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'mpeg', 'mpg', 'webm', 'm4v'];
            if ($.inArray(suffix, videoTypes) != -1) {
                return 'video';
            }

            // 音频类型
            var audioTypes = ['mp3', 'wav', 'ogg', 'oga', 'flac', 'aac', 'm4a'];
            if ($.inArray(suffix, audioTypes) != -1) {
                return 'audio';
            }

            return 'file';
        },

        // 复制
        copyData: function(data) {
            let target = document.createElement('div');
            target.id = 'tempTarget';
            target.style.opacity = '0';
            target.innerText = data;
            document.body.appendChild(target);

            try {
                let range = document.createRange();
                range.selectNode(target);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand('copy');
                window.getSelection().removeAllRanges();

                layer.msg(this.lang("copy_success"));
            } catch (e) {
                layer.msg(this.lang("copy_error"));
            }

            target.parentElement.removeChild(target);
        },

        // 翻译
        lang: function () {
            var args = arguments,
                string = args[0],
                i = 1;

            var thiz = this;

            // 语言包
            var Lang = window.LakeFormMediaLang;

            string = string.toLowerCase();
            if (typeof Lang !== 'undefined' && typeof Lang[string] !== 'undefined') {
                if (typeof Lang[string] == 'object') {
                    return Lang[string];
                }

                string = Lang[string];
            } else if (string.indexOf('.') !== -1) {
                // 处理多级语言包
                var arr = string.split('.');
                var current = Lang[arr[0]];

                for (var i = 1; i < arr.length; i++) {
                    current = typeof current[arr[i]] != 'undefined'
                        ? current[arr[i]]
                        : '';
                    if (typeof current != 'object') {
                        break;
                    }
                }

                if (typeof current == 'object') {
                    return current;
                }
                
                string = current || args[0];
            } else {
                string = args[0];
            }

            // 原始按序替换
            string = string.replace(/%((%)|s|d)/g, function (m) {
                // m 是匹配到的格式, e.g. %s, %d
                var val = null;

                if (m[2]) {
                    val = m[2];
                } else {
                    val = args[i];
                    // 默认是 %s
                    switch (m) {
                        case '%d':
                            val = parseFloat(val);
                            if (isNaN(val)) {
                                val = 0;
                            }
                            break;
                    }
                    i++;
                }

                return val;
            });

            // 键值翻译
            string = string.replace(/:([a-zA-Z0-9:\-\_]+)/g, function (m) {
                if (args.length < 2) {
                    return m;
                }

                if (m[1] && m[1] == ":") {
                    return m.substr(1);
                }

                // 默认
                var val = null;

                // 翻译数据
                var data = args[1];

                // 对象判断
                if (! thiz.isObj(data)) {
                    return m;
                }

                // 键值
                var key = m.substr(1);

                // 键值判断
                if (! (key in data)) {
                    return m;
                }

                // 设置值
                val = data[key];

                return val;
            });

            return string;
        },

        // 选择文件
        selectFiles: function(name, files) {
            var thiz = this;

            var mediaCont = $('.lake-form-media-'+name);
            var inputCont = mediaCont.find('.lake-form-media-input');

            var options = mediaCont.data('options');
            options = $.extend({}, options);

            var limit = options.limit;
            var rootpath = options.rootpath;
            var saveFullUrl = options.saveFullUrl;
            var storeAsId = options.storeAsId;

            // 记录日志，帮助调试
            console.log('selectFiles called:', {
                name: name,
                files: files,
                storeAsId: storeAsId,
                limit: limit
            });

            var urlList = [];
            var idList = [];
            
            // 已经存在的
            mediaCont.find('.lake-form-media-preview-item')
                .each(function(i, cont) {
                    var itemSrc = $(cont).data('src');
                    console.log('Existing item:', itemSrc);
                    urlList.push(itemSrc);
                });
            
            // 新选择的
            for (var i = 0; i < files.length; i++) {
                var url = files[i].content;
                var id = files[i].id;
                
                console.log('Selected item:', { id: id, url: url });
                
                if (storeAsId == 1) {
                    if (id) {
                        idList.push(id);
                    } else {
                        console.warn('Missing ID for storeAsId mode:', url);
                    }
                } else {
                    if (saveFullUrl != 1) {
                        url = url.replace(rootpath, '');
                    }
                    
                    urlList.push(url);
                }
            }
            
            // 合并处理
            var newList = [];
            
            if (limit == 1) {
                // 单选
                if (storeAsId == 1 && idList.length > 0) {
                    newList = [idList[idList.length - 1]];
                    console.log('Single select (ID):', newList);
                } else if (urlList.length > 0) {
                    // 对于单图上传且非storeAsId模式，直接存储URL字符串而非数组
                    if (storeAsId != 1) {
                        var url = urlList[urlList.length - 1];
                        // 检查URL是否是相对路径，如果saveFullUrl为1则添加根路径
                        if (url && url.indexOf('http') !== 0 && url.indexOf('//') !== 0 && saveFullUrl == 1) {
                            // 移除可能的根路径前缀，以避免重复添加
                            if (url.indexOf(rootpath) === 0) {
                                url = url.replace(rootpath, '');
                            }
                            // 添加根路径前缀
                            url = rootpath + url;
                        }
                        inputCont.val(url);
                        console.log('Single select (URL string):', url, 'saveFullUrl:', saveFullUrl);
                        this.refreshPreview(name, [url], options);
                        return; // 提前返回，不继续执行
                    } else {
                        newList = [urlList[urlList.length - 1]];
                        console.log('Single select (URL):', newList);
                    }
                }
            } else {
                // 多选
                if (storeAsId == 1) {
                    // 当使用ID存储时，只使用新选择的ID列表
                    newList = this.unique(idList);
                } else {
                    // 当第一次选择时，只使用新选择的URL
                    if (urlList.length <= files.length) {
                        // 只取新选择的
                        var newUrlList = [];
                        for (var i = 0; i < files.length; i++) {
                            var url = files[i].content;
                            // 确保URL不为空
                            if (url && url.trim() !== '') {
                                if (saveFullUrl != 1) {
                                    url = url.replace(rootpath, '');
                                }
                                newUrlList.push(url);
                            }
                        }
                        newList = this.unique(newUrlList);
                    } else {
                        // 已有选择的情况，只取新的文件
                        // 先过滤掉原有urlList中的空值
                        var filteredUrlList = [];
                        for (var i = 0; i < urlList.length; i++) {
                            if (urlList[i] && urlList[i].trim() !== '') {
                                filteredUrlList.push(urlList[i]);
                            }
                        }
                        newList = this.unique(filteredUrlList.slice(-files.length));
                    }
                }
                
                if (limit > 1 && newList.length > limit) {
                    newList = newList.slice(0, limit);
                    console.log('Limited to:', newList);
                }
            }

            var inputString = JSON.stringify(newList);
            if (inputString == '[]' || inputString == '[""]') {
                inputString = '';
            }
            
            console.log('Final input value:', inputString);
            inputCont.val(inputString);
            
            this.refreshPreview(name, newList, options);
        },

        // 选择项
        selectItem: function(name, selected) {
            var thiz = this;

            var mediaCont = $('.lake-form-media-'+name);
            var inputCont = mediaCont.find('.lake-form-media-input');

            var options = mediaCont.data('options');
            options = $.extend({}, options);

            var limit = options.limit;
            var rootpath = options.rootpath;
            var saveFullUrl = options.saveFullUrl;
            var storeAsId = options.storeAsId;

            // 使用新的selectFiles方法处理选择
            this.selectFiles(name, selected);

            var modalId = 'LakeFormMediaModel' + name;
            $('#' + modalId).modal('hide');
        },
    }

    LakeFormMedia.init();

    window.LakeFormMedia = LakeFormMedia;
});

