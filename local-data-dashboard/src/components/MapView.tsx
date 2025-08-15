import React, { useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
// @ts-ignore
import MarkerClusterGroup from 'react-leaflet-markercluster';
import type { LocationItem } from '../types';

// Fix default icon path for Leaflet (markers won't show otherwise in Vite)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  items: LocationItem[];
  height?: string;
}

/**
 * แสดงแผนที่และหมุดสถานที่ด้วย Leaflet พร้อมการคลัสเตอร์
 */
export default function MapView({ items, height = '400px' }: Props) {
  // คำนวณ center ของแผนที่จากรายการที่มีพิกัด
  const center = useMemo(() => {
    const coords = items.filter((i) => i.lat && i.lng) as Required<
      Pick<LocationItem, 'lat' | 'lng'>
    >[];
    if (coords.length === 0) {
      // fallback ไปยังบางกอก
      return [13.757, 100.501] as [number, number];
    }
    const avgLat = coords.reduce((sum, p) => sum + (p.lat || 0), 0) / coords.length;
    const avgLng = coords.reduce((sum, p) => sum + (p.lng || 0), 0) / coords.length;
    return [avgLat, avgLng] as [number, number];
  }, [items]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6" style={{ height }}>
      <h3 className="text-lg font-semibold mb-2">แผนที่สถานที่</h3>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: `calc(${height} - 2.5rem)` }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup>
          {items
            .filter((i) => i.lat && i.lng)
            .map((item) => (
              <Marker key={item.id} position={[item.lat!, item.lng!] as [number, number]}>
                <Popup>
                  <strong>{item.name}</strong>
                  <br />ประเภท: {item.category || 'ไม่ระบุ'}
                  {item.address && (
                    <>
                      <br />ที่อยู่: {item.address}
                    </>
                  )}
                  {item.phone && (
                    <>
                      <br />โทร: {item.phone}
                    </>
                  )}
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}