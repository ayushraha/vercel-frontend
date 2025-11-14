import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatCurrency } from '../utils/helpers';
import '../styles/AdminWallet.css';

export const AdminWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const walletResponse = await paymentService.getAdminWallet();
      const paymentsResponse = await paymentService.getPaymentHistory();

      setWallet(walletResponse.wallet);
      setPayments(paymentsResponse.payments);

      if (walletResponse.wallet.bankAccount) {
        setBankDetails(walletResponse.wallet.bankAccount);
      }
    } catch (err) {
      setMessage('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateBankDetails = async () => {
    try {
      const response = await paymentService.updateBankDetails(bankDetails);
      if (response.success) {
        setMessage('Bank details updated successfully!');
        fetchWalletData();
      }
    } catch (err) {
      setMessage('Failed to update bank details');
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > wallet.currentBalance) {
      setMessage('Insufficient balance');
      return;
    }

    try {
      const response = await paymentService.requestWithdrawal(parseFloat(withdrawAmount));
      if (response.success) {
        setMessage('Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        fetchWalletData();
      }
    } catch (err) {
      setMessage('Failed to process withdrawal');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-wallet">
      <div className="wallet-header">
        <h1>💰 Admin Wallet</h1>
      </div>

      {message && <div className="success-message">{message}</div>}

      <div className="wallet-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`tab-btn ${activeTab === 'banking' ? 'active' : ''}`}
          onClick={() => setActiveTab('banking')}
        >
          Banking
        </button>
        <button
          className={`tab-btn ${activeTab === 'withdrawal' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawal')}
        >
          Withdrawal
        </button>
      </div>

      {activeTab === 'overview' && wallet && (
        <div className="wallet-overview">
          <div className="wallet-cards">
            <div className="wallet-card primary">
              <h3>Total Earnings</h3>
              <p className="amount">₹{wallet.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="wallet-card success">
              <h3>Available Balance</h3>
              <p className="amount">₹{wallet.currentBalance.toFixed(2)}</p>
            </div>
            <div className="wallet-card warning">
              <h3>Pending Balance</h3>
              <p className="amount">₹{wallet.pendingBalance.toFixed(2)}</p>
            </div>
            <div className="wallet-card info">
              <h3>Total Withdrawals</h3>
              <p className="amount">₹{wallet.totalWithdrawals.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="transactions-section">
          <h3>Payment History</h3>
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Note Title</th>
                  <th>Amount</th>
                  <th>Platform Fee</th>
                  <th>Your Profit</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.studentId?.name || 'N/A'}</td>
                      <td>{payment.noteId?.title || 'N/A'}</td>
                      <td>₹{payment.amount.toFixed(2)}</td>
                      <td>₹{payment.platformFee?.toFixed(2) || '0.00'}</td>
                      <td className="profit">₹{payment.adminProfit?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className={`status ${payment.status}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">No transactions yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="banking-section">
          <h3>🏦 Bank Account Details</h3>
          <div className="bank-form">
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                placeholder="Full Name"
                value={bankDetails.accountHolderName}
                onChange={handleBankDetailsChange}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                value={bankDetails.accountNumber}
                onChange={handleBankDetailsChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="IFSC Code"
                  value={bankDetails.ifscCode}
                  onChange={handleBankDetailsChange}
                />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="Bank Name"
                  value={bankDetails.bankName}
                  onChange={handleBankDetailsChange}
                />
              </div>
            </div>
            <button onClick={handleUpdateBankDetails} className="save-btn">
              Save Bank Details
            </button>
          </div>
        </div>
      )}

      {activeTab === 'withdrawal' && wallet && (
        <div className="withdrawal-section">
          <h3>💸 Request Withdrawal</h3>
          <div className="withdrawal-form">
            <div className="info-box">
              <p><strong>Available Balance:</strong> ₹{wallet.currentBalance.toFixed(2)}</p>
              <p><strong>Pending Balance:</strong> ₹{wallet.pendingBalance.toFixed(2)}</p>
            </div>
            <div className="form-group">
              <label>Withdrawal Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="100"
                max={wallet.currentBalance}
              />
              <small>Minimum amount: ₹100</small>
            </div>
            <button
              onClick={handleWithdrawal}
              className="withdraw-btn"
              disabled={!withdrawAmount || withdrawAmount <= 0}
            >
              Request Withdrawal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};