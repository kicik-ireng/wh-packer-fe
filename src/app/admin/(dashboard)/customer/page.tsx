"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FiUsers } from "react-icons/fi";

interface Customer {
  id: number;
  name: string;
  address?: string;
}

export default function CustomerPage() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Customer>({
    id: 0,
    name: "",
    address: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:3001/customer", {
        credentials: "include",
      });
      const data = await res.json();
      setCustomerList(data);
    } catch (err) {
      console.error("Gagal mengambil data customer:", err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `http://10.10.10.5:3001/customer/${formData.id}`
      : `http://10.10.10.5:3001/customer`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: formData.name, address: formData.address }),
    });

    if (res.ok) {
      setFormData({ id: 0, name: "", address: "" });
      setShowForm(false);
      fetchCustomers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin hapus customer ini?")) return;
    await fetch(`http://10.10.10.5:3001/customer/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchCustomers();
  };

  const openEdit = (item: Customer) => {
    setFormData(item);
    setShowForm(true);
  };

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const res = await fetch("http://10.10.10.5:3001/auth/verify", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/admin/login");
        }
      } catch (error) {
        console.error("Verifikasi login gagal", error);
        router.replace("/admin/login");
      }
    };

    verifyLogin();
  }, [router]);

  const totalPages = Math.ceil(customerList.length / itemsPerPage);
  const paginatedData = customerList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [customerList]);

  return (
    <div className="p-6 max-w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          <FiUsers className="text-blue-600" />
          Customer Management
        </h1>
        <button
          onClick={() => {
            setFormData({ id: 0, name: "", address: "" });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm transition"
        >
          <PlusCircle size={18} /> Tambah
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-xl border border-gray-300 shadow-xl">
            <table className="min-w-[600px] w-full text-sm text-gray-800">
              <thead className="bg-blue-50 text-sm text-gray-700 font-semibold uppercase tracking-wide">
                <tr>
                  {["No", "Nama", "Alamat", "Aksi"].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-center border-b border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      <Loader2 className="animate-spin mx-auto" size={20} />
                    </td>
                  </tr>
                ) : customerList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-2 text-center font-medium">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-2 text-center">{customer.name}</td>
                      <td className="px-4 py-2 text-center">
                        {customer.address || "-"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(customer)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <span className="h-4 w-px bg-gray-300" />
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
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

          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
            <p className="text-xs text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-xl space-y-4 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {formData.id ? "Edit Customer" : "Tambah Customer"}
            </h2>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">
                Nama
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">
                Alamat
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
              >
                <X size={16} /> Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
