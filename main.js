//node main.js taobao_comment 5555 test.test

var requirejs = require('requirejs');

requirejs.config({
	nodeRequire: require

});

requirejs([

	// Load our app module and pass it to our definition function
	'app'

	// Some plugins have to be loaded in order due to their non AMD compliance
	// Because these scripts are not "modules" they do not pass any values to the definition function below
	], function (App) {
    // The "app" dependency is passed in as "App"
    // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
    App.initialize();
});
