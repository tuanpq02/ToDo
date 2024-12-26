const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema(
    {
        name: {
            type: String,
            require: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            require: true
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Task', taskSchema);