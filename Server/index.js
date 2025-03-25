import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import session from "express-session";
import passport from "passport";
import { ConnectDB } from "./Models/db.js";
import router from "./Routes/AllocateSeat.js";
import Employee from "./Routes/Employee.js";
import LoginCreditional from "./Routes/LoginCreditional.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false, // Security Improvement
    })
);

// Connect to Database
ConnectDB();

// Routes
app.use("/", LoginCreditional);
app.use("/Seats", router);
app.use("/Employee", Employee);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
