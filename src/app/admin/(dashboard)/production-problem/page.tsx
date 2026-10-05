"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";
import { FiTool } from "react-icons/fi";

type ProductionProblem = {
  id: number;
  no: number;
  jamMulai: string;
  jamSelesai: string;
  menit: number;
  problemItem: string;
  pic: string;
  slOrDl: string;
  status: string;
  keterangan?: string | null;
  createdAt: string;
};
type Manpower = {
  id: number;
  nik: string;
  name: string;
};

function formatTime(datetime: string) {
  const date = new Date(datetime);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(datetime: string) {
  const date = new Date(datetime);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProductionProblemAdminPage() {
  const [data, setData] = useState<ProductionProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [manpowerList, setManpowerList] = useState<Manpower[]>([]);

  useEffect(() => {
    const fetchManpower = async () => {
      try {
        const res = await fetch("http://10.10.10.5:3001/manpower", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Gagal mengambil data manpower");
        const json = await res.json();
        setManpowerList(json);
      } catch (error) {
        console.error("Gagal fetch manpower", error);
      }
    };

    fetchManpower();
  }, []);

  const getManpowerName = (nik: string) => {
    const found = manpowerList.find((mp) => mp.nik === nik);
    return found ? found.name : nik; // fallback ke nik kalau tidak ditemukan
  };

  // 🔒
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://10.10.10.5:3001/production-problem");
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 py-10">Loading data...</p>;
  if (error)
    return <p className="text-red-600 text-center py-10">Error: {error}</p>;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <FiTool className="text-blue-600" />
        Laporan Masalah Produksi
      </h1>
      <button
        onClick={fetchData}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-150
  font-medium shadow-md border text-sm
  ${
    loading
      ? "bg-gray-200 text-gray-500 cursor-not-allowed animate-pulse"
      : "bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
  }
`}
      >
        <FiRefreshCw
          className={`text-lg transition-transform duration-300 
      ${loading ? "animate-spin scale-110" : "hover:rotate-90"}
    `}
        />
        <span>{loading ? "Refreshing..." : "Refresh"}</span>
      </button>
      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-gray-300">
        <table className="min-w-full text-sm text-gray-800 text-center">
          <thead className="bg-blue-50 text-sm text-gray-700 font-semibold uppercase tracking-wide">
            <tr>
              {[
                "No",
                "Tanggal",
                "Jam Mulai",
                "Jam Selesai",
                "Menit",
                "Problem Item",
                "PIC",
                "SL/DL",
                "Status",
                "Keterangan",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 whitespace-nowrap border-b border-gray-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-6 text-gray-400 italic"
                >
                  Tidak ada data ditemukan
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-2 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2">{formatDate(item.jamMulai)}</td>
                  <td className="px-4 py-2">{formatTime(item.jamMulai)}</td>
                  <td className="px-4 py-2">{formatTime(item.jamSelesai)}</td>
                  <td className="px-4 py-2">{item.menit}</td>
                  <td className="px-4 py-2">{item.problemItem}</td>
                  <td className="px-4 py-2">{getManpowerName(item.pic)}</td>
                  <td className="px-4 py-2">{item.slOrDl}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "selesai"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 italic text-gray-600">
                    {item.keterangan?.trim() || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
  );
}
