const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({message: "Acces denied."});
        }
        next()
    }
}

module.exports = authorizeRoles;