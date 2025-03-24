import mongoose from "mongoose";
const Schema = mongoose.Schema;
const SeatAllocation = new Schema({
    floor_id: String,
    Allocated_seats: {
        type:[
            {
                seat_number: Number,
                emp_id: String
            }
        ]
    }
})
const SeatAvailability = new Schema({

    floor_name: String,
    Available_seats: {
        type:[
            {
                seat_number: Number
            }
        ]
    }
})
const Employee = new Schema({
    emp_id: String,
    emp_name: String,
    emp_email: String,
    emp_role: String,
})

export const SeatAllocationModel = mongoose.model('SeatAllocation', SeatAllocation);
export const SeatAvailabilityModel = mongoose.model('SeatAvailability', SeatAvailability);  
export const EmployeeModel = mongoose.model('Employee', Employee);

