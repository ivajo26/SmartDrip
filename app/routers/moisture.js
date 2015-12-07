var moistureControllers = require('../controllers/moisture'),
	moistureRouter = function (router) {
		router.get('/moistures', moistureControllers)
	}

module.exports = moistureRouter;
