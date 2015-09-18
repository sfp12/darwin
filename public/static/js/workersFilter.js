onmessage=function(e){
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
}

