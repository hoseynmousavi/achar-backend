import mongoose from "mongoose"

const schema = mongoose.Schema

const questionModel = new schema({
    book_id: {
        type: schema.Types.ObjectId,
        index: true,
        required: "Enter book_id!",
    },
    question_text: {
        type: String,
        required: "Enter question!",
    },
    first_answer: {
        type: String,
        required: "Enter first_answer!",
    },
    second_answer: {
        type: String,
        required: "Enter second_answer!",
    },
    third_answer: {
        type: String,
        required: "Enter third_answer!",
    },
    forth_answer: {
        type: String,
        required: "Enter forth_answer!",
    },
    correct_answer: {
        type: Number,
        min: 1,
        max: 4,
        required: "Enter correct_answer!",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
})

export default questionModel