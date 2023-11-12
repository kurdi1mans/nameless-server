const HelperFunctions = require('./HelperFunctions');
const DatabaseSetup = require('./db/DatabaseSetup');

class BackGroundJobsManager
{
	constructor()
	{
		this.runJobs();
	}
	
	runJobs()
	{
		console.info('BackGroundJobsManager.runJobs()');
	}
}

module.exports = new BackGroundJobsManager();