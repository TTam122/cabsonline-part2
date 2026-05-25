import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  address: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function MapView({ address }: MapViewProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address) return;

    async function geocode() {
      try {
        const query = encodeURIComponent(address + ', Auckland, New Zealand');
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await response.json();

        if (data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError('Could not find location on map.');
        }
      } catch (err) {
        setError('Could not load map.');
      }
    }

    geocode();
  }, [address]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!coords) return <p>Loading map...</p>;

  return (
    <MapContainer
      center={coords}
      zoom={15}
      style={{ height: '300px', width: '100%', marginTop: '1rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={coords}>
        <Popup>{address}</Popup>
      </Marker>
    </MapContainer>
  );
}