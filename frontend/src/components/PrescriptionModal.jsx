import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PrescriptionModal = ({ appointment, onClose, onSave }) => {
    const [medicines, setMedicines] = useState([
        { medicineName: '', dosage: '', duration: '', instructions: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [nextVisitDate, setNextVisitDate] = useState('');

    useEffect(() => {
        if (appointment && appointment.prescription && appointment.prescription.length > 0) {
            setMedicines(appointment.prescription);
            setNotes(appointment.notes || '');
            if (appointment.nextVisitDate) {
                setNextVisitDate(new Date(appointment.nextVisitDate).toISOString().split('T')[0]);
            }
        }
    }, [appointment]);

    const handleAddMedicine = () => {
        setMedicines([...medicines, { medicineName: '', dosage: '', duration: '', instructions: '' }]);
    };

    const handleRemoveMedicine = (index) => {
        const newMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(newMedicines);
    };

    const handleMedicineChange = (index, field, value) => {
        const newMedicines = [...medicines];
        newMedicines[index][field] = value;
        setMedicines(newMedicines);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:4000/api/prescription/add', {
                appointmentId: appointment._id,
                prescription: medicines,
                notes,
                nextVisitDate: nextVisitDate || null
            });

            if (data.success) {
                toast.success('Prescription saved successfully');
                onSave();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving prescription');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center bg-primary text-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Medical Prescription</h2>
                    <button onClick={onClose} className="text-2xl hover:text-slate-200 transition-colors">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800 border-l-4 border-primary pl-2">Medicines</h3>
                            <button
                                type="button"
                                onClick={handleAddMedicine}
                                className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition-colors"
                            >
                                + Add Medicine
                            </button>
                        </div>

                        {medicines.map((med, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50 relative group">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g. Paracetamol"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={med.medicineName}
                                        onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosage</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g. 1 tablet twice daily"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={med.dosage}
                                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g. 5 days"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={med.duration}
                                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructions</label>
                                    <select
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={med.instructions}
                                        onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                                    >
                                        <option value="">Select Instruction</option>
                                        <option value="Before Food">Before Food</option>
                                        <option value="After Food">After Food</option>
                                        <option value="With Milk">With Milk</option>
                                        <option value="At Bedtime">At Bedtime</option>
                                    </select>
                                </div>
                                {medicines.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedicine(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-slate-800 border-l-4 border-primary pl-2">Additional Notes</h3>
                            <textarea
                                className="w-full border p-3 rounded h-32 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="Any additional notes for the patient..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-slate-800 border-l-4 border-primary pl-2">Next Visit Date</h3>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Select follow-up date (if any)</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={nextVisitDate}
                                    onChange={(e) => setNextVisitDate(e.target.value)}
                                />
                                <p className="mt-2 text-xs text-slate-500 italic">This will be displayed as "Follow-up Required" on the patient's dashboard.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 rounded font-bold bg-primary text-white hover:bg-primary-dark shadow-md transition-all active:scale-95"
                        >
                            Save Prescription
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionModal;
