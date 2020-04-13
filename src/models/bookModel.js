import mongoose from "mongoose"

const schema = mongoose.Schema

const bookModel = new schema({
    week_id: {
        type: schema.Types.ObjectId,
        required: "Enter week_id!",
    },
    name: {
        type: String,
        required: "Enter name!",
    },
    picture: {
        type: String,
        required: "Enter picture!",
    },
    file: {
        type: String,
        required: "Enter file!",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
})

export default bookModel