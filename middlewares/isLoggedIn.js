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


module.exports.authToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1] ;
    if (token == null) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, 'nsidnaidansdi', (err, decodedToken) => {
        if (err) {
            console.error('JWT verify error:', err);
            return res.status(403).send('Forbidden');
        }

        // Check if role is 'user', 'retailer', or 'admin'
        if (decodedToken.role !== 'user' && decodedToken.role !== 'retailer' && decodedToken.role !== 'manufacturer') {
            return res.status(403).send('Forbidden: Invalid role');
        }

        if (decodedToken.role === 'user') {
            req.user = decodedToken;
        } else if (decodedToken.role === 'retailer') {
            req.retailer = decodedToken;
        } else if (decodedToken.role === 'manufacturer') {
            req.manufacturer = decodedToken;
        }

        next(); 
    });
};