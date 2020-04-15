import mongoose from "mongoose"

const schema = mongoose.Schema

const weekModel = new schema({
    start_date: {
        type: Date,
        required: "Enter start_date!",
    },
    end_date: {
        type: Date,
        required: "Enter end_date!",
    },
    name: {
        type: String,
        required: "Enter name!",
    },
    create_persian_date: {
        type: String,
        required: "Enter create_persian_date!",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
})

export default weekModel