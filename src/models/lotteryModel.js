import mongoose from "mongoose"

const schema = mongoose.Schema

const lotteryModel = new schema({
    user_id: {
        type: schema.Types.ObjectId,
        index: true,
        required: "Enter user_id!",
    },
    book_id: {
        type: schema.Types.ObjectId,
        index: true,
        required: "Enter book_id!",
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

lotteryModel.index({user_id: 1, book_id: 1}, {unique: true})

export default lotteryModel