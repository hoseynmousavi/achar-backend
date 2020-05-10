import weekController from "../controllers/weekController"

const weekRouter = (app) =>
{
    app.route("/week")
        .get(weekController.getWeeks)
        .post(weekController.addWeek)

    app.route("/week/:week_id")
        .get(weekController.getWeekById)

    app.route("/book")
        .post(weekController.addBook)

    app.route("/book/:book_id")
        .get(weekController.getBookById)

    app.route("/question")
        .post(weekController.addQuestion)

    app.route("/question/:book_id")
        .get(weekController.getBookQuestions)

    app.route("/answer")
        .post(weekController.addAnswer)

    app.route("/lottery")
        .post(weekController.addForLottery)

    app.route("/lottery/:create_persian_date")
        .get(weekController.getForLottery)
}

export default weekRouter