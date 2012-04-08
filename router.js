// Filename: router.js
define([
	'actions/test',
	'actions/taobao/comment',
	'actions/weibo/feed',
	'actions/personal/feed'
	], function (testAction,taobaoCommentAction,weiboFeedAction,personalAction) {

	var fs = require('fs');
	//配置数据库
	var DB = require('mysql');
	var client = DB.createClient();
	client.user = 'root';
	client.password = '123456';

	//日志文件
	var log = fs.createWriteStream('log.txt', {'flags': 'a'});
/*
	//连接数据库 
	client.connect(function(error, results) {
	  	if(error) {
			console.log('Connection Error: ' + error.message);
			return;
	  	}
		console.log('Connected to MySQL');
	  	ClientConnectionReady(client);
	});
*/
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
	ClientConnectionReady(client);
	
	var actions = function(options) {

		switch(options[0])
		{
			case 'test':
				testAction.initialize(client,log,options[2]);
				testAction.listening(options[1]);
				break;
			case 'taobao_comment':
				taobaoCommentAction.initialize(client,log,options[2]);
				taobaoCommentAction.listening(options[1]);
				break;
			case 'taobao_db_replace':
				taobaoCommentAction.initialize(client,log,options[2]);
				taobaoCommentAction.handle_db_replace();
				break;
			case 'weibo_feed':
				weiboFeedAction.initialize(client,log,options[2]);
				weiboFeedAction.listening(options[1]);
				break;
			case 'weibo_db_replace':
				weiboFeedAction.initialize(client,log,options[2]);
				weiboFeedAction.handle_db_replace();
				break;
			case 'personal_feed':
				personalAction.initialize(client,log,options[2]);
				personalAction.listening(options[1]);
		}
	}
	
    var initialize = function () {
    		var args = process.argv.splice(2);
    		if(args.length > 2)
    		{
				actions(args);
			}else
			{
				console.log("error args");
				process.exit();
			}
			//console.log(optionModel.defaults);
        };	
    return {
        initialize: initialize
    };
});
