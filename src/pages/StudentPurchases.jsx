import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import '../styles/StudentPurchases.css';

export const StudentPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getStudentPurchases();
      setPurchases(response.purchases || []);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="student-purchases">
      <h2>📥 My Purchased Notes</h2>

      {purchases.length > 0 ? (
        <div className="purchases-table">
          <table>
            <thead>
              <tr>
                <th>Note Title</th>
                <th>Subject</th>
                <th>Price</th>
                <th>Purchase Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase._id}>
                  <td>{purchase.noteId?.title || 'N/A'}</td>
                  <td>{purchase.noteId?.subject || 'N/A'}</td>
                  <td>₹{purchase.amount.toFixed(2)}</td>
                  <td>{formatDate(purchase.createdAt)}</td>
                  <td>
                    <span className={`status ${purchase.status}`}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-purchases">
          <p>You haven't purchased any premium notes yet.</p>
        </div>
      )}
    </div>
  );
};