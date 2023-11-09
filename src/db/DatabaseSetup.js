class DatabaseSetup
{
    constructor()
    {
        runall();
    }

    runall()
    {
        this.createTableOfDatabaseModelOperations();
        this.createUserTables();
        this.createTableforTokens();
        this.addStatusFlagColumnToUserTable();
        this.removeAddresscolumnFromUserTable();
    }

    createTableOfDatabaseModelOperations()
    {
        // check if operation was performed successfully before. If done before, skip
    }

    createUserTables()
    {
        // check if table user is created
        // if not, create table for users and add the necessary columns
    }

    createTableforTokens()
    {
        // check if table for tokens is created
        // if not, create the table
    }

    addStatusFlagColumnToUserTable()
    {
        // check if user table has status column
        // if not add the new column and fill with default values
    }

    removeAddresscolumnFromUserTable()
    {
        // check if address column is still in user table
        // if you find it, drop it
    }
}

module.exports = DatabaseSetup;