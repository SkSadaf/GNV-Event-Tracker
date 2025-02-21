
// import React, { useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-shadow.png'
// });

// const eventLocations = [
//   { id: 1, name: "Event 1", lat: 29.6516, lng: -82.3248, link: "/event/1" },
//   { id: 2, name: "Event 2", lat: 29.6550, lng: -82.3166, link: "/event/2" },
//   // Add more events as needed
// ];

// const MapPage = () => {
//   const [selected, setSelected] = useState(null);

//   return (
//     <MapContainer center={[29.6516, -82.3248]} zoom={13} style={{ height: "100vh", width: "100%" }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />
//       {eventLocations.map(event => (
//         <Marker 
//           key={event.id} 
//           position={[event.lat, event.lng]}
//           eventHandlers={{
//             click: () => {
//               setSelected(event);
//             },
//           }}
//         >
//           {selected === event && (
//             <Popup position={[event.lat, event.lng]}>
//               <div>
//                 <h2>{event.name}</h2>
//                 <a href={event.link}>More Info</a>
//               </div>
//             </Popup>
//           )}
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// }

// export default MapPage;


import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-shadow.png'
});

const eventLocations = [
  { id: 1, name: "Event 1", lat: 29.6516, lng: -82.3248, link: "/event/1" },
  { id: 2, name: "Event 2", lat: 29.6550, lng: -82.3166, link: "/event/2" },
];

const MapPage = () => (
  <MapContainer center={[29.6516, -82.3248]} zoom={13} style={{ height: "100vh", width: "100%" }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    {eventLocations.map(event => (
      <Marker key={event.id} position={[event.lat, event.lng]}>
        <Popup>
          <div>
            <h2>{event.name}</h2>
            <a href={event.link}>More Info</a>
          </div>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default MapPage;