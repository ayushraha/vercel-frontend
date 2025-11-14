import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { noteService } from '../services/noteService';
import { DEPARTMENTS, SEMESTERS } from '../utils/constants';
import { formatDate, truncateText } from '../utils/helpers';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/StudentDashboard.css';

export const StudentDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    subject: ''
  });
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await noteService.getAllNotes();
      setNotes(response.notes);
      setFilteredNotes(response.notes);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = notes;

    if (filters.department) {
      filtered = filtered.filter(note => note.department === filters.department);
    }

    if (filters.semester) {
      filtered = filtered.filter(note => note.semester === parseInt(filters.semester));
    }

    if (filters.subject) {
      filtered = filtered.filter(note =>
        note.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const handleDownload = async (noteId, fileName) => {
    try {
      await noteService.downloadNote(noteId);
      window.open(`${process.env.REACT_APP_API_URL.replace('/api', '')}${fileName}`, '_blank');
    } catch (err) {
      console.error('Error downloading note:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}! 📚</h1>
        <p>Explore notes for {user?.department} - Semester {user?.semester}</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="subject"
            placeholder="Search by subject..."
            value={filters.subject}
            onChange={handleFilterChange}
          />
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
          <button onClick={applyFilters} className="filter-btn">
            Apply Filters
          </button>
        </div>
      </div>

      <div className="notes-count">
        Showing {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
      </div>

      <div className="notes-grid">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <div key={note._id} className="note-card">
              <div className="note-header">
                <h3>{note.title}</h3>
                <span className="semester-badge">Sem {note.semester}</span>
              </div>
              <p className="note-subject"><strong>Subject:</strong> {note.subject}</p>
              <p className="note-department"><strong>Department:</strong> {note.department}</p>
              <p className="note-description">{truncateText(note.description || 'No description', 100)}</p>
              <div className="note-meta">
                <span>📥 {note.downloads} downloads</span>
                <span>📅 {formatDate(note.createdAt)}</span>
              </div>
              <button
                onClick={() => handleDownload(note._id, note.fileUrl)}
                className="download-btn"
              >
                ⬇️ Download
              </button>
            </div>
          ))
        ) : (
          <div className="no-notes">
            <p>No notes found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};