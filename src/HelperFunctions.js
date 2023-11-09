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
}

module.exports = new HelperFunctions();