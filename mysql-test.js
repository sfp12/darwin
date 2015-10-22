var mysql = require('mysql');  
      
// var TEST_DATABASE = 'darwin';  
// var TEST_TABLE = 'data';  
  
//创建连接  
var client = mysql.createConnection({  
  user: 'root',  
  password: 'root',
  database: 'darwin'  
});  

client.connect(function(err){
  if(err){
    console.error('error connecting:'+err.stack);
    return;
  }

  console.log('connected as id '+connection.threadId);
});

// client.query("use " + TEST_DATABASE);

client.query(  
  'SELECT * FROM '+TEST_TABLE,  
  function selectCb(err, results, fields) {  
    if (err) {  
      throw err;  
    }  
      
      if(results)
      {
          for(var i = 0; i < results.length; i++)
          {
              console.log("%s\t\t%s\t%s", results[i].data_name, results[i].data_id, results[i].user_id);
          }
      }    
    client.end(function(err){
      if(err){
        console.log('error end:'+err.stack);
      }
    });  
  }  
); 