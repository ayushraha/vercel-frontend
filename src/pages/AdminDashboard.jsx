import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { noteService } from '../services/noteService';
import { paymentService } from '../services/paymentService';
import { adminService } from '../services/adminService';
import { DEPARTMENTS, SEMESTERS } from '../utils/constants';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/AdminDashboard.css';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    department: '',
    semester: '',
    description: '',
    isPremium: false,
    price: 0,
    file: null
  });
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchNotes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await noteService.getAllNotes();
      setNotes(response.notes);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchWalletData = async () => {
  try {
    const response = await paymentService.getAdminWallet();
    
    // ✅ Handle both success cases
    if (response.success) {
      setWalletData(response.wallet);
      setMessage(''); // Clear any error messages
    } else {
      // If wallet creation failed on backend
      setMessage('❌ ' + (response.message || 'Unable to load wallet'));
    }
  } catch (err) {
    console.error('Error fetching wallet:', err);
    
    // ✅ Better error message for user
    if (err.response?.status === 404) {
      setMessage('⚠️ Wallet not found. Please refresh the page.');
    } else if (err.response?.status === 401) {
      setMessage('❌ You must be logged in as admin');
    } else {
      setMessage('❌ Failed to load wallet data');
    }
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handlePremiumToggle = (e) => {
    const isPremium = e.target.value === 'premium';
    setFormData(prev => ({
      ...prev,
      isPremium,
      price: isPremium ? prev.price : 0
    }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validation
      if (!formData.title.trim()) {
        setMessage('Please enter note title');
        setLoading(false);
        return;
      }

      if (!formData.subject.trim()) {
        setMessage('Please enter subject');
        setLoading(false);
        return;
      }

      if (!formData.department) {
        setMessage('Please select department');
        setLoading(false);
        return;
      }

      if (!formData.semester) {
        setMessage('Please select semester');
        setLoading(false);
        return;
      }

      if (!formData.file) {
        setMessage('Please select a file');
        setLoading(false);
        return;
      }

      if (formData.isPremium && formData.price < 10) {
        setMessage('Premium note price must be at least ₹10');
        setLoading(false);
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('department', formData.department);
      uploadFormData.append('semester', formData.semester);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('isPremium', formData.isPremium);
      uploadFormData.append('price', formData.isPremium ? formData.price : 0);
      uploadFormData.append('file', formData.file);

      await noteService.uploadNote(uploadFormData);
      setMessage('✅ Note uploaded successfully!');
      setFormData({
        title: '',
        subject: '',
        department: '',
        semester: '',
        description: '',
        isPremium: false,
        price: 0,
        file: null
      });
      // Reset file input
      document.querySelector('input[type="file"]').value = '';
      fetchNotes();
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await noteService.deleteNote(noteId);
        setMessage('✅ Note deleted successfully');
        fetchNotes();
      } catch (err) {
        setMessage('❌ Failed to delete note');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        setMessage('✅ User deleted successfully');
        fetchUsers();
      } catch (err) {
        setMessage('❌ Failed to delete user');
      }
    }
  };

  if (!stats && activeTab === 'stats') {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => { setActiveTab('upload'); fetchNotes(); }}
        >
          📤 Upload Notes
        </button>
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => { setActiveTab('notes'); fetchNotes(); }}
        >
          📝 Manage Notes
        </button>
        <button
          className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => { setActiveTab('wallet'); fetchWalletData(); }}
        >
          💰 My Wallet
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); fetchUsers(); }}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => { setActiveTab('stats'); fetchStats(); }}
        >
          📊 Statistics
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="upload-section">
          <h2>📤 Upload New Note</h2>
          <form onSubmit={handleUploadSubmit} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Note Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="e.g., Database Management Systems"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  placeholder="e.g., DBMS"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="semester">Semester *</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Add description about the note (optional)"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="noteType">Note Type *</label>
                <select
                  id="noteType"
                  name="isPremium"
                  value={formData.isPremium ? 'premium' : 'free'}
                  onChange={handlePremiumToggle}
                  disabled={loading}
                >
                  <option value="free">🆓 Free Note</option>
                  <option value="premium">💎 Premium Note (Paid)</option>
                </select>
              </div>

              {formData.isPremium && (
                <div className="form-group">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    placeholder="e.g., 50"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={loading}
                    min="10"
                    step="10"
                    required={formData.isPremium}
                  />
                  <small>Minimum: ₹10 | You'll receive 90% after platform fee</small>
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="file">Upload File (.pdf, .doc, .docx, .txt) *</label>
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>

            {formData.isPremium && (
              <div className="price-info">
                <h4>💰 Earnings Breakdown</h4>
                <p>
                  <strong>Price:</strong> ₹{formData.price || 0}
                </p>
                <p>
                  <strong>Platform Fee (10%):</strong> ₹{((formData.price || 0) * 0.1).toFixed(2)}
                </p>
                <p className="your-earnings">
                  <strong>Your Earning (90%):</strong> ₹{((formData.price || 0) * 0.9).toFixed(2)}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? '⏳ Uploading...' : '✅ Upload Note'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="notes-section">
          <h2>📝 Manage Notes ({notes.length})</h2>
          {notes.length > 0 ? (
            <div className="notes-list">
              {notes.map(note => (
                <div key={note._id} className={`note-card ${note.isPremium ? 'premium' : 'free'}`}>
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    {note.isPremium && <span className="badge-premium">💎 Premium</span>}
                    {!note.isPremium && <span className="badge-free">🆓 Free</span>}
                  </div>
                  <p><strong>Subject:</strong> {note.subject}</p>
                  <p><strong>Department:</strong> {note.department}</p>
                  <p><strong>Semester:</strong> {note.semester}</p>
                  <p><strong>Downloads:</strong> {note.downloads || 0}</p>
                  {note.isPremium && (
                    <p><strong>Price:</strong> ₹{note.price}</p>
                  )}
                  {note.isPremium && (
                    <p><strong>Paid Downloads:</strong> {note.paidDownloads || 0}</p>
                  )}
                  <button 
                    onClick={() => handleDeleteNote(note._id)} 
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No notes uploaded yet. Go to Upload tab to create your first note!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="wallet-section">
          <h2>💰 My Wallet</h2>
          {walletData ? (
            <div className="wallet-info">
              <div className="wallet-cards">
                <div className="wallet-card primary">
                  <h3>Total Earnings</h3>
                  <p className="amount">₹{walletData.totalEarnings?.toFixed(2) || 0}</p>
                </div>
                <div className="wallet-card success">
                  <h3>Available Balance</h3>
                  <p className="amount">₹{walletData.currentBalance?.toFixed(2) || 0}</p>
                </div>
                <div className="wallet-card warning">
                  <h3>Pending Balance</h3>
                  <p className="amount">₹{walletData.pendingBalance?.toFixed(2) || 0}</p>
                </div>
                <div className="wallet-card info">
                  <h3>Total Withdrawals</h3>
                  <p className="amount">₹{walletData.totalWithdrawals?.toFixed(2) || 0}</p>
                </div>
              </div>
              <div className="wallet-note">
                <p>💡 <strong>Note:</strong> You receive 90% of the premium note price. 10% is the platform fee.</p>
              </div>
              <button 
                onClick={() => navigate('/admin-wallet')}
                className="manage-wallet-btn"
              >
                💳 Manage Wallet & Withdrawals
              </button>
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <h2>👥 Users ({users.length})</h2>
          {users.length > 0 ? (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? '👨‍💼 Admin' : '👤 Student'}
                        </span>
                      </td>
                      <td>{user.department}</td>
                      <td>{user.semester}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteUser(user._id)} 
                          className="delete-btn"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No users found.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="stats-section">
          <h2>📊 Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card blue">
              <h3>📚 Total Notes</h3>
              <p className="stat-value">{stats.totalNotes || 0}</p>
            </div>
            <div className="stat-card green">
              <h3>👥 Total Students</h3>
              <p className="stat-value">{stats.totalStudents || 0}</p>
            </div>
            <div className="stat-card purple">
              <h3>👨‍💼 Total Admins</h3>
              <p className="stat-value">{stats.totalAdmins || 0}</p>
            </div>
            <div className="stat-card orange">
              <h3>📥 Total Downloads</h3>
              <p className="stat-value">{stats.totalDownloads || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};