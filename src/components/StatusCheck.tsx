import { useState } from 'react';
import { API_URL } from '../config';
import MapView from './MapView';

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
    setBooking(null);
    setError('');

    const brnRegex = /^BRN\d{5}$/;
    if (!brnRegex.test(brn)) {
      setError('Invalid format. Please enter a reference number like BRN00001.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/status?brn=${brn}`);
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

  function getBadgeClass(status: string) {
    if (status === 'assigned') return 'badge badge-assigned';
    if (status === 'paid') return 'badge badge-paid';
    return 'badge badge-unassigned';
  }

  return (
    <div className="page">
      <h2>Check Booking Status</h2>

      <div className="search-row">
        <input
          type="text"
          value={brn}
          onChange={(e) => setBrn(e.target.value.toUpperCase())}
          placeholder="e.g. BRN00001"
        />
        <button className="btn-primary" onClick={checkStatus} disabled={loading}>
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}

      {booking && (
        <>
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
                <th>Phone</th>
                <td>{booking.phone}</td>
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
                <td>
                  <span className={getBadgeClass(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <MapView address={`${booking.snumber} ${booking.stname} ${booking.sbname}`} />
        </>
      )}
    </div>
  );
}