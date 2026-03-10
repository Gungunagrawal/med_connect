import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Authenticate a doctor
// @route   POST /api/doctors/login
// @access  Public
export const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });

        if (doctor && (await bcrypt.compare(password, doctor.password))) {
            res.json({
                success: true,
                _id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                role: 'Doctor',
                token: generateToken(doctor._id, 'Doctor'),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get doctor related appointments
// @route   GET /api/doctors/appointments
// @access  Private (Doctor)
export const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.userId }).populate('patientId', 'name email');
        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/doctors/appointment/:id
// @access  Private (Doctor)
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Ensure it belongs to the logged-in doctor
        if (appointment.doctorId.toString() !== req.userId) {
            return res.status(401).json({ success: false, message: 'Not authorized for this appointment' });
        }

        appointment.status = status;
        await appointment.save();

        res.json({ success: true, message: `Appointment ${status}`, appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Doctor Profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
export const updateDoctorProfile = async (req, res) => {
    try {
        const { fees, about, availability, experience, timeSlots } = req.body;
        const doctor = await Doctor.findById(req.userId);

        if (doctor) {
            doctor.fees = fees || doctor.fees;
            doctor.about = about || doctor.about;
            doctor.availability = availability !== undefined ? availability : doctor.availability;
            doctor.experience = experience || doctor.experience;
            if (timeSlots) {
                doctor.timeSlots = timeSlots;
            }

            const updatedDoctor = await doctor.save();
            res.json({ success: true, doctor: updatedDoctor });
        } else {
            res.status(404).json({ success: false, message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get public doctor list
// @route   GET /api/doctors
// @access  Public
export const getDoctosList = async (req, res) => {
    try {
        const { speciality, minRating, name, availability } = req.query;
        let query = {};

        if (speciality) query.specialization = speciality;
        if (minRating) query.averageRating = { $gte: Number(minRating) };
        if (name) query.name = { $regex: name, $options: 'i' };
        if (availability !== undefined) query.availability = availability === 'true';

        const doctors = await Doctor.find(query).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
