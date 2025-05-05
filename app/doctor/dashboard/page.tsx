"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Case {
  _id: string;
  title: string;
  description: string;
  status: string;
  medicalIssue?: string;
  costBreakdown?: { surgery: string; medicine: string; recovery: string; other: string } | { item: string; cost: number }[];
  imageUrl?: string[];
}

interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  specialization: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'cases' | 'profile' | 'history'>('cases');
  const [cases, setCases] = useState<Case[]>([]);
  const [history, setHistory] = useState<Case[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [editProfile, setEditProfile] = useState<DoctorProfile | null>(null);
  const [profilePassword, setProfilePassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [viewModal, setViewModal] = useState<Case | null>(null);
  const [editModal, setEditModal] = useState<Case | null>(null);
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editCost, setEditCost] = useState<{ surgery: string; medicine: string; recovery: string; other: string }>({ surgery: '', medicine: '', recovery: '', other: '' });
  const [editMsg, setEditMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    // Fetch assigned cases
    fetch('http://localhost:5001/api/doctor/cases', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch cases'))
      .then(data => {
        setCases(data.filter((c: Case) => c.status !== 'completed' && c.status !== 'closed'));
        setHistory(data.filter((c: Case) => c.status === 'completed' || c.status === 'closed'));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch cases');
        setLoading(false);
      });
    // Fetch profile
    fetch('http://localhost:5001/api/doctor/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch profile'))
      .then(data => {
        setProfile(data);
        setEditProfile(data);
      })
      .catch(() => setError('Failed to fetch profile'));
  }, [router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editProfile) return;
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    const token = localStorage.getItem('doctorToken');
    if (!token || !editProfile) return;
    const body: any = { ...editProfile };
    if (profilePassword) body.password = profilePassword;
    const res = await fetch('http://localhost:5001/api/doctor/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.doctor);
      setProfileMsg('Profile updated successfully!');
      setProfilePassword('');
    } else {
      setProfileMsg('Failed to update profile.');
    }
  };

  // Helper to parse cost breakdown
  function parseCostBreakdown(cb: any): { surgery: string; medicine: string; recovery: string; other: string } {
    if (Array.isArray(cb)) {
      // [{item, cost}] format
      const map: any = {};
      cb.forEach((c: any) => { map[c.item?.toLowerCase()] = c.cost?.toString() || ''; });
      return {
        surgery: map.surgery || '',
        medicine: map.medicine || '',
        recovery: map.recovery || '',
        other: map.other || ''
      };
    }
    return cb || { surgery: '', medicine: '', recovery: '', other: '' };
  }

  // Open edit modal and prefill fields
  const openEditModal = (caseItem: Case) => {
    setEditModal(caseItem);
    setEditDiagnosis(caseItem.medicalIssue || '');
    setEditStatus(caseItem.status || '');
    setEditCost(parseCostBreakdown(caseItem.costBreakdown));
    setEditMsg('');
  };

  // Handle edit form submit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setEditMsg('');
    const token = localStorage.getItem('doctorToken');
    if (!token) return;
    // Prepare cost breakdown as array
    const costBreakdown = [
      { item: 'Surgery', cost: parseFloat(editCost.surgery) || 0 },
      { item: 'Medicine', cost: parseFloat(editCost.medicine) || 0 },
      { item: 'Recovery', cost: parseFloat(editCost.recovery) || 0 },
      { item: 'Other', cost: parseFloat(editCost.other) || 0 }
    ];
    const res = await fetch(`http://localhost:5001/api/doctor/cases/${editModal._id}/diagnosis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        medicalIssue: editDiagnosis,
        costBreakdown,
        status: editStatus
      })
    });
    if (res.ok) {
      setEditMsg('Case updated successfully!');
      // Refresh cases
      fetch('http://localhost:5001/api/doctor/cases', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch cases'))
        .then(data => {
          setCases(data.filter((c: Case) => c.status !== 'completed' && c.status !== 'closed'));
          setHistory(data.filter((c: Case) => c.status === 'completed' || c.status === 'closed'));
        });
      setTimeout(() => setEditModal(null), 1200);
    } else {
      setEditMsg('Failed to update case.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Doctor Dashboard</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('cases')} className={`px-4 py-2 rounded ${tab === 'cases' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Cases</button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded ${tab === 'history' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Case History</button>
        <button onClick={() => setTab('profile')} className={`px-4 py-2 rounded ${tab === 'profile' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Profile</button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {tab === 'cases' && (
        <div>
          {loading ? (
            <p className="text-gray-400">Loading cases...</p>
          ) : cases.length === 0 ? (
            <p className="text-gray-400">No assigned cases.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cases.map((caseItem) => (
                <div key={caseItem._id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{caseItem.title}</h2>
                    <p className="text-gray-300 mb-2">{caseItem.description}</p>
                    <p className="text-gray-400 mb-1">Status: {caseItem.status}</p>
                    {caseItem.medicalIssue && <p className="text-gray-400 mb-1">Medical Issue: {caseItem.medicalIssue}</p>}
                    {caseItem.costBreakdown && (
                      <div className="mt-2">
                        <h3 className="text-gray-300 font-semibold">Cost Breakdown:</h3>
                        <ul className="text-gray-400">
                          {Array.isArray(caseItem.costBreakdown) ? (
                            caseItem.costBreakdown.map((c: any, idx: number) => (
                              <li key={idx}>{c.item}: {c.cost}</li>
                            ))
                          ) : (
                            <>
                              <li>Surgery: {caseItem.costBreakdown.surgery}</li>
                              <li>Medicine: {caseItem.costBreakdown.medicine}</li>
                              <li>Recovery: {caseItem.costBreakdown.recovery}</li>
                              <li>Other: {caseItem.costBreakdown.other}</li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                    {caseItem.imageUrl && caseItem.imageUrl.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {caseItem.imageUrl.map((img, idx) => (
                          <img key={idx} src={`http://localhost:5001/${img}`} alt="Case" className="w-24 h-24 object-cover rounded border" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setViewModal(caseItem)}>View</button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => openEditModal(caseItem)}>Edit</button>
                    {/* Mark as Completed button can be implemented here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setViewModal(null)}>&times;</button>
            <h2 className="text-xl font-semibold text-white mb-2">{viewModal.title}</h2>
            <p className="text-gray-300 mb-2">{viewModal.description}</p>
            <p className="text-gray-400 mb-1">Status: {viewModal.status}</p>
            {viewModal.medicalIssue && <p className="text-gray-400 mb-1">Medical Issue: {viewModal.medicalIssue}</p>}
            {viewModal.costBreakdown && (
              <div className="mt-2">
                <h3 className="text-gray-300 font-semibold">Cost Breakdown:</h3>
                <ul className="text-gray-400">
                  {Array.isArray(viewModal.costBreakdown) ? (
                    viewModal.costBreakdown.map((c: any, idx: number) => (
                      <li key={idx}>{c.item}: {c.cost}</li>
                    ))
                  ) : (
                    <>
                      <li>Surgery: {viewModal.costBreakdown.surgery}</li>
                      <li>Medicine: {viewModal.costBreakdown.medicine}</li>
                      <li>Recovery: {viewModal.costBreakdown.recovery}</li>
                      <li>Other: {viewModal.costBreakdown.other}</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            {viewModal.imageUrl && viewModal.imageUrl.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {viewModal.imageUrl.map((img, idx) => (
                  <img key={idx} src={`http://localhost:5001/${img}`} alt="Case" className="w-24 h-24 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setEditModal(null)}>&times;</button>
            <h2 className="text-xl font-semibold text-white mb-4">Edit Case Diagnosis</h2>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Diagnosis / Medical Issue</label>
                <input type="text" value={editDiagnosis} onChange={e => setEditDiagnosis(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Cost Breakdown</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" placeholder="Surgery" value={editCost.surgery} onChange={e => setEditCost({ ...editCost, surgery: e.target.value })} className="p-2 rounded bg-gray-700 text-white" />
                  <input type="number" step="0.01" placeholder="Medicine" value={editCost.medicine} onChange={e => setEditCost({ ...editCost, medicine: e.target.value })} className="p-2 rounded bg-gray-700 text-white" />
                  <input type="number" step="0.01" placeholder="Recovery" value={editCost.recovery} onChange={e => setEditCost({ ...editCost, recovery: e.target.value })} className="p-2 rounded bg-gray-700 text-white" />
                  <input type="number" step="0.01" placeholder="Other" value={editCost.other} onChange={e => setEditCost({ ...editCost, other: e.target.value })} className="p-2 rounded bg-gray-700 text-white" />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Diagnosis</button>
              {editMsg && <p className="mt-2 text-green-400">{editMsg}</p>}
            </form>
          </div>
        </div>
      )}
      {tab === 'history' && (
        <div>
          {loading ? (
            <p className="text-gray-400">Loading case history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400">No completed/closed cases.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((caseItem) => (
                <div key={caseItem._id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-2">{caseItem.title}</h2>
                  <p className="text-gray-300 mb-2">{caseItem.description}</p>
                  <p className="text-gray-400">Status: {caseItem.status}</p>
                  {caseItem.medicalIssue && <p className="text-gray-400">Medical Issue: {caseItem.medicalIssue}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'profile' && profile && editProfile && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">My Profile</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <input type="text" name="name" value={editProfile.name} onChange={handleProfileChange} className="w-full p-2 rounded bg-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input type="email" name="email" value={editProfile.email} onChange={handleProfileChange} className="w-full p-2 rounded bg-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Specialization</label>
              <input type="text" name="specialization" value={editProfile.specialization} onChange={handleProfileChange} className="w-full p-2 rounded bg-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <input type="password" name="password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Leave blank to keep current password" />
            </div>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save Changes</button>
            {profileMsg && <p className="mt-2 text-green-400">{profileMsg}</p>}
          </form>
        </div>
      )}
    </div>
  );
} 