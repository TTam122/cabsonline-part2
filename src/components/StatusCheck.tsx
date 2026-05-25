import { useState } from 'react';

interface Booking {
  brn: string;
  cname: string;
  phone: string;
  unumber: string;
  snumber: string;
  stname: string;
  sbname: string;
  dsbname: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
}

export default function StatusCheck() {
  const [brn, setBrn] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function checkStatus() {
    // Reset previous results
    setBooking(null);
    setError('');

    // Validate BRN format
    const brnRegex = /^BRN\d{5}$/;
    if (!brnRegex.test(brn)) {
      setError(
        'Invalid format. Please enter a reference number like BRN00001.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://cabsonline-part2-production.up.railway.app/api/status?brn=${brn}`
      );
      const data = await response.json();

      if (data.success) {
        setBooking(data);
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
      <h2>Check Booking Status</h2>

      <p>
        <label htmlFor="brn">Booking Reference Number: </label>
        <input
          type="text"
          id="brn"
          value={brn}
          onChange={(e) => setBrn(e.target.value.toUpperCase())}
          placeholder="e.g. BRN00001"
        />
        <button onClick={checkStatus} disabled={loading}>
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {booking && (
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
              <th>Pickup Address</th>
              <td>
                {booking.unumber ? booking.unumber + '/' : ''}
                {booking.snumber} {booking.stname}
                {booking.sbname ? ', ' + booking.sbname : ''}
              </td>
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
            <tr>
              <th>Status</th>
              <td
                style={{
                  color: booking.status === 'assigned' ? 'green' : 'orange',
                  fontWeight: 'bold',
                }}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
