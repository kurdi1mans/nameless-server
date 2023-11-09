const mysql = require("mysql");

class MySQL
{
	constructor()
	{
		this.dbConfig = {
			connectionLimit: 10, // default 10
			host : process.env.DB_URL,
			user : process.env.DB_USER,
			password : process.env.DB_PASSWORD,
			database : process.env.DB_NAME
		};

		this.pool = mysql.createPool(this.dbConfig);
	}

	connection() 
	{
		return new Promise((resolve, reject) => 
		{
			pool.getConnection((err, connection) => 
			{
				if(err)
				{
					reject(err);
				}
				else
				{
					const query = (sql, binding) => 
					{
						return new Promise((resolve, reject) => 
						{
							connection.query(sql, binding, (err, result) => 
							{
								if(err) reject(err);
								resolve(result);
							});
						});
					};
					const release = () => 
					{
						return new Promise((resolve, reject) => 
						{
							if(err) reject(err);
							console.log("MySQL pool released: threadId " + connection.threadId);
							resolve(connection.release());
						});
					};
					resolve({ query, release });
				}
			});
		});
	}
	
	query(sql, binding)
	{
		return new Promise((resolve, reject) => 
		{
			pool.query(sql, binding, (err, result, fields) => 
			{
				if(err)
				{
					reject(err);
				}
				else
				{
					resolve(result);
				}
			});
		});
	}
}


module.exports = new MySQL();