const HelperFunctions = require('./HelperFunctions')

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