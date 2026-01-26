import React, { useState } from 'react';
import '../Profile.css';

interface AddMemberFormProps {
    onSave: (member: any) => Promise<void>;
    onCancel: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        relation: 'Friend',
        interestProfile: {
            travel_interest: [],
            food_interest: [],
            activity_preferences: []
        }
        // Simplification: Not full nested interest profile UI yet, maybe just comma separated string or basics
    });

    // Handling interest as comma separated for now to be simple
    const [interests, setInterests] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const interestList = interests.split(',').map(i => i.trim()).filter(i => i);
            const submitData = {
                ...formData,
                interestProfile: {
                    ...formData.interestProfile,
                    activity_preferences: interestList
                }
            };
            await onSave(submitData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-member-form">
            <h3>Add New Member</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            required
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Relationship</label>
                        <select
                            value={formData.relation}
                            onChange={e => setFormData({ ...formData, relation: e.target.value })}
                        >
                            <option value="Friend">Friend</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Children">Children</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Interests (comma separated)</label>
                        <input
                            type="text"
                            placeholder="Hiking, Beach, Museums..."
                            value={interests}
                            onChange={e => setInterests(e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onCancel} disabled={loading} style={{ background: 'transparent', border: '1px solid #ccc', color: 'inherit' }} className="add-member-btn">Cancel</button>
                    <button type="submit" disabled={loading} className="add-member-btn">{loading ? 'Saving...' : 'Save Member'}</button>
                </div>
            </form>
        </div>
    );
};

export default AddMemberForm;
