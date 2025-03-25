import express from "express";
import { Signin, Logout, SignUp } from "../Controller/Login.js";

const LoginCreditional = express.Router();

LoginCreditional.post("/login", Signin);
LoginCreditional.post("/signup", SignUp);
LoginCreditional.get("/logout", Logout);

export default LoginCreditional;
