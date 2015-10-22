
 $(function () { 
			 	alert("aaa");
			 	var hsd = {};

				//����
				hsd.con = $('#con');				

				// ----------����ʼ----------------------
				//��ȡ���
				hsd.getData = function(){
					// $.get('json/handsontable.json', function(data){
						hsd.data = data;
						hsd.pageInit(hsd.data);
						hsd.createTable();
						hsd.logCal();
						hsd.filter();
					// });
				}
				//ҳ���ʼ��:���ع��˵�����
				hsd.pageInit = function(data){
					//�����е���Ŀ
					var str = '';
					for(var i=0, l=data[0].length; i<l; i++){
						str += '<option value='+i+'>'+(i+1)+'</option>';
					}
					$('#filter_col').html(str);
					//���رȽϵ������
					str = '';
					str += '<option value='+0+'>����</option>';
					str += '<option value='+1+'>С��</option>';
					$('#filter_compare').html(str);

					//���ҳ��ĸ߶ȣ����������ͱ��ĸ߶�
					$("#con").css('height', $(window).height()+$(document).scrollTop()-90);
					$("#con").css('height', $(window).height()+$(document).scrollTop()-90-100);					
				}
				//����ʼ������
				hsd.createTable = function(){
					hsd.hot = new Handsontable(hsd.con[0], {
						data: JSON.parse(JSON.stringify(hsd.data)),
					    rowHeaders: true,
					    colHeaders: ['SLE', 'Control'],
					    minCols: 20,
					    minRows: 50,
					    contextMenu: true,
					    columnSorting: true,
					    manualColumnResize: true,
					    fixedRowsTop: 1,
    					fixedColumnsLeft: 1,
					 	sortIndicator: true
					});					
				};
				/*
				* ����ݵĴ������㣨log��filter�����������ֽ��������һ��web workers�ں�̨���У������ڵ�ǰ���������
				* �����ֽ��������װΪhsd.webWorkersCon������ĺ��������save and show��Ҳ��hsd.webWorkersCon��ִ��
				*/
				//log����
				hsd.logCal = function(){
					//argu���ĸ�����
					var argu = {};
					//�������˵�Ԫ��
					argu.origin_ele = '#log10';
					argu.workers_path = './js/workersLog.js';
					argu.callback = hsd.logCalOpe;
					//argu�Ǵ���hsd.webWorkersCon�Ĳ���argu.data�Ǵ���web workers�в���argu.data.data�Ǵ���web workers�����
					argu.data = {};
					argu.data.data = hsd.hot.getData();

					hsd.webWorkersCon(argu);					
				}
				//log�������;����������֧��web workers������Ҫ��������н�������
				hsd.logCalOpe = function(argu){
					var result = [];

					for(var i = 0, l = argu.data.length; i < l; i++){
						for(var j = 0, k = argu.data[i].length; j < k; j++){
							if(+argu.data[i][j] > 0){
								argu.data[i][j] = Math.log(argu.data[i][j])/Math.LN10;
							}
						}
					}

					return argu.data;
				}
				//log����󣬱������ʾ����
				hsd.logSaveShow = function(data){
					//���������ݱ����ڷ�������

					//��ʾ3λС��
					for(var i = 0, l = data.length; i < l; i++){
						for(var j = 0, k = data[i].length; j < k; j++){						
								data[i][j] = Math.round(data[i][j].toFixed(3)*100)/100;							
						}
					}

					return data;
				}
				//����
				hsd.filter = function(){
					//argu���ĸ�����
					var argu = {};
					//�������˵�Ԫ��
					argu.origin_ele = '#filter';
					argu.workers_path = './js/workersFilter.js';
					//����web workers�Ĳ���
					argu.data = {};
					argu.data.data = hsd.hot.getData();					
					argu.callback = hsd.filterOpe;

					hsd.webWorkersCon(argu);					
				}
				//���˵ľ������;����������֧��web workers������Ҫ��������н�������
				hsd.filterOpe = function(argu){
					var result = [];
					var filter_compare = argu.compare;
					var filter_limitation = argu.limitation;
					var filter_col = argu.col;

					for(var i = 0, l = argu.data.length; i < l; i++){
						var item = argu.data[i];
						if(filter_compare == 0){
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
				}
				//web workers��װ����
				hsd.webWorkersCon = function(argu){
					//typeof(Worker) !== 'undefined'
					if(typeof(Worker) !== 'undefined'){
						$(argu.origin_ele).on('click', function(){

							if(argu.origin_ele == '#filter'){
								var filter_col = $('#filter_col').val();
								var filter_compare = $('#filter_compare').val();
								var filter_limitation = $('#filter_limitation').val();
								argu.data.col = filter_col;
								argu.data.compare = filter_compare; 
								argu.data.limitation =  filter_limitation;
							}
							
							var w = new Worker(argu.workers_path);
							//workers.jsͨ��e.data.data����ȡ��array							
							w.postMessage(argu.data);
							w.onmessage = function(event){								
								var data = [];

								if(argu.origin_ele == '#log10'){
									data = hsd.logSaveShow(event.data);
								}else{
									data = event.data;
								}

								hsd.hot.updateSettings({
								   data:JSON.parse(JSON.stringify(data))
								});
								
								w.terminate();								
							};
							w.onerror = function(event){
								console.error('web workers:'+event.message+', '+event.lineno+'; '+event.filename);
								w.terminate();							
							};
						});						
					}else{
						console.log('�������֧��web workers');						
						$(argu.origin_ele).on('click', function(){
							if(argu.origin_ele == '#filter'){
								var filter_col = $('#filter_col').val();
								var filter_compare = $('#filter_compare').val();
								var filter_limitation = $('#filter_limitation').val();
								argu.data.col = filter_col;
								argu.data.compare = filter_compare; 
								argu.data.limitation =  filter_limitation;
							}

							var data = argu.callback(argu.data);

							if(argu.origin_ele == '#log10'){
								data = hsd.logSaveShow(data);
							}else{
								data = data;
							}

							hsd.hot.updateSettings({
							   data:JSON.parse(JSON.stringify(data))
							});
						});
					}
				}

				hsd.getData();
				//----------�������----------------------

				w.hsd = hsd; 
				
			});			
		