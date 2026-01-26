import React, { useEffect, useState } from 'react';
import { getProfile, addMember, deleteMember, ProfileData } from '@services/profileService';
import AddMemberForm from './components/AddMemberForm';
import './Profile.css';

const Profile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [membersExpanded, setMembersExpanded] = useState(true);

    const fetchProfile = async () => {
        try {
            const resp = await getProfile();
            if (resp.success && resp.data) {
                setProfile(resp.data);
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAddMember = async (memberData: any) => {
        try {
            const resp = await addMember(memberData);
            if (resp.success) {
                setShowAddMember(false);
                fetchProfile(); // Reload to get updated list
            }
        } catch (err) {
            console.error('Failed to add member', err);
            alert('Failed to add member');
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this member?')) return;
        try {
            await deleteMember(id);
            fetchProfile();
        } catch (err) {
            console.error('Failed to delete member', err);
            alert('Failed to delete member');
        }
    };

    if (loading) return <div className="profile-page">Loading profile...</div>;
    if (!profile) return <div className="profile-page">Failed to load profile.</div>;

    // Find primary member for profile details (Avatar/DOB etc)
    const primaryMember = profile.members.find(m => m.isPrimaryMember);

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>My Profile</h1>
            </div>

            {/* Primary User Section */}
            <div className="section-card user-details">
                <div className="user-avatar-large">
                    {primaryMember?.avatar ? (
                        <img src={primaryMember.avatar} alt="Avatar" className="user-avatar-large" />
                    ) : (
                        <span>{profile.user.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div className="user-info-grid">
                    <div className="info-item">
                        <label>Name</label>
                        <div className="value">{profile.user.name}</div>
                    </div>
                    <div className="info-item">
                        <label>Email</label>
                        <div className="value">
                            {profile.user.email}
                            {profile.user.emailVerified && <span className="verified-icon" title="Verified">✓</span>}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Phone</label>
                        <div className="value">
                            {profile.user.phoneNumber || 'Not set'}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Date of Birth</label>
                        <div className="value">
                            {primaryMember?.dob ? new Date(primaryMember.dob).toLocaleDateString() : 'Not set'}
                        </div>
                    </div>
                    <div className="info-item">
                        <label>Age</label>
                        <div className="value">
                            {primaryMember?.age ?? 'N/A'}
                        </div>
                    </div>
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                        <label>Interests</label>
                        <div className="value">
                            {/* Render simplified interests if available */}
                            {Object.values(primaryMember?.interestProfile || {}).flat().join(', ') || 'No interests set'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Section */}
            <div className="section-card">
                <div className="members-header" onClick={() => setMembersExpanded(!membersExpanded)}>
                    <h2>Members ({profile.members.length - 1})</h2> {/* Exclude primary */}
                    <span>{membersExpanded ? '▼' : '▶'}</span>
                </div>

                {membersExpanded && (
                    <>
                        <div className="action-bar" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            {!showAddMember && <button className="add-member-btn" onClick={(e) => { e.stopPropagation(); setShowAddMember(true); }}>+ Add Member</button>}
                        </div>

                        {showAddMember && (
                            <AddMemberForm onSave={handleAddMember} onCancel={() => setShowAddMember(false)} />
                        )}

                        <div className="members-grid">
                            {profile.members.filter(m => !m.isPrimaryMember).map(member => (
                                <div key={member.id} className="member-card">
                                    <button className="delete-btn" onClick={() => handleDeleteMember(member.id)}>🗑</button>
                                    <div className="member-header">
                                        <div className="member-avatar">
                                            {member.avatar ? <img src={member.avatar} alt={member.name} /> : member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{member.relation || 'Member'}</div>
                                        </div>
                                    </div>
                                    <div className="member-details" style={{ fontSize: '0.9rem' }}>
                                        <div><strong>Age:</strong> {member.age ?? 'N/A'}</div>
                                        {member.dob && <div><strong>DOB:</strong> {new Date(member.dob).toLocaleDateString()}</div>}
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <strong>Interests:</strong><br />
                                            {Object.values(member.interestProfile || {}).flat().join(', ') || 'None'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {profile.members.filter(m => !m.isPrimaryMember).length === 0 && !showAddMember && (
                                <div style={{ fontStyle: 'italic', color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: '1rem' }}>
                                    No additional members added.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
