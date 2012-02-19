
define([
	"function.common"
	],
	function (func) {
    var action = {
    	client:null,
    	log:null,
    	dbname: '',
    	page: 1,
        initialize: function (client,log,dbname) {
			this.client = client;
			this.log = log;
			this.dbname =dbname;
        },
        ClientReady: function(client,param)
		{
			_this = this;
			if(typeof param == 'object')
			{
				for(var p in param){
					if(typeof param[p] == 'string')
						param[p] = param[p].replace(/[']/g,"\'");
					param[p] = '"'+param[p]+'"';
				}
			}
			var values = [param.postid,param.ori_content,param.content,param.cdate,param.from_url,param.from_custom,param.retwitter_num,param.comment_num,param.userid,param.username];


			client.query('INSERT INTO '+_this.dbname+' SET postid=?,ori_content=?,content=?,cdate=?,from_url=?,from_custom=?,retwitter_num=?,comment_num=?,userid=?,username=?',values,
	
				function(error,results){
					if(error){
						console.log("ClientReady Error:" + error.message);
						client.end();
						return;
					}
					_this.log.write(func.getMyDate() + "	Id inserted:"+results.insertId+'\n');
			});
		},

		ClientError: function(client,content)
		{
			_this = this;
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
					_this.log.write(func.getMyDate() + "	Error Id inserted:"+results.insertId+'\n');
			});
		},
        listening: function(port)
		{
			//console.log(this.dbname);
			//配置pull端
			var context = require('zeromq'),
				receiver = context.createSocket('pull');
			_this = this;
			var date_str1 = '2011.03.17 12:14:00';
			receiver.on('message', function (buf) {
				// do the work
				// not a great node sample for zeromq,
				setTimeout(function () {
					// simple progress indicator for the viewer
					try
					{						
						//ClientReady(client,JSON.parse(buf.toString()));
						
						console.log(_this.page++);
						var data = JSON.parse(buf.toString());

						for(var i =0,n=data.length;i<n;i++)
						{
							var date_str2 = '';
							if(1 || func.time_compare(date_str1,date_str2))
							{								
								_this.ClientReady(_this.client,data[i]);
							}else
							{
								process.stdout.write(date_str2+">pass\n");
							}
						}
					}catch(err)
					{
						_this.ClientError(_this.client,buf.toString());
						console.log(err.description + "\n");
					}
				}, 5);
			})

			receiver.connect('tcp://localhost:'+port);

			process.on('SIGINT', function () {
				receiver.close();
				process.exit();
			});
		},
		handle_db_replace: function()
		{
				var param = ["postid","ori_content","content","cdate","from_url","from_custom","retwitter_num","comment_num","userid","username"];
				var str = [];
				var content = 'UPDATE '+this.dbname+'  SET ';
				for(var i=0,n=param.length;i<n;i++)
				{
					str[str.length] = param[i]+'=REPLACE('+param[i]+',\'"\',"")'
				}
				content += str.join(',');
				this.db_exec(this.client,content);
				//console.log(content);
		},


		db_exec: function(client,sql)
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
    };
    return action;
});
