import { useState } from 'react';
import { API_URL } from '../config';

interface Booking {
  brn: string;
  cname: string;
  phone: string;
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

  // Payment form fields
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

    // Validate card fields
    if (cardName.trim() === '') {
      setError('Error: Card holder name is required.');
      return;
    }

    const cardRegex = /^\d{16}$/;
    if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
      setError('Error: Card number must be exactly 16 digits.');
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) {
      setError('Error: Expiry date must be in MM/YY format.');
      return;
    }

    // Check expiry not in the past
    const [expMonth, expYear] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(expYear), parseInt(expMonth) - 1);
    if (expiryDate < new Date()) {
      setError('Error: Card has expired.');
      return;
    }

    const cvvRegex = /^\d{3}$/;
    if (!cvvRegex.test(cvv)) {
      setError('Error: CVV must be exactly 3 digits.');
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
    <div>
      <h2>CabsOnline - Payment</h2>

      {/* BRN Lookup */}
      {!booking && !paid && (
        <p>
          <label>Booking Reference Number: </label>
          <input
            type="text"
            value={brn}
            onChange={(e) => setBrn(e.target.value.toUpperCase())}
            placeholder="e.g. BRN00001"
          />
          <button onClick={lookupBooking} disabled={loading}>
            {loading ? 'Looking up...' : 'Look Up Booking'}
          </button>
        </p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Booking Summary */}
      {booking && (
        <div>
          <h3>Booking Summary</h3>
          <table border={1}>
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

          {/* Payment Form */}
          <h3>Payment Details</h3>
          <p>
            <label>Card Holder Name: </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Smith"
            />
          </p>
          <p>
            <label>Card Number: </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234567890123456"
              maxLength={16}
            />
          </p>
          <p>
            <label>Expiry Date (MM/YY): </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="12/27"
              maxLength={5}
            />
          </p>
          <p>
            <label>CVV: </label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              maxLength={3}
            />
          </p>
          <p>
            <button onClick={submitPayment} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </p>
        </div>
      )}

      {/* Confirmation */}
      {paid && (
        <div style={{ color: 'green' }}>
          <h3>Payment Successful!</h3>
          <p>Thank you for your payment. Your booking reference was {brn}.</p>
          <p>Your taxi has been confirmed. Have a safe journey!</p>
        </div>
      )}
    </div>
  );
}