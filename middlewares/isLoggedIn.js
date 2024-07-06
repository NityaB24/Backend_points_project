const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');

module.exports.isLoggedin = async(req,res,next)=>{
    if(!req.cookies.token){
        req.flash("error","You need to login first");
        return res.redirect("/");
    }
    try{
        let decoded = jwt.verify(req.cookies.token,process.env.JWT_KEY);
        let user = await userModel.findOne({email: decoded.email}).select("-password"); //passowrd select nhi hoga
        req.user = user;
        next();
    }
    catch(err){
        req.flash("error","Something went wrong");
        res.redirect("/");
    }
};


module.exports.authMiddleware = async (req, res, next) => {
    try {
        // Assuming you're storing user ID in session or cookies
        const userId = req.session.userId || req.cookies.userId; 
        if (!userId) {
            return res.status(401).redirect('/');
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).redirect('/');
        }

        // Attach user to request object for further use
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.authToken = (req, res, next) => {
    const token = req.cookies.token;

    if (token == null) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            console.error('JWT verify error:', err);
            return res.status(403).send('Forbidden');
        }
        req.user = user;
        next();
    });
};
module.exports.authToken_retial = (req, res, next) => {
    const token = req.cookies.token;

    if (token == null) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, 'your_jwt_secret', (err, retailer) => {
        if (err) {
            console.error('JWT verify error:', err);
            return res.status(403).send('Forbidden');
        }
        req.retailer = retailer;
        next();
        
    });
};