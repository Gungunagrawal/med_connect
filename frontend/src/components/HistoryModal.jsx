import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const HistoryModal = ({ appointment, onClose, onSave }) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [prescriptionSummary, setPrescriptionSummary] = useState('');
    const [notes, setNotes] = useState('');

    // Vitals State
    const [bloodPressure, setBloodPressure] = useState('');
    const [weight, setWeight] = useState('');
    const [sugarLevel, setSugarLevel] = useState('');
    const [heartRate, setHeartRate] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const historyPayload = {
                patientId: appointment.patientId._id,
                appointmentId: appointment._id,
                diagnosis,
                prescriptionSummary,
                visitDate: appointment.date,
                notes
            };

            const reqConfig = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

            const { data } = await axios.post('http://localhost:4000/api/history/add', historyPayload, reqConfig);

            // If vitals are provided, save them too
            let metricsObj = {};
            if (bloodPressure || weight || sugarLevel || heartRate) {
                metricsObj = {
                    bloodPressure,
                    weight: weight ? Number(weight) : undefined,
                    sugarLevel: sugarLevel ? Number(sugarLevel) : undefined,
                    heartRate: heartRate ? Number(heartRate) : undefined,
                };
                const vitalsPayload = {
                    patientId: appointment.patientId._id,
                    appointmentId: appointment._id,
                    ...metricsObj,
                    recordedDate: new Date().toISOString()
                };
                await axios.post('http://localhost:4000/api/healthmetrics/add', vitalsPayload, reqConfig);
            }

            // Also save to DoctorLogs
            const logPayload = {
                patientId: appointment.patientId._id,
                appointmentId: appointment._id,
                diagnosis,
                prescription: prescriptionSummary,
                healthMetrics: metricsObj,
                visitDate: appointment.date
            };
            await axios.post('http://localhost:4000/api/doctorlogs/add', logPayload, reqConfig);

            if (data.success) {
                toast.success('Medical history saved successfully!');
                onSave();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving history');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Add Medical History: {appointment.patientId?.name}</h2>
                    <button onClick={onClose} className="text-3xl font-light hover:rotate-90 transition-transform">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg border">
                        <div><span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Date</span><p>{appointment.date}</p></div>
                        <div><span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Status</span><p>{appointment.status}</p></div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
                        <input
                            type="text"
                            required
                            className="w-full border p-2 rounded focus:ring-primary focus:border-primary"
                            placeholder="e.g. Viral Fever, Hypertension"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Prescription Summary</label>
                        <textarea
                            className="w-full border p-2 rounded focus:ring-primary focus:border-primary"
                            placeholder="Briefly state medicines prescribed..."
                            value={prescriptionSummary}
                            onChange={(e) => setPrescriptionSummary(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Private Notes</label>
                        <textarea
                            className="w-full border p-2 rounded focus:ring-primary focus:border-primary"
                            placeholder="Any clinical observations..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Vitals Section */}
                    <div className="pt-2 border-t mt-4">
                        <h3 className="font-bold text-slate-700 mb-3 block text-sm">Patient Vitals (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">BP (mmHg)</label>
                                <input type="text" placeholder="e.g. 120/80" className="w-full border p-2 rounded focus:ring-primary focus:border-primary text-sm" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Weight (kg)</label>
                                <input type="number" placeholder="e.g. 70" className="w-full border p-2 rounded focus:ring-primary focus:border-primary text-sm" value={weight} onChange={e => setWeight(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sugar (mg/dL)</label>
                                <input type="number" placeholder="e.g. 95" className="w-full border p-2 rounded focus:ring-primary focus:border-primary text-sm" value={sugarLevel} onChange={e => setSugarLevel(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Heart Rate (bpm)</label>
                                <input type="number" placeholder="e.g. 72" className="w-full border p-2 rounded focus:ring-primary focus:border-primary text-sm" value={heartRate} onChange={e => setHeartRate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-semibold">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded font-bold shadow-md">
                            {isSubmitting ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HistoryModal;
