
define([
	"function.common"
	],
	function (func) {
    var action = {
    	client:null,
    	log:null,
    	dbname: '',
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

			
			var values = [param.rateContent,param.userVipLevel,param.fromOnePai,param.tradeId,param.fromMall,param.displayUserNick,param.type,param.id,param.feedAppendedDO,
		param.b2CSeller,param.auctionTitle,param.reply,param.rateResult,param.displayUserLink,param.dispalyRateLevel2,param.displayUserNumId,param.fromVirtualHurling,
		param.auctionLink,param.dispalyRateLevel1,param.auctionSku,param.rateDate,param.gapDates,param.auctionPrice,param.ratedUserNumId,param.dispalyRateSum,
		param.displayUserSeller,param.aliMallSeller,param.validScore,param.fromB2cMapping,param.anony];

			client.query('INSERT INTO '+_this.dbname+' SET rateContent=?,userVipLevel=?,fromOnePai=?,tradeId=?,fromMall=?,displayUserNick=?,type=?,id=?,feedAppendedDO=?,\
		b2CSeller=?,auctionTitle=?,reply=?,rateResult=?,displayUserLink=?,dispalyRateLevel2=?,displayUserNumId=?,fromVirtualHurling=?,\
		auctionLink=?,dispalyRateLevel1=?,auctionSku=?,rateDate=?,gapDates=?,auctionPrice=?,ratedUserNumId=?,dispalyRateSum=?,\
		displayUserSeller=?,aliMallSeller=?,validScore=?,fromB2cMapping=?,anony=?',values,
	
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
						process.stdout.write(buf.toString() + "\n");
						/*
						var data = JSON.parse(buf.toString());
						process.stdout.write(data.rateList.currentPageNum + "\n");
						for(var i =0,n=data.rateList.rateListDetail.length;i<n;i++)
						{
							var date_str2 = data.rateList.rateListDetail[i].rateDate;
							if(1 || func.time_compare(date_str1,date_str2))
							{
								_this.ClientReady(_this.client,data.rateList.rateListDetail[i]);
							}else
							{
								process.stdout.write(date_str2+">pass\n");
							}
						}*/
					}catch(err)
					{
						_this.ClientError(_this.client,buf.toString());
						process.stdout.write(err.description + "\n");
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
				var param = ['rateContent','userVipLevel','fromOnePai','tradeId','fromMall','displayUserNick','type','id','feedAppendedDO',
				'b2CSeller','auctionTitle','reply','rateResult','displayUserLink','dispalyRateLevel2','displayUserNumId','fromVirtualHurling',
				'auctionLink','dispalyRateLevel1','auctionSku','rateDate','gapDates','auctionPrice','ratedUserNumId','dispalyRateSum',
				'displayUserSeller','aliMallSeller','validScore','fromB2cMapping','anony'];
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
