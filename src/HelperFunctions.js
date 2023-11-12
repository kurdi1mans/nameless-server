const luxon = require('luxon');

class HelperFunctions
{
    constructor()
    {
        
    }
    
    async delay(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    logUsedMemory()
    {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`Approximately ${Math.round(used * 100) / 100} MB is in use.`);    
    }

    jsDateToString(date)
    {
        return luxon.DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    }

    jsDateTimeToString(datetime)
    {
        return luxon.DateTime.fromJSDate(datetime).toFormat('yyyy-MM-dd hh:mm:ss');
    }

    jsDateTimeToMySQLDataTime(datetime)
    {
        return datetime.toISOString().slice(0, 19).replace('T', ' ');
    }

    DbDateTimeToString(datetime)
    {
        return luxon.DateTime.fromJSDate(datetime).toFormat('yyyy-MM-dd hh:mm:ss')
    }
}

module.exports = new HelperFunctions();