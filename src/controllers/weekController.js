import mongoose from "mongoose"
import weekModel from "../models/weekModel"
import bookModel from "../models/bookModel"
import questionModel from "../models/questionModel"
import answerModel from "../models/answerModel"

const week = mongoose.model("week", weekModel)
const book = mongoose.model("book", bookModel)
const question = mongoose.model("question", questionModel)
const answer = mongoose.model("answer", answerModel)

const getWeeks = (req, res) =>
{
    const user_id = req.headers.authorization._id
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10
    const skip = (req.query.page - 1 > 0 ? req.query.page - 1 : 0) * limit
    const options = {sort: "-created_date", skip, limit}
    week.find(null, null, options, (err, weeks) =>
    {
        if (err) res.status(500).send(err)
        else
        {
            book.find({week_id: {$in: weeks.reduce((sum, week) => [...sum, week.toJSON()._id], [])}}, (err, books) =>
            {
                if (err) res.status(500).send(err)
                else
                {
                    question.find({book_id: {$in: books.reduce((sum, book) => [...sum, book.toJSON()._id], [])}}, (err, questions) =>
                    {
                        answer.find({user_id, question_id: {$in: questions.reduce((sum, question) => [...sum, question.toJSON()._id], [])}}, (err, answers) =>
                        {
                            if (err) res.status(500).send(err)
                            else
                            {
                                const weeksObject = weeks.reduce((sum, week) => ({...sum, [week._id]: week.toJSON()}), {})
                                books.forEach(book =>
                                {
                                    weeksObject[book.week_id].books = [...weeksObject[book.week_id].books || [], book]
                                })
                                Object.values(weeksObject).forEach(week =>
                                {
                                    let weekQuestions = []
                                    let weekAnswers = []
                                    week.books.forEach(book =>
                                    {
                                        weekQuestions = [...weekQuestions, ...questions.filter(question => question.book_id.toString() === book._id.toString())]
                                    })
                                    weekQuestions.forEach(question =>
                                    {
                                        weekAnswers = [...weekAnswers, ...answers.filter(answer => answer.question_id.toString() === question._id.toString())]
                                    })
                                    week.questions_count = weekQuestions.length
                                    week.answers_count = weekAnswers.length
                                })
                                res.send(Object.values(weeksObject))
                            }
                        })
                    })

                }
            })
        }
    })
}

const getWeekById = (req, res) =>
{
    week.findById(req.params.week_id, (err, takenWeek) =>
    {
        if (err) res.status(400).send(err)
        else if (!takenWeek) res.status(404).send({message: "not found!"})
        else
        {
            const takenWeekJson = takenWeek.toJSON()
            book.find({week_id: takenWeekJson._id}, (err, books) =>
            {
                takenWeekJson.books = books
                res.send(takenWeekJson)
            })
        }
    })
}

const addWeek = (req, res) =>
{
    if (req.headers.authorization.role === "admin")
    {
        const {start_date, name} = req.body
        if (start_date && name)
        {
            const end_date = req.body.end_date ? new Date().setDate(new Date().getDate() + parseInt(req.body.end_date)) : new Date().setDate(new Date().getDate() + (parseInt(start_date) + 7))
            const newWeek = new week({name, start_date: new Date().setDate(new Date().getDate() + parseInt(start_date)), end_date})
            newWeek.save((err, createdWeek) =>
            {
                if (err) res.status(400).send(err)
                else res.send(createdWeek)
            })
        }
        else res.status(400).send({message: "send start_date && name!"})
    }
    else res.status(403).send({message: "don't have permission babe!"})
}

const getBookById = (req, res) =>
{
    book.findById(req.params.book_id, (err, takenBook) =>
    {
        if (err) res.status(400).send(err)
        else if (!takenBook) res.status(404).send({message: "not found!"})
        else res.send(takenBook)
    })
}

const addBook = (req, res) =>
{
    if (req.headers.authorization.role === "admin")
    {
        const {week_id, name} = req.body
        const picture = req.files ? req.files.picture : null
        const file = req.files ? req.files.file : null
        if (week_id && name && picture && file)
        {
            const pictureName = new Date().toISOString() + picture.name
            picture.mv(`media/pictures/${pictureName}`, (err) =>
            {
                if (err) console.log(err)
                else
                {
                    const fileName = new Date().toISOString() + file.name
                    file.mv(`media/files/${fileName}`, (err) =>
                    {
                        if (err) console.log(err)
                        else
                        {
                            const newBook = new book({name, week_id, picture: `/media/pictures/${pictureName}`, file: `/media/files/${fileName}`})
                            newBook.save((err, createdBook) =>
                            {
                                if (err) res.status(400).send(err)
                                else res.send(createdBook)
                            })
                        }
                    })
                }
            })
        }
        else res.status(400).send({message: "send week_id && name && picture && file!"})
    }
    else res.status(403).send({message: "don't have permission babe!"})
}

const getWeekQuestions = (req, res) =>
{
    book.find({week_id: req.params.week_id}, (err, books) =>
    {
        if (err) res.status(400).send(err)
        else
        {
            const booksObject = books.reduce((sum, book) => ({...sum, [book._id]: book.toJSON()}), {})
            question.find(
                {book_id: {$in: books.reduce((sum, book) => [...sum, book.toJSON()._id], [])}},
                (err, questions) =>
                {
                    if (err) res.status(400).send(err)
                    else
                    {
                        answer.find({question_id: {$in: questions.reduce((sum, question) => [...sum, question.toJSON()._id], [])}}, (err, answers) =>
                        {
                            const questionsObject = questions.reduce((sum, question) => ({...sum, [question._id]: question.toJSON()}), {})
                            const answersObject = answers.reduce((sum, answer) => ({...sum, [answer.question_id]: answer.toJSON()}), {})
                            questions.forEach(question =>
                            {
                                questionsObject[question._id].book_name = booksObject[question.book_id].name
                                if (answersObject[question._id])
                                {
                                    questionsObject[question._id].user_answer = answersObject[question._id].user_answer
                                }
                                else delete questionsObject[question._id].correct_answer
                            })

                            res.send(Object.values(questionsObject))
                        })
                    }
                })
        }
    })
}

const addQuestion = (req, res) =>
{
    if (req.headers.authorization.role === "admin")
    {
        const {book_id, question_text, first_answer, second_answer, third_answer, forth_answer, correct_answer} = req.body
        if (book_id && question_text && first_answer && second_answer && third_answer && forth_answer && correct_answer)
        {
            const newQuestion = new question({book_id, question_text, first_answer, second_answer, third_answer, forth_answer, correct_answer})
            newQuestion.save((err, createdQuestion) =>
            {
                if (err) res.status(400).send(err)
                else res.send(createdQuestion)
            })
        }
        else res.status(400).send({message: "send book_id && question_text && first_answer && second_answer && third_answer && forth_answer && correct_answer!"})
    }
    else res.status(403).send({message: "don't have permission babe!"})
}

const addAnswer = (req, res) =>
{
    const {question_id, user_answer} = req.body
    const user_id = req.headers.authorization._id
    if (question_id && user_answer && user_id)
    {
        question.findById(question_id, (err, takenQuestion) =>
        {
            if (err) res.status(400).send(err)
            else if (!takenQuestion) res.status(404).send({message: "question not found!"})
            else
            {
                let is_correct = false
                if (takenQuestion.toJSON().correct_answer === parseInt(user_answer)) is_correct = true
                const newAnswer = new answer({question_id, user_answer, user_id, is_correct})
                newAnswer.save((err, createdAnswer) =>
                {
                    if (err) res.status(400).send(err)
                    else res.send(createdAnswer)
                })
            }
        })
    }
    else res.status(400).send({message: "send question_id && user_answer && token!"})
}

const weekController = {
    getWeeks,
    getWeekById,
    addWeek,
    getBookById,
    addBook,
    getWeekQuestions,
    addQuestion,
    addAnswer,
}

export default weekController