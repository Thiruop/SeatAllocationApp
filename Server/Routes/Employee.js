import { GetEmployee, PostEmployee, UpdateEmployee, DeleteEmployee, AllocateSeat, DeleteAllocatedSeat, UpdateAllocatedSeat, login} from "../Controller/EmployeeDetail.js";
import express from "express";
const Employee = express.Router();
Employee.post("/PostEmployee", PostEmployee);
Employee.get("/GetEmployee", GetEmployee);
Employee.put("/UpdateEmployee/:emp_id", UpdateEmployee);
Employee.delete("/DeleteEmployee/:emp_id", DeleteEmployee);
Employee.post("/SeatAllocate/:emp_id", AllocateSeat);
Employee.delete("/SeatDeallocate/:emp_id", DeleteAllocatedSeat);
Employee.put("/UpdateSeat/:emp_id", UpdateAllocatedSeat);
export default Employee;