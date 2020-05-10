import mongoose from "mongoose"
import userModel from "../models/userModel"
import tokenHelper from "../functions/tokenHelper"
import verificationCodeController from "./verificationCodeController"
import numberCorrection from "../functions/numberCorrection"

const user = mongoose.model("user", userModel)

const phoneCheck = (req, res) =>
{
    const {phone} = req.body
    if (phone.trim().length === 11)
        user.find({phone}, {phone: 1}, (err, users) =>
        {
            if (err) res.status(500).send(err)
            else if (users) res.send({count: users.length})
            else res.send({count: 0})
        })
    else res.status(400).send({message: "please don't send shit."})
}

const loginSignUp = (req, res) =>
{
    const {phone, name, code} = req.body
    verificationCodeController.verifyCode({phone, code})
        .then(() =>
        {
            userExist({phone})
                .then((result) =>
                {
                    const {user} = result
                    tokenHelper.encodeToken({_id: user._id, phone: user.phone})
                        .then((token) => res.send({...user, token}))
                        .catch((err) => res.status(500).send({message: err}))
                })
                .catch(() =>
                {
                    const newUser = new user({phone, name, create_persian_date: numberCorrection(new Date().toLocaleDateString("fa-ir"))})
                    newUser.save((err, createdUser) =>
                    {
                        if (err) res.status(400).send(err)
                        else
                        {
                            const user = createdUser.toJSON()
                            tokenHelper.encodeToken({_id: user._id, phone: user.phone})
                                .then((token) => res.send({...user, token}))
                                .catch((err) => res.status(500).send({message: err}))
                        }
                    })
                })
        })
        .catch(err => res.status(err.status || 500).send({message: err.err}))
}

const verifyToken = ({_id, phone}) =>
{
    return new Promise((resolve, reject) =>
    {
        if (_id && phone)
        {
            user.findOne({_id, phone}, (err, takenUser) =>
            {
                if (err) reject({status: 500, err})
                else if (!takenUser) reject({status: 403, err: {message: "token is not valid!"}})
                else resolve({status: 200, err: {message: "it's valid babe!"}, user: takenUser.toJSON()})
            })
        }
        else reject({status: 403, err: {message: "token is not valid!"}})
    })
}

const verifyTokenRoute = (req, res) =>
{
    const {_id} = req.headers.authorization
    user.findById(_id, (err, takenUser) =>
    {
        if (err) res.status(500).send(err)
        else
        {
            const user = takenUser.toJSON()
            res.send({...user})
        }
    })
}

const userExist = ({phone}) =>
{
    return new Promise((resolve, reject) =>
    {
        user.findOne({phone}, (err, takenUser) =>
        {
            if (err) reject({status: 500, err})
            else if (!takenUser) reject({status: 404, err: {message: "user not found!"}})
            else resolve({status: 200, user: takenUser.toJSON()})
        })
    })
}

const getUsersFunc = ({condition, fields, options}) =>
{
    return new Promise((resolve, reject) =>
    {
        user.find(condition, fields, options, (err, users) =>
        {
            if (err) reject(err)
            else resolve(users)
        })
    })
}

const userController = {
    loginSignUp,
    phoneCheck,
    verifyToken,
    verifyTokenRoute,
    getUsersFunc,
}

export default userController