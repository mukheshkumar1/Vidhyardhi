// // src/components/NotificationCenter.tsx
// import React, { useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';

// const socket: Socket = io('http://localhost:5000');

// interface NotificationData {
//   title: string;
//   message: string;
//   timestamp?: string;
// }

// const NotificationCenter = ({ events }: { events: { [eventName: string]: (data: any) => NotificationData } }) => {
//   const [notifications, setNotifications] = useState<NotificationData[]>([]);
//   const [badgeCount, setBadgeCount] = useState(0);

//   useEffect(() => {
//     const audio = new Audio('/notification.mp3');

//     Object.entries(events).forEach(([event, handler]) => {
//       socket.on(event, (data) => {
//         const notification = handler(data);
//         setNotifications((prev) => [notification, ...prev]);
//         setBadgeCount((count) => count + 1);
//         audio.play().catch((err) => console.warn("Sound blocked", err));
//       });
//     });

//     return () => {
//       Object.keys(events).forEach((event) => socket.off(event));
//     };
//   }, [events]);

//   return (
//     <div className="relative p-4">
//       <div className="flex items-center gap-2">
//         <button className="relative text-2xl">
//           🔔
//           {badgeCount > 0 && (
//             <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
//               {badgeCount}
//             </span>
//           )}
//         </button>
//         <span className="text-lg font-semibold">Notifications</span>
//       </div>

//       {notifications.length > 0 && (
//         <div className="mt-4 bg-white shadow rounded p-4 max-h-64 overflow-auto w-full sm:w-96">
//           {notifications.map((n, i) => (
//             <div key={i} className="mb-3 border-b pb-2">
//               <p className="font-bold text-blue-700">{n.title}</p>
//               <p className="text-gray-700 text-sm">{n.message}</p>
//               <p className="text-xs text-gray-500 mt-1">{n.timestamp}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationCenter;
