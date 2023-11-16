const MySQL = require("./MySQL.js");
const { DateTime } = require('luxon');
const ULID = require('ulid');
const HF = require('../HelperFunctions.js')

class DBAO
{	
	async getFullUserRecord(username, conn)
	{
		const query = `select * from User where Username = ?`;
		const result = await conn.query(query,[username]);

		return result;
	}

	async insertUserToken(UserID, token, conn)
    {
        const query = `Insert into TokenRegister (UserID,Token,CreationDate) values (?,?,?)`;		
		const nowTimeStamp = HF.jsDateTimeToMySQLDataTime(new Date());

        const result = await conn.query(query,[UserID,token,nowTimeStamp]);

        return result;
    }

	async deleteAllUserTokens(UserID,conn)
	{
		const query = `Delete from TokenRegister where UserID=?`;
        const result = await conn.query(query,[UserID]);

        return result;
	}

	async deleteUserToken(UserID,token,conn)
	{
		const query = `Delete from TokenRegister where UserID=? and Token=?`;
        const result = await conn.query(query,[UserID,token]);

        return result;
	}

	async deleteToken(token,conn)
	{
		const query = `Delete from TokenRegister where Token=?`;
        const result = await conn.query(query,[token]);

        return result;
	}


	async getUserTokens(UserID,conn)
	{
		const query = `Select Token from TokenRegister where UserID=?`;
        const result = await conn.query(query,[UserID]);

        return result;
	}
}

module.exports = new DBAO();