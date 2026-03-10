import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Admin Login
// @route   POST /api/admins/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // We expect the admin to be seeded or created with role 'Admin'
        const admin = await User.findOne({ email, role: 'Admin' });

        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({
                success: true,
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id, admin.role),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a new Doctor
// @route   POST /api/admins/add-doctor
// @access  Private (Admin)
export const addDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, fees, about, experience } = req.body;

        const doctorExists = await Doctor.findOne({ email });

        if (doctorExists) {
            return res.status(400).json({ success: false, message: 'Doctor already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doctor = await Doctor.create({
            name,
            email,
            password: hashedPassword,
            specialization,
            fees,
            about,
            experience,
        });

        if (doctor) {
            res.status(201).json({ success: true, message: 'Doctor added successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid doctor data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove a Doctor
// @route   DELETE /api/admins/doctor/:id
// @access  Private (Admin)
export const removeDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (doctor) {
            await Doctor.deleteOne({ _id: doctor._id });
            res.json({ success: true, message: 'Doctor removed' });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users (patients)
// @route   GET /api/admins/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'Patient' }).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all appointments
// @route   GET /api/admins/appointments
// @access  Private (Admin)
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization');
        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Dashboard Analytics
// @route   GET /api/admins/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
    try {
        const doctorsCount = await Doctor.countDocuments();
        const usersCount = await User.countDocuments({ role: 'Patient' });
        const appointmentsCount = await Appointment.countDocuments();

        // recent appointments
        const recentAppointments = await Appointment.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

        res.json({
            success: true,
            dashData: {
                doctors: doctorsCount,
                users: usersCount,
                appointments: appointmentsCount,
                recentAppointments,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
