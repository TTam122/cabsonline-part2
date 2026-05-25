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

export default function Admin() {
  const [bsearch, setBsearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);

  function showMessage(text: string, type: 'success' | 'error' | 'info') {
    setMessage(text);
    setMessageType(type);
  }

  async function searchBooking() {
    setMessage('');
    setBookings([]);

    if (bsearch.trim() !== '') {
      const brnRegex = /^BRN\d{5}$/;
      if (!brnRegex.test(bsearch.trim())) {
        showMessage('Invalid booking reference number format. Must be like BRN00001.', 'error');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bsearch: bsearch.trim() })
      });

      const data = await response.json();

      if (data.success) {
        if (data.bookings.length === 0) {
          showMessage('No bookings found.', 'info');
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

  async function assignBooking(brn: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brn })
      });

      const data = await response.json();

      if (data.success) {
        setBookings(prev =>
          prev.map(b => b.brn === brn ? { ...b, status: 'assigned' } : b)
        );
        showMessage(`Booking ${brn} has been successfully assigned!`, 'success');
      } else {
        showMessage(data.error, 'error');
      }

    } catch (err) {
      showMessage('Could not connect to the server. Please try again.', 'error');
    }
  }

  function getBadgeClass(status: string) {
    if (status === 'assigned') return 'badge badge-assigned';
    if (status === 'paid') return 'badge badge-paid';
    return 'badge badge-unassigned';
  }

  return (
    <div className="page">
      <h2>Admin Panel</h2>

      <div className="search-row">
        <input
          type="text"
          name="bsearch"
          value={bsearch}
          onChange={(e) => setBsearch(e.target.value.toUpperCase())}
          placeholder="BRN00001 or leave empty for upcoming"
        />
        <button
          name="sbutton"
          className="btn-primary"
          onClick={searchBooking}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Booking'}
        </button>
      </div>

      {message && (
        <div className={`message-${messageType}`}>
          {message}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Reference</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Pickup Suburb</th>
                <th>Destination Suburb</th>
                <th>Pickup Date and Time</th>
                <th>Status</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.brn}>
                  <td>{booking.brn}</td>
                  <td>{booking.cname}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.sbname || 'Not specified'}</td>
                  <td>{booking.dsbname || 'Not specified'}</td>
                  <td>{booking.pickup_date} {booking.pickup_time}</td>
                  <td>
                    <span className={getBadgeClass(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      id={`btn-${booking.brn}`}
                      onClick={() => assignBooking(booking.brn)}
                      disabled={booking.status === 'assigned'}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}