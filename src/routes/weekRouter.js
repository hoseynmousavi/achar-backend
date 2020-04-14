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

    app.route("/question/:week_id")
        .get(weekController.getWeekQuestions)
}

export default weekRouter