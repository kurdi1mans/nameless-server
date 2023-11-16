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
			this.pool.getConnection((err, connection) => 
			{
				if(err)
				{
					reject(err);
				}
				else
				{
					console.log(`MySQL pool threadId#${connection.threadId}: connected`);
					const query = (sql, binding) => 
					{
						return new Promise((resolve, reject) => 
						{
							connection.query(sql, binding, (err, result) => 
							{
								if(err)
								{
									reject(err);
								}
								else
								{
									// console.log(`MySQL pool threadId#${connection.threadId}: query executed`);
									resolve(result);
								}
							});
						});
					};
					const release = () => 
					{
						return new Promise((resolve, reject) => 
						{
							if(err) reject(err);
							console.log(`MySQL pool threadId#${connection.threadId}: released`);
							resolve(connection.release());
						});
					};
					resolve({ query, release });
				}
			});
		});
	}
}


module.exports = new MySQL();