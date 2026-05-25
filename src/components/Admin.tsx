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
  const [loading, setLoading] = useState(false);

  async function searchBooking() {
    setMessage('');
    setBookings([]);

    // Validate BRN format if non-empty
    if (bsearch.trim() !== '') {
      const brnRegex = /^BRN\d{5}$/;
      if (!brnRegex.test(bsearch.trim())) {
        setMessage('Error: Invalid booking reference number format. Must be in the format BRN00001.');
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
          setMessage('No bookings found.');
        } else {
          setBookings(data.bookings);
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }

    } catch (err) {
      setMessage('Error: Could not connect to the server. Please try again.');
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
        // Update status in table without re-fetching
        setBookings(prev =>
          prev.map(b =>
            b.brn === brn ? { ...b, status: 'assigned' } : b
          )
        );
        setMessage(`Congratulations! Booking request ${brn} has been assigned!`);
      } else {
        setMessage(`Error: ${data.error}`);
      }

    } catch (err) {
      setMessage('Error: Could not connect to the server. Please try again.');
    }
  }

  return (
    <div>
      <h2>CabsOnline - Admin Panel</h2>

      <p>
        <label>Booking Reference Number: </label>
        <input
          type="text"
          name="bsearch"
          value={bsearch}
          onChange={(e) => setBsearch(e.target.value.toUpperCase())}
          placeholder="e.g. BRN00001 or leave empty"
        />
        <button name="sbutton" onClick={searchBooking} disabled={loading}>
          {loading ? 'Searching...' : 'Search Booking'}
        </button>
      </p>

      {message && (
        <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>
          {message}
        </p>
      )}

      {bookings.length > 0 && (
        <div className="content">
          <table border={1}>
            <thead>
              <tr>
                <th>Booking Reference Number</th>
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
                  <td style={{
                    color: booking.status === 'assigned' ? 'green' : 'orange',
                    fontWeight: 'bold'
                  }}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </td>
                  <td>
                    <button
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