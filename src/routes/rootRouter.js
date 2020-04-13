const rootRouter = (app) =>
{
    app.route("/")
        .get((req, res) => res.send("welcome to the achar.tv api"))
        .post((req, res) => res.send("welcome to the achar.tv api"))
        .patch((req, res) => res.send("welcome to the achar.tv api"))
        .delete((req, res) => res.send("welcome to the achar.tv api"))
}

export default rootRouter