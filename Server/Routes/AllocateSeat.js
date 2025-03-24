import express from "express";
import multer from "multer";
import {UploadSeats, GetAvailableSeats} from "../Controller/SeatAllocation.js";


const router = express.Router(); 
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });  

router.post("/UploadSeats", upload.single("excelFile"), UploadSeats);
router.get("/GetAvailableSeats", GetAvailableSeats);


export default router;