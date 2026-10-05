// "use client";

// import { useEffect, useState } from "react";
// import { Pencil, Trash2, PlusCircle, Save, X, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { FiCalendar } from "react-icons/fi";

// interface Truck {
//   id: number;
//   noPol: string;
// }

// interface Driver {
//   id: number;
//   name: string;
// }

// interface Customer {
//   id: number;
//   name: string;
// }

// interface ScheduleTruck {
//   id: number;
//   scheduleAt: string;
//   truck: Truck;
//   driver: Driver;
//   customers: { customer: Customer }[];
// }

// export default function ScheduleTruckPage() {
//   const [list, setList] = useState<ScheduleTruck[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     id: 0,
//     truckId: 0,
//     driverId: 0,
//     customerIds: [] as number[],
//     scheduleAt: "",
//   });

//   const [trucks, setTrucks] = useState<Truck[]>([]);
//   const [drivers, setDrivers] = useState<Driver[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]);

//   const router = useRouter();

//   useEffect(() => {
//     verifyLogin();
//     fetchAll();
//   }, []);

//   const verifyLogin = async () => {
//     try {
//       const res = await fetch("http://10.10.10.5:3001/auth/verify", {
//         method: "POST",
//         credentials: "include",
//       });
//       if (!res.ok) router.replace("/admin/login");
//     } catch {
//       router.replace("/admin/login");
//     }
//   };

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const [schedulesRes, trucksRes, driversRes, customersRes] =
//         await Promise.all([
//           fetch("http://10.10.10.5:3001/schedule-truck", { credentials: "include" }),
//           fetch("http://10.10.10.5:3001/truck", { credentials: "include" }),
//           fetch("http://10.10.10.5:3001/driver", { credentials: "include" }),
//           fetch("http://10.10.10.5:3001/customer", { credentials: "include" }),
//         ]);

//       setList(await schedulesRes.json());
//       setTrucks(await trucksRes.json());
//       setDrivers(await driversRes.json());
//       setCustomers(await customersRes.json());
//     } catch (err) {
//       console.error("Gagal fetch data:", err);
//     }
//     setLoading(false);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const method = formData.id ? "PUT" : "POST";
//     const url = formData.id
//       ? `http://10.10.10.5:3001/schedule-truck/${formData.id}`
//       : `http://10.10.10.5:3001/schedule-truck`;

//     const res = await fetch(url, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({
//         truckId: formData.truckId,
//         driverId: formData.driverId,
//         customerIds: formData.customerIds,
//         scheduleAt: formData.scheduleAt,
//       }),
//     });

//     if (res.ok) {
//       setFormData({ id: 0, truckId: 0, driverId: 0, customerIds: [], scheduleAt: "" });
//       setShowForm(false);
//       fetchAll();
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Yakin ingin hapus schedule ini?")) return;
//     await fetch(`http://10.10.10.5:3001/schedule-truck/${id}`, {
//       method: "DELETE",
//       credentials: "include",
//     });
//     fetchAll();
//   };

//   const openEdit = (item: ScheduleTruck) => {
//     setFormData({
//       id: item.id,
//       truckId: item.truck.id,
//       driverId: item.driver.id,
//       customerIds: item.customers.map((c) => c.customer.id),
//       scheduleAt: item.scheduleAt.split("T")[0],
//     });
//     setShowForm(true);
//   };

//   return (
//     <div className="p-6 max-w-full space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
//           <FiCalendar className="text-blue-600" />
//           Schedule Truck Management
//         </h1>
//         <button
//           onClick={() => {
//             setFormData({ id: 0, truckId: 0, driverId: 0, customerIds: [], scheduleAt: "" });
//             setShowForm(true);
//           }}
//           className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm transition"
//         >
//           <PlusCircle size={18} /> Tambah
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-[800px] w-full text-sm text-gray-800 border rounded-xl shadow">
//           <thead className="bg-blue-50 text-sm text-gray-700 font-semibold uppercase">
//             <tr>
//               <th className="px-4 py-3 text-center">No</th>
//               <th className="px-4 py-3 text-center">Truck</th>
//               <th className="px-4 py-3 text-center">Driver</th>
//               <th className="px-4 py-3 text-center">Customers</th>
//               <th className="px-4 py-3 text-center">Schedule At</th>
//               <th className="px-4 py-3 text-center">Aksi</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y bg-white">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-400">
//                   <Loader2 className="animate-spin mx-auto" size={20} />
//                 </td>
//               </tr>
//             ) : list.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-400">
//                   Tidak ada data.
//                 </td>
//               </tr>
//             ) : (
//               list.map((item, idx) => (
//                 <tr key={item.id} className="hover:bg-blue-50 transition">
//                   <td className="px-4 py-2 text-center">{idx + 1}</td>
//                   <td className="px-4 py-2 text-center">{item.truck.noPol}</td>
//                   <td className="px-4 py-2 text-center">{item.driver.name}</td>
//                   <td className="px-4 py-2 text-center">
//                     {item.customers.map((c) => c.customer.name).join(", ")}
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     {new Date(item.scheduleAt).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <div className="flex gap-2 justify-center">
//                       <button
//                         onClick={() => openEdit(item)}
//                         className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
//                       >
//                         <Pencil size={14} /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(item.id)}
//                         className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
//                       >
//                         <Trash2 size={14} /> Hapus
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showForm && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
//           <form
//             onSubmit={handleSubmit}
//             className="bg-white p-6 rounded-xl shadow-xl space-y-4 w-full max-w-md"
//           >
//             <h2 className="text-xl font-semibold">
//               {formData.id ? "Edit Schedule" : "Tambah Schedule"}
//             </h2>

//             <div>
//               <label className="block text-sm text-gray-600">Truck</label>
//               <select
//                 className="w-full border rounded px-3 py-2"
//                 value={formData.truckId}
//                 onChange={(e) => setFormData({ ...formData, truckId: Number(e.target.value) })}
//                 required
//               >
//                 <option value="">-- pilih --</option>
//                 {trucks.map((t) => (
//                   <option key={t.id} value={t.id}>
//                     {t.noPol}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm text-gray-600">Driver</label>
//               <select
//                 className="w-full border rounded px-3 py-2"
//                 value={formData.driverId}
//                 onChange={(e) => setFormData({ ...formData, driverId: Number(e.target.value) })}
//                 required
//               >
//                 <option value="">-- pilih --</option>
//                 {drivers.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm text-gray-600">Customers</label>
//               <select
//                 className="w-full border rounded px-3 py-2"
//                 multiple
//                 value={formData.customerIds.map(String)}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     customerIds: Array.from(e.target.selectedOptions, (opt) => Number(opt.value)),
//                   })
//                 }
//                 required
//               >
//                 {customers.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <small className="text-gray-400">Tekan Ctrl/Cmd untuk memilih banyak</small>
//             </div>

//             <div>
//               <label className="block text-sm text-gray-600">Tanggal Schedule</label>
//               <input
//                 type="date"
//                 className="w-full border rounded px-3 py-2"
//                 value={formData.scheduleAt}
//                 onChange={(e) => setFormData({ ...formData, scheduleAt: e.target.value })}
//                 required
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-4">
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
//               >
//                 <X size={16} /> Batal
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 <Save size={16} /> Simpan
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FiCalendar } from "react-icons/fi";

interface Truck {
  id: number;
  noPol: string;
}
interface Driver {
  id: number;
  name: string;
}
interface Customer {
  id: number;
  name: string;
}
interface ScheduleTruck {
  id: number;
  scheduleAt: string;
  truck: Truck;
  driver: Driver;
  cycle?: number;
  customers: { customer: Customer }[];
}

export default function ScheduleTruckPage() {
  const [list, setList] = useState<ScheduleTruck[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    truckId: 0,
    driverId: 0,
    customerIds: [] as number[],
    scheduleAt: "",
    cycle: 1, // ✅ default cycle
  });

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const router = useRouter();

  useEffect(() => {
    verifyLogin();
    fetchAll();
  }, []);

  const verifyLogin = async () => {
    try {
      const res = await fetch("http://10.10.10.5:3001/auth/verify", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schedulesRes, trucksRes, driversRes, customersRes] =
        await Promise.all([
          fetch("http://10.10.10.5:3001/schedule-truck", {
            credentials: "include",
          }),
          fetch("http://10.10.10.5:3001/truck", { credentials: "include" }),
          fetch("http://10.10.10.5:3001/driver", { credentials: "include" }),
          fetch("http://10.10.10.5:3001/customer", { credentials: "include" }),
        ]);

      setList(await schedulesRes.json());
      setTrucks(await trucksRes.json());
      setDrivers(await driversRes.json());
      setCustomers(await customersRes.json());
    } catch (err) {
      console.error("Gagal fetch data:", err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `http://10.10.10.5:3001/schedule-truck/${formData.id}`
      : `http://10.10.10.5:3001/schedule-truck`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        truckId: formData.truckId,
        driverId: formData.driverId,
        customerIds: formData.customerIds,
        scheduleAt: formData.scheduleAt,
        cycle: formData.cycle, // ✅ kirim cycle ke backend
      }),
    });

    if (res.ok) {
      setFormData({
        id: 0,
        truckId: 0,
        driverId: 0,
        customerIds: [],
        scheduleAt: "",
        cycle: 1,
      });
      setShowForm(false);
      fetchAll();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin hapus schedule ini?")) return;
    await fetch(`http://10.10.10.5:3001/schedule-truck/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchAll();
  };

  const openEdit = (item: ScheduleTruck) => {
    setFormData({
      id: item.id,
      truckId: item.truck.id,
      driverId: item.driver.id,
      customerIds: item.customers.map((c) => c.customer.id),
      scheduleAt: item.scheduleAt.split("T")[0],
      cycle: item.cycle ?? 1, // ✅ ambil cycle jika ada
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          <FiCalendar className="text-blue-600" />
          Schedule Truck Management
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm transition"
        >
          <PlusCircle size={18} /> Tambah
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm text-gray-800 border rounded-xl shadow">
          <thead className="bg-blue-50 text-sm text-gray-700 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3 text-center">No</th>
              <th className="px-4 py-3 text-center">Truck</th>
              <th className="px-4 py-3 text-center">Driver</th>
              <th className="px-4 py-3 text-center">Customers</th>
              <th className="px-4 py-3 text-center">Cycle</th>
              <th className="px-4 py-3 text-center">Schedule At</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  <Loader2 className="animate-spin mx-auto" size={20} />
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              list.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-2 text-center">{idx + 1}</td>
                  <td className="px-4 py-2 text-center">{item.truck.noPol}</td>
                  <td className="px-4 py-2 text-center">{item.driver.name}</td>
                  <td className="px-4 py-2 text-center">
                    {item.customers.map((c) => c.customer.name).join(", ")}
                  </td>
                  <td className="px-4 py-2 text-center">{item.cycle ?? "-"}</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(item.scheduleAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-xl space-y-4 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold">
              {formData.id ? "Edit Schedule" : "Tambah Schedule"}
            </h2>

            <div>
              <label className="block text-sm text-gray-600">Truck</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.truckId}
                onChange={(e) =>
                  setFormData({ ...formData, truckId: Number(e.target.value) })
                }
                required
              >
                <option value="">-- pilih --</option>
                {trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.noPol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Driver</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.driverId}
                onChange={(e) =>
                  setFormData({ ...formData, driverId: Number(e.target.value) })
                }
                required
              >
                <option value="">-- pilih --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Customers</label>
              <select
                className="w-full border rounded px-3 py-2"
                multiple
                value={formData.customerIds.map(String)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerIds: Array.from(e.target.selectedOptions, (o) =>
                      Number(o.value),
                    ),
                  })
                }
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <small className="text-gray-400">
                Tekan Ctrl/Cmd untuk memilih banyak
              </small>
            </div>

            <div>
              <label className="block text-sm text-gray-600">
                Tanggal Schedule
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={formData.scheduleAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduleAt: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Cycle</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.cycle}
                onChange={(e) =>
                  setFormData({ ...formData, cycle: Number(e.target.value) })
                }
              >
                <option value={1}>Cycle 1</option>
                <option value={2}>Cycle 2</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                <X size={16} /> Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Save size={16} /> Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
