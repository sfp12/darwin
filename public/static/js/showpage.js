// 先不用判断是否登录

//#question#  存在的问题

$(document).ready(function(w){

    // handsontable
    var hsd = {};
    // --hsd的属性，不含function
    // hsd.uname;  用户名
    // hsd.user_id; 用户id
    // hsd.con; table的容器
    // hsd.modal_flag; 触发modal的元素标示
    // hsd.time;  区分click dblclick时 click的延时函数
    // hsd.new_table;  是否为new table,主要指当前这个表是新表还是旧表，主要用在save时的判断
    // hsd.prev_table; 之前的表是否为旧表，主要用在表切换时；
    // hsd.hot; handsontable object
    // hsd.data_id; table id
    // hsd.table_name; table name
    // hsd.data; table 数据
    // hsd.open; 是否打开文件，为了和data tab show相区分
    // hsd.modify; 是否修改，打开新的文件时，需要判断已有表是否修改
    // hsd.open_id: 要打开的id，为了和data_id作区分，因为要打开新文件时，需要保存旧文件，如果不区分的话，会把旧文件保存为新文件，再打开新文件

    // --总结的规则
    // upload, save new,save as需要刷新file tab的data tables
    
    // 属性
    hsd.con = $('#con');
    hsd.modal_flag = -1;
    //默认值为false，new(file) new(data) 直接切换data(tab)为true，save之后为false
    // #question#new table saveas,还是new table吗？是
    hsd.new_table = false;
    //getData内变false是合理的，如果打开失败，再次切换data tab时，不用再打开
    hsd.open = false; 
    hsd.modify = false;
    hsd.open_id = -1;
    hsd.prev_table = false;

    // cookie变量
    hsd.uname = $.cookie('uname');
    hsd.user_id = $.cookie('uid');
     
    // --------------------jstree-------------------------

    // jsTree
    var jst = {};
    // data tables中，上一次选中记录的id
    // 原因：data与result，graph联动时，把result（以它为例）打开的关闭，取消active，但是有可能直接打开result中的记录，这样就出错了，不能以打开为判断条件。就需要一个变量记录上一次选中的记录（data tables中）
    jst.before_id = -1;

    // 获取树形菜单的数据；把数据转为jsTree可识别的；给file tree加单击和双击事件；
    jst.getData = function(){
        //获取file的数据
        $.get('/indexajax/getIndexData', {"userId": hsd.user_id}, function(data){            
            var files = data.data.files;
            //files有值
            if(files.length === +files.length){
                //转换files
                //因为会自动返回files，所以不需要建files_data
                _.map(files, function(file){
                    file.id = "table"+file.dataId;
                    file.text = file.dataName;
                    file.children = false;
                    file.type = "file"; 
                    file.icon = "file file-xls";
                    return file; 
                }); 

                //转换results    
                var results_data = jst.changeToTree(data.data.results, 0);
                //转换graphs
                var graphs_data = jst.changeToTree(data.data.graphs, 1);

                jst.createFilesTree('#tree_files', files);
                jst.createResultsTree('#tree_results', results_data);
                jst.createGraphsTree('#tree_graphs', graphs_data);

                hsd.time = null;
                // data table双击 打开table          
                $('#tree_files').on('dblclick','.jstree-anchor', function (e) {
                    clearTimeout(hsd.time);
                    var instance = $.jstree.reference(this),
                    node = instance.get_node(this);
                    var index = node.id.replace('table','');
                    hsd.open_id = +index;  
                    hsd.open = true;
                    hsd.new_table = false;               
                    $('#flag li:eq(1) a').tab('show');                    
                });

                // data table单击 选中table，results graphs相应的变化
                $('#tree_files').on('click', '.jstree-anchor', function (e) {
                    var instance = $.jstree.reference(this),
                        node = instance.get_node(this);
                    clearTimeout(hsd.time);
                    hsd.time = setTimeout(function(){
                        //单击事件在这里                        
                        //result的容器
                        var con_r = $('#tree_results');
                        //graphs的容器
                        var con_g = $('#tree_graphs');
                        //选中元素的序号
                        var index = node.id.replace('table','');

                        //取消data table高亮               
                        $('#'+$('#tree_files').jstree('get_selected')).parent().find('li.active').toggleClass('active');
                        //data table中选中的li高亮
                        $('#'+$('#tree_files').jstree('get_selected')).toggleClass('active');

                        //取消results table高亮
                        // 第一次不需要取消高亮
                        if(jst.before_id !== -1){
                            var before_result = con_r.find('#result'+jst.before_id);
                            before_result.toggleClass('active');                
                            con_r.jstree('close_all', 'result'+jst.before_id);
                        }                       

                        //results table中选中的li高亮
                        var result = $('#result'+index);
                        con_r.jstree('open_all', 'result'+index);                
                        result.toggleClass('active');
                        if(result.offset() && con_r.offset() && con_r.scrollTop()){
                            con_r.animate({
                                scrollTop : result.offset().top - con_r.offset().top + con_r.scrollTop()
                            }, 'linear');
                        } 

                        //取消graphs table高亮
                        // 第一次不需要取消高亮
                        if(jst.before_id !== -1){
                            var before_graphs = con_g.find('#graphs'+jst.before_id);
                            before_graphs.toggleClass('active');                
                            con_g.jstree('close_all', 'graphs'+jst.before_id);
                        }

                        //graphs table中选中的li高亮
                        var graphs = $('#graphs'+index);
                        con_g.jstree('open_all', 'graphs'+index);                
                        graphs.toggleClass('active');
                        if(graphs.offset() && con_g.offset() && con_g.scrollTop()){
                            con_g.animate({
                                scrollTop : graphs.offset().top - con_g.offset().top + con_g.scrollTop()
                            }, 'linear'); 
                        }

                        jst.before_id = index; 
                    }, 300);                                    
                });

                // result 左键 跳转到analysis
                $('#tree_results').on('click', '.jstree-anchor', function(e){                    
                    if(e.which === 1){
                        if($.jstree.reference(this).get_node(this)){
                            $('#flag li:eq(2) a').tab('show');
                            $('#analysis').text($.jstree.reference(this).get_node(this).id);
                        }
                    }
                })

                // result 左键 跳转到analysis
                $('#tree_graphs').on('click', '.jstree-anchor', function(e){                    
                    if(e.which === 1){
                        if($.jstree.reference(this).get_node(this)){
                            $('#flag li:eq(2) a').tab('show');
                            $('#analysis').text($.jstree.reference(this).get_node(this).id);
                        }
                    }
                })                

                jst.init();
            } 
        }, 'json');
    }; 

    // 判断是否登陆
    // if(hsd.uname === null){
    //     window.location.href="/login";
    // }else{
    //     $('body').css('display','block');
    //     jst.getData();    
    // }   

    //data tables的自动刷新
    //因为只会刷新file tab的data tables，所以也不用传参数了。
    jst.treeRefresh = function(){

        $.get('/indexajax/getIndexData', {"userId": hsd.user_id}, function(data){

            var files = data.data.files;
            //files有值
            if(files.length === +files.length){
                //转换files
                //因为会自动返回files，所以不需要建files_data
                _.map(files, function(file){
                    file.id = "table"+file.dataId;
                    file.text = file.dataName;
                    file.children = false;
                    file.type = "file"; 
                    file.icon = "file file-xls";
                    return file; 
                }); 

                //转换results    
                var results_data = jst.changeToTree(data.data.results, 0);
                //转换graphs
                var graphs_data = jst.changeToTree(data.data.graphs, 1);

                $('#tree_files').jstree(true).settings.core.data = files;
                $('#tree_files').jstree(true).refresh();
                $('#tree_results').jstree(true).settings.core.data = results_data;
                $('#tree_results').jstree(true).refresh();
                $('#tree_graphs').jstree(true).settings.core.data = graphs_data;
                $('#tree_graphs').jstree(true).refresh();
            } 

        }, 'json');

    };    

    // 执行一些函数， file tab中的，页面初始化时执行一次的
    jst.init = function(){
        //delete modal 不删除节点
        $('#delete_no').unbind().bind('click', function(){
            $('#delete_modal').modal('hide');
        }); 

        //delete modal 删除节点
        $('#delete_yes').unbind().bind('click', function(){
            $('#delete_modal').modal('hide');
            var c = hsd.delete_reference,
                d = hsd.delete_node;
            c.delete_node(c.is_selected(d)?c.get_selected():d);
        }); 

        //new 新建table
        $('#file_new').unbind().bind('click', function(){
            hsd.open_id = undefined;
            hsd.new_table = true;
            $('#flag li:eq(1) a').tab('show');
        });        

        // 上传的事件处理程序；
        // fata tab中有，但是只有data tab显示之后才能绑定，所以file tab也得写一个
        $('#upload_file_button').unbind().bind('click', function(e){

            // 获取文件名
            var file_name = $('#upload_file').val().split('\\').pop();
            var array_t = [];
            $('#tree_files a').each(function(index, ele){
                array_t[array_t.length] = $(ele).text();
            })

            // 不重名
            if($.inArray(file_name, array_t) === -1){
                
                //modal_source 触发modal的元素
                var modal_s = $('#file_upload').attr('active') === undefined ? $('#data_upload') : $('#file_upload');

                $.ajaxFileUpload({
                    url: '/file/uploadify/', 
                    type: 'post',
                    secureuri: false, 
                    fileElementId: 'upload_file', 
                    data: {  
                        "userId": hsd.user_id                    
                    },
                    dataType: 'json',
                    success: function(data, status){
                        $('#upload_modal').modal('hide');
                        if(data.status === 0){
                            $('#message_modal p').text('Successfully uploaded!');
                            $('#message_modal').modal('show');
                        }                       

                        jst.treeRefresh();                    
                    },
                    error: function(data, status, e){ 
                        $('#upload_modal').modal('hide');                        
                    }
                });

            }else{

                //重名
                $('#message_modal p').text('文件名重复，请修改文件名。');
                $('#message_modal').modal('show');
            }

        });

        //export 下载table
        $('#file_export').unbind().bind('click', function(){

            if($('#'+$('#tree_files').jstree('get_selected')).length !== 0){

                // 更新<a>的href，并点击
                var index = +$('#'+$('#tree_files').jstree('get_selected')).attr('id').replace('table','');
                $('#file_export_a').attr('href','/file/download?dataId='+index+'&userId='+hsd.user_id);
                var a_array = $('#file_export_a');
                a_array[0].click();

            }else{

                $('#message_modal p').text('请选择文件。');
                $('#message_modal').modal('show');
            }
        });
    };
    
    // 把从后台传来的数据整理为jsTree可以识别的数据
    //flag:0 表示result;flag:1表示graphs
    //只有results和graphs需要
    jst.changeToTree = function(results, flag){

        var type_t = flag === 0 ? "result":"graphs"; 

        //提交给jstree的数据
        var results_data = [];            
        //返回results的所有key []
        var keys_r = _.keys(results);

        _.each(keys_r, function(key){
            //result_data_item,准备push到result_data
            var r_d_item = {};
            r_d_item.id = type_t+results[key].dataId;
            r_d_item.text = results[key].dataName;
            r_d_item.children = [];               
            _.each(results[key][type_t+"List"], function(item){
                //result_data_children_item,准备push到result_data_item.children
                var r_d_c_item = {};
                r_d_c_item.id = type_t+"_r"+item[type_t+"Id"];
                r_d_c_item.text = item[type_t+"Name"];
                r_d_c_item[type_t+"Type"] = item[type_t+"Type"];
                r_d_c_item.type = "file";
                r_d_c_item.icon = "file file-text";
                r_d_item.children.push(r_d_c_item);
            });
            results_data.push(r_d_item);
        });

        return results_data;
    };

    // 创建file tree；删除；重命名；
    jst.createFilesTree = function(con, data){
        $(con)
        .jstree({
            'core' : {
                'dblclick_toggle' : false,
                'data' : data,
                'check_callback' : function(o, n, p, i, m) {
                    if(m && m.dnd && m.pos !== 'i') { return false; }
                    if(o === "move_node" || o === "copy_node") {
                        if(this.get_node(n).parent === this.get_node(p).id) { return false; }
                    }
                    return true;
                },
                'themes' : {
                    'responsive' : false,
                    'variant' : 'small',
                    'stripes' : true
                }                
            },
            'sort' : function(a, b) {
                return this.get_type(a) === this.get_type(b) ? (this.get_text(a).toLowerCase() > this.get_text(b).toLowerCase() ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
            },
            'contextmenu' : {
                'items' : function(node) {
                    var tmp = $.jstree.defaults.contextmenu.items();                    
                    var rename = tmp.rename;
                    var remove = tmp.remove;
                    delete tmp.rename;        
                    delete tmp.remove;
                    delete tmp.create;        
                    delete tmp.ccp;

                    tmp.Open = {
                        "label" : "Open",
                        "action" : function(data){
                            var index = data.reference.prevObject.selector.replace('#table','');
                            hsd.open_id = +index;
                            hsd.open = true;
                            hsd.new_table = false;
                            $('#flag li:eq(1) a').tab('show');                            
                        }
                    };
                    tmp.Rename = rename;
                    tmp.Remove = remove;
                    tmp.Remove.action = function(b){
                        var c=$.jstree.reference(b.reference),
                            d=c.get_node(b.reference);
                        $('#delete_modal p').text('Delete this file?');
                        $('#delete_modal').modal('show');
                        hsd.delete_reference = c;
                        hsd.delete_node = d;                        
                    }
                    tmp.Export = {
                        "label" : "Export",
                        "action" : function(data){
                            //给<a>,的href赋值，再click
                            $('#file_export_a').attr('href','/file/download?dataId='+data.reference.prevObject.selector.replace('#table','')+'&userId='+hsd.user_id);
                            var a_array = $('#file_export_a');
                            a_array[0].click();                            
                        }
                    };                   
                    
                    return tmp;
                }
            },
            'types' : {
                'default' : { 'icon' : 'folder' },
                'file' : { 'valid_children' : [], 'icon' : 'file' }
            },
            'unique' : {
                'duplicate' : function (name, counter) {
                    return name + ' ' + counter;
                }
            },

            'plugins' : ['dnd','sort','types','contextmenu','unique']
        })
        .on('delete_node.jstree', function(e, data){
            //删除文件
            // #question#
            var argu = {};
            argu.dataId = data.node.id.replace('table','');
            argu.userId = hsd.user_id;
            $.post('/indexajax/delete/', argu, function(data){               
                
            }, 'json');
        })
        .on('rename_node.jstree', function(e, data){ 
            //把修改的名字，传到后端
            var argu = {};
            argu.dataId = data.node.id.replace('table','');

            // 修改results和graphs的name
            // $('#tree_results').jstree('rename_node', '#result'+argu.dataId, data.text);            
            // $('#tree_graphs').jstree('rename_node', '#graphs'+argu.dataId, data.text);

            // 节点也rename，字符串替换
            // 根据id找到那个节点，把<a>中的字符串替换
            $('#result'+argu.dataId).find('a').each(function(){
                console.log($(this).text());
                $(this).html($(this).html().replace(data.old, data.text));
            })
            $('#graphs'+argu.dataId).find('a').each(function(){
                console.log($(this).text());
                $(this).html($(this).html().replace(data.old, data.text));
            })

            argu.userId = hsd.user_id;
            argu.fileName = data.text.replace('.xls','');
            $.post('/indexajax/saveName/', argu, function(data){                
                $('#message_modal p').text(data.data);
                $('#message_modal').modal('show');
            }, 'json');
        })                
        ;
    };
    
    // 创建results tree; changed事件，点击后，切换到analysis;
    jst.createResultsTree = function(con, data){
        $(con)
        .jstree({
            'core' : {
                'data' : data,
                'check_callback' : function(o, n, p, i, m) {
                    if(m && m.dnd && m.pos !== 'i') { return false; }
                    if(o === "move_node" || o === "copy_node") {
                        if(this.get_node(n).parent === this.get_node(p).id) { return false; }
                    }
                    return true;
                },
                'themes' : {
                    'responsive' : false,
                    'variant' : 'small',
                    'stripes' : true
                }
            },
            'sort' : function(a, b) {
                return this.get_type(a) === this.get_type(b) ? (this.get_text(a).toLowerCase() > this.get_text(b).toLowerCase() ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
            },            
            'types' : {
                'default' : { 'icon' : 'folder' },
                'file' : { 'valid_children' : [], 'icon' : 'file' }
            },
            'unique' : {
                'duplicate' : function (name, counter) {
                    return name + ' ' + counter;
                }
            },
            'plugins' : ['dnd','sort','types','unique']
        })
        ;        
    };
    
    // 创建graphs tree; changed事件，点击后，切换到analysis;
    jst.createGraphsTree = function(con, data){
        $(con)
        .jstree({
            'core' : {
                'data' : data,
                'check_callback' : function(o, n, p, i, m) {
                    if(m && m.dnd && m.pos !== 'i') { return false; }
                    if(o === "move_node" || o === "copy_node") {
                        if(this.get_node(n).parent === this.get_node(p).id) { return false; }
                    }
                    return true;
                },
                'themes' : {
                    'responsive' : false,
                    'variant' : 'small',
                    'stripes' : true
                }
            },
            'sort' : function(a, b) {
                return this.get_type(a) === this.get_type(b) ? (this.get_text(a).toLowerCase() > this.get_text(b).toLowerCase() ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
            },            
            'types' : {
                'default' : { 'icon' : 'folder' },
                'file' : { 'valid_children' : [], 'icon' : 'file' }
            },
            'unique' : {
                'duplicate' : function (name, counter) {
                    return name + ' ' + counter;
                }
            },
            'plugins' : ['dnd','sort','types','unique']
        })        
        ;
    };

    w.jst = jst;
    // --------------------handsontable------------------------------

    // ----------函数开始----------------------
    //设置第一行或列的背景颜色
    var firstRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.style.background = '#eee';
    } 

    //获取table的数据
    hsd.getData = function(index){

        hsd.open = false;

        var argu = {};
        argu.userId = hsd.user_id;
        argu.dataId = index;
        $.post('/indexajax/get', argu,  function(data){

            data = JSON.parse(data);
            
            hsd.data_id = data.data.data_id; 
            hsd.table_name = data.data.data_name;
            hsd.data = JSON.parse(data.data.data_info);
            hsd.user_id = data.data.user_id;            

            $('#data_export a').attr('href', '/file/download?dataId='+hsd.data_id+'&userId='+hsd.user_id); 

            //没有添加 add_time mod_time id_del          
            hsd.pageInit(hsd.data);

            if(hsd.hot !== undefined){                
                hsd.new_table = false;
                hsd.new_table = false;
                hsd.prev_table = false;
                hsd.hot.updateSettings({
                    data : hsd.data                                  
                });
                // 滚动到顶部
                hsd.hot.selectCell(1, 0);
                hsd.hot.deselectCell(); 
                hsd.data_id = hsd.open_id; 
            }else{
               hsd.createTable(false, hsd.table_name); 
            }                                   
        });
    };

    //存储时，后缀名的处理
    //如果以.csv结尾，则不处理
    //如果不以.csv结尾，则添加.csv
    var addSuffix = function(table_name){
        var start = table_name.lastIndexOf('.');
        var type_t = table_name.slice(start, table_name.length);
        if(type_t === '.csv'){
            return table_name;            
        }else{
            return table_name+'.csv';
        }
    }    

    //页面初始化
    //问题：新建的表格，什么时候会加载过滤条件？
    hsd.pageInit = function(data){

        var str = '';

        //加载列的数目
        if(data.length !== 0 && data[0] !== null){           
            for(var i=0, l=data[0].length; i<l; i++){
                str += '<option value='+i+'>'+(i+1)+'</option>';
            }
            $('#filter_col').html(str); 
        }        

        //加载比较的运算符
        str = '';
        str += '<option value='+0+'>大于</option>';
        str += '<option value='+1+'>小于</option>';
        $('#filter_compare').html(str);

        //加载表格的名字
        $('#table_name').text(hsd.table_name);

        //新建表格
        $('#data_new').unbind().bind('click', function(){       
            if(!hsd.prev_table){                        
                if(hsd.modify){
                    $('#save_modal').modal();
                    $('#save_modal p').text('Save changes to this document?');
                    hsd.open_id = undefined;
                }else{
                    hsd.data = [[]];
                    hsd.createTable(true, 'Untitled.csv');
                    hsd.open_id = -1;
                }
            }else{                        
                $('#save_modal').modal();
                $('#save_modal p').text('Save changes to this document?');
                hsd.open_id = undefined;                     
            }            
        });

        // 改变表格名字的modal显示后，执行的函数
        $('#data_modal').on('show.bs.modal', function(event){
            var button = $(event.relatedTarget); 
            var title = button.data('title');
            var modal = $(this);
            modal.find('.modal-title').text(title); 
        });

        //不保存
        $('#save_no').unbind().bind('click', function(){
            $('#table_name_star').css('display', 'none');
            $('#save_modal').modal('hide');
            hsd.new_table = false;
            hsd.modify = false; 
            if(hsd.open_id === undefined){
                hsd.data = [[]];
                hsd.createTable(true, 'Untitled.csv');
                hsd.open_id = -1;
            }else{
               hsd.getData(hsd.open_id); 
            }                     
        });

        //保存
        $('#save_yes').unbind().bind('click', function(){
            $('#save_modal').modal('hide');
            $('#data_save').click();                      
        });

        //改变表格名字的modal 按钮的事件处理程序
        $('#data_modal .modal-footer button').unbind().bind('click', function(){

            $('#data_modal').modal('hide');

            var table_name = $('#table_name_save').val();
            hsd.table_name = table_name;
            $('#table_name_save').val('');

            var argu = {};

            if(hsd.modal_flag === 0){
                
            }else if(hsd.modal_flag == 1){                
                //保存新建的表格                
                argu.userId = hsd.user_id;
                argu.fileName = addSuffix(hsd.table_name);
                argu.fileData = hsd.notNull(JSON.parse(JSON.stringify(hsd.hot.getData())));
                argu.fileData = JSON.stringify({ data: argu.fileData});
                $.post('/indexajax/save/', argu, function(data){
                    hsd.new_table = false;
                    $('#message_modal p').text(data.data);
                    $('#message_modal').modal('show');                    
                    $('#table_name').text(hsd.table_name);
                    $('#table_name_star').css('display', 'none');
                    jst.treeRefresh();

                    //打开新的表
                    if(hsd.open_id === undefined){
                        hsd.data = [[]];
                        hsd.createTable(true, 'Untitled.csv');
                        hsd.open_id = -1;
                    }else{
                       hsd.getData(hsd.open_id); 
                    }
                }, 'json');

            }else if(hsd.modal_flag == 2){
                //另存为

                // 获取新的名字
                var file_name = table_name;
                var start = file_name.lastIndexOf('.');
                var type_t = file_name.slice(start, file_name.length);
                if(type_t !== '.csv'){
                    file_name = file_name+'.csv';
                }

                // file tree的表名
                var array_t = [];
                $('#tree_files a').each(function(index, ele){
                    array_t[array_t.length] = $(ele).text();
                })

                // 不重名
                if($.inArray(file_name, array_t) === -1){
                    argu.dataId = hsd.data_id;
                    argu.userId = hsd.user_id;
                    argu.fileName = addSuffix(hsd.table_name);
                    argu.fileData = hsd.notNull(JSON.parse(JSON.stringify(hsd.hot.getData())));
                    argu.fileData = JSON.stringify({ data: argu.fileData});
                    $.post('/indexajax/saveAs/', argu, function(data){
                        $('#message_modal p').text(data.data);
                        $('#message_modal').modal('show');
                        $('#table_name').text(hsd.table_name);
                        jst.treeRefresh();
                    }, 'json');
                }else{
                    //重名
                    $('#message_modal p').text('文件名重复，请修改文件名。');
                    $('#message_modal').modal('show');
                }

            }else{
                console.error('异常 hsd.modal_flag:'+hsd.modal_flag);
            }

            hsd.modal_flag = -1;            
        });        

        //save按钮的事件
        $('#data_save').unbind().bind('click', function(){

            // 保存新建的表
            if(hsd.new_table){
                hsd.modal_flag = 1;
                $('.data_modal .modal-title').text('Save File');
                $('#data_modal').modal();
            }else{
                //保存已有表格
                // #question#没有改动，save，操作失败
                var argu = {};
                argu.dataId = hsd.data_id;
                argu.userId = hsd.user_id;
                argu.fileName = addSuffix(hsd.table_name);
                argu.fileData = hsd.notNull(JSON.parse(JSON.stringify(hsd.hot.getData())));
                argu.fileData = JSON.stringify({ data: argu.fileData});
                $.post('/indexajax/save/', argu, function(data){
                    hsd.modify = false;
                    $('#message_modal p').text(data.data);
                    $('#message_modal').modal('show');
                    $('#table_name_star').css('display', 'none');

                    //打开新的表
                    if(hsd.open_id === undefined){
                        hsd.data = [[]];
                        hsd.createTable(true, 'Untitled.csv');
                        hsd.open_id = -1;
                    }else{
                       hsd.getData(hsd.open_id); 
                    }

                }, 'json');
            }
        });

        //save as按钮的事件
        $('#data_saveas').unbind().bind('click', function(){
            //弹出modal，输入名字
            //#question#:save as的话，star会消失吗？            
            hsd.modal_flag = 2;           
        });        

        //log10
        $('#data_log10').unbind().bind('click', function(){
            hsd.logCal('#data_log10');
        });

        //log2
        $('#data_log2').unbind().bind('click', function(){
            hsd.logCal('#data_log2');
        });

        //√
        $('#data_sqrt').unbind().bind('click', function(){
            hsd.logCal('#data_sqrt');
        });

        //过滤
        $('#data_filter').unbind().bind('click', function(){
            hsd.filter('#data_filter');
        });
    };

    //上传文件类型判断
    //现在还没用
    hsd.checkUploadFileType = function(obj, type){
        if(obj.value){
            var start = obj.value.lastIndexOf('.');
            var type_t = obj.value.slice(start, obj.value.length);
            if(type_t != type){
                $('#upload_file').val('');
                $('#message_modal p').text('请上传CSV文件');
                $('#message_modal').modal('show');
            }
        }        
    };
    
    /*
     * 对数据的大量运算（log，filter），都有两种解决方案：一、web workers在后台运行；二、在当前浏览器运行
     * 把两种解决方案封装为hsd.webWorkersCon，运算的后续操作（save and show）也在hsd.webWorkersCon中执行
     */
    //log运算
    //这里的log不仅仅是log运算，其实指任何运算，如log，sqrt。这些运算的流程都是相同的
    hsd.logCal = function(con){
        //argu有四个属性
        var argu = {};
        //触发过滤的元素
        argu.workers_path = './static/js/workersLog.js';
        argu.callback = hsd.logCalOpe;
        //argu是传给hsd.webWorkersCon的参数；argu.data是传给web workers中参数；argu.data.data是传给web workers的数据
        argu.data = {};
        argu.data.data = hsd.data;
        argu.data.origin_ele = con;

        hsd.webWorkersCon(argu);
    };
    //log运算操作;如果浏览器不支持web workers，就需要在浏览器中进行运算
    hsd.logCalOpe = function(argu){
        var result = [];

        for(var i = 0, l = argu.data.length; i < l; i++){
            for(var j = 0, k = argu.data[i].length; j < k; j++){
                if(argu.origin_ele == '#data_log10'){
                    if(+argu.data[i][j] > 0){
                        argu.data[i][j] = Math.log(argu.data[i][j])/Math.LN10;
                    }
                }else if(argu.origin_ele == '#data_log2'){
                    if(+argu.data[i][j] > 0){
                        argu.data[i][j] = Math.log(argu.data[i][j])/Math.LN2;
                    }
                }else if(argu.origin_ele == '#data_sqrt'){
                    if(+argu.data[i][j] > 0){
                        argu.data[i][j] = Math.sqrt(argu.data[i][j]);
                    }
                }else{
                    console.error('运算事件源有误');
                }
            }
        }

        return argu.data;
    };
    //log运算后，保存和显示操作
    hsd.logSaveShow = function(data){
        //把完整的数据保存在服务器端

        //显示3位小数
        for(var i = 0, l = data.length; i < l; i++){
            for(var j = 0, k = data[i].length; j < k; j++){
                if(data[i][j] !== null && typeof(data[i][j]) == 'number'){
                    data[i][j] = Math.round(data[i][j].toFixed(3)*100)/100;
                }
            }
        }

        return data;
    };
    //过滤
    hsd.filter = function(con){
        //argu有四个属性
        var argu = {};
        //触发过滤的元素
        argu.origin_ele = '#filter';
        argu.workers_path = './static/js/workersLog.js';
        //传给web workers的参数
        argu.data = {};
        argu.data.data = hsd.data;
        argu.data.origin_ele = con;
        argu.data.col = $('#filter_col').val();
        argu.data.compare = $('#filter_compare').val();
        argu.data.limitation =  $('#filter_limitation').val();
        argu.callback = hsd.filterOpe;

        hsd.webWorkersCon(argu);
    };

    //过滤的具体操作;如果浏览器不支持web workers，就需要在浏览器中进行运算
    hsd.filterOpe = function(argu){
        var result = [];
        var filter_compare = argu.compare;
        var filter_limitation = argu.limitation;
        var filter_col = argu.col;

        for(var i = 0, l = argu.data.length; i < l; i++){
            var item = argu.data[i];
            if(filter_compare === 0){
                if(item[filter_col] >= filter_limitation){
                    result.push(item);
                }
            }else{
                if(item[filter_col] <= filter_limitation){
                    result.push(item);
                }
            }
        }

        return result;
    };

    //web workers封装函数
    hsd.webWorkersCon = function(argu){

        //typeof(Worker) !== 'undefined'
        if(typeof(Worker) !== 'undefined'){

            var w = new Worker(argu.workers_path);

            //workers.js通过e.data.data才能取到array
            w.postMessage(argu.data);

            w.onmessage = function(event){

                var data = [];

                if(argu.data.origin_ele == '#data_log10' || argu.data.origin_ele == '#data_log2' || argu.data.origin_ele == '#data_sqrt'){
                    data = hsd.logSaveShow(event.data);
                }else{
                    data = event.data;
                }

                if(data.length === 0){
                    hsd.data = [[]];
                    hsd.new_table = true;
                    hsd.prev_table = true;
                    hsd.hot.updateSettings({
                        data:[[]]
                    });
                    hsd.hot.selectCell(1, 0);
                    hsd.hot.deselectCell(); 
                }else{
                    hsd.data = JSON.parse(JSON.stringify(data));
                    hsd.new_table = false;
                    hsd.prev_table = false;
                    hsd.hot.updateSettings({
                        data:JSON.parse(JSON.stringify(data))
                    });
                    hsd.hot.selectCell(1, 0);
                    hsd.hot.deselectCell(); 
                }

                w.terminate();
            };

            w.onerror = function(event){
                console.error('web workers:'+event.message+'; '+event.lineno+'; '+event.filename);
                w.terminate();
            };

        }else{

            var data = argu.callback(argu.data);

            if(argu.data.origin_ele == '#data_log10' || argu.data.origin_ele == '#data_log2' || argu.data.origin_ele == '#data_sqrt'){
                data = hsd.logSaveShow(data);
            }else{
                data = data;
            }

            if(data.length === 0){
                hsd.data = [[]];
                hsd.new_table = true;
                hsd.prev_table = true;
                hsd.hot.updateSettings({
                    data:[[]]
                });
                hsd.hot.selectCell(1, 0);
                hsd.hot.deselectCell(); 
            }else{
                hsd.data = JSON.parse(JSON.stringify(data));
                hsd.new_table = false;
                hsd.prev_table = false;
                hsd.hot.updateSettings({
                    data:JSON.parse(JSON.stringify(data))
                });
                hsd.hot.selectCell(1, 0);
                hsd.hot.deselectCell(); 
            }            
            
        }
    };

    //去除data中的空行，空列
    hsd.notNull = function(data){
        var result = [];

        //过滤空行
        result = _.filter(data, function(list){
            return !_.every(list, function(item){
                return item === null;
            });
        });

        //过滤空列
        var first_row = _.filter(result[0], function(num){
            return num !== null;
        });        
        result = _.map(result, function(list){            
            list.length = first_row.length;
            return list;
        });

        return result;
    }; 

    //建表
    hsd.createTable = function(new_table, table_name){

        hsd.new_table = new_table;
        // 下次切换时，就可以知道之前的表是 空的 还是 满的
        hsd.prev_table = new_table;
        hsd.table_name = table_name;
        hsd.con.html('');                
        hsd.hot = new Handsontable(hsd.con[0], {
            data: hsd.data,
            rowHeaders: function(index){ 
                        if(index === 0){
                            return '';
                        }else{
                            return index;
                        }                     
                    },
            colHeaders: function(index){

                       if(hsd.data !== [[]] && hsd.data[0][0] === ''){
                           if(index ===0){
                                return '';
                            }else{
                                return String.fromCharCode(index-1+65);
                            }  
                        }else{                            
                            return String.fromCharCode(index+65);                            
                        }                                               
                                             
                    },
            minCols: 20,
            minRows: 50,
            contextMenu: ['row_above', 'row_below', '---------', 'col_left', 'col_right', '---------', 'remove_row', 'remove_col', '---------', 'undo', 'redo', '---------', 'alignment'],
            // contextMenu: true,
            // contextMenuCopyPaste: {
            //     swfPath: '../../static/js/ZeroClipboard.swf'
            // },
            contextMenuCopyPaste: true,
            columnSorting: true,
            manualColumnResize: true,
            fixedRowsTop: 1,
            fixedColumnsLeft: 1,
            sortIndicator: true,
            minSpareRows:1,
            minSpareCols:1,  
            // height:400,
            afterChange: function(array, event_name){
                if((array != null) && event_name != 'loadData' && array[0][2] != +array[0][3]){
                    hsd.modify = true;
                    $('#table_name_star').css('display', 'inline-block');
                }
            },
            cells:function(row, col, prop){
                var cellProperties = {};
                if(row === 0){
                    cellProperties.renderer = firstRenderer;
                }
                
                if(hsd.data !== [[]] && hsd.data[0][0] === ''){
                    if(col === 0){
                        cellProperties.renderer = firstRenderer;
                    }
                }               
                
                return cellProperties;
            }                   
        });

        hsd.data_id = hsd.open_id;
        
        hsd.pageInit(hsd.data);

    };      

    //data tab show的事件处理程序
    $('a[href="#data"]').unbind().bind('shown.bs.tab', function (e) {

        //没有表
        if(hsd.hot === undefined){

            //没有data id：file new;data tab show
            if(hsd.open_id === undefined || hsd.open_id === -1){
                hsd.data = [[]];
                hsd.createTable(true, 'Untitled.csv')
                hsd.open_id = -1;
            }else{
                //有data id
                if(hsd.open){
                    //open 双击
                    hsd.getData(hsd.open_id);
                }else{
                    //data tab 切换
                }                 
            }      

        }else{     //hsd.hot !==undefined
        //有表

            //没有data id:file new;data tab show
            if(hsd.open_id === undefined){
                //是否保存
                if(!hsd.prev_table){
                    //上一个不是新表                    
                    if(hsd.modify){
                        $('#save_modal').modal();
                        $('#save_modal p').text('Save changes to this document?'); 
                    }else{
                        $('#table_name_star').hide();
                        hsd.data = [[]];
                        hsd.createTable(true, 'Untitled.csv');
                        hsd.open_id = -1;
                    }
                }else{
                    //上一个是新表                    
                    $('#save_modal').modal();
                    $('#save_modal p').text('Save changes to this document?');
                }                   
            }else{
                //有data id
                if(hsd.open){
                    //open 双击
                    //是否保存                    
                    if(!hsd.prev_table){                        
                        if(hsd.modify){
                            $('#save_modal').modal();
                            $('#save_modal p').text('Save changes to this document?');
                        }else{
                            $('#table_name_star').hide();
                            hsd.getData(hsd.open_id);
                        }
                    }else{                        
                        $('#save_modal').modal();
                        $('#save_modal p').text('Save changes to this document?');                     
                    }                    
                }else{
                    //data tab 切换
                }
            }

        }        
    });

    //这个函数的结构
    
    // 不是新表
    //     有修改
    //         是否保存
    //     没有修改
    //         new
    // 是新表
    //     是否保存

    // data_new也是按照这个结构

    // file的操作：切换，双击（open），file new，data new
    // data的操作：新表，旧表，旧表修改



    //----------函数结束----------------------

    w.hsd = hsd;

}(window));
