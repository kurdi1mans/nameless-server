const MySQL = require('./MySQL');
const ULID = require('ulid');
const HF = require('../HelperFunctions');

class DatabaseSetup
{
	constructor()
	{
		this.runall();
	}

	async runall()
	{
		await this.createDatabaseDDLTracker();
		await this.createUserTable();
		await this.createTokenRegisterTable();
		await this.createIndexForUserID();
		await this.createTokenRegisterUserReference();
	}


	//----------- Log database operation in DDL Log
	async insertOperationInfo(OperationID, OperationName, OperationDescription)
	{
		const conn = await MySQL.connection();
		
		const nowTimeStamp = HF.jsDateTimeToMySQLDataTime(new Date());

		const insertOperationQueryText = `insert into DDLTracker (ID, Date, Name, Description) values (?,?,?,?)`;
		const insertOperationQueryResult = await conn.query(insertOperationQueryText,[OperationID,nowTimeStamp,OperationName,OperationDescription]);
		
		console.log('Executed',OperationID,nowTimeStamp,OperationName,OperationDescription);

		conn.release();
	}

	async checkIfOperationDone(OperationID)
	{
		const conn = await MySQL.connection();
		try
		{
			const selectOperationQueryText = `select * from DDLTracker where ID=?`;
			const selectOperationQueryResult = await conn.query(selectOperationQueryText,[OperationID]);
	
			if(selectOperationQueryResult.length>0)
			{
				let operation = selectOperationQueryResult[0];
				operation.Date = HF.DbDateTimeToString(operation.Date);

				console.log('Skipped',operation.ID,operation.Date,operation.Name,operation.Description);

				return true;
			}
			else return false;
		}
		catch(e)
		{
			if(e.code==='ER_NO_SUCH_TABLE' && e.sqlMessage ==="Table 'PlatformDBSchema.DDLTracker' doesn't exist")
			{
				return false; // Table DDLTracker not created yet. Return false
			}
		}
		finally
		{
			conn.release();
		}
	}
	//-----------

	async createDatabaseDDLTracker()
	{
		const operationDone = await this.checkIfOperationDone('01HF1HT2D0TEZE38QY23F9ZV73');
		
		if(!operationDone)
		{
			const conn = await MySQL.connection();
			const createDDLTrackerQueryText = `CREATE TABLE DDLTracker (
				ID varchar(255),
				Date DATETIME,
				Name varchar(255),
				Description varchar(500)
			);`;
	
			const createDDLTrackerQueryResult = await conn.query(createDDLTrackerQueryText);
	
			this.insertOperationInfo('01HF1HT2D0TEZE38QY23F9ZV73','createDatabaseDDLTracker','This table will track the DDL operations that were successfully conducted on the database.');
	
			conn.release();	
		}
	}

	async createUserTable()
	{
		const operationDone = await this.checkIfOperationDone('01HF1S2XH01YSP31P6MQES4MJ4');
		
		if(!operationDone)
		{
			const conn = await MySQL.connection();
			const createUserQueryText = `CREATE TABLE User (
				ID varchar(255),
				FirstName varchar(255),
				LastName varchar(255),
				UserName varchar(255),
				Password varchar(255),
				Email varchar(255),
				Phone varchar(20),
				Status varchar(255)
			);`;
	
			const createUserQueryResult = await conn.query(createUserQueryText);	

			this.insertOperationInfo('01HF1S2XH01YSP31P6MQES4MJ4','createUserTable','Table to track user info such as username, password, first name, last name, and contact info');

			conn.release();
		}
		
	}

	async createTokenRegisterTable()
	{
		const operationDone = await this.checkIfOperationDone('01HF1TJ7ST6GCHRGWY9KV34YG4');
		
		if(!operationDone)
		{
			const conn = await MySQL.connection();
			const createTokenRegisterQueryText = `CREATE TABLE TokenRegister (
				UserID varchar(255),
				Token varchar(255)
			);`;
	
			const createTokenRegisterQueryResult = await conn.query(createTokenRegisterQueryText);	

			this.insertOperationInfo('01HF1TJ7ST6GCHRGWY9KV34YG4','createTokenRegisterTable','The TokenRegiser is used to track active refresh token for the users. Removing the refresh tokens from this table will force log out for the user.');

			conn.release();
		}
	}

	async createIndexForUserID()
	{
		const operationDone = await this.checkIfOperationDone('01HF1VCGPQ7C21EA37TK0HCJ6W');
		
		if(!operationDone)
		{
			const conn = await MySQL.connection();
			const queryText = `ALTER TABLE User
			ADD PRIMARY KEY (ID);`;
	
			const queryResult = await conn.query(queryText);	

			this.insertOperationInfo('01HF1VCGPQ7C21EA37TK0HCJ6W','createIndexForUserID','Create index for User.ID as a primary key');

			conn.release();
		}
	}

	async createTokenRegisterUserReference()
	{
		const operationDone = await this.checkIfOperationDone('01HF1TX4PC7Y3M9NX4YGK1D5MG');
		
		if(!operationDone)
		{
			const conn = await MySQL.connection();
			const queryText = `ALTER TABLE TokenRegister
			ADD CONSTRAINT FK_UserID
			FOREIGN KEY (UserID) REFERENCES User(ID)
			ON DELETE RESTRICT
			ON UPDATE CASCADE;`;
	
			const queryResult = await conn.query(queryText);	

			this.insertOperationInfo('01HF1TX4PC7Y3M9NX4YGK1D5MG','createTokenRegisterUserReference','Links TokenRegister.UserID to User.ID');

			conn.release();
		}
	}

	async insertInitialUsers()
	{
		const operationDone = await this.checkIfOperationDone('01HF1VJDWQ7Z38VGN409W78MAC');
		
		if(!operationDone)
		{
			const conn = await MySQL.connection();
			const queryText = `ALTER TABLE TokenRegister
			ADD CONSTRAINT FK_UserID
			FOREIGN KEY (UserID) REFERENCES User(ID)
			ON DELETE RESTRICT
			ON UPDATE CASCADE;`;
	
			const queryResult = await conn.query(queryText);	

			this.insertOperationInfo('01HF1VJDWQ7Z38VGN409W78MAC','insertInitialUsers','Insert some initial users for testing');

			conn.release();
		}
	}

}

module.exports = new DatabaseSetup();