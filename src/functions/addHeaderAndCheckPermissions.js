import tokenHelper from "./tokenHelper"

const addHeaderAndCheckPermissions = (app) =>
{
    app.use((req, res, next) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (
            req.originalUrl === "/" ||
            // (req.originalUrl.slice(0, 5) === "/week" && req.method === "GET") ||
            // (req.originalUrl.slice(0, 5) === "/book" && req.method === "GET") ||
            // (req.originalUrl.slice(0, 9) === "/question" && req.method === "GET") ||
            (req.originalUrl.slice(0, 17) === "/user/phone_check" && req.method === "POST") ||
            (req.originalUrl.slice(0, 19) === "/user/login-sign-up" && req.method === "POST") ||
            (req.originalUrl.slice(0, 5) === "/code" && req.method === "POST")
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
