import mongoose from "mongoose"

const schema = mongoose.Schema

const bookModel = new schema({
    week_id: {
        type: schema.Types.ObjectId,
        index: true,
        required: "Enter week_id!",
    },
    name: {
        type: String,
        required: "Enter name!",
    },
    description: {
        type: String,
    },
    picture: {
        type: String,
        required: "Enter picture!",
    },
    file: {
        type: String,
        required: "Enter file!",
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

export default bookModel