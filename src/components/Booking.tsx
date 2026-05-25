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
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

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
    setSuccess(false);
    setPickupAddress('');

    if (cname.trim() === '') { setMessage('Customer name is required.'); return; }
    if (phone.trim() === '') { setMessage('Phone number is required.'); return; }
    if (snumber.trim() === '') { setMessage('Street number is required.'); return; }
    if (stname.trim() === '') { setMessage('Street name is required.'); return; }
    if (date.trim() === '') { setMessage('Pickup date is required.'); return; }
    if (time.trim() === '') { setMessage('Pickup time is required.'); return; }

    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(phone.trim())) {
      setMessage('Phone number must be all digits and between 10 to 12 characters long.');
      return;
    }

    const dateParts = date.split('/');
    const timeParts = time.split(':');
    if (dateParts.length !== 3 || timeParts.length !== 2) {
      setMessage('Please enter date as DD/MM/YYYY and time as HH:MM.');
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
      setMessage('Pickup date and time cannot be in the past.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cname, phone, unumber, snumber, stname, sbname, dsbname, date, time })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage(`Booking reference number: ${data.brn}\nPickup time: ${data.pickup_time}\nPickup date: ${data.pickup_date}`);
        setPickupAddress(`${snumber} ${stname} ${sbname}`);
      } else {
        setMessage(data.error);
      }

    } catch (err) {
      setMessage('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2>Book a Taxi</h2>

      <div className="form-row">
        <label>Customer Name</label>
        <input type="text" value={cname} onChange={(e) => setCname(e.target.value)} placeholder="John Smith" />
      </div>
      <div className="form-row">
        <label>Phone Number</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0211234567" />
      </div>
      <div className="form-row">
        <label>Unit Number (optional)</label>
        <input type="text" value={unumber} onChange={(e) => setUnumber(e.target.value)} placeholder="e.g. 4B" />
      </div>
      <div className="form-row">
        <label>Street Number</label>
        <input type="text" value={snumber} onChange={(e) => setSnumber(e.target.value)} placeholder="e.g. 1" />
      </div>
      <div className="form-row">
        <label>Street Name</label>
        <input type="text" value={stname} onChange={(e) => setStname(e.target.value)} placeholder="e.g. Queen Street" />
      </div>
      <div className="form-row">
        <label>Suburb (optional)</label>
        <input type="text" value={sbname} onChange={(e) => setSbname(e.target.value)} placeholder="e.g. Auckland CBD" />
      </div>
      <div className="form-row">
        <label>Destination Suburb (optional)</label>
        <input type="text" value={dsbname} onChange={(e) => setDsbname(e.target.value)} placeholder="e.g. Northcote" />
      </div>
      <div className="form-row">
        <label>Pickup Date (DD/MM/YYYY)</label>
        <input type="text" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Pickup Time (HH:MM)</label>
        <input type="text" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <div className="form-row">
        <button className="btn-primary" onClick={submitBooking} disabled={loading}>
          {loading ? 'Booking...' : 'Book Taxi'}
        </button>
      </div>

      {message && (
        <div className={success ? 'confirmation-box' : 'message-error'}>
          {success && <h3>Thank you for your booking!</h3>}
          {message.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {pickupAddress && <MapView address={pickupAddress} />}
    </div>
  );
}