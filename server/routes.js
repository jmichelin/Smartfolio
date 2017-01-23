var uController = require('./controllers/userController.js');
var iController = require('./controllers/imgController.js');
var helper = require('./authenticator');

module.exports = function (app, express) {
  app.post('/signin', uController.signin);
  app.post('/register', uController.register);
  app.get('/photos',helper.decode, iController.fetch);
  app.post('/upload/photos',helper.decode, iController.upload);

  app.use(helper.errorLogger);
  ap.use(helper.errorHandler);
}
