import { useState } from 'react';
import { API_URL } from '../config';

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
    const [loading, setLoading] = useState(false);

    async function fetchAvailableBookings() {
        setMessage('');
        setBookings([]);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/driver/bookings`);
            const data = await response.json();

            if (data.success) {
                if (data.bookings.length === 0) {
                    setMessage('No available bookings at this time.');
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

    async function claimBooking(brn: string) {
        try {
            const response = await fetch(`${API_URL}/api/driver/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brn })
            });

            const data = await response.json();

            if (data.success) {
                // Remove claimed booking from the list
                setBookings(prev => prev.filter(b => b.brn !== brn));
                setMessage(`Booking ${brn} has been successfully claimed!`);
            } else {
                setMessage(`Error: ${data.error}`);
            }

        } catch (err) {
            setMessage('Error: Could not connect to the server. Please try again.');
        }
    }

    return (
        <div>
            <h2>CabsOnline - Driver Portal</h2>

            <p>
                <button onClick={fetchAvailableBookings} disabled={loading}>
                    {loading ? 'Loading...' : 'Show Available Bookings'}
                </button>
            </p>

            {message && (
                <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>
                    {message}
                </p>
            )}

            {bookings.length > 0 && (
                <table border={1}>
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
                            <th>Claim</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.brn}>
                                <td>{booking.brn}</td>
                                <td>{booking.cname}</td>
                                <td>{booking.phone}</td>
                                <td>{booking.snumber} {booking.stname}</td>
                                <td>{booking.sbname || 'Not specified'}</td>
                                <td>{booking.dsbname || 'Not specified'}</td>
                                <td>{booking.pickup_date}</td>
                                <td>{booking.pickup_time}</td>
                                <td>
                                    <button onClick={() => claimBooking(booking.brn)}>
                                        Claim
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}