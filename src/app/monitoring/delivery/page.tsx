// 'use client';

// import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { Truck, PackageSearch } from 'lucide-react';
// import type { LatLngTuple } from 'leaflet';

// const CustomMap = dynamic(() => import('./CustomMap'), { ssr: false });

// type DeliveryItem = {
//   id: number;
//   qtyDelivered: number;
//   part2r?: any;
//   part4r?: any;
// };

// type DeliveryOrder = {
//   id: number;
//   noDo: string;
//   date: string;
//   driver: { name: string };
//   customer: { name: string; address: string };
//   items: DeliveryItem[];
// };

// export default function DeliveryDashboard() {
//   const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
//   const [destinations, setDestinations] = useState<
//     { name: string; driver: string; position: LatLngTuple; color: string }[]
//   >([]);
//   const [time, setTime] = useState('');

//   const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];

//   const geocodeAddress = async (address: string): Promise<LatLngTuple | null> => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
//         { headers: { 'User-Agent': 'DeliveryDashboard/1.0' } }
//       );
//       const data = await res.json();
//       if (data.length > 0) {
//         return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
//       }
//     } catch (err) {
//       console.error('Geocode error:', address, err);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/dashboard-delivery');
//         const data = await res.json();

//         const today = new Date().toISOString().split('T')[0];
//         const filtered = data.filter((d: DeliveryOrder) =>
//           d.date.startsWith(today)
//         );

//         setDeliveries(filtered);
//       } catch (err) {
//         console.error('Error fetching deliveries:', err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const resolveCoordinates = async () => {
//       const usedColors = new Set<string>();

//       const getRandomColor = () => {
//         const letters = '0123456789ABCDEF';
//         let color;
//         do {
//           color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
//         } while (usedColors.has(color));
//         usedColors.add(color);
//         return color;
//       };

//       const cleanAddress = (address: string) => {
//         return address
//           .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, '')
//           .replace(/NO\.?\s*[\d\/]+/gi, '')
//           .replace(/^JL,?/i, 'Jalan')
//           .replace(/^[Jj]l\.?/i, 'Jalan')
//           .replace(/\s{2,}/g, ' ')
//           .trim();
//       };

//       const results = await Promise.all(
//         deliveries.map(async (doItem) => {
//           const name = doItem.customer?.name || 'Unknown';
//           const driver = doItem.driver?.name || 'Unknown';
//           const rawAddress = doItem.customer?.address?.trim();

//           if (!rawAddress) {
//             console.log(`❌ Lewat: ${name} (alamat kosong)`);
//             return null;
//           }

//           let coords: LatLngTuple | null = null;

//           const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawAddress);
//           if (isLatLng) {
//             const [latStr, lngStr] = rawAddress.split(',');
//             coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
//             console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
//           } else {
//             const cleaned = cleanAddress(rawAddress);
//             coords = await geocodeAddress(cleaned);
//             console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
//           }

//           if (!coords) return null;

//           return {
//             name,
//             driver,
//             position: coords,
//             color: getRandomColor(),
//           };
//         })
//       );

//       const successful = results.filter(Boolean) as {
//         name: string;
//         driver: string;
//         position: LatLngTuple;
//         color: string;
//       }[];

//       if (successful.length === 0) {
//         console.warn('⚠️ Tidak ada koordinat berhasil di-resolve.');
//       }

//       setDestinations(successful);
//     };

//     if (deliveries.length > 0) {
//       resolveCoordinates();
//     }
//   }, [deliveries]);

//   return (
//     <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
//       <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">

//         {/* Sidebar */}
//         <div className="w-full md:w-[420px] bg-white border border-gray-200 p-6 overflow-y-auto max-h-[100vh]">
//           {/* Header */}
//           <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
//             <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <PackageSearch className="w-5 h-5 text-blue-600" />
//               <span>Delivery</span>
//             </h1>
//             <div className="text-right text-sm text-gray-500 leading-tight">
//               <p className="font-mono">{time}</p>
//               <p className="text-xs">
//                 {new Date().toLocaleDateString('id-ID', {
//                   weekday: 'short',
//                   day: 'numeric',
//                   month: 'short',
//                 })}
//               </p>
//             </div>
//           </div>

//           {/* Summary */}
//           <p className="text-sm text-gray-700 mb-4">
//             Total Pengiriman Hari Ini:{' '}
//             <span className="font-bold text-gray-900">{deliveries.length}</span>
//           </p>

//           {/* Content */}
//           {deliveries.length === 0 ? (
//             <div className="text-center text-gray-400 italic py-8">
//               Tidak ada data pengiriman hari ini.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {deliveries.map((doItem) => (
//                 <div
//                   key={doItem.id}
//                   className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow transition-all text-xs"
//                 >
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-blue-700 flex items-center gap-1">
//                       <Truck size={14} />
//                       {doItem.noDo}
//                     </span>
//                     <span className="text-[10px] text-gray-400">
//                       {new Date(doItem.date).toLocaleDateString('id-ID')}
//                     </span>
//                   </div>
//                   <div className="mt-1">
//                     <div className="text-gray-600">
//                       <span className="font-medium">Driver:</span> {doItem.driver?.name || '-'}
//                     </div>
//                     <div className="text-gray-600">
//                       <span className="font-medium">Customer:</span> {doItem.customer?.name || '-'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Map Panel + Footer */}
//         <div className="flex-1 overflow-hidden shadow-xl border border-gray-300 flex flex-col">
//           <CustomMap origin={warehouseLocation} destinations={destinations} />

// {/* Footer Info */}
// <div className="flex-1 overflow-hidden shadow-xl border border-gray-300 flex flex-col">

//   {/* New Stats Panel */}
//   <div className="bg-gray-50 border-t border-gray-200 p-3 flex-1">
//     <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Statistics</h3>
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Total Deliveries</p>
//         <p className="text-lg font-semibold text-gray-800">{deliveries.length}</p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Locations Found</p>
//         <p className="text-lg font-semibold text-green-600">{destinations.length}</p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Failed Geocoding</p>
//         <p className="text-lg font-semibold text-red-600">
//           {deliveries.length - destinations.length}
//         </p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Success Rate</p>
//         <p className="text-lg font-semibold text-blue-600">
//           {deliveries.length > 0
//             ? `${Math.round((destinations.length / deliveries.length) * 100)}%`
//             : '0%'}
//         </p>
//       </div>
//     </div>
//   </div>

//   {/* Extended Footer Info with Table */}
//   <div className="bg-white border-t border-gray-300 px-4 py-3 text-xs text-gray-700 overflow-auto">

//     <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
//       <thead className="bg-gray-100 text-gray-600">
//         <tr>
//           <th className="text-left px-3 py-2 border-b border-gray-200">#</th>
//           <th className="text-left px-3 py-2 border-b border-gray-200">Driver</th>
//           <th className="text-left px-3 py-2 border-b border-gray-200">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {destinations.map((d, idx) => (
//           <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
//             <td className="px-3 py-1 text-gray-500">{idx + 1}</td>
//             <td className="px-3 py-1 font-medium">{d.driver || '-'}</td>
//             <td className="px-3 py-1">{d.name || '-'}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>

//      <div className="flex justify-between items-center mb-3">
//       <span>
//         Locations successfully geocoded: <strong className="text-green-600">{destinations.length}</strong>
//       </span>
//       <span className="font-mono text-gray-500">Last Update: {time}</span>
//     </div>
//   </div>

// </div>

//   </div>
//     </div>
//     </main>
//   );
// }
// 'use client';

// import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { Truck, PackageSearch } from 'lucide-react';
// import type { LatLngTuple } from 'leaflet';

// const CustomMap = dynamic(() => import('./CustomMap'), { ssr: false });

// type DeliveryItem = {
//   id: number;
//   qtyDelivered: number;
//   part2r?: any;
//   part4r?: any;
// };

// type DeliveryOrder = {
//   id: number;
//   noDo: string;
//   date: string;
//   driver: { name: string };
//   customer: { name: string; address: string };
//   items: DeliveryItem[];
// };

// export default function DeliveryDashboard() {
//   const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
//   const [destinations, setDestinations] = useState<
//     { name: string; driver: string; position: LatLngTuple; color: string }[]
//   >([]);
//   const [time, setTime] = useState('');

//   const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];

//   const geocodeAddress = async (address: string): Promise<LatLngTuple | null> => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
//         { headers: { 'User-Agent': 'DeliveryDashboard/1.0' } }
//       );
//       const data = await res.json();
//       if (data.length > 0) {
//         return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
//       }
//     } catch (err) {
//       console.error('Geocode error:', address, err);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/dashboard-delivery');
//         const data = await res.json();

//         const today = new Date().toISOString().split('T')[0];
//         const filtered = data.filter((d: DeliveryOrder) =>
//           d.date.startsWith(today)
//         );

//         setDeliveries(filtered);
//       } catch (err) {
//         console.error('Error fetching deliveries:', err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const resolveCoordinates = async () => {
//       const usedColors = new Set<string>();

//       const getRandomColor = () => {
//         const letters = '0123456789ABCDEF';
//         let color;
//         do {
//           color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
//         } while (usedColors.has(color));
//         usedColors.add(color);
//         return color;
//       };

//       const cleanAddress = (address: string) => {
//         return address
//           .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, '')
//           .replace(/NO\.?\s*[\d\/]+/gi, '')
//           .replace(/^JL,?/i, 'Jalan')
//           .replace(/^[Jj]l\.?/i, 'Jalan')
//           .replace(/\s{2,}/g, ' ')
//           .trim();
//       };

//       const results = await Promise.all(
//         deliveries.map(async (doItem) => {
//           const name = doItem.customer?.name || 'Unknown';
//           const driver = doItem.driver?.name || 'Unknown';
//           const rawAddress = doItem.customer?.address?.trim();

//           if (!rawAddress) {
//             console.log(`❌ Lewat: ${name} (alamat kosong)`);
//             return null;
//           }

//           let coords: LatLngTuple | null = null;

//           const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawAddress);
//           if (isLatLng) {
//             const [latStr, lngStr] = rawAddress.split(',');
//             coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
//             console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
//           } else {
//             const cleaned = cleanAddress(rawAddress);
//             coords = await geocodeAddress(cleaned);
//             console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
//           }

//           if (!coords) return null;

//           return {
//             name,
//             driver,
//             position: coords,
//             color: getRandomColor(),
//           };
//         })
//       );

//       const successful = results.filter(Boolean) as {
//         name: string;
//         driver: string;
//         position: LatLngTuple;
//         color: string;
//       }[];

//       if (successful.length === 0) {
//         console.warn('⚠️ Tidak ada koordinat berhasil di-resolve.');
//       }

//       setDestinations(successful);
//     };

//     if (deliveries.length > 0) {
//       resolveCoordinates();
//     }
//   }, [deliveries]);

//   return (
//     <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
//       <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">

//         {/* Sidebar */}
//         <div className="w-full md:w-[420px] bg-white border border-gray-200 p-6 overflow-y-auto max-h-[100vh]">
//           {/* Header */}
//           <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
//             <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <PackageSearch className="w-5 h-5 text-blue-600" />
//               <span>Delivery</span>
//             </h1>
//             <div className="text-right text-sm text-gray-500 leading-tight">
//               <p className="font-mono">{time}</p>
//               <p className="text-xs">
//                 {new Date().toLocaleDateString('id-ID', {
//                   weekday: 'short',
//                   day: 'numeric',
//                   month: 'short',
//                 })}
//               </p>
//             </div>
//           </div>

//           {/* Summary */}
//           <p className="text-sm text-gray-700 mb-4">
//             Total Pengiriman Hari Ini:{' '}
//             <span className="font-bold text-gray-900">{deliveries.length}</span>
//           </p>

//           {/* Content */}
//           {deliveries.length === 0 ? (
//             <div className="text-center text-gray-400 italic py-8">
//               Tidak ada data pengiriman hari ini.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {deliveries.map((doItem) => (
//                 <div
//                   key={doItem.id}
//                   className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow transition-all text-xs"
//                 >
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-blue-700 flex items-center gap-1">
//                       <Truck size={14} />
//                       {doItem.noDo}
//                     </span>
//                     <span className="text-[10px] text-gray-400">
//                       {new Date(doItem.date).toLocaleDateString('id-ID')}
//                     </span>
//                   </div>
//                   <div className="mt-1">
//                     <div className="text-gray-600">
//                       <span className="font-medium">Driver:</span> {doItem.driver?.name || '-'}
//                     </div>
//                     <div className="text-gray-600">
//                       <span className="font-medium">Customer:</span> {doItem.customer?.name || '-'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Map Panel + Footer */}
//         <div className="flex-1 overflow-hidden shadow-xl border border-gray-300 flex flex-col">
//           <CustomMap origin={warehouseLocation} destinations={destinations} />

// {/* Wrapper to ensure footer stays at bottom */}
// <div className="min-h-[40vh] flex flex-col shadow-xl border border-gray-300 overflow-hidden mb-1">

//   {/* New Stats Panel */}
//   <div className="bg-gray-50 border-t border-gray-200 p-3">
//     <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Statistics</h3>
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Total Deliveries</p>
//         <p className="text-lg font-semibold text-gray-800">{deliveries.length}</p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Locations Found</p>
//         <p className="text-lg font-semibold text-green-600">{destinations.length}</p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Failed Geocoding</p>
//         <p className="text-lg font-semibold text-red-600">
//           {deliveries.length - destinations.length}
//         </p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Success Rate</p>
//         <p className="text-lg font-semibold text-blue-600">
//           {deliveries.length > 0
//             ? `${Math.round((destinations.length / deliveries.length) * 100)}%`
//             : '0%'}
//         </p>
//       </div>
//     </div>
//   </div>

//   {/* Scrollable Table Section */}
//   <div className="bg-white border-t border-gray-300 px-4 py-3 text-xs text-gray-700 overflow-auto">
//     <table className="w-full text-xs border border-gray-200 rounded">
//       <thead className="bg-gray-100 text-gray-600">
//         <tr>
//           <th className="text-left px-3 py-2 border-b border-gray-200">#</th>
//           <th className="text-left px-3 py-2 border-b border-gray-200">Driver</th>
//           <th className="text-left px-3 py-2 border-b border-gray-200">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {destinations.map((d, idx) => (
//           <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
//             <td className="px-3 py-1 text-gray-500">{idx + 1}</td>
//             <td className="px-3 py-1 font-medium">{d.driver || '-'}</td>
//             <td className="px-3 py-1">{d.name || '-'}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>

//    <div className="flex justify-between items-center pt-6 mt-auto border-t border-gray-200">
//       <span>
//         Locations successfully geocoded: <strong className="text-green-600">{destinations.length}</strong>
//       </span>
//       <span className="font-mono text-gray-500">Last Update: {time}</span>
//     </div>
//   </div>
// </div>

//   </div>
//     </div>
//     </main>
//   );
// }
//  'use client';

// import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { Truck, PackageSearch } from 'lucide-react';
// import type { LatLngTuple } from 'leaflet';

// const CustomMap = dynamic(() => import('./CustomMap'), { ssr: false });

// type DeliveryItem = {
//   id: number;
//   qtyDelivered: number;
//   part2r?: any;
//   part4r?: any;
// };

// type DeliveryOrder = {
//   id: number;
//   noDo: string;
//   date: string;
//   driver: { name: string };
//   customer: { name: string; address: string };
//   items: DeliveryItem[];
// };

// export default function DeliveryDashboard() {
//   const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
//   const [destinations, setDestinations] = useState<
//     { name: string; driver: string; position: LatLngTuple; color: string }[]
//   >([]);
//   const [time, setTime] = useState('');

//   const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];

//   const geocodeAddress = async (address: string): Promise<LatLngTuple | null> => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
//         { headers: { 'User-Agent': 'DeliveryDashboard/1.0' } }
//       );
//       const data = await res.json();
//       if (data.length > 0) {
//         return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
//       }
//     } catch (err) {
//       console.error('Geocode error:', address, err);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/dashboard-delivery');
//         const data = await res.json();

//         const today = new Date().toISOString().split('T')[0];
//         const filtered = data.filter((d: DeliveryOrder) =>
//           d.date.startsWith(today)
//         );

//         setDeliveries(filtered);
//       } catch (err) {
//         console.error('Error fetching deliveries:', err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const resolveCoordinates = async () => {
//       const usedColors = new Set<string>();

//       const getRandomColor = () => {
//         const letters = '0123456789ABCDEF';
//         let color;
//         do {
//           color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
//         } while (usedColors.has(color));
//         usedColors.add(color);
//         return color;
//       };

//       const cleanAddress = (address: string) => {
//         return address
//           .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, '')
//           .replace(/NO\.?\s*[\d\/]+/gi, '')
//           .replace(/^JL,?/i, 'Jalan')
//           .replace(/^[Jj]l\.?/i, 'Jalan')
//           .replace(/\s{2,}/g, ' ')
//           .trim();
//       };

//       const results = await Promise.all(
//         deliveries.map(async (doItem) => {
//           const name = doItem.customer?.name || 'Unknown';
//           const driver = doItem.driver?.name || 'Unknown';
//           const rawAddress = doItem.customer?.address?.trim();

//           if (!rawAddress) {
//             console.log(`❌ Lewat: ${name} (alamat kosong)`);
//             return null;
//           }

//           let coords: LatLngTuple | null = null;

//           const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawAddress);
//           if (isLatLng) {
//             const [latStr, lngStr] = rawAddress.split(',');
//             coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
//             console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
//           } else {
//             const cleaned = cleanAddress(rawAddress);
//             coords = await geocodeAddress(cleaned);
//             console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
//           }

//           if (!coords) return null;

//           return {
//             name,
//             driver,
//             position: coords,
//             color: getRandomColor(),
//           };
//         })
//       );

//       const successful = results.filter(Boolean) as {
//         name: string;
//         driver: string;
//         position: LatLngTuple;
//         color: string;
//       }[];

//       if (successful.length === 0) {
//         console.warn('⚠️ Tidak ada koordinat berhasil di-resolve.');
//       }

//       setDestinations(successful);
//     };

//     if (deliveries.length > 0) {
//       resolveCoordinates();
//     }
//   }, [deliveries]);

//   return (
//     <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
//       <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">

//         {/* Sidebar */}
//         <div className="w-full md:w-[420px] bg-[#273F4F] border-[#273F4F] p-6 overflow-y-auto max-h-[100vh] scrollbar-none">
//           {/* Header */}
//           <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
//             <h1 className="text-xl font-semibold text-white flex items-center gap-2">
//               <PackageSearch className="w-5 h-5 text-white" />
//               <span>Delivery</span>
//             </h1>
//             <div className="text-right text-sm text-white leading-tight">
//               <p className="font-mono">{time}</p>
//               <p className="text-xs">
//                 {new Date().toLocaleDateString('id-ID', {
//                   weekday: 'short',
//                   day: 'numeric',
//                   month: 'short',
//                 })}
//               </p>
//             </div>
//           </div>

//           {/* Summary */}
//           <p className="text-sm text-white mb-4">
//             Total Delivery:{' '}
//             <span className="font-bold text-white">{deliveries.length}</span>
//           </p>

//           {/* Content */}
//           {deliveries.length === 0 ? (
//             <div className="text-center text-black italic py-8">
//               Tidak ada data pengiriman hari ini.
//             </div>
//           ) : (
//             <div className="space-y-1">
//               {deliveries.map((doItem) => (
//                 <div
//                   key={doItem.id}
//                   className="p-2 border border-[#D7D7D7] bg-[#D7D7D7] hover:shadow transition-all text-xs rounded"
//                 >
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-blue-700 flex items-center gap-1">
//                       <Truck size={14} />
//                       {doItem.noDo}
//                     </span>
//                     <span className="text-[10px] text-black">
//                       {new Date(doItem.date).toLocaleDateString('id-ID')}
//                     </span>
//                   </div>
//                   <div className="mt-1">
//                     <div className="text-black">
//                       <span className="font-medium">Driver:</span> {doItem.driver?.name || '-'}
//                     </div>
//                     <div className="text-black">
//                       <span className="font-medium">Customer:</span> {doItem.customer?.name || '-'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Map Panel + Footer */}
//         <div className="flex-1 overflow-hidden  border border-black flex flex-col scrollbar-none">
//           <CustomMap origin={warehouseLocation} destinations={destinations} />

// {/* Wrapper to ensure footer stays at bottom */}
// <div className="min-h-[50vh] flex flex-col border border-white overflow-hidden mb-1 scrollbar-none">
// {/* Scrollable Table Section */}
// <div className="flex flex-col h-full bg-[#273F4F] text-xs text-white">

//   {/* Tabel Scrollable Section */}
// <div className="flex-1 px-4 py-3 overflow-y-auto scrollbar-none">
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {[
//       deliveries.slice(0, Math.ceil(deliveries.length / 2)),
//       deliveries.slice(Math.ceil(deliveries.length / 2)),
//     ].map((half, i) => (
//       <div
//         key={i}
//         className="overflow-y-auto max-h-[700px] border border-[#447D9B] rounded bg-[#D7D7D7] scrollbar-none"
//       >
//         <table className="w-full text-xs text-black">
//           <thead className="sticky top-0 z-10 bg-[#447D9B] text-white shadow">
//             <tr>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">#</th>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">DO Number</th>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">Part</th>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">Qty</th>
//             </tr>
//           </thead>
//           <tbody>
//             {half.map((doItem, doIndex) => {
//               const total = doItem.items.length;
//               const displayIndex = i * Math.ceil(deliveries.length / 2) + doIndex + 1;

//               return doItem.items.map((item, itemIndex) => {
//                 // const partName = item.part2r?.name || item.part4r?.name || 'Unknown';
//                 const partName =
//   item.part2r ? item.part2r.emiPartName?.trim() || 'Unknown'
//   : item.part4r ? item.part4r.model?.trim() || 'Unknown'
//   : 'Unknown';

//                 const rowNumber = total === 1 ? `${displayIndex}` : `${displayIndex}.${itemIndex + 1}`;

//                 return (
//                   <tr
//                     key={`${doItem.id}-${itemIndex}`}
//                     className="border-b border-[#447D9B] hover:bg-[#FE7743]/20 transition-all"
//                   >
//                     <td className="px-3 py-1 font-mono text-[#273F4F]">{rowNumber}</td>
//                     <td className="px-3 py-1">{doItem.noDo}</td>
//                     <td className="px-3 py-1">{partName}</td>
//                     <td className="px-3 py-1 font-bold">{item.qtyDelivered}</td>
//                   </tr>
//                 );
//               });
//             })}
//           </tbody>
//         </table>
//       </div>
//     ))}
//   </div>
// </div>

//   {/* Footer Section */}
//   <div className="flex justify-between items-center border-t border-white text-black p-3 text-xs bg-[#FE7743]">
//       <span className="flex items-center gap-1 text-black">
//         <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
//         <span className="text-[11px] text-black ">LIVE</span>
//       </span>
//     <span className="font-mono text-black">Last Update: {time}</span>
//   </div>
// </div>
// </div>

//   </div>
//     </div>
//     </main>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { Truck, PackageSearch } from 'lucide-react';
// import type { LatLngTuple } from 'leaflet';

// const CustomMap = dynamic(() => import('./CustomMap'), { ssr: false });

// type DeliveryItem = {
//   id: number;
//   qtyDelivered: number;
//   part2r?: any;
//   part4r?: any;
// };

// type DeliveryOrder = {
//   id: number;
//   noDo: string;
//   date: string;
//   driver: { name: string };
//   customer: { name: string; address: string };
//   items: DeliveryItem[];
// };

// export default function DeliveryDashboard() {
//   const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
//   const [destinations, setDestinations] = useState<
//     { name: string; driver: string; position: LatLngTuple; color: string }[]
//   >([]);
//   const [time, setTime] = useState('');

//   const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];

//   const geocodeAddress = async (address: string): Promise<LatLngTuple | null> => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
//         { headers: { 'User-Agent': 'DeliveryDashboard/1.0' } }
//       );
//       const data = await res.json();
//       if (data.length > 0) {
//         return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
//       }
//     } catch (err) {
//       console.error('Geocode error:', address, err);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/dashboard-delivery');
//         const data = await res.json();

//         const today = new Date().toISOString().split('T')[0];
//         const filtered = data.filter((d: DeliveryOrder) =>
//           d.date.startsWith(today)
//         );

//         setDeliveries(filtered);
//       } catch (err) {
//         console.error('Error fetching deliveries:', err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const resolveCoordinates = async () => {
//       const usedColors = new Set<string>();

//       const getRandomColor = () => {
//         const letters = '0123456789ABCDEF';
//         let color;
//         do {
//           color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
//         } while (usedColors.has(color));
//         usedColors.add(color);
//         return color;
//       };

//       const cleanAddress = (address: string) => {
//         return address
//           .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, '')
//           .replace(/NO\.?\s*[\d\/]+/gi, '')
//           .replace(/^JL,?/i, 'Jalan')
//           .replace(/^[Jj]l\.?/i, 'Jalan')
//           .replace(/\s{2,}/g, ' ')
//           .trim();
//       };

//       const results = await Promise.all(
//         deliveries.map(async (doItem) => {
//           const name = doItem.customer?.name || 'Unknown';
//           const driver = doItem.driver?.name || 'Unknown';
//           const rawAddress = doItem.customer?.address?.trim();

//           if (!rawAddress) {
//             console.log(`❌ Lewat: ${name} (alamat kosong)`);
//             return null;
//           }

//           let coords: LatLngTuple | null = null;

//           const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawAddress);
//           if (isLatLng) {
//             const [latStr, lngStr] = rawAddress.split(',');
//             coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
//             console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
//           } else {
//             const cleaned = cleanAddress(rawAddress);
//             coords = await geocodeAddress(cleaned);
//             console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
//           }

//           if (!coords) return null;

//           return {
//             name,
//             driver,
//             position: coords,
//             color: getRandomColor(),
//           };
//         })
//       );

//       const successful = results.filter(Boolean) as {
//         name: string;
//         driver: string;
//         position: LatLngTuple;
//         color: string;
//       }[];

//       if (successful.length === 0) {
//         console.warn('⚠️ Tidak ada koordinat berhasil di-resolve.');
//       }

//       setDestinations(successful);
//     };

//     if (deliveries.length > 0) {
//       resolveCoordinates();
//     }
//   }, [deliveries]);

//   return (
//     <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
//       <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">

//         {/* Sidebar */}
//         <div className="w-full md:w-[420px] bg-white border border-gray-200 p-6 overflow-y-auto max-h-[100vh]">
//           {/* Header */}
//           <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
//             <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <PackageSearch className="w-5 h-5 text-blue-600" />
//               <span>Delivery</span>
//             </h1>
//             <div className="text-right text-sm text-gray-500 leading-tight">
//               <p className="font-mono">{time}</p>
//               <p className="text-xs">
//                 {new Date().toLocaleDateString('id-ID', {
//                   weekday: 'short',
//                   day: 'numeric',
//                   month: 'short',
//                 })}
//               </p>
//             </div>
//           </div>

//           {/* Summary */}
//           <p className="text-sm text-gray-700 mb-4">
//             Total Pengiriman Hari Ini:{' '}
//             <span className="font-bold text-gray-900">{deliveries.length}</span>
//           </p>

//           {/* Content */}
//           {deliveries.length === 0 ? (
//             <div className="text-center text-gray-400 italic py-8">
//               Tidak ada data pengiriman hari ini.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {deliveries.map((doItem) => (
//                 <div
//                   key={doItem.id}
//                   className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow transition-all text-xs"
//                 >
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-blue-700 flex items-center gap-1">
//                       <Truck size={14} />
//                       {doItem.noDo}
//                     </span>
//                     <span className="text-[10px] text-gray-400">
//                       {new Date(doItem.date).toLocaleDateString('id-ID')}
//                     </span>
//                   </div>
//                   <div className="mt-1">
//                     <div className="text-gray-600">
//                       <span className="font-medium">Driver:</span> {doItem.driver?.name || '-'}
//                     </div>
//                     <div className="text-gray-600">
//                       <span className="font-medium">Customer:</span> {doItem.customer?.name || '-'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Map Panel + Footer */}
//         <div className="flex-1 overflow-hidden shadow-xl border border-gray-300 flex flex-col">
//           <CustomMap origin={warehouseLocation} destinations={destinations} />

// {/* Wrapper to ensure footer stays at bottom */}
// <div className="min-h-[40vh] flex flex-col shadow-xl border border-gray-300 overflow-hidden mb-1">

//   {/* New Stats Panel */}
//   <div className="bg-gray-50 border-t border-gray-200 p-3">
//     <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Statistics</h3>
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Total Deliveries</p>
//         <p className="text-lg font-semibold text-gray-800">{deliveries.length}</p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Locations Found</p>
//         <p className="text-lg font-semibold text-green-600">{destinations.length}</p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Failed Geocoding</p>
//         <p className="text-lg font-semibold text-red-600">
//           {deliveries.length - destinations.length}
//         </p>
//       </div>
//       <div className="bg-white p-2 rounded border border-gray-200">
//         <p className="text-xs text-gray-500">Success Rate</p>
//         <p className="text-lg font-semibold text-blue-600">
//           {deliveries.length > 0
//             ? `${Math.round((destinations.length / deliveries.length) * 100)}%`
//             : '0%'}
//         </p>
//       </div>
//     </div>
//   </div>

//   {/* Scrollable Table Section */}
//   <div className="bg-white border-t border-gray-300 px-4 py-3 text-xs text-gray-700 overflow-auto">
//     <table className="w-full text-xs border border-gray-200 rounded">
//       <thead className="bg-gray-100 text-gray-600">
//         <tr>
//           <th className="text-left px-3 py-2 border-b border-gray-200">#</th>
//           <th className="text-left px-3 py-2 border-b border-gray-200">Driver</th>
//           <th className="text-left px-3 py-2 border-b border-gray-200">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {destinations.map((d, idx) => (
//           <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
//             <td className="px-3 py-1 text-gray-500">{idx + 1}</td>
//             <td className="px-3 py-1 font-medium">{d.driver || '-'}</td>
//             <td className="px-3 py-1">{d.name || '-'}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>

//    <div className="flex justify-between items-center pt-6 mt-auto border-t border-gray-200">
//       <span>
//         Locations successfully geocoded: <strong className="text-green-600">{destinations.length}</strong>
//       </span>
//       <span className="font-mono text-gray-500">Last Update: {time}</span>
//     </div>
//   </div>
// </div>

//   </div>
//     </div>
//     </main>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { Truck, PackageSearch } from 'lucide-react';
// import type { LatLngTuple } from 'leaflet';

// const CustomMap = dynamic(() => import('./CustomMap'), { ssr: false });

// type DeliveryItem = {
//   id: number;
//   qtyDelivered: number;
//   part2r?: any;
//   part4r?: any;
// };

// type DeliveryOrder = {
//   id: number;
//   noDo: string;
//   date: string;
//   driver: { name: string };
//   customer: { name: string; address: string };
//   items: DeliveryItem[];
// };

// export default function DeliveryDashboard() {
//   const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
//   const [destinations, setDestinations] = useState<
//     { name: string; driver: string; position: LatLngTuple; color: string }[]
//   >([]);
//   const [time, setTime] = useState('');

//   const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];
// const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

//   const geocodeAddress = async (address: string): Promise<LatLngTuple | null> => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
//         { headers: { 'User-Agent': 'DeliveryDashboard/1.0' } }
//       );
//       const data = await res.json();
//       if (data.length > 0) {
//         return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
//       }
//     } catch (err) {
//       console.error('Geocode error:', address, err);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5055/dashboard-delivery');
//         const data = await res.json();

//         const today = new Date().toISOString().split('T')[0];
//         const filtered = data.filter((d: DeliveryOrder) =>
//           d.date.startsWith(today)
//         );

//         setDeliveries(filtered);
//       } catch (err) {
//         console.error('Error fetching deliveries:', err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const resolveCoordinates = async () => {
//       const usedColors = new Set<string>();

//       const getRandomColor = () => {
//         const letters = '0123456789ABCDEF';
//         let color;
//         do {
//           color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
//         } while (usedColors.has(color));
//         usedColors.add(color);
//         return color;
//       };

//       const cleanAddress = (address: string) => {
//         return address
//           .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, '')
//           .replace(/NO\.?\s*[\d\/]+/gi, '')
//           .replace(/^JL,?/i, 'Jalan')
//           .replace(/^[Jj]l\.?/i, 'Jalan')
//           .replace(/\s{2,}/g, ' ')
//           .trim();
//       };

//       const results = await Promise.all(
//         deliveries.map(async (doItem) => {
//           const name = doItem.customer?.name || 'Unknown';
//           const driver = doItem.driver?.name || 'Unknown';
//           const rawAddress = doItem.customer?.address?.trim();

//           if (!rawAddress) {
//             console.log(`❌ Lewat: ${name} (alamat kosong)`);
//             return null;
//           }

//           let coords: LatLngTuple | null = null;

//           const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawAddress);
//           if (isLatLng) {
//             const [latStr, lngStr] = rawAddress.split(',');
//             coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
//             console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
//           } else {
//             const cleaned = cleanAddress(rawAddress);
//             coords = await geocodeAddress(cleaned);
//             console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
//           }

//           if (!coords) return null;

//           return {
//             name,
//             driver,
//             position: coords,
//             color: getRandomColor(),
//           };
//         })
//       );

//       const successful = results.filter(Boolean) as {
//         name: string;
//         driver: string;
//         position: LatLngTuple;
//         color: string;
//       }[];

//       if (successful.length === 0) {
//         console.warn('⚠️ Tidak ada koordinat berhasil di-resolve.');
//       }

//       setDestinations(successful);
//     };

//     if (deliveries.length > 0) {
//       resolveCoordinates();
//     }
//   }, [deliveries]);

//   const driverToTruckMap: Record<string, string> = {
//   'ZULKIFLI': 'B 9744 UEV',
//   'EKA': 'B 9531 UEW',
//   'HALDONO': 'B 9673 SYN',
//   'HAFID': 'B 9672 SYN',

//   //MORE
// };

// const driverColors: Record<string, string> = {
//   ZULKIFLI: 'bg-green-500 text-white',
//   EKA: 'bg-gray-400 text-black',
//   HALDONO: 'bg-yellow-400 text-black',
//   HAFID: 'bg-blue-600 text-white',
//   default: 'bg-black text-white',
// };

//   const allItems = deliveries.flatMap((doItem, doIndex) =>
//   doItem.items.map((item, itemIndex) => ({
//     doIndex,
//     itemIndex,
//     doItem,
//     item,
//   }))
// );

// const halfLength = Math.ceil(allItems.length / 2);
// const itemHalves = [allItems.slice(0, halfLength), allItems.slice(halfLength)];

//   return (
//     <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
//       <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">

//         {selectedDelivery && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
//     <div className="bg-white rounded shadow-lg w-[300px] max-h-screen flex flex-col translate-y-10">

//       {/* Header */}
//       <div className="p-4 border-b">
//         <h2 className="text-lg font-bold mb-2">
//           Detail Delivery - {selectedDelivery.noDo}
//         </h2>
//         <p><b>Driver:</b> {selectedDelivery.driver?.name}</p>
//         <p><b>Customer:</b> {selectedDelivery.customer?.name}</p>
//         {/* <p><b>Address:</b> {selectedDelivery.customer?.address}</p> */}
//       </div>

//       {/* List Barang Scroll */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <h3 className="font-semibold mb-2">Barang:</h3>
//         <ul className="list-disc list-inside text-sm space-y-1">
//           {selectedDelivery.items.map((item) => (
//             <li key={item.id}>
//               {item.part4r
//                 ? `${item.part4r.model} | Qty: ${item.qtyDelivered}`
//                 : item.part2r
//                 ? `${item.part2r.emiPartName} | Qty: ${item.qtyDelivered}`
//                 : `Unknown Part | Qty: ${item.qtyDelivered}`}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t flex justify-end">
//         <button
//           onClick={() => setSelectedDelivery(null)}
//           className="px-4 py-2 bg-red-500 text-white rounded"
//         >
//           Tutup
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//         {/* Sidebar */}
//         <div className="w-full md:w-[250px] bg-[#273F4F] border-[#273F4F] p-6 overflow-y-auto max-h-[100vh] scrollbar-none">
//           {/* Header */}
//           <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
//             <h1 className="text-xl font-semibold text-white flex items-center gap-2">
//               <PackageSearch className="w-5 h-5 text-white" />
//               <span>Delivery</span>
//             </h1>
//             <div className="text-right text-sm text-white leading-tight">
//               <p className="font-mono">{time}</p>
//               <p className="text-xs">
//                 {new Date().toLocaleDateString('id-ID', {
//                   weekday: 'short',
//                   day: 'numeric',
//                   month: 'short',
//                 })}
//               </p>
//             </div>
//           </div>

//           {/* Summary */}
//           <p className="text-sm text-white mb-4">
//             Total Delivery:{' '}
//             <span className="font-bold text-white">{deliveries.length}</span>
//           </p>

//           {/* Content */}
//           {deliveries.length === 0 ? (
//             <div className="text-center text-black italic py-8">
//               Tidak ada data pengiriman hari ini.
//             </div>
//           ) : (
//             <div className="space-y-1">
//               {deliveries.map((doItem) => (
//                 <div
//                   key={doItem.id}
//                   className="p-2 border border-[#D7D7D7] bg-[#D7D7D7] hover:shadow transition-all text-xs rounded"
//                 >
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-blue-700 flex items-center gap-1">
//                       <Truck size={14} />
//                       {doItem.noDo}
//                     </span>
//                     <span className="text-[10px] text-black">
//                       {new Date(doItem.date).toLocaleDateString('id-ID')}
//                     </span>
//                   </div>
//                   <div className="mt-1">
//                     <div className="text-black">
//                       <span className="font-medium">Driver:</span> {doItem.driver?.name || '-'}
//                     </div>
//                     <div className="text-black">
//                       <span className="font-medium">Customer:</span> {doItem.customer?.name || '-'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Map Panel + Footer */}
//         <div className="flex-1 overflow-hidden  border border-black flex flex-col scrollbar-none">
//           <CustomMap origin={warehouseLocation} destinations={destinations} />

// {/* Wrapper to ensure footer stays at bottom */}
// <div className="min-h-[50vh] flex flex-col border border-white overflow-hidden mb-1 scrollbar-none">
// {/* Scrollable Table Section */}
// <div className="flex flex-col h-full bg-[#273F4F] text-xs text-white">

//   {/* Tabel Scrollable Section */}
// {/* <div className="flex-1 px-4 py-3 overflow-y-auto scrollbar-none">
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {[
//       deliveries.slice(0, Math.ceil(deliveries.length / 2)),
//       deliveries.slice(Math.ceil(deliveries.length / 2)),
//     ].map((half, i) => (
//       <div
//         key={i}
//         className="overflow-y-auto max-h-[700px] border border-[#447D9B] rounded bg-[#D7D7D7] scrollbar-none"
//       >
//         <table className="w-full text-xs text-black">
//           <thead className="sticky top-0 z-10 bg-[#447D9B] text-white shadow">
//             <tr>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">#</th>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">DO Number</th>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">Part</th>
//               <th className="text-left px-3 py-2 border-b border-[#273F4F]">Qty</th>
//             </tr>
//           </thead>
//           <tbody>
//             {half.map((doItem, doIndex) => {
//               const total = doItem.items.length;
//               const displayIndex = i * Math.ceil(deliveries.length / 2) + doIndex + 1;

//               return doItem.items.map((item, itemIndex) => {
//                 // const partName = item.part2r?.name || item.part4r?.name || 'Unknown';
//                 const partName =
//   item.part2r ? item.part2r.emiPartName?.trim() || 'Unknown'
//   : item.part4r ? item.part4r.model?.trim() || 'Unknown'
//   : 'Unknown';

//                 const rowNumber = total === 1 ? `${displayIndex}` : `${displayIndex}.${itemIndex + 1}`;

//                 return (
//                   <tr
//                     key={`${doItem.id}-${itemIndex}`}
//                     className="border-b border-[#447D9B] hover:bg-[#FE7743]/20 transition-all"
//                   >
//                     <td className="px-3 py-1 font-mono text-[#273F4F]">{rowNumber}</td>
//                     <td className="px-3 py-1">{doItem.noDo}</td>
//                     <td className="px-3 py-1">{partName}</td>
//                     <td className="px-3 py-1 font-bold">{item.qtyDelivered}</td>
//                   </tr>
//                 );
//               });
//             })}
//           </tbody>
//         </table>
//       </div>
//     ))}
//   </div>
// </div> */}
// <div className="flex-1 px-4 py-3 overflow-y-auto scrollbar-none max-h-[700px] scrollbar-none">
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//     {Object.entries(
//       deliveries.reduce((acc, doItem) => {
//         const driverName =
//           typeof doItem.driver === 'string'
//             ? doItem.driver
//             : doItem.driver?.name || 'Unknown';

//         const customerName =
//           typeof doItem.customer === 'string'
//             ? doItem.customer
//             : doItem.customer?.name || 'Unknown';

//         if (!acc[driverName]) acc[driverName] = new Set();
//         acc[driverName].add(customerName);
//         return acc;
//       }, {} as Record<string, Set<string>>)
//     ).map(([driverName, customers]) => {
//       const noTruck = driverToTruckMap[driverName] || '-';
//       const customerList = Array.from(customers);

//       // Ambil kelas warna driver, kalau gak ada pakai default
//       const headerClass = driverColors[driverName] || driverColors.default;

//       return (
//         <section
//           key={driverName}
//           className="rounded-lg border border-blue-400 bg-white shadow-md flex flex-col"
//         >
//           <header
//             className={`${headerClass} px-5 py-3 rounded-t-lg font-semibold select-none`}
//           >
//             No Truck: <span className="font-mono">{noTruck}</span> | Driver: {driverName}
//           </header>
//           <ul className="divide-y divide-gray-200 px-5 py-3 max-h-56 overflow-y-auto text-gray-700 text-sm flex-1">
//             {customerList.map((cust) => (
//               <li key={cust} className="py-2 hover:bg-blue-50 rounded cursor-default">
//                 • {cust}
//               </li>
//             ))}
//           </ul>
//         </section>
//       );
//     })}
//   </div>
// </div>

//   {/* Footer Section */}
//   <div className="flex justify-between items-center border-t border-white text-black p-3 text-xs bg-[#FE7743]">
//       <span className="flex items-center gap-1 text-black">
//         <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
//         <span className="text-[11px] text-black ">LIVE</span>
//       </span>
//     <span className="font-mono text-black">Last Update: {time}</span>
//   </div>
// </div>
// </div>

//   </div>
//     </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Truck, PackageSearch } from "lucide-react";
import type { LatLngTuple } from "leaflet";

const CustomMap = dynamic(() => import("./CustomMap"), { ssr: false });

type DeliveryItem = {
  id: number;
  qtyDelivered: number;
  part2r?: any;
  part4r?: any;
};

type DeliveryOrder = {
  id: number;
  noDo: string;
  date: string;
  driver: { name: string };
  customer: { name: string; address: string };
  items: DeliveryItem[];
};

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [destinations, setDestinations] = useState<
    { name: string; driver: string; position: LatLngTuple; color: string }[]
  >([]);
  const [time, setTime] = useState("");
  const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryOrder | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const geocodeAddress = async (
    address: string,
  ): Promise<LatLngTuple | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        { headers: { "User-Agent": "DeliveryDashboard/1.0" } },
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.error("Geocode error:", address, err);
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5055/dashboard-delivery");
        const data = await res.json();

        const today = new Date().toISOString().split("T")[0];
        const filtered = data.filter((d: DeliveryOrder) =>
          d.date.startsWith(today),
        );

        setDeliveries(filtered);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const resolveCoordinates = async () => {
      const usedColors = new Set<string>();

      const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color;
        do {
          color =
            "#" +
            Array.from(
              { length: 6 },
              () => letters[Math.floor(Math.random() * 16)],
            ).join("");
        } while (usedColors.has(color));
        usedColors.add(color);
        return color;
      };

      const cleanAddress = (address: string) => {
        return address
          .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, "")
          .replace(/NO\.?\s*[\d\/]+/gi, "")
          .replace(/^JL,?/i, "Jalan")
          .replace(/^[Jj]l\.?/i, "Jalan")
          .replace(/\s{2,}/g, " ")
          .trim();
      };

      const results = await Promise.all(
        deliveries.map(async (doItem) => {
          const name = doItem.customer?.name || "Unknown";
          const driver = doItem.driver?.name || "Unknown";
          const rawAddress = doItem.customer?.address?.trim();

          if (!rawAddress) {
            console.log(`❌ Lewat: ${name} (alamat kosong)`);
            return null;
          }

          let coords: LatLngTuple | null = null;

          const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(
            rawAddress,
          );
          if (isLatLng) {
            const [latStr, lngStr] = rawAddress.split(",");
            coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
            console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
          } else {
            const cleaned = cleanAddress(rawAddress);
            coords = await geocodeAddress(cleaned);
            console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
          }

          if (!coords) return null;

          return {
            name,
            driver,
            position: coords,
            color: getRandomColor(),
          };
        }),
      );

      const successful = results.filter(Boolean) as {
        name: string;
        driver: string;
        position: LatLngTuple;
        color: string;
      }[];

      if (successful.length === 0) {
        console.warn("⚠️ Tidak ada koordinat berhasil di-resolve.");
      }

      setDestinations(successful);
    };

    if (deliveries.length > 0) {
      resolveCoordinates();
    }
  }, [deliveries]);

  const driverToTruckMap: Record<string, string> = {
    ZULKIFLI: "B 9744 UEV",
    EKA: "B 9531 UEW",
    HALDONO: "B 9673 SYN",
    HAFID: "B 9672 SYN",

    //MORE
  };

  const driverColors: Record<string, string> = {
    ZULKIFLI: "bg-green-500 text-white",
    EKA: "bg-gray-400 text-black",
    HALDONO: "bg-yellow-400 text-black",
    HAFID: "bg-blue-600 text-white",
    default: "bg-black text-white",
  };

  const allItems = deliveries.flatMap((doItem, doIndex) =>
    doItem.items.map((item, itemIndex) => ({
      doIndex,
      itemIndex,
      doItem,
      item,
    })),
  );

  const halfLength = Math.ceil(allItems.length / 2);
  const itemHalves = [
    allItems.slice(0, halfLength),
    allItems.slice(halfLength),
  ];

  return (
    <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
      <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">
        {/* MODAL SIDE - ITEM */}

        {/* Sidebar */}
        <div className="w-full md:w-[250px] bg-[#273F4F] border-[#273F4F] p-6 overflow-y-auto max-h-[100vh] scrollbar-none">
          {/* MODAL SIDE - ITEM */}

          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-white" />
              <span>Delivery</span>
            </h1>
            <div className="text-right text-sm text-white leading-tight">
              <p className="font-mono">{time}</p>
              <p className="text-xs">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-white mb-4">
            Total Delivery:{" "}
            <span className="font-bold text-white">{deliveries.length}</span>
          </p>

          {/* Content */}
          {deliveries.length === 0 ? (
            <div className="text-center text-black italic py-8">
              Tidak ada data pengiriman hari ini.
            </div>
          ) : (
            <div className="space-y-1">
              {deliveries.map((doItem) => (
                <div
                  key={doItem.id}
                  className="p-2 border border-[#D7D7D7] bg-[#D7D7D7] hover:shadow transition-all text-xs rounded cursor-pointer"
                  onClick={() => setSelectedDelivery(doItem)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <Truck size={14} />
                      {doItem.noDo}
                    </span>
                    <span className="text-[10px] text-black">
                      {new Date(doItem.date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-black">
                      <span className="font-medium">Driver:</span>{" "}
                      {doItem.driver?.name || "-"}
                    </div>
                    <div className="text-black">
                      <span className="font-medium">Customer:</span>{" "}
                      {doItem.customer?.name || "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Panel + Footer */}
        <div className="flex-1 overflow-hidden  border border-black flex flex-col scrollbar-none">
          <CustomMap origin={warehouseLocation} destinations={destinations} />

          {/* Wrapper to ensure footer stays at bottom */}
          <div className="min-h-[50vh] flex flex-col border border-white overflow-hidden mb-1 scrollbar-none">
            {/* Scrollable Table Section */}
            <div className="flex flex-col h-full bg-[#273F4F] text-xs text-white">
              <div className="flex-1 px-4 py-3 overflow-y-auto scrollbar-none max-h-[700px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(
                    deliveries.reduce(
                      (acc, doItem) => {
                        const driverName =
                          typeof doItem.driver === "string"
                            ? doItem.driver
                            : doItem.driver?.name || "Unknown";

                        if (!acc[driverName]) acc[driverName] = [];
                        acc[driverName].push(doItem);
                        return acc;
                      },
                      {} as Record<string, DeliveryOrder[]>,
                    ),
                  ).map(([driverName, orders]) => {
                    const noTruck = driverToTruckMap[driverName] || "-";
                    const headerClass =
                      driverColors[driverName] || driverColors.default;

                    // 🔑 Group by customer
                    const customers = orders.reduce(
                      (custAcc, doItem) => {
                        const custName =
                          typeof doItem.customer === "string"
                            ? doItem.customer
                            : doItem.customer?.name || "Unknown";

                        if (!custAcc[custName]) custAcc[custName] = [];
                        custAcc[custName].push(...(doItem.items || []));
                        return custAcc;
                      },
                      {} as Record<string, DeliveryItem[]>,
                    );

                    return (
                      <section
                        key={driverName}
                        className="rounded-lg border border-blue-400 bg-white shadow-md flex flex-col"
                      >
                        <header
                          className={`${headerClass} px-5 py-3 rounded-t-lg font-semibold select-none`}
                        >
                          No Truck: <span className="font-mono">{noTruck}</span>{" "}
                          | Driver: {driverName}
                        </header>

                        <ul className="divide-y divide-gray-200 px-5 py-3 max-h-56 overflow-y-auto text-gray-700 text-sm flex-1">
                          {Object.entries(customers).map(
                            ([custName, items]) => {
                              const totalQty = items.reduce(
                                (sum, item) => sum + (item.qtyDelivered || 0),
                                0,
                              );

                              const isExpanded = expandedCustomer === custName;

                              return (
                                <li key={custName} className="py-2">
                                  {/* Klik nama customer untuk toggle */}
                                  <div
                                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                    onClick={() =>
                                      setExpandedCustomer(
                                        isExpanded ? null : custName,
                                      )
                                    }
                                  >
                                    • {custName}{" "}
                                    <span className="text-xs text-gray-500">
                                      (Total: {totalQty})
                                    </span>
                                  </div>

                                  {/* Expand items */}
                                  {isExpanded && (
                                    <ul className="ml-5 list-disc text-gray-600 mt-1">
                                      {items.map((item, idx) => (
                                        <li key={idx}>
                                          {item.part4r
                                            ? `${item.part4r.model} (${item.qtyDelivered})`
                                            : item.part2r
                                              ? `${item.part2r.emiPartName} (${item.qtyDelivered})`
                                              : `Unknown Part (${item.qtyDelivered})`}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
