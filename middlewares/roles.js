const admin = (req, res, next) =>{
    if(req.user.rol_id !== 1000) return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const finance = (req, res, next) =>{
    if(req.user.rol_id !== 1001 && req.user.rol_id !== 1000) return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const sales = (req, res, next) =>{
    if(req.user.rol_id !== 1002 && req.user.rol_id !== 1000) return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const sales_finance = (req, res, next) =>{
    if(req.user.rol_id !== 1000 && req.user.rol_id !== 1001 && req.user.rol_id !== 1002) return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const sales_finance_storage = (req, res, next) =>{
    if(req.user.rol_id !== 1000 && req.user.rol_id !== 1001 && req.user.rol_id !== 1002 && req.user.rol_id !== 1003) return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const storage = (req, res, next) =>{
    if(req.user.rol_id !== 1003 && req.user.rol_id !== 1000) return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const editor = (req, res, next) =>{
    if(req.user.rol_id !== "admin" && req.user.rol_id !== "editor") return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
}

const viewer = (req, res, next) =>{
    if(req.user.rol_id !== "admin" && req.user.rol_id !== "editor" && req.user.rol_id !== "viewer") return res.status(403).send({
        ok: false, 
        error: "Access denied"
    });

    next();
} 

module.exports = {admin, sales, finance, sales_finance, editor, viewer, storage, sales_finance_storage};