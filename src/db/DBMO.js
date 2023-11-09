const mysql = require("./mysql.js");

class DBMO
{
	async runSqlCode(sql,conn)
	{	
		let result = await conn.query(sql);
		return result;
	}
	
	async createTableWithIdColumn(tablename,column_def,conn)
	{
		let result = await conn.query(`CREATE TABLE ${tablename} (ID int);`);
		return result;
	}
	
	async addColumnToTable(conn)
	{
		let result = await conn.query(``);
		return result;
	}
	
	async removeColumnFromTable(conn)
	{
		let result = await conn.query(``);
		return result;
	}
	
	async dropTable(tablename,conn)
	{
		let result = await conn.query(`DROP TABLE ${tablename};`);
		return result;
	}
}


module.exports = DBMO