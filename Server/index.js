import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // Load .env variables
import session from "express-session";
import passport from "passport";
import { ConnectDB } from "./Models/db.js";
import router from "./Routes/AllocateSeat.js";
import Employee from "./Routes/Employee.js";
import LoginCreditional from "./Routes/LoginCreditional.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_fallback_secret", // Fallback for local dev
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS (Render uses HTTPS by default)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Optional: initialize Passport if you're using it
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
ConnectDB();

// Routes
app.use("/", LoginCreditional);
app.use("/Seats", router);
app.use("/Employee", Employee);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
