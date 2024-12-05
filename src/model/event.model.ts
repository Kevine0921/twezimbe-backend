import mongoose, { Schema, model } from 'mongoose'

const eventSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    type: { type: String, enum: ['Birthday', 'Anniversary', 'Custom'], default: 'Custom' },
    notificationSent: { type: Boolean, default: false },
});

export default model('Event', eventSchema)
