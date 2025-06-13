const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){
    try{
        if(req.user.Role !== "admin"){
            return res.status(401).json("Not admin");
        }
        next();
    } catch (e) {
        console.error("Unexpected error:", e);
        return res.status(401).json("Unexpected error");
    }
}