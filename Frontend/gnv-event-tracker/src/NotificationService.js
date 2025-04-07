// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { AuthContext } from './AuthContext';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';

// // Configure toast
// toast.configure({
//   autoClose: 5000,
//   hideProgressBar: false,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true
// });

// export const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const { isAuthenticated } = useContext(AuthContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let socket = null;
    
//     if (isAuthenticated) {
//       // Connect to WebSocket
//       socket = new WebSocket('ws://localhost:8080/ws');
      
//       socket.onopen = () => {
//         console.log('WebSocket connection established');
//       };
      
//       socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
        
//         if (data.type === 'new_event') {
//           toast.info(
//             <div>
//               {data.message}
//               <button 
//                 onClick={() => navigate(`/events/${data.eventId}`)}
//                 style={{
//                   marginLeft: '10px',
//                   background: '#4a90e2',
//                   color: 'white',
//                   border: 'none',
//                   padding: '4px 8px',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 View
//               </button>
//             </div>
//           );
//         }
//       };
      
//       socket.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
//     }
    
//     return () => {
//       if (socket) {
//         socket.close();
//       }
//     };
//   }, [isAuthenticated, navigate]);

//   return (
//     <NotificationContext.Provider value={{}}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };