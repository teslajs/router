# Tesla.js Router
[![NPM version](https://badge.fury.io/js/tesla-router.png)](http://badge.fury.io/js/tesla-router)
[![Dependency Status](https://gemnasium.com/teslajs/router.png)](https://gemnasium.com/teslajs/router)



## About
An MVC style auto-router for [Tesla.js](http://teslajs.com).


## How It Works
This router will attempt to auto-load a controller based on the current URL. If you are using [Tesla.js](http://teslajs.com) it comes ready to go out of the box. If you want to use it as a stand-alone router, see the [installation]([#installation--usage) section below.

Following is a quick walkthrough of how URL's are mapped to controllers.

For example, Going to [http://mysite.com/foo/bar](http://mysite.com/foo/bar) will attempt to load:


#### File Structure
```
app/controllers/foo/barController.js
```

If it fails to find a file there, it will attempt to load:

```
app/controllers/foor/bar/indexController.js

```

If this also fails, the router will assume a more coplex controller and try this:

```
app/controllers/fooController.js
```

if that also fails, it will throw a 404 error.


#### Controller Structure

Generally, with a request like [http://mysite.com/foo/bar](http://mysite.com/foo/bar), your controller file is expected to be formatted one of two ways:

```
module.exports = function(app, req, res) {
	// RENDER YOUR VIEWS HERE
	res.render('foo/bar');
}
```
or

```
exports.bar  = function(app, req, res) {
	// RENDER YOUR VIEWS HERE
	res.render('index');
}

```

Either of these methods are acceptable if you are loading a single view in your controller, and will work with either **app/controllers/foo/barController.js** or **app/controllers/foo/bar/indexController.js**.

If you are loading multiple views, or naming your controller like **app/controllers/fooController.js** (with a CRUD style controller for example), the module.exports format will not work. You will need to follow this format:


```
// responds to http://mysite.com/foo/bar
exports.bar  = function(app, req, res) {
	
	// RENDER YOUR VIEWS HERE
	res.render('foo/bar');
	
};

// responds to http://mysite.com/foo/baz
exports.baz  = function(app, req, res) {

	// RENDER YOUR VIEWS HERE
	res.render('foo/baz');
	
};

```


##### More Examples

A few more quick examples of how URL's will route to controller files:

[http://mysite.com/](http://mysite.com/) will only try:

- **app/controllers/indexController.js**

while [http://mysite.com/login](http://mysite.com/login) will try:

- **app/controllers/loginController.js**
- **app/controllers/login/indexController.js**



and lastly [http://mysite.com/my/name/is/steve](http://mysite.com/my/name/is/steve) will try:

- **app/controllers/my/name/is/steveController.js**
- **app/controllers/my/name/is/steve/indexController.js**
- **app/controllers/my/name/isController.js**





## Installation & Usage
This module is built to work with the [Tesla.js](http://teslajs.com) framework, but will also work as a stand-alone router (though it does require Express 4 at a minimum).

##### Install

```
$ npm install tesla-router
```


##### Usage

All that's required is to require the router after your express app has been created, and pass it the app object:

```
require('tesla-router')(app);
```

Here's a super basic barebones example:

```
var express = require('express'), // GET EXPRESS
    app = module.exports = express(), // DEFINE THE APP
    server = require('http').createServer(app); // CREATE THE SERVER

// IF YOU HAVE ANY CUSTOM ROUTES YOU WANT TO OVERRIDE THE AUT ROUTER WITH
// THEY SHOULD COME FIRST (OPTIONAL)

// INCLUDE AUTO ROUTES
require('tesla-router')(app);

server.listen( 3000 );

// EXPOSE APP
exports = module.exports = app;

```





## ERROR HANDLING

[Tesla.js](http://teslajs.com) includes an error controller to handle any errors. But, if you are using this as a stand-alone, you will need to create the file **app/controllers/errorController.js** with the following methods:


```
// GENERIC ERROR HANDLER
exports.throw = function(app, req, res) {

	if (app.err.status) {

		res.status(app.err.status).render('errors/default', {
			title : app.err.message,
			status: app.err.status,
			site: app.site
		});

	} else {
		res.status(500).render('error', {
			title : app.err,
			status: '500',
			site: app.site
		});
	}

};


// 404 ERROR
exports.throw404 = function(app, req, res) {

	res.status(404).render('errors/404', {
		title : app.err,
		url: req.originalUrl,
		error: app.err,
		site: app.site
	});

};


// 500 ERROR
exports.throw500 = function(app, req, res) {

	res.status(500).render('errors/500', {
		title : app.err.title,
		url: req.originalUrl,
		error: app.err.stack,
		site: app.site
	});

};

```


The file doesn't need to be exactly this, but the router will look for the file **app/controllers/errorController.js** with the throw, throw404 & throw500 methods.