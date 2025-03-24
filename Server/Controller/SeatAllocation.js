import express from "express";
import dotenv from "dotenv";
import xlsx from "xlsx";
import { SeatAvailabilityModel} from "../Models/schema.js";
dotenv.config();
export const UploadSeats = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetNames = workbook.SheetNames;

        for (let i = 0; i < sheetNames.length; i++) {
            const floorName = sheetNames[i];
            const sheet = workbook.Sheets[floorName];
            const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            const availableSeats = [];
            for (let row of sheetData) {
                if (row && row[0] && typeof row[0] === "number") {
                    availableSeats.push({ seat_number: row[0] });
                }
            }

            // Check if a document for the current floor already exists
            const existingFloor = await SeatAvailabilityModel.findOne({ floor_name: floorName });

            if (existingFloor) {
                // Update the existing document
                existingFloor.Available_seats = availableSeats;
                await existingFloor.save();
            } else {
                // Create a new document for the floor
                const seatAvailability = new SeatAvailabilityModel({
                    floor_name: floorName,
                    Available_seats: availableSeats,
                });
                await seatAvailability.save();
            }
        }

        res.status(200).json({ message: "Seats uploaded successfully" });
    } catch (error) {
        console.error("Error reading/updating Excel file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetAvailableSeats = async (req, res) => {
    try {
        const availableSeats = await SeatAvailabilityModel.find();  
        res.status(200).json(availableSeats);
    } catch (error) { 
        res.status(500).json({ error: "Internal Server Error" });
    }
};