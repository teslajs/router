module.exports = function(app) {

  // AUTO ROUTER
  require(__dirname + '/lib/autoRouter.js')(app);

  // ERROR HANDLER
  require(__dirname + '/lib/errorRouter')(app);

};
