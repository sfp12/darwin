onmessage=function(e){
	var data = e.data.data;

	for(var i = 0, l = data.length; i < l; i++){
		for(var j = 0, k = data[i].length; j < k; j++){
			if(+data[i][j] > 0){
				data[i][j] = Math.log(data[i][j])/Math.LN10;				
			}
		}
	}

	postMessage(data);	
}

