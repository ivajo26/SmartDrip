var homeControllers = require('../controllers/home'),
	homeRouter = function (router) {
		router.get('/', homeControllers)
	}

module.exports = homeRouter;
