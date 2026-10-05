// 'use client';

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   User,
//   ClipboardList,
// } from "lucide-react";

// // Komponen MenuCard
// const MenuCard = ({
//   href,
//   icon,
//   label,
//   description,
//   isAdmin,
//   className = "",
// }: {
//   href: string;
//   icon: React.ReactNode;
//   label: string;
//   description: string;
//   isAdmin?: boolean;
//   className?: string;
// }) => (
//   <Link
//     href={href}
//     className={`${isAdmin
//       ? `bg-white border border-gray-300 rounded-full shadow-md p-3 flex items-center justify-center w-14 h-14 hover:shadow-lg transition-transform hover:scale-110 fixed right-6 z-20 ${className}`
//       : "bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col items-start text-left"
//       }`}
//   >
//     <div className={`bg-blue-100 rounded-full ${isAdmin ? "p-2" : "p-3 mb-4"}`}>
//       {icon}
//     </div>
//     {!isAdmin && (
//       <>
//         <span className="text-lg font-semibold text-gray-900">{label}</span>
//         <p className="mt-1 text-sm text-gray-600">{description}</p>
//       </>
//     )}
//   </Link>
// );

// export default function HomePage() {
//   const [showMonitoring, setShowMonitoring] = useState(false);

//   // Efek visual hujan
//   useEffect(() => {
//     const canvas = document.getElementById("rain-canvas") as HTMLCanvasElement;
//     const ctx = canvas?.getContext("2d");
//     if (!canvas || !ctx) return;

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const drops = Array.from({ length: 200 }, () => ({
//       x: Math.random() * canvas.width,
//       y: Math.random() * canvas.height,
//       length: Math.random() * 20 + 10,
//       speed: Math.random() * 2 + 2,
//     }));

//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
//       ctx.lineWidth = 1;

//       for (let drop of drops) {
//         ctx.beginPath();
//         ctx.moveTo(drop.x, drop.y);
//         ctx.lineTo(drop.x, drop.y + drop.length);
//         ctx.stroke();
//       }

//       update();
//       requestAnimationFrame(draw);
//     };

//     const update = () => {
//       for (let drop of drops) {
//         drop.y += drop.speed;
//         if (drop.y > canvas.height) {
//           drop.y = -drop.length;
//           drop.x = Math.random() * canvas.width;
//         }
//       }
//     };

//     draw();

//     const handleResize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <main className="relative min-h-screen w-full bg-gradient-to-b from-[#1e293b]/40 via-[#0f172a]/30 to-[#020617]/20 backdrop-blur-sm text-gray-900 font-sans overflow-hidden">
//       {/* Background Rain Canvas */}
//       <canvas id="rain-canvas" className="absolute inset-0 z-0 pointer-events-none" />

//       {/* Background Gambar */}
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         <img
//           src="/bg-main.png"
//           alt="Industrial Background"
//           className="w-full h-full object-cover opacity-20"
//         />
//       </div>

//       {/* Logo */}
//       <div className="relative z-10 flex justify-center pt-10">
//         <img src="/logo_.png" alt="Company Logo" className="h-24 w-auto drop-shadow-xl" />
//       </div>

//       {/* Admin Button Dropdown */}
//       <div className="fixed top-4 right-6 z-30 group">
//         <button
//           onClick={() => setShowMonitoring(!showMonitoring)}
//           className="bg-white border border-gray-300 rounded-full shadow-md p-3 flex items-center justify-center w-14 h-14 hover:shadow-lg transition-transform hover:scale-110"
//         >
//           <User className="w-6 h-6 text-black" />
//         </button>

//         <div
//           className={`transition-all duration-200 origin-top-right ${
//             showMonitoring ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
//           } absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-xl ring-1 ring-black/5`}
//         >
//           <div className="py-2 text-sm text-gray-800">
//             <div className="px-4 py-2 text-xs text-gray-500">Monitoring Menu</div>
//             <Link href="/monitoring/incoming" className="block px-4 py-2 hover:bg-gray-100">Incoming</Link>
//             <Link href="/monitoring/packing" className="block px-4 py-2 hover:bg-gray-100">Packing</Link>
//             <Link href="/monitoring/delivery" className="block px-4 py-2 hover:bg-gray-100">Delivery</Link>
//             <Link href="/monitoring/map" className="block px-4 py-2 hover:bg-gray-100">Map</Link>
//             <div className="border-t my-2 mx-2" />
//             <Link href="/admin/login" className="block px-4 py-2 text-blue-600 hover:underline">
//               Ke Admin Panel →
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Judul dan Deskripsi */}
//       <section className="relative z-10 text-center flex flex-col items-center px-4 md:px-6 py-12 md:py-16 space-y-6 max-w-6xl mx-auto">
//         <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-tight drop-shadow-md">
//           EXEDY Production Dashboard
//         </h1>
//         <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl leading-relaxed">
//           A real-time monitoring and control system designed to enhance overall production efficiency and performance.
//         </p>
//       </section>

//       {/* Menu Cards */}
//       <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 mt-10">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           <MenuCard
//             href="/manpower/packing-report"
//             icon={<ClipboardList className="w-8 h-8 text-black" />}
//             label="Packing"
//             description="Detailed and real-time reports of packing activities from the production division."
//           />
//           <MenuCard
//             href="/dandori/incoming"
//             icon={<ClipboardList className="w-8 h-8 text-black" />}
//             label="Incoming"
//             description="Monitoring of incoming goods to the production area and warehouse on a daily basis."
//           />
//           <MenuCard
//             href="/dandori/delivery"
//             icon={<ClipboardList className="w-8 h-8 text-black" />}
//             label="Delivery"
//             description="Daily delivery data including customer destination information."
//           />
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="relative z-10 mt-24 mb-10 text-center text-sm text-gray-500 px-4">
//         &copy; {new Date().getFullYear()} PT. Vuteq Indonesia • All rights reserved.
//       </footer>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  ClipboardList,
  CalendarClock,
  Layers,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

// MenuCard Component
const MenuCard = ({
  href,
  icon,
  label,
  description,
  delay,
  isDropdown = false,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  delay: number;
  isDropdown?: boolean;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      {isDropdown ? (
        <div
          onClick={() => setOpen(!open)}
          className="cursor-pointer bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col gap-4 text-left group"
        >
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-4 flex items-center justify-center group-hover:scale-110 transform transition-transform">
            {icon}
          </div>
          <span className="text-xl font-bold text-gray-800">{label}</span>
          <p className="text-sm text-gray-600">{description}</p>
          {/* Dropdown list */}
          {open && <div className="mt-4 space-y-2">{children}</div>}
        </div>
      ) : (
        <Link
          href={href || "#"}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col gap-4 text-left group"
        >
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-4 flex items-center justify-center group-hover:scale-110 transform transition-transform">
            {icon}
          </div>
          <span className="text-xl font-bold text-gray-800">{label}</span>
          <p className="text-sm text-gray-600">{description}</p>
        </Link>
      )}
    </motion.div>
  );
};

export default function HomePage() {
  const [showMonitoring, setShowMonitoring] = useState(false);

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-800 font-sans overflow-hidden">
      {/* Floating gradient shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />

      {/* Background subtle grid */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_#60a5fa_1px,_transparent_1px)] bg-[length:24px_24px]" />

      {/* Logo */}
      <div className="relative z-10 flex justify-center pt-10">
        <img
          src="/logo_.png"
          alt="Company Logo"
          className="h-20 w-auto drop-shadow-lg"
        />
      </div>

      {/* Admin Dropdown */}
      <div className="fixed top-4 right-6 z-30 group">
        <button
          onClick={() => setShowMonitoring(!showMonitoring)}
          className="bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg p-3 flex items-center justify-center w-14 h-14 hover:shadow-2xl transition-transform hover:scale-110"
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>

        <div
          className={`transition-all duration-300 origin-top-right ${
            showMonitoring
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          } absolute right-0 mt-3 w-64 rounded-xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30`}
        >
          <div className="py-3 text-sm text-gray-800">
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
              Monitoring Menu
            </div>
            <Link
              href="/monitoring/incoming"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Incoming
            </Link>
            <Link
              href="/monitoring/packing"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Packing
            </Link>
            <Link
              href="/monitoring/delivery2"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Delivery
            </Link>
            <Link
              href="/monitoring/map"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Map
            </Link>
            <div className="border-t my-2 mx-2" />
            <Link
              href="/admin/login"
              className="block px-4 py-2 text-blue-600 hover:underline"
            >
              Ke Admin Panel →
            </Link>
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <section className="relative z-10 text-center flex flex-col items-center px-4 md:px-6 py-12 md:py-16 space-y-6 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight drop-shadow-md"
        >
          EXEDY Production Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-2 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
        >
          Real-time monitoring and control system to enhance production
          efficiency and performance.
        </motion.p>
      </section>

      {/* Menu Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <MenuCard
            href="/manpower/packing-report"
            icon={<ClipboardList className="w-8 h-8 text-white" />}
            label="Packing"
            description="Detailed real-time reports of packing activities."
            delay={0.1}
          />
          <MenuCard
            href="/dandori/incoming"
            icon={<ClipboardList className="w-8 h-8 text-white" />}
            label="Incoming"
            description="Monitoring of incoming goods and materials."
            delay={0.2}
          />
          {/* Delivery Dropdown */}
          <MenuCard
            icon={<Truck className="w-8 h-8 text-white" />}
            label="Delivery"
            description="Access schedule, delivery tracking, and final process."
            delay={0.3}
            isDropdown
          >
            <Link
              href="/dandori/schedule"
              className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              Schedule
            </Link>
            <Link
              href="/dandori/delivery"
              className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              Delivery
            </Link>
            <Link
              href="/dandori/final"
              className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              Final
            </Link>
          </MenuCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-24 mb-10 text-center text-sm text-gray-500 px-4">
        &copy; {new Date().getFullYear()} PT. Vuteq Indonesia • All rights
        reserved.
      </footer>
    </main>
  );
}
