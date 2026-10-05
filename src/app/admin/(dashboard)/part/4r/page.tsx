"use client";

import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Save,
  X,
  Loader2,
  PackageSearch,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Part4r {
  id: number;
  codeNo: string;
  customer: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  kpp: string;
  kppNp: string;
}

export default function Part4rPage() {
  const [parts, setParts] = useState<Part4r[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Part4r>({
    id: 0,
    codeNo: "",
    customer: "",
    segment: "",
    assyNo16: "",
    assyNo10: "",
    oeNo: "",
    model: "",
    kpp: "",
    kppNp: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const router = useRouter();
  const [searchAssy, setSearchAssy] = useState("");

  useEffect(() => {
    fetchParts();
    verifyLogin();
  }, []);

  const fetchParts = async () => {
    setLoading(true);
    const res = await fetch("http://10.10.10.5:3001/part-database-4r", {
      credentials: "include",
    });
    const data = await res.json();
    setParts(data);
    setLoading(false);
  };

  const verifyLogin = async () => {
    const res = await fetch("http://10.10.10.5:3001/auth/verify", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) router.replace("/admin/login");
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     const method = form.id ? "PATCH" : "POST";
  //     const url = form.id
  //         ? `http://10.10.10.5:3001/part-database-4r/${form.id}`
  //         : `http://10.10.10.5:3001/part-database-4r`;

  //     await fetch(url, {
  //         method,
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //         body: JSON.stringify(form),
  //     });

  //     setForm({
  //         id: 0, codeNo: "", customer: "", segment: "", assyNo16: "", assyNo10: "", oeNo: "", model: "", kpp: "", kppNp: ""
  //     });
  //     setShowForm(false);
  //     fetchParts();
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = form.id ? "PATCH" : "POST";
    const url = form.id
      ? `http://10.10.10.5:3001/part-database-4r/${form.id}`
      : `http://10.10.10.5:3001/part-database-4r`;

    // Hindari kirim `id` saat POST
    const { id, ...restPayload } = form;
    const payload = method === "POST" ? restPayload : form;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    setForm({
      id: 0,
      codeNo: "",
      customer: "",
      segment: "",
      assyNo16: "",
      assyNo10: "",
      oeNo: "",
      model: "",
      kpp: "",
      kppNp: "",
    });
    setShowForm(false);
    fetchParts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin hapus data ini?")) return;
    await fetch(`http://10.10.10.5:3001/part-database-4r/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchParts();
  };

  const openEdit = (item: Part4r) => {
    setForm(item);
    setShowForm(true);
  };

  const filteredParts = parts.filter(
    (p) =>
      p.assyNo16.toLowerCase().includes(searchAssy.toLowerCase()) ||
      p.assyNo10.toLowerCase().includes(searchAssy.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const paginatedParts = filteredParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Judul */}
      <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2 mb-2">
        <PackageSearch className="text-blue-600" /> Part 4R Management
      </h1>

      {/* Card Tambah & Search */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Tombol Tambah */}
        <button
          onClick={() => {
            setShowForm(true);
            setForm({
              id: 0,
              codeNo: "",
              customer: "",
              segment: "",
              assyNo16: "",
              assyNo10: "",
              oeNo: "",
              model: "",
              kpp: "",
              kppNp: "",
            });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm"
        >
          <PlusCircle size={18} /> Tambah
        </button>

        {/* Search Assy */}
        <input
          type="text"
          value={searchAssy}
          onChange={(e) => {
            setSearchAssy(e.target.value);
            setCurrentPage(1); // reset pagination saat search berubah
          }}
          placeholder="Cari Assy No 16 / 10..."
          className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-auto rounded-lg border border-gray-300 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {[
                "No",
                "Code No",
                "Customer",
                "Segment",
                "AssyNo16",
                "AssyNo10",
                "OE No",
                "Model",
                "KPP",
                "KPP NP",
                "Aksi",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-xs font-bold text-gray-700 text-center"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-center text-sm">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-4">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-4 text-gray-400 italic">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              paginatedParts.map((p, idx) => (
                <tr key={p.id}>
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>{p.codeNo}</td>
                  <td>{p.customer}</td>
                  <td>{p.segment}</td>
                  <td>{p.assyNo16}</td>
                  <td>{p.assyNo10}</td>
                  <td>{p.oeNo}</td>
                  <td>{p.model}</td>
                  <td>{p.kpp}</td>
                  <td>{p.kppNp}</td>
                  <td className="flex justify-center gap-2 py-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600 text-xs flex items-center gap-1"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t">
          <p className="text-xs text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={`px-3 py-1 rounded border text-sm ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={`px-3 py-1 rounded border text-sm ${currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-xl space-y-4 w-full max-w-2xl"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {form.id ? "Edit Part 4R" : "Tambah Part 4R"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Code No", key: "codeNo" },
                { label: "Customer", key: "customer" },
                { label: "Segment", key: "segment" },
                { label: "Assy No 16", key: "assyNo16" },
                { label: "Assy No 10", key: "assyNo10" },
                { label: "OE No", key: "oeNo" },
                { label: "Model", key: "model" },
                { label: "KPP", key: "kpp" },
                { label: "KPP NP", key: "kppNp" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof Part4r] as string}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    required
                    className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
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
