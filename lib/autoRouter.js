module.exports = function(app, next) {

	app.use(function(req, res, next) {

		var action, ctrl, log, output,
				fs 		= require('fs'),
				path	= require('path'),
				uri		= require(__dirname + '/utility')(app, req), // INCLIUDE URI UTILITIES
				dir		= path.dirname(require.main.filename) + '/app/controllers/', // SET CONTROLLER DIRECTORY
				file	= uri.full(), // SET INITIAL FILE NAME
				found = false,
				forbidIndex = false;

		if (file.substr(-1) === '/') file = file.substr(0, file.length - 1); // REMOVE TRAILING SLASH
		if (file.substr(1) === '/') file = file.substring(1); // REMOVE LEADING SLASH
		if (file === '') file = 'index'; // IF FILE IS EMPTY, CALL IT INDEX

		action = file.split('/').pop(); // SAVE ACTION FOR LATER


		// START BY ASSUMING LAST URI PARAM IS CONTROLLER NAME

		// TRY: controllers/path/to/fileController.js
		if (fs.existsSync(dir + file + 'Controller.js')) {


			found = true; // TELL THE SCRIPT A CONTROLLER WAS FOUND
			ctrl = dir + file + 'Controller.js'; // TELL WHAT CONTROLLER WAS FOUND

			// TRY: controllers/path/to/file/indexController.js
		} else if (fs.existsSync(dir + file + '/indexController.js')) {


			found = true; // TELL THE SCRIPT A CONTROLLER WAS FOUND
			ctrl = dir + file + '/indexController.js'; // TELL WHAT CONTROLLER WAS FOUND

			// IF FIRST ASSUMPTION FAILS, ASSUME 2ND TO LAST PARAM IS CONTROLLER & LAST PARAM IS ACTION
		} else {

			output = file.split('/');
			action = file.split('/').pop();
			output = output.splice(0, output.length - 1).join('/');


			// TRY: controllers/path/to/fileController.js
			if (fs.existsSync(dir + output + 'Controller.js')) {
				found = true; // TELL THE SCRIPT A CONTROLLER WAS FOUND
				ctrl = dir + output + 'Controller.js'; // TELL WHAT CONTROLLER WAS FOUND
				file = output;

				// TRY: controllers/path/to/file/indexController.js
			} else if (fs.existsSync(dir + output + '/indexController.js')) {
				found = true; // TELL THE SCRIPT A CONTROLLER WAS FOUND
				ctrl = dir + output + '/indexController.js'; // TELL WHAT CONTROLLER WAS FOUND
				file = output;
				forbidIndex = true; // REQUIRE foo/bar/indexController TO CALL baz.exports() WHEN URL IS foo/bar/baz
			}

		}


		// IF URI ASSUMPTIONS WERE CORRECT, TRY AND LOAD CONTROLLER
		if (found === true) {

			if (action === file) action = 'index'; // SET ACTION TO INDEX IF EMPTY

			var controller = require(ctrl); // REQUIRE OUR CONTROLLER FILE

			// FIRST, LOOK FOR EXPORTS.ACTION
			if (typeof controller[action] === 'function') {
				controller[action](app, req, res); // CALL THE RIGHT FUNCTION IN CONTROLLER
				// NEXT, LOOK FOR RES.RENDER(ACTION)
			} else if (typeof controller === 'function') {

				if ( forbidIndex === false) {
					controller(app, req, res); // CALL DEFAULT FUNCTION IN CONTROLLER
				} else {
					var err = new Error(500);
					err.code = 500;
					err.message = 'Controller Error!';
					err.stack = 'Error in controller: ' + ctrl + '\n\n';
					err.stack = err.stack + 'File was found, but was not properly formatted and could not be loaded. Expected to find:\n\n';
					err.stack = err.stack + 'exports.' + action + '  = function(app, req, res) {\n';
					err.stack = err.stack + '  res.render(\'index\');\n';
					err.stack = err.stack + '}\n\n';
					err.stack = err.stack + 'or\n\n';
					err.stack = err.stack + 'module.exports = function(app, req, res) {\n';
					err.stack = err.stack + '  res.render(\'' + action + '\');\n';
					err.stack = err.stack + '}\n';
					next(err);
				}

				// LAST, THROW A 500 ERROR IF WE CAN'T FIGURE OUT HOW TO USE CONTROLLER
			} else {
				var err = new Error(500);
				err.code = 500;
				err.message = 'Controller Error!';
				err.stack = 'Error in controller: ' + ctrl + '\n\n';
				err.stack = err.stack + 'File was found, but was not properly formatted and could not be loaded. Expected to find:\n\n';
				err.stack = err.stack + 'exports.' + action + '  = function(app, req, res) {\n';
				err.stack = err.stack + '  res.render(\'index\');\n';
				err.stack = err.stack + '}\n\n';
				err.stack = err.stack + 'or\n\n';
				err.stack = err.stack + 'module.exports = function(app, req, res) {\n';
				err.stack = err.stack + '  res.render(\'' + action + '\');\n';
				err.stack = err.stack + '}\n';
				next(err);
			}

			// IF URI ASSUMPTIONS WERE FALSE AND CONTROLLER FILE CANNOT BE NOT FOUND, THROW A 404
		} else {
			next();
		}

	});

};
