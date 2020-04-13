import tokenHelper from "./tokenHelper"

const addHeaderAndCheckPermissions = (app) =>
{
    app.use((req, res, next) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (
            req.originalUrl === "/" ||
            (req.originalUrl === "/user/" && req.method === "POST") ||
            (req.originalUrl === "/user/phone_check/") ||
            (req.originalUrl === "/user/login-sign-up/") ||
            (req.originalUrl === "/code/")
        )
        {
            if (req.headers.authorization)
            {
                tokenHelper.decodeToken(req.headers.authorization)
                    .then((payload) =>
                    {
                        req.headers.authorization = {...payload}
                        next()
                    })
                    .catch(() => next())
            }
            else next()
        }
        else
        {
            if (req.headers.authorization)
            {
                tokenHelper.decodeToken(req.headers.authorization)
                    .then((payload) =>
                    {
                        req.headers.authorization = {...payload}
                        next()
                    })
                    .catch((result) => res.status(result.status || 403).send(result.err))
            }
            else res.status(401).send({message: "send token!"})
        }
    })
}

export default addHeaderAndCheckPermissions
