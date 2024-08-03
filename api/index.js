import app from "./app.js";
import connectDB from './src/config/connectDB.js';
import dotenv from "dotenv"


//CONFIG DOTENV
dotenv.config({
    path:'./.env'
})

// START SERVER
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
