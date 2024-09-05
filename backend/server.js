const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Updated Mongoose connection without deprecated options
mongoose.connect('mongodb+srv://eklavyabro:rtdiasndrf@ndrf.avscv.mongodb.net/agency?retryWrites=true&w=majority&appName=NDRF')
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

const employeeSchema = new mongoose.Schema({
    agencyName: String,
    agencyId: Number,
    pincode: Number,
    email: String,
    employeeName: String,
    employeeId: Number,
    position: String,
    phone: String,
    regPassword: String,
});

const grievanceSchema = new mongoose.Schema({
    name: String,
    contactNumber: String,
    address: String,
    pincode: Number,
    disasterType: String,
    assistanceRequired: String,
    description: String,
    peopleCount: Number,
    urgencyLevel: String,
});

const Employee = mongoose.model('Employee', employeeSchema);
const Grievance = mongoose.model('Grievance', grievanceSchema);

app.post('/register', async (req, res) => {
    try {
        const { regPassword } = req.body;
        const hashedPassword = await bcrypt.hash(regPassword, 10);

        const newEmployee = new Employee({
            ...req.body,
            regPassword: hashedPassword,
        });

        await newEmployee.save();
        res.status(201).json({ msg: "Employee registered successfully!" });
    } catch (err) {
        res.status(500).json({ msg: "Registration failed", error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const employee = await Employee.findOne({ employeeName: username });

        if (!employee) {
            return res.status(400).json({ msg: "Employee not found" });
        }

        const isMatch = await bcrypt.compare(password, employee.regPassword);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        res.status(200).json({ msg: "Login successful" });
    } catch (err) {
        res.status(500).json({ msg: "Login failed", error: err.message });
    }
});

app.post('/grievance', async (req, res) => {
    try {
        const newGrievance = new Grievance(req.body);
        await newGrievance.save();
        res.status(201).json({ msg: "Grievance reported successfully!" });
    } catch (err) {
        res.status(500).json({ msg: "Grievance submission failed", error: err.message });
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 5001');
});
