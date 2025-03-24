
import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

import {ConnectDB} from './Models/db.js';
import router from './Routes/AllocateSeat.js';
import Employee from './Routes/Employee.js';
const app = express();



const port = 3000;
app.use(express.json());
app.use(cors(({origin:"*"})));

ConnectDB(); 


 app.use('/Seats',router);
 app.use('/Employee',Employee);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})