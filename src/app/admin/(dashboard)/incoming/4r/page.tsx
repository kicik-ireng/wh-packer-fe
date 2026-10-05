"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";
import { FiDownload } from "react-icons/fi";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "sonner";

import * as XLSX from "sheetjs-style";

interface Incoming4r {
  id: number;
  prId: string;
  date: string;
  cust: string;
  seg: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  kpp: string;
  kppNp: string;
  qtyPlan: number;
  qtyActual?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function Incoming4RPage() {
  const [data, setData] = useState<Incoming4r[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [searchPrid, setSearchPrid] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editedData, setEditedData] = useState<
    Record<number, Partial<Incoming4r>>
  >({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:3001/incoming4r", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Gagal mengambil data incoming4r", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      const res = await fetch(`http://10.10.10.5:3001/incoming4r/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Gagal menghapus data");

      setData((prev) => prev.filter((item) => item.id !== id));
      setDeleteSuccess(true); // ✅ tampilkan pesan
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const updateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    await fetch(`http://10.10.10.5:3001/incoming4r/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setData((data) =>
      data.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const statusBadge = (status: Incoming4r["status"]) => {
    const base =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "APPROVED":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>
        );
      default:
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            Pending
          </span>
        );
    }
  };
  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "4r");

      const res = await fetch("http://10.10.10.5:3001/incoming4r", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal upload file");
      }

      setUploadSuccess(true);

      const newData = await fetch("http://10.10.10.5:3001/incoming4r", {
        credentials: "include",
      }).then((res) => res.json());
      setData(newData);
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setUploading(false);
    }
  }
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

  function normalize(str?: string): string {
    return str?.trim().toUpperCase() ?? "";
  }

  function parseDateString(dateStr: string): Date | null {
    const [dd, mm, yyyy] = dateStr.split("/");
    if (!dd || !mm || !yyyy) return null;
    return new Date(`${yyyy}-${mm}-${dd}`);
  }

  async function exportIncoming4rToExcel(
    data: Incoming4r[],
    selectedDate?: string,
  ) {
    if (!data || data.length === 0) {
      toast.error("Data kosong !");
      return;
    }

    let filtered = data;

    if (selectedDate && selectedDate !== "") {
      const [yyyy, mm, dd] = selectedDate.split("-");
      const compare = `${dd}/${mm}/${yyyy}`;
      filtered = data.filter((item) => item.date === compare);

      if (filtered.length === 0) {
        toast.warning("Tidak ada data !");
        return;
      }
    } else {
      toast.info("Tanggal belum dipilih. Menampilkan semua data.");
      filtered = [...data];
    }

    filtered.sort((a, b) => {
      const dateA = parseDateString(a.date)?.getTime() || 0;
      const dateB = parseDateString(b.date)?.getTime() || 0;
      return dateA - dateB;
    });

    const part4r = await fetch("http://10.10.10.5:3001/part-database-4r", {
      credentials: "include",
    }).then((res) => res.json());

    const fileDate = parseDateString(filtered[0]?.date || "") || new Date();
    const tanggalForFile = fileDate
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    const headers = [
      "No",
      "PR ID",
      "Code No",
      "Date",
      "Cust",
      "Segment",
      "Assy 16",
      "Assy 10",
      "OE No",
      "Model",
      "KPP",
      "KPP NP",
      "Qty Plan",
    ];

    const sheetData: (string | number)[][] = [headers];

    filtered.forEach((item, index) => {
      let codeNo = "";
      const match = part4r.find(
        (p: any) =>
          normalize(p.assyNo16) === normalize(item.assyNo16) &&
          normalize(p.segment) === normalize(item.seg) &&
          normalize(p.oeNo) === normalize(item.oeNo),
      );
      if (match) codeNo = match.codeNo || "";

      sheetData.push([
        index + 1,
        item.prId,
        codeNo,
        item.date,
        item.cust,
        item.seg,
        item.assyNo16,
        item.assyNo10,
        item.oeNo,
        item.model,
        item.kpp,
        item.kppNp,
        item.qtyPlan,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incoming4R");

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[addr];
        if (!cell) continue;

        const isHeader = R === 0;
        const centerCols = [0, 2, 3, 4, 5, 10, 11, 12];
        const leftCols = [1, 6, 7, 8, 9];
        let align: "center" | "left" = "center";

        if (leftCols.includes(C)) align = "left";

        cell.s = {
          font: {
            name: "Calibri",
            sz: 12,
            bold: isHeader,
          },
          alignment: {
            horizontal: isHeader ? "center" : align,
            vertical: "center",
          },
          fill: isHeader ? { fgColor: { rgb: "E0E0E0" } } : undefined,
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    }

    XLSX.writeFile(workbook, `incoming4r-${tanggalForFile}.xlsx`);
  }

  function formatToDateOnly(dateStr: string): string {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const filteredData = data.filter(
    (item) =>
      item.prId.toLowerCase().includes(searchPrid.toLowerCase()) &&
      (dateFilter === "" || formatToDateOnly(item.date) === dateFilter),
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <FiDownload className="text-blue-600" />
        Incoming 4R
      </h1>
      {uploadSuccess && (
        <div className="px-4 py-2 rounded-md bg-green-50 text-green-800 border border-green-300 text-sm shadow-sm">
          ✅ File berhasil diupload.
        </div>
      )}

      {uploadError && (
        <div className="px-4 py-2 rounded-md bg-red-50 text-red-700 border border-red-300 text-sm shadow-sm whitespace-pre-wrap">
          ❌ {uploadError}
        </div>
      )}

      {deleteSuccess && (
        <div className="mb-4 px-4 py-2 rounded-md bg-green-100 text-green-800 border border-green-300 text-sm shadow">
          ✅ Data berhasil dihapus.
        </div>
      )}
      {/* Upload Section */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm justify-between">
        <div className="flex flex-col md:flex-row gap-3">
          <label className="relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gradient-to-r from-white to-gray-50 px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 cursor-pointer transition">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              disabled={uploading}
            />
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-blue-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiUploadCloud className="text-lg transition-transform duration-200 group-hover:-translate-y-1" />
                Upload Excel
              </span>
            )}
          </label>

          {/* Export Excel */}
          <button
            onClick={() => exportIncoming4rToExcel(data, dateFilter)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <FiDownload className="text-base" />
            Export Excel
          </button>
        </div>

        {/* 🔍 Search PR ID */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search PR ID..."
            value={searchPrid}
            onChange={(e) => setSearchPrid(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-blue-500 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 text-sm"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full md:w-52 px-3 py-2 border border-blue-500 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-xl border border-gray-300 shadow-xl">
            <table className="min-w-[1000px] w-full text-sm text-gray-800">
              <thead className="bg-blue-50 text-sm text-gray-700 font-semibold uppercase tracking-wide">
                <tr>
                  {[
                    "No",
                    "PR ID",
                    "Date",
                    "Cust",
                    "Seg",
                    "Assy 16",
                    "Assy 10",
                    "OE No",
                    "Model",
                    "KPP",
                    "KPP NP",
                    "Plan",
                    "Status",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-center border-b border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center border-b border-gray-300 whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      No data available.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                      <td className="px-3 py-2 text-center font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-2 text-center">{item.prId}</td>
                      <td className="px-3 py-2 text-center">{item.date}</td>
                      <td className="px-3 py-2 text-center">{item.cust}</td>
                      <td className="px-3 py-2 text-center">{item.seg}</td>
                      <td className="px-3 py-2 text-center">{item.assyNo16}</td>
                      <td className="px-3 py-2 text-center">{item.assyNo10}</td>
                      <td className="px-3 py-2 text-center">{item.oeNo}</td>
                      <td className="px-3 py-2 text-center">{item.model}</td>
                      <td className="px-3 py-2 text-center">{item.kpp}</td>
                      <td className="px-3 py-2 text-center">{item.kppNp}</td>

                      <td className="px-3 py-2 text-center">
                        {editingRow === item.id ? (
                          <input
                            type="number"
                            value={editedData[item.id]?.qtyPlan ?? item.qtyPlan}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setEditedData((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], qtyPlan: val },
                              }));
                            }}
                            className="w-20 border border-blue-400 rounded px-2 py-1 text-sm text-center"
                          />
                        ) : (
                          <span>{item.qtyPlan}</span>
                        )}
                      </td>

                      <td className="px-4 py-2 text-center">
                        {statusBadge(item.status)}
                      </td>
                      <td className="px-4 py-2 text-center space-x-1">
                        {editingRow === item.id ? (
                          <>
                            <button
                              onClick={async () => {
                                const update = editedData[item.id];
                                if (
                                  !update ||
                                  typeof update.qtyPlan !== "number"
                                )
                                  return;

                                try {
                                  const res = await fetch(
                                    `http://10.10.10.5:3001/incoming4r/${item.id}`,
                                    {
                                      method: "PATCH",
                                      credentials: "include",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        qtyPlan: update.qtyPlan,
                                      }),
                                    },
                                  );

                                  if (!res.ok)
                                    throw new Error("Gagal update qtyPlan");

                                  setData((prev) =>
                                    prev.map((d) =>
                                      d.id === item.id
                                        ? { ...d, qtyPlan: update.qtyPlan! }
                                        : d,
                                    ),
                                  );
                                  setEditedData((prev) => {
                                    const updated = { ...prev };
                                    delete updated[item.id];
                                    return updated;
                                  });
                                  setEditingRow(null);
                                } catch (err) {
                                  console.error(err);
                                  alert("Gagal menyimpan perubahan.");
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingRow(null);
                                setEditedData((prev) => {
                                  const updated = { ...prev };
                                  delete updated[item.id];
                                  return updated;
                                });
                              }}
                              className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-3 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingRow(item.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                          </>
                        )}
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
    </div>
  );
}
