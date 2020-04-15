import mongoose from "mongoose"

const schema = mongoose.Schema

const userModel = new schema({
    phone: {
        type: String,
        unique: true,
        minlength: 11,
        maxlength: 11,
        index: true,
        required: "Enter phone!",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: "Enter role!",
    },
    name: {
        type: String,
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

export default userModel