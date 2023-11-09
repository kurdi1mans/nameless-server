const jwt = require('jsonwebtoken');
const express = require('express');
const ApiHandler = require('./ApiHandler');

class Server
{
	constructor()
	{
		this.app = express();
		this.app.use(express.json());

		this.apiHandler = new ApiHandler(this.app);
		
		this.server = this.app.listen(process.env.PORT);
		console.log(`Server listening on port ${process.env.PORT}`);
	}
}

module.exports = new Server();