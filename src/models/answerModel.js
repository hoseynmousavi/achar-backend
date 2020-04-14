import mongoose from "mongoose"

const schema = mongoose.Schema

const answerModel = new schema({
    question_id: {
        type: schema.Types.ObjectId,
        index: true,
        required: "Enter question_id!",
    },
    user_id: {
        type: schema.Types.ObjectId,
        index: true,
        required: "Enter user_id!",
    },
    user_answer: {
        type: Number,
        min: 1,
        max: 4,
        required: "Enter correct_answer!",
    },
    is_correct: {
        type: Boolean,
        required: "Enter is_correct!",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
})

answerModel.index({user_id: 1, question_id: 1}, {unique: true})

export default answerModel