var temperatureControllers = require('../controllers/temperature'),
	temperatureRouter = function (router) {
		router.get('/temperatures', temperatureControllers)
	}

module.exports = temperatureRouter;
