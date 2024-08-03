import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
   },
    reciever: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        require: true
    }
}, { timestamps: true })

export const Message = mongoose.model('Message', messageSchema)