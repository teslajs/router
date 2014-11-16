module.exports = function (app) {

  app.get('*', function(req, res, next){

    var err = new Error( '404 Not Found' );
        err.code = 404;
        err.message = '404 Not Found';
        err.status = 404;

    next( err );
  });

  app.use(function(err, req, res, next){

    var root = require('path').dirname(require.main.filename);

    app.err = err;

    // SPECIAL VIEW FOR 404
    if ( err.status && err.status === 404 || err.code === 'MODULE_NOT_FOUND' ) {
      require(root + '/app/controllers/' + 'errorController').throw404(app, req, res);
    } else if ( err.status ) {
      require(root + '/app/controllers/' + 'errorController').throw(app, req, res);
    } else {
      app.err.status = 500;
      app.err.message = err;
      app.err.title = '500 Internal Server Error';
      require(root + '/app/controllers/' + 'errorController').throw500(app, req, res);
    }

  });

};
