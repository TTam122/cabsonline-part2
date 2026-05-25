import { useState } from 'react';
import { API_URL } from '../config';

interface Booking {
  brn: string;
  cname: string;
  sbname: string;
  dsbname: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
}

export default function Payment() {
  const [brn, setBrn] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  async function lookupBooking() {
    setError('');
    setBooking(null);
    setPaid(false);

    const brnRegex = /^BRN\d{5}$/;
    if (!brnRegex.test(brn)) {
      setError('Invalid format. Please enter a reference number like BRN00001.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/status?brn=${brn}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      if (data.status === 'unassigned') {
        setError('Your booking has not been assigned yet. Please wait.');
        return;
      }

      if (data.status === 'paid') {
        setError('This booking has already been paid.');
        return;
      }

      setBooking(data);

    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitPayment() {
    setError('');

    if (cardName.trim() === '') {
      setError('Card holder name is required.');
      return;
    }

    const cardRegex = /^\d{16}$/;
    if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
      setError('Card number must be exactly 16 digits.');
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) {
      setError('Expiry date must be in MM/YY format.');
      return;
    }

    const [expMonth, expYear] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(expYear), parseInt(expMonth) - 1);
    if (expiryDate < new Date()) {
      setError('Card has expired.');
      return;
    }

    const cvvRegex = /^\d{3}$/;
    if (!cvvRegex.test(cvv)) {
      setError('CVV must be exactly 3 digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brn: booking?.brn })
      });

      const data = await response.json();

      if (data.success) {
        setPaid(true);
        setBooking(null);
      } else {
        setError(data.error);
      }

    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2>Payment</h2>

      {!booking && !paid && (
        <div className="search-row">
          <input
            type="text"
            value={brn}
            onChange={(e) => setBrn(e.target.value.toUpperCase())}
            placeholder="e.g. BRN00001"
          />
          <button className="btn-primary" onClick={lookupBooking} disabled={loading}>
            {loading ? 'Looking up...' : 'Look Up Booking'}
          </button>
        </div>
      )}

      {error && <div className="message-error">{error}</div>}

      {booking && (
        <>
          <h3>Booking Summary</h3>
          <table className="details-table">
            <tbody>
              <tr>
                <th>Booking Reference</th>
                <td>{booking.brn}</td>
              </tr>
              <tr>
                <th>Customer Name</th>
                <td>{booking.cname}</td>
              </tr>
              <tr>
                <th>Pickup Suburb</th>
                <td>{booking.sbname || 'Not specified'}</td>
              </tr>
              <tr>
                <th>Destination</th>
                <td>{booking.dsbname || 'Not specified'}</td>
              </tr>
              <tr>
                <th>Pickup Date</th>
                <td>{booking.pickup_date}</td>
              </tr>
              <tr>
                <th>Pickup Time</th>
                <td>{booking.pickup_time}</td>
              </tr>
            </tbody>
          </table>

          <h3>Payment Details</h3>
          <div className="form-row">
            <label>Card Holder Name</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div className="form-row">
            <label>Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234567890123456"
              maxLength={16}
            />
          </div>
          <div className="form-row">
            <label>Expiry Date (MM/YY)</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="12/27"
              maxLength={5}
            />
          </div>
          <div className="form-row">
            <label>CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="•••"
              maxLength={3}
            />
          </div>
          <div className="form-row">
            <button className="btn-primary" onClick={submitPayment} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </>
      )}

      {paid && (
        <div className="confirmation-box">
          <h3>Payment Successful!</h3>
          <p>Thank you for your payment.</p>
          <p>Booking reference: {brn}</p>
          <p>Your taxi has been confirmed. Have a safe journey!</p>
        </div>
      )}
    </div>
  );
}