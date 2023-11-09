const ULID = require('ulid')
const FunctionalFacade = require('./FunctionalFacade');
const HelperFunctions = require('./HelperFunctions');
const jwt = require('jsonwebtoken');

class ApiHandler
{
	constructor(app)
	{
		this.app = app;
		this.setupPublicHandlers();
		this.setupAuthenticatedHandlers();

		this.refreshTokens = [];
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
		this.app.get('/getUserTaskList', this.authenticateToken, this.getUserTaskList);
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
	login(req, res) // This handler will allow login for a user given the user user credentials
	{
		const username = req.body.username;
		//hash the password and ensure the user is who he claims to be

		const user = { username: username };
		
		const accessToken = this.generateAccessToken(user);
		const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '120s'});
		this.refreshTokens.push(refreshToken);
		res.json({ accessToken: accessToken, refreshToken: refreshToken });
	}
	
	generateAccessToken(user) // This function generates an access token (short-lived token).
	{
		const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '60s'})
		return accessToken;
	}

	generateNewAccessToken(req,res) // This handler generates a new access token (short-lived token) given a refresh token (long-lived token).
	{
		const refreshToken = req.body.token;
		if(refreshToken == null) return res.sendStatus(401); // 401 (Unauthorized): Request must have refresh token
		if(!this.refreshTokens.includes(refreshToken)) return res.sendStatus(403); // 403 (Forbidden): Authentication failed. Token is revoked.
		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
			if(err) return res.sendStatus(403); // 403 (Forbidden): User authentication failed
			const accessToken = this.generateAccessToken({ username: user.username });
			res.json({accessToken: accessToken});
		});
	}

	deleteRefreshToken(req,res)
	{
		this.refreshTokens = this.refreshTokens.filter(token => token!==req.body.token);
		res.sendStatus(204); // 204 (No Content): Refresh token revoked.
	}

	getUserTaskList(req,res)
	{
		const usersTaskList = [
			{
				task_id:1,
				username:'user1',
				taskTitle:'Task A'
			},
			{
                task_id:2,
                username:'user1',
                taskTitle:'Task B'
            },
			{
                task_id:3,
                username:'user1',
                taskTitle:'Task C'
            },
			{
                task_id:4,
                username:'user2',
                taskTitle:'Task D'
            },
			{
                task_id:5,
                username:'user2',
                taskTitle:'Task E'
            },
			{
                task_id:6,
                username:'user2',
                taskTitle:'Task F'
            },
			{
                task_id:7,
                username:'user2',
                taskTitle:'Task G'
            }
		];


		const filterdForAuthenticatedUser = usersTaskList.filter(task => task.username === req.user.username)
		res.json(filterdForAuthenticatedUser);
	}
}


module.exports = ApiHandler;