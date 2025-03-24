import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { EmployeeModel, SeatAllocationModel, SeatAvailabilityModel } from "../Models/schema.js";
import passport from "passport";

export const login = passport.authenticate('auth0', { scope: 'openid email profile' });

export const PostEmployee = async (req, res) => {
    try {
        const { emp_id, emp_name, emp_email, emp_role } = req.body;
        const employee = new EmployeeModel({
            emp_id,
            emp_name,
            emp_email,
            emp_role
        });
        await employee.save();
        res.status(200).json({ message: "Employee added successfully" });
    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(error.status).json({ error: error.message });
    }
};

export const GetEmployee = async (req, res) => {
    const { emp_id } = req.query;
    if (!emp_id) {
        try {
            const employees = await EmployeeModel.find();
            res.status(200).json(employees);
        }
        catch (error) {
            res.status(error.status).json({ error: error.message });
        }
    } else {
        try {
            const employee = await EmployeeModel.findOne({ emp_id });
            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }
            res.status(200).json(employee);
        }
        catch (error) {
            res.status(error.status).json({ error: error.message });
        }
    }
};

export const UpdateEmployee = async (req, res) => {
    const { emp_id } = req.params;
    const { emp_name, emp_email, emp_role } = req.body;
    try {
        await EmployeeModel.findOneAndUpdate(
            { emp_id },
            { emp_name, emp_email, emp_role }
        );
        res.status(200).json({ message: "Employee updated successfully" });
    } catch (error) {
        res.status(error.status).json({ error: error.message });
    }
};
export const DeleteEmployee = async (req, res) => {
    const { emp_id } = req.params;
    try {
        await EmployeeModel.findOneAndDelete({ emp_id });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(error.status).json({ error: error.message });
    }
};

export const AllocateSeat = async (req, res) => {
    const { emp_id } = req.params;
    const { seat_number, floor_id } = req.body;

    try {
        const floor = await SeatAllocationModel.findOne({ floor_id });
        if (!floor) {
            const Seat_allocation = new SeatAllocationModel({
                floor_id,
                Allocated_seats: [{ seat_number, emp_id }],
            });
            await Seat_allocation.save();
            const seatAvailability = await SeatAvailabilityModel.findById(floor_id);
            if (!seatAvailability) {
                return res.status(404).json({ error: "Floor not found in SeatAvailability" });
            }
            await SeatAvailabilityModel.updateOne(
                { _id: floor_id },
                { $pull: { Available_seats: { seat_number } } }
            );

            res.status(200).json({ message: "Seat allocated successfully" });
        } else {
            const emp = floor.Allocated_seats.find((seat) => seat.emp_id === emp_id);
            if (emp) {
                return res.status(400).json({ error: "Seat already allocated to this employee" });
            } else {
                const seatAvailability = await SeatAvailabilityModel.findById(floor_id);
                const seats = seatAvailability.Available_seats.find((seat) => seat.seat_number === seat_number);
                if (!seats) {
                    return res.status(404).json({ error: "Seat not found in SeatAvailability" });
                } else {
                    floor.Allocated_seats.push({ seat_number, emp_id });
                    await floor.save();
                    await SeatAvailabilityModel.updateOne(
                        { _id: floor_id },
                        { $pull: { Available_seats: { seat_number } } }
                    );

                    res.status(200).json({ message: "Seat allocated successfully" });

                }
            }
        }
    } catch (error) {
        console.error("Error allocating seat:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const DeleteAllocatedSeat = async (req, res) => {
    const { emp_id } = req.params;
    const { seat_number, floor_id } = req.body;
    try {
        const floor = await SeatAllocationModel.findOne({ floor_id , Allocated_seats: { $elemMatch: { emp_id } } });
        if (!floor) {
            return res.status(404).json({ error: "Seat not found" });
        }else{
        const floors = await SeatAvailabilityModel.findById(floor_id);
        await floors.Available_seats.push({ seat_number });
        await floors.save();
        await floor.Allocated_seats.pull({ emp_id, seat_number });
        await floor.save();
        res.status(200).json({ message: "Seat deallocated successfully" });
        }   
    } catch (error) {
        res.status(error.status).json({ error: error.message });
    }
}
export const UpdateAllocatedSeat = async (req, res) => {
    const { emp_id } = req.params; 
    const { new_seat_number, new_floor_id } = req.body; 
    try {
        const currentFloor = await SeatAllocationModel.findOne({
            Allocated_seats: { $elemMatch: { emp_id } },
        });

        if (!currentFloor) {
            return res.status(404).json({ error: "Employee's current seat allocation not found" });
        }
        const currentSeat = currentFloor.Allocated_seats.find(
            (seat) => seat.emp_id === emp_id
        );

        if (!currentSeat) {
            return res.status(404).json({ error: "Employee's current seat not found" });
        }

        currentFloor.Allocated_seats = currentFloor.Allocated_seats.filter(
            (seat) => seat.emp_id !== emp_id
        );
        await currentFloor.save();

        await SeatAvailabilityModel.updateOne(
            { _id: currentFloor.floor_id },
            { $push: { Available_seats: { seat_number: currentSeat.seat_number } } }
        );

        const newFloor = await SeatAllocationModel.findOne({ floor_id: new_floor_id });
        const floor = await SeatAvailabilityModel.findById(new_floor_id);

        if (!newFloor) {
            if (floor) {
            const updateseate = new SeatAllocationModel({
                floor_id: new_floor_id,
                Allocated_seats: [{ seat_number: new_seat_number, emp_id }],
            });
            await updateseate.save();
            await SeatAvailabilityModel.updateOne(
                { _id: new_floor_id },
                { $pull: { Available_seats: { seat_number: new_seat_number } } }
            );
            res.status(200).json({ message: "Seat updated successfully" });
        }else{
            return res.status(404).json({ error: "Floor not found" });
        }
        }else{
            newFloor.Allocated_seats.push({ seat_number: new_seat_number, emp_id });
            await newFloor.save();
            await SeatAvailabilityModel.updateOne(
                { _id: new_floor_id },
                { $pull: { Available_seats: { seat_number: new_seat_number } } }
            );
         

            res.status(200).json({ message: "Seat updated successfully" });
        }
    } catch (error) {
        console.error("Error updating allocated seat:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetAllocatedSeats = async (req, res) => {
    try {
        const allocatedSeats = await SeatAllocationModel.find();
        res.status(200).json(allocatedSeats);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};