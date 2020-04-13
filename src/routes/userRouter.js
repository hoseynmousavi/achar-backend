import userController from "../controllers/userController"

const userRouter = (app) =>
{
    app.route("/user/phone_check")
        .post(userController.phoneCheck)

    app.route("/user/login-sign-up")
        .post(userController.loginSignUp)

    app.route("/user/verify-token")
        .post(userController.verifyTokenRoute)
}

export default userRouter