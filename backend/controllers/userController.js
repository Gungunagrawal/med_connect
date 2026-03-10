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

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Book an appointment
// @route   POST /api/users/book-appointment
// @access  Private
export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;

        // Simple validation (can add checking if slot is taken)
        const appointmentExists = await Appointment.findOne({ doctorId, date, time, status: { $ne: 'Rejected' } });
        if (appointmentExists) {
            return res.status(400).json({ success: false, message: 'Slot not available' });
        }

        const appointment = await Appointment.create({
            patientId: req.userId,
            doctorId,
            date,
            time,
            status: 'Pending',
        });

        res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user appointments
// @route   GET /api/users/appointments
// @access  Private
export const getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.userId }).populate('doctorId', 'name specialization fees image');
        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel appointment
// @route   PUT /api/users/cancel-appointment/:id
// @access  Private
export const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.patientId.toString() !== req.userId) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        appointment.status = 'Rejected'; // Or cancelled
        await appointment.save();

        res.json({ success: true, message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
