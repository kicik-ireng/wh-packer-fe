// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';

// type Customer = {
//   id: number;
//   customer: { id: number; name: string; address: string };
// };

// type Schedule = {
//   id: number;
//   scheduleAt: string;
//   cycle?: number | null;
//   truck: { id: number; noPol: string; color?: string | null };
//   driver: { id: number; name: string };
//   customers: Customer[];
// };

// export default function SchedulePage() {
//   const [schedules, setSchedules] = useState<Schedule[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/schedule-truck');
//         if (!res.ok) throw new Error('Failed to fetch schedules');
//         const data: Schedule[] = await res.json();
//         setSchedules(data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 30000); // refresh every 30s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <main className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-xl font-bold mb-4">Schedule Overview</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {schedules.map((schedule) => (
//           <div
//             key={schedule.id}
//             className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center"
//           >
//             {/* Truck Image */}
//             <div className="relative w-32 h-16">
//               <Image
//                 src="/truck.png" // taruh gambar truk di public/truck.png
//                 alt="Truck"
//                 fill
//                 className="object-contain"
//               />
//             </div>

//             {/* Driver Name */}
//             <p className="mt-2 font-semibold text-gray-800">
//               {schedule.driver?.name || 'Unknown Driver'}
//             </p>
//             <p className="text-sm text-gray-500">Truck: {schedule.truck?.noPol}</p>

//             {/* Schedule Date */}
//             <p className="text-xs text-gray-400 mb-2">
//               {new Date(schedule.scheduleAt).toLocaleDateString('en-GB', {
//                 day: '2-digit',
//                 month: 'short',
//               })}
//             </p>

//             {/* Container with Customers */}
//             <div className="bg-gray-200 rounded-lg w-full p-2">
//               <h3 className="text-xs font-bold text-gray-700 mb-1">Customers:</h3>
//               <ul className="text-xs text-gray-600 space-y-1">
//                 {schedule.customers.length > 0 ? (
//                   schedule.customers.map((c) => (
//                     <li key={c.id} className="truncate">
//                       • {c.customer.name}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="text-gray-400">No Customers</li>
//                 )}
//               </ul>
//             </div>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }

// 'use client';

// import { useEffect, useState, useMemo } from 'react';

// type ScheduleTruck = {
//   id: number;
//   scheduleAt: string;
//   truck: { noPol: string; color?: string | null } | null;
//   driver: { name: string } | null;
//   customers: { id: number; customer: { name: string } }[];
//   cycle?: number | null;
// };

// export function ScheduleView() {
//   const [schedules, setSchedules] = useState<ScheduleTruck[]>([]);

//   useEffect(() => {
//     const fetchSchedules = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/schedule-truck');
//         if (!res.ok) throw new Error('Failed to fetch schedule');
//         const data: ScheduleTruck[] = await res.json();
//         setSchedules(data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchSchedules();
//     const interval = setInterval(fetchSchedules, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // ✅ Filter for today only (Asia/Jakarta)
//   const todaySchedules = useMemo(() => {
//     const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
//     return schedules.filter((s) => {
//       try {
//         const scheduleDate = new Date(s.scheduleAt).toLocaleDateString('en-CA', {
//           timeZone: 'Asia/Jakarta',
//         });
//         return scheduleDate === today;
//       } catch {
//         return false;
//       }
//     });
//   }, [schedules]);

//   return (
//     <div className="flex flex-col h-full">
//       <h2 className="text-xl md:text-2xl font-bold text-white mb-4 border-b-2 border-gray-500 pb-3">
//         TODAY'S TRUCK SCHEDULE
//       </h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 overflow-y-auto flex-1 pr-2">
//         {todaySchedules.length > 0 ? (
//           todaySchedules.map((s) => {
//             const scheduleTime = new Date(s.scheduleAt).toLocaleTimeString('en-GB', {
//               hour: '2-digit',
//               minute: '2-digit',
//               timeZone: 'Asia/Jakarta',
//             });

//             return (
//               <div
//                 key={s.id}
//                 className="bg-white rounded-xl shadow-md flex flex-col p-4 md:p-6 text-gray-800 hover:shadow-lg transition"
//               >
//                 {/* Driver & Truck Info */}
//                 <div className="flex justify-between items-start mb-3">
//                   <div>
//                     <p className="text-base md:text-lg font-bold">
//                       {s.driver?.name || 'Unknown Driver'}
//                     </p>
//                     <p className="text-sm md:text-base text-gray-600">
//                       Truck: <span className="font-semibold">{s.truck?.noPol || '-'}</span>
//                     </p>
//                     <p className="text-sm md:text-base text-gray-500">
//                       Cycle: <span className="font-semibold">{s.cycle ?? '-'}</span>
//                     </p>
//                   </div>
//                   {s.truck?.color && (
//                     <span
//                       className="w-5 h-5 md:w-6 md:h-6 rounded-full border"
//                       style={{ backgroundColor: s.truck.color }}
//                     ></span>
//                   )}
//                 </div>

//                 {/* Schedule Time */}
//                 {/* <p
//                   className={`text-lg md:text-xl font-extrabold mb-4 ${
//                     scheduleTime < '09:00' ? 'text-green-600' : 'text-blue-600'
//                   }`}
//                 >
//                   {scheduleTime} WIB
//                 </p> */}

//                 {/* Customers */}
//                 <div className="bg-gray-100 rounded-lg p-3 md:p-4 flex-1">
//                   <h3 className="text-sm md:text-base font-semibold mb-2">Customers</h3>
//                   <ul className="text-sm md:text-base space-y-1 max-h-32 md:max-h-36 overflow-y-auto">
//                     {s.customers.length > 0 ? (
//                       s.customers.map((c) => (
//                        <li key={c.id} className="break-words">
//                           • {c.customer.name}
//                         </li>
//                       ))
//                     ) : (
//                       <li className="text-gray-400">No Customers</li>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <p className="text-gray-300 text-base md:text-xl">No schedules for today.</p>
//         )}
//       </div>
//     </div>
//   );
// }
