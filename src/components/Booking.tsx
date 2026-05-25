import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import MapView from './MapView';

export default function Booking() {
  const [cname, setCname] = useState('');
  const [phone, setPhone] = useState('');
  const [unumber, setUnumber] = useState('');
  const [snumber, setSnumber] = useState('');
  const [stname, setStname] = useState('');
  const [sbname, setSbname] = useState('');
  const [dsbname, setDsbname] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

  // Pre-fill date and time on load
  useEffect(() => {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    setDate(`${day}/${month}/${year}`);

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hours}:${minutes}`);
  }, []);

  async function submitBooking() {
    setMessage('');

    // Validation
    if (cname.trim() === '') {
      setMessage('Error: Customer name is required.');
      return;
    }
    if (phone.trim() === '') {
      setMessage('Error: Phone number is required.');
      return;
    }
    if (snumber.trim() === '') {
      setMessage('Error: Street number is required.');
      return;
    }
    if (stname.trim() === '') {
      setMessage('Error: Street name is required.');
      return;
    }
    if (date.trim() === '') {
      setMessage('Error: Pickup date is required.');
      return;
    }
    if (time.trim() === '') {
      setMessage('Error: Pickup time is required.');
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(phone.trim())) {
      setMessage('Error: Phone number must be all digits and between 10 to 12 characters long.');
      return;
    }

    // Date and time not in the past
    const dateParts = date.split('/');
    const timeParts = time.split(':');

    if (dateParts.length !== 3 || timeParts.length !== 2) {
      setMessage('Error: Please enter date as DD/MM/YYYY and time as HH:MM.');
      return;
    }

    const pickupDateTime = new Date(
      parseInt(dateParts[2]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[0]),
      parseInt(timeParts[0]),
      parseInt(timeParts[1])
    );

    if (pickupDateTime < new Date()) {
      setMessage('Error: Pickup date and time cannot be in the past.');
      return;
    }

    // Send to server
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cname, phone, unumber, snumber,
          stname, sbname, dsbname, date, time
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Thank you for your booking!\n` +
          `Booking reference number: ${data.brn}\n` +
          `Pickup time: ${data.pickup_time}\n` +
          `Pickup date: ${data.pickup_date}`
        );
        setPickupAddress(`${snumber} ${stname} ${sbname}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }

    } catch (err) {
      setMessage('Error: Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>CabsOnline - Book a Taxi</h2>

      <p>
        <label>Customer Name: </label>
        <input type="text" value={cname} onChange={(e) => setCname(e.target.value)} />
      </p>
      <p>
        <label>Phone Number: </label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </p>
      <p>
        <label>Unit Number: </label>
        <input type="text" value={unumber} onChange={(e) => setUnumber(e.target.value)} />
      </p>
      <p>
        <label>Street Number: </label>
        <input type="text" value={snumber} onChange={(e) => setSnumber(e.target.value)} />
      </p>
      <p>
        <label>Street Name: </label>
        <input type="text" value={stname} onChange={(e) => setStname(e.target.value)} />
      </p>
      <p>
        <label>Suburb: </label>
        <input type="text" value={sbname} onChange={(e) => setSbname(e.target.value)} />
      </p>
      <p>
        <label>Destination Suburb: </label>
        <input type="text" value={dsbname} onChange={(e) => setDsbname(e.target.value)} />
      </p>
      <p>
        <label>Pickup Date (DD/MM/YYYY): </label>
        <input type="text" value={date} onChange={(e) => setDate(e.target.value)} />
      </p>
      <p>
        <label>Pickup Time (HH:MM): </label>
        <input type="text" value={time} onChange={(e) => setTime(e.target.value)} />
      </p>
      <p>
        <button onClick={submitBooking} disabled={loading}>
          {loading ? 'Booking...' : 'Book Taxi'}
        </button>
      </p>

      {message && (
        <div id="reference">
          {message.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {pickupAddress && <MapView address={pickupAddress} />}
        </div>
      )}

    </div>
  );
}