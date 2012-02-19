define(
	function () {
	var func =	{
			getMyDate: function()
			{
				var fillZero = this.fillZero;
				var myDate = new Date();
				var cDate = myDate.getFullYear() + '-' + fillZero(myDate.getMonth() + 1) + '-' + fillZero(myDate.getDate()) + ' ' + fillZero(myDate.getHours()) + ':' + fillZero(myDate.getMinutes()) + ':' + fillZero(myDate.getSeconds());
				return cDate;
			},
			fillZero: function (v){
				if(v<10){v='0'+v;}
				return v;
			},

			time_compare: function(date_str1,date_str2)
			{
				var time_stamp1 = Date.parse(date_str1.replace(/\./g,"/"));
				var time_stamp2 = Date.parse(date_str2.replace(/\./g,"/"));
				return time_stamp1>time_stamp2
			}
		};
	return func;
});
