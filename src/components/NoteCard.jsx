import React from 'react';
import { formatDate, truncateText } from '../utils/helpers';
import { PaymentModal } from './PaymentModal';
import '../styles/NoteCard.css';

export const NoteCard = ({ note, onDownload, onPurchase }) => {
  const [showPayment, setShowPayment] = React.useState(false);

  return (
    <>
      <div className={`note-card ${note.isPremium ? 'premium' : ''}`}>
        <div className="note-header">
          <div className="note-title-section">
            <h3>{note.title}</h3>
            {note.isPremium && <span className="premium-badge">💎 Premium</span>}
          </div>
          <span className="semester-badge">Sem {note.semester}</span>
        </div>
        <p className="note-subject"><strong>Subject:</strong> {note.subject}</p>
        <p className="note-department"><strong>Department:</strong> {note.department}</p>
        <p className="note-description">{truncateText(note.description || 'No description', 100)}</p>

        {note.isPremium && (
          <div className="premium-price">
            <span className="price-label">Price:</span>
            <span className="price-amount">₹{note.price}</span>
          </div>
        )}

        <div className="note-meta">
          <span>📥 {note.downloads} downloads</span>
          <span>📅 {formatDate(note.createdAt)}</span>
        </div>

        <div className="note-actions">
          {note.isPremium ? (
            <button
              onClick={() => setShowPayment(true)}
              className="purchase-btn"
            >
              🛒 Buy Note
            </button>
          ) : (
            <button
              onClick={() => onDownload(note._id, note.fileUrl)}
              className="download-btn"
            >
              ⬇️ Download
            </button>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          note={note}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onPurchase && onPurchase(note._id);
          }}
        />
      )}
    </>
  );
};