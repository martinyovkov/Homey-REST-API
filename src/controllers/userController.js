const router = require('express').Router();
const authService = require('../services/authService');
const {COOKIE_SESSION_NAME} = require('../../constants');
//const { isAuth } = require('../middlewares/authMiddleware');


router.post('/login', async (req, res)=>{ 
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({status: 400, message: 'Email and pasword are required!'});
    }
    
    try {
        const user = await authService.login(email, password);
        const token = await authService.createToken(user, "user"); 

        res.cookie(COOKIE_SESSION_NAME, token, {httpOnly: true}); 
        res.status(200).json({user});

    } catch (error) {
        res.status(400).json({ status: 400, ...error });
    }


});


router.post('/register', async(req, res)=>{
    const{email, firstName, lastName, password, repeatPassword } = req.body;

   
    if (password!== repeatPassword) {
        return res.status(400).json({ status: 400, message: 'Password mismatch!' })
    }    

    try {
        const user = await authService.create({email, firstName, lastName, password});
        const token = await authService.createToken(user, "user"); 
        res.cookie(COOKIE_SESSION_NAME, token, {httpOnly: true});
        res.json({ status: 200, user });
    } catch (error) { 
        res.status(400).json({ status: 400, ...error });
    }
   
});

router.get('/logout', (req, res)=>{
    res.clearCookie(COOKIE_SESSION_NAME);
    res.status(200).json({ message: 'Logged out!' })
});

router.get('/me', async (req, res) => {
    const token = req.cookies[COOKIE_SESSION_NAME];

    if (!token) {
        return res.status(400).json({ status: 400, message: 'You are not logged in!' })
    }

    try {
        const decodedToken = await authService.VerifyToken(token);
        console.log(decodedToken);
        return res.status(200).json({status: 200,  user: {...decodedToken} })

    } catch (error) {
        res.status(400).json({ status: 400, ...error });
    }
});


module.exports = router;