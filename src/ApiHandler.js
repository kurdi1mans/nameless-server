const ULID = require('ulid')
const FunctionalFacade = require('./FunctionalFacade');
const HelperFunctions = require('./HelperFunctions');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const DBAO = require('./db/DBAO');
const MySQL = require('./db/MySQL');

class ApiHandler
{
	constructor(app)
	{
		this.app = app;
		this.setupPublicHandlers();
		this.setupAuthenticatedHandlers();
	}

	// ---------- Setup Handlers for public and authenticated requests
	setupPublicHandlers()
	{
		this.app.post('/login', this.login.bind(this));
		this.app.post('/token', this.generateNewAccessToken.bind(this));
		this.app.delete('/logout',this.deleteRefreshToken.bind(this));
		
	}

	setupAuthenticatedHandlers() // all API calls must pass by the authenticateToken middle-ware function
	{
		this.app.get('/getUserTaskList', this.authenticateToken, this.getUserTaskList); // authenticateToken function is the middleware to verify the token is valid
	}

	// ---------- This is the authentication middle-ware function. It ensures that any request is being done be an authenticated user.
	authenticateToken(req, res, next)
	{
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if(token == null) return res.sendStatus(401); // 401 (Unauthorized): Request must have access token to be authenticated
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if(err) return res.sendStatus(403); // 403 (Forbidden): Authentication failed. Token is either corrupted or expired
			req.user = user;
			next();
		})
	}

	// ---------- Handler Functions
	async login(req, res) // This handler will allow login for a user given the user user credentials
	{

		const username = req.body.username;
		const password = req.body.password;

		const conn = await MySQL.connection();
		
		let db_user = await DBAO.getFullUserRecord(username,conn);
		
		if(db_user.length>0)
		{
			db_user = db_user[0];

			const isMatch = await bcrypt.compare(password,db_user.Password);

			if(isMatch)
			{
				const tokenContent = { user_id:db_user.ID, username: db_user.UserName };
		
				const accessToken = this.generateAccessToken(tokenContent);
				const refreshToken = jwt.sign(tokenContent, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '120s'});
				
				await DBAO.insertUserToken(db_user.ID,refreshToken,conn);

				res.json({ accessToken: accessToken, refreshToken: refreshToken });
			}
			else
			{
				res.sendStatus(401); // 401 (Unauthorized): password is incorrect
			}			
		}
		else
		{
			res.sendStatus(401); // 401 (Unauthorized): username not found
		}

		conn.release();
	}
	
	generateAccessToken(tokenContent) // This function generates an access token (short-lived token).
	{
		const accessToken = jwt.sign(tokenContent, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '60s'})
		return accessToken;
	}

	async generateNewAccessToken(req,res) // This handler generates a new access token (short-lived token) given a refresh token (long-lived token).
	{
		const refreshToken = req.body.token;

		if(refreshToken == null)
		{
			return res.sendStatus(401); // 401 (Unauthorized): Request must have refresh token
		}
		else
		{
			jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
				const conn = await MySQL.connection();

				if(err)
				{
					if(err.name === 'TokenExpiredError')
					{
						await DBAO.deleteToken(refreshToken,conn);
					}

					conn.release();
					return res.sendStatus(403); // 403 (Forbidden): User authentication failed. Token is invalid.
				}
				else
				{
					const userTokens = await DBAO.getUserTokens(user.user_id,conn);
					const result = userTokens.find( item => item.Token === refreshToken); // check if the provided refresh token is in the TokenRegister
					
					if(result===undefined)
					{
						conn.release();
						return res.sendStatus(403); // 403 (Forbidden): Authentication failed. Token is revoked and no longer available in approved token register in database.
					}
					else
					{
						const accessToken = this.generateAccessToken({ user_id:user.user_id, username: user.username });

						conn.release();
						res.json({accessToken: accessToken});
					}
				}	
			});
		}
	}

	deleteRefreshToken(req,res)
	{
		const refreshToken = req.body.token;

		if(refreshToken == null)
		{
			return res.sendStatus(401); // 401 (Unauthorized): Request must have refresh token
		}
		else
		{
			jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {	
				
				const conn = await MySQL.connection();

				if(err)
				{
					if(err.name === 'TokenExpiredError')
					{
						await DBAO.deleteToken(refreshToken,conn);
					}
					
					conn.release();
					return res.sendStatus(403); // 403 (Forbidden): User authentication failed. Token is invalid.
				}
				else
				{
					const userTokens = await DBAO.getUserTokens(user.user_id,conn);
					const result = userTokens.find( item => item.Token === refreshToken); // check if the provided refresh token is in the TokenRegister
					
					if(result===undefined)
					{
						conn.release();
						return res.sendStatus(403); // 403 (Forbidden): Authentication failed. Token is revoked and no longer available in approved token register in database.
					}
					else
					{
						// const accessToken = this.generateAccessToken({ user_id:user.user_id, username: user.username });
	
						await DBAO.deleteToken(refreshToken,conn);
						
						conn.release();
						res.sendStatus(204); // 204 (No Content): Refresh token revoked.
					}
				}
			});
		}
	}

	getUserTaskList(req,res)
	{
		const usersTaskList = [
			{
				task_id:1,
				username:'Fulan.Fulani',
				taskTitle:'Task A'
			},
			{
                task_id:2,
                username:'Fulan.Fulani',
                taskTitle:'Task B'
            },
			{
                task_id:3,
                username:'Fulan.Fulani',
                taskTitle:'Task C'
            },
			{
                task_id:4,
                username:'Ellan.Ellani',
                taskTitle:'Task D'
            },
			{
                task_id:5,
                username:'Ellan.Ellani',
                taskTitle:'Task E'
            },
			{
                task_id:6,
                username:'Ellan.Ellani',
                taskTitle:'Task F'
            },
			{
                task_id:7,
                username:'Ellan.Ellani',
                taskTitle:'Task G'
            }
		];


		const filterdForAuthenticatedUser = usersTaskList.filter(task => task.username === req.user.username)
		res.json(filterdForAuthenticatedUser);
	}
}


module.exports = ApiHandler;