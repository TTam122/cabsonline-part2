import { useState } from 'react';
import { API_URL } from '../config';
import MapView from './MapView';

interface Booking {
  brn: string;
  cname: string;
  phone: string;
  snumber: string;
  stname: string;
  sbname: string;
  dsbname: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
}

export default function Driver() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);

  function showMessage(text: string, type: 'success' | 'error' | 'info') {
    setMessage(text);
    setMessageType(type);
  }

  async function fetchAvailableBookings() {
    setMessage('');
    setBookings([]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/driver/bookings`);
      const data = await response.json();

      if (data.success) {
        if (data.bookings.length === 0) {
          showMessage('No available bookings at this time.', 'info');
        } else {
          setBookings(data.bookings);
        }
      } else {
        showMessage(data.error, 'error');
      }

    } catch (err) {
      showMessage('Could not connect to the server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function claimBooking(brn: string) {
    try {
      const response = await fetch(`${API_URL}/api/driver/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brn })
      });

      const data = await response.json();

      if (data.success) {
        setBookings(prev => prev.filter(b => b.brn !== brn));
        showMessage(`Booking ${brn} has been successfully claimed!`, 'success');
      } else {
        showMessage(data.error, 'error');
      }

    } catch (err) {
      showMessage('Could not connect to the server. Please try again.', 'error');
    }
  }

  return (
    <div className="page">
      <h2>Driver Portal</h2>

      <div className="form-row">
        <button
          className="btn-primary"
          onClick={fetchAvailableBookings}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Show Available Bookings'}
        </button>
      </div>

      {message && (
        <div className={`message-${messageType}`}>
          {message}
        </div>
      )}

      {bookings.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking Reference</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Pickup Address</th>
              <th>Pickup Suburb</th>
              <th>Destination</th>
              <th>Pickup Date</th>
              <th>Pickup Time</th>
              <th>Map</th>
              <th>Claim</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <>
                <tr key={booking.brn}>
                  <td>{booking.brn}</td>
                  <td>{booking.cname}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.snumber} {booking.stname}</td>
                  <td>{booking.sbname || 'Not specified'}</td>
                  <td>{booking.dsbname || 'Not specified'}</td>
                  <td>{booking.pickup_date}</td>
                  <td>{booking.pickup_time}</td>
                  <td>—</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => claimBooking(booking.brn)}
                    >
                      Claim
                    </button>
                  </td>
                </tr>
                <tr key={`map-${booking.brn}`}>
                  <td colSpan={10}>
                    <MapView address={`${booking.snumber} ${booking.stname} ${booking.sbname}`} />
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}