const mongoose = require('mongoose');
const config = require('config');
const db = config.get('MONGO_URI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {});
        console.log("mongodb Connected");

    } catch (err) {
        console.error(err.message);
        process.exit(

        )
    }
}

module.exports = connectDB;