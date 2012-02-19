var fs = require('fs');
//配置数据库
var DB = require('mysql').Client;
var client = new DB();
client.user = 'root';
client.password = '123456';

//日志文件
var log = fs.createWriteStream('log.txt', {'flags': 'a'});

//连接数据库 
client.connect(function(error, results) {
  	if(error) {
    	console.log('Connection Error: ' + error.message);
    	return;
  	}
	console.log('Connected to MySQL');
  	ClientConnectionReady(client);
});

//打开函数
ClientConnectionReady = function(client)
{
	client.query('SET names "utf8"',
		function(error,results){
			if(error){
				console.log('ClientConnectionReady Error:' + error.message);
				client.end();
				return;
			}			
	});
	console.log('init...');
}

ClientReady = function(client,param)
{
	if(typeof param == 'object')
	{
		for(var p in param){
			if(typeof param[p] == 'string')
				param[p] = param[p].replace(/[']/g,"&acute;");
			param[p] = '"'+param[p]+'"';
		}
	}
	var values = param;
	client.query('INSERT INTO test.jobs SET jobname=?,joburl=?,coname=?,address=?,cdate=?,fromurl=?',values,
	
		function(error,results){
			if(error){
				console.log("ClientReady Error:" + error.message);
				client.end();
				return;
			}
			log.write(getMyDate() + "	Id inserted:"+results.insertId+'\n');
	});
}

ClientError = function(client,content)
{

	if(typeof content == 'string')
		content = content.replace(/[']/g,"\'");
	else
		return;

	var values = [content];
	client.query('INSERT INTO test.error SET content=?',values,
		function(error,results){
			if(error){
				console.log("ClientReady Error:" + error.message);
				client.end();
				return;
			}
			log.write(getMyDate() + "	Error Id inserted:"+results.insertId+'\n');
	});
}

//配置pull端
var context = require('zeromq'),
    receiver = context.createSocket('pull');

var date_str1 = '2011.07.20 19:59:41';
//handle_db_replace(client);
receiver.on('message', function (buf) {
    // do the work
    // not a great node sample for zeromq,
    setTimeout(function () {
        // simple progress indicator for the viewer
		try
		{		    
		    //ClientReady(client,JSON.parse(buf.toString()));
		    var data = JSON.parse(buf.toString());
		    for(var i =0,n=data.length;i<n;i++)
		    {
		    	ClientReady(client,data[i]);
		    }
        }catch(err)
        {
        	ClientError(client,buf.toString());
        	process.stdout.write(err.description + "\n");
        }
    }, 5);
})

receiver.connect('tcp://localhost:5555');

process.on('SIGINT', function () {
    receiver.close();
    process.exit();
})


getMyDate = function()
{
	var myDate = new Date();
	var cDate = myDate.getFullYear() + '-' + fillZero(myDate.getMonth() + 1) + '-' + fillZero(myDate.getDate()) + ' ' + fillZero(myDate.getHours()) + ':' + fillZero(myDate.getMinutes()) + ':' + fillZero(myDate.getSeconds());
	return cDate;
}
fillZero = function (v){
	if(v<10){v='0'+v;}
	return v;
}

time_compare = function(date_str1,date_str2)
{
	var time_stamp1 = Date.parse(date_str1.replace(/\./g,"/"));
	var time_stamp2 = Date.parse(date_str2.replace(/\./g,"/"));
	return time_stamp1>time_stamp2
}

function handle_db_replace(client)
{
        var param = ['jobname','joburl','coname','address','cdate','fromurl'];
        var str = [];
        var content = 'UPDATE test.jobs  SET ';
        for(var i=0,n=param.length;i<n;i++)
        {
	        str[str.length] = param[i]+'=REPLACE('+param[i]+',\'"\',"")'
        }
        content += str.join(',');
        db_exec(client,content);
        //console.log(content);
}


function db_exec(client,sql)
{
	client.query(sql,
		function(error,results){
			if(error){
				console.log('exec Error:' + error.message);
				client.end();
				return;
			}		
                        console.log('exec ok!');
	});
}
