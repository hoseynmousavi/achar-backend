import mongoose from "mongoose"
import weekModel from "../models/weekModel"
import bookModel from "../models/bookModel"
import questionModel from "../models/questionModel"
import answerModel from "../models/answerModel"
import lotteryModel from "../models/lotteryModel"
import numberCorrection from "../functions/numberCorrection"

const week = mongoose.model("week", weekModel)
const book = mongoose.model("book", bookModel)
const question = mongoose.model("question", questionModel)
const answer = mongoose.model("answer", answerModel)
const lottery = mongoose.model("lottery", lotteryModel)

const getWeeks = (req, res) =>
{
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
                    const weeksObject = weeks.reduce((sum, week) => ({...sum, [week._id]: week.toJSON()}), {})
                    books.forEach(book =>
                        weeksObject[book.week_id].books = [...weeksObject[book.week_id].books || [], book],
                    )
                    res.send(Object.values(weeksObject))
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

const getBookById = (req, res) =>
{
    book.findById(req.params.book_id, (err, takenBook) =>
    {
        if (err) res.status(400).send(err)
        else if (!takenBook) res.status(404).send({message: "not found!"})
        else res.send(takenBook)
    })
}

const getBookQuestions = (req, res) =>
{
    const user_id = req.headers.authorization._id
    book.findById(req.params.book_id, (err, takenBook) =>
    {
        if (err) res.status(400).send(err)
        else if (!takenBook) res.status(404).send({message: "book not found!"})
        else
        {
            question.find({book_id: req.params.book_id}, (err, questions) =>
            {
                if (err) res.status(400).send(err)
                else
                {
                    answer.find({user_id, question_id: {$in: questions.reduce((sum, question) => [...sum, question.toJSON()._id], [])}}, (err, answers) =>
                    {
                        const questionsObject = questions.reduce((sum, question) => ({...sum, [question._id]: question.toJSON()}), {})
                        const answersObject = answers.reduce((sum, answer) => ({...sum, [answer.question_id]: answer.toJSON()}), {})
                        questions.forEach(question =>
                        {
                            if (answersObject[question._id]) questionsObject[question._id].user_answer = answersObject[question._id].user_answer
                            else delete questionsObject[question._id].correct_answer
                        })
                        res.send({book: takenBook.toJSON(), questions: Object.values(questionsObject), questions_count: questions.length, answers_count: answers.length})
                    })
                }
            })
        }
    })
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
                const newAnswer = new answer({question_id, user_answer, user_id, is_correct, create_persian_date: numberCorrection(new Date().toLocaleDateString("fa-ir"))})
                newAnswer.save((err, createdAnswer) =>
                {
                    if (err) res.status(400).send(err)
                    else res.send({...createdAnswer.toJSON(), correct_answer: takenQuestion.toJSON().correct_answer})
                })
            }
        })
    }
    else res.status(400).send({message: "send question_id && user_answer && token!"})
}

const addForLottery = (req, res) =>
{
    const user_id = req.headers.authorization._id
    const {book_id} = req.body
    if (user_id && book_id)
    {
        book.findById(book_id, (err, takenBook) =>
        {
            if (err) res.status(400).send(err)
            else if (!takenBook) res.status(404).send({message: "book not found!"})
            else
            {
                week.findById(takenBook.toJSON().week_id, (err, takenWeek) =>
                {
                    question.find({book_id}, (err, questions) =>
                    {
                        if (err) res.status(400).send(err)
                        else
                        {
                            answer.find({user_id, is_correct: true, question_id: {$in: questions.reduce((sum, question) => [...sum, question.toJSON()._id], [])}}, (err, answers) =>
                            {
                                if (questions.length === answers.length)
                                {
                                    if (new Date() > takenWeek.toJSON().end_date) res.status(201).send({message: "all right, but late!"})
                                    else
                                    {
                                        const newLottery = new lottery({user_id, book_id, create_persian_date: numberCorrection(new Date().toLocaleDateString("fa-ir"))})
                                        newLottery.save((err, createdLottery) =>
                                        {
                                            if (err) res.status(400).send(err)
                                            else res.send(createdLottery)
                                        })
                                    }
                                }
                                else res.status(403).send({message: "you weren't correct for all questions!"})
                            })
                        }
                    })
                })
            }
        })
    }
    else res.status(400).send({message: "book_id && token!"})
}

// admin endpoints
const addWeek = (req, res) =>
{
    if (req.headers.authorization.role === "admin")
    {
        const {start_date, name} = req.body
        if (start_date && name)
        {
            const end_date = req.body.end_date ? new Date().setDate(new Date().getDate() + parseInt(req.body.end_date)) : new Date().setDate(new Date().getDate() + (parseInt(start_date) + 7))
            const newWeek = new week({name, start_date: new Date().setDate(new Date().getDate() + parseInt(start_date)), end_date, create_persian_date: numberCorrection(new Date().toLocaleDateString("fa-ir"))})
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

const addBook = (req, res) =>
{
    if (req.headers.authorization.role === "admin")
    {
        const {week_id, name, description, summary} = req.body
        const picture = req.files ? req.files.picture : null
        if (week_id && name && picture && summary)
        {
            const pictureName = new Date().toISOString() + picture.name
            picture.mv(`media/pictures/${pictureName}`, (err) =>
            {
                if (err) console.log(err)
                else
                {
                    const newBook = new book({
                        name,
                        description,
                        week_id, picture: `/media/pictures/${pictureName}`,
                        summary,
                        create_persian_date: numberCorrection(new Date().toLocaleDateString("fa-ir")),
                    })
                    newBook.save((err, createdBook) =>
                    {
                        if (err) res.status(400).send(err)
                        else res.send(createdBook)
                    })
                }
            })
        }
        else res.status(400).send({message: "send week_id && name && picture && summary!"})
    }
    else res.status(403).send({message: "don't have permission babe!"})
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

const weekController = {
    getWeeks,
    getWeekById,
    getBookById,
    getBookQuestions,
    addAnswer,
    addForLottery,
    addWeek,
    addBook,
    addQuestion,
}

export default weekController