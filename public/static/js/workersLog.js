onmessage=function(e){
	//过滤运算
	if(e.data.origin_ele == '#data_filter'){
		var data=e.data.data;
		var col = e.data.col;
		var compare = e.data.compare;
		var limitation = e.data.limitation;
		var result = [];

		for(var i = 0, l = data.length; i < l; i++){
			var item = data[i];
			if(compare == 0){
				if(item[col] >= limitation){
					result.push(item);
				}
			}else{
				if(item[col] <= limitation){
					result.push(item);
				}
			}
		}

		postMessage(result);
		
	}else{
	//log运算
		var data = e.data.data;

		for(var i = 0, l = data.length; i < l; i++){
			for(var j = 0, k = data[i].length; j < k; j++){

				if(e.data.origin_ele == '#data_log10'){
					if(+data[i][j] > 0){
						data[i][j] = Math.log(data[i][j])/Math.LN10;				
					}
				}else if(e.data.origin_ele == '#data_log2'){
					if(+data[i][j] > 0){
						data[i][j] = Math.log(data[i][j])/Math.LN2;				
					}
				}else if(e.data.origin_ele == '#data_sqrt'){
					if(+data[i][j] > 0){
						data[i][j] = Math.sqrt(data[i][j]);				
					}
				}else{
					console.error('运算事件源有误');
				}
				
			}
		}

		postMessage(data);
	}		
}

