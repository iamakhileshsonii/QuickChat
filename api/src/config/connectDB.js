import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_NAME}`);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Unable to connect to the database!!!", error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
