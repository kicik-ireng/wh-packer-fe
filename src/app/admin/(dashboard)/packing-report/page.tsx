"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import * as XLSX from "sheetjs-style";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";
import { FiPackage } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { Trash } from "lucide-react";

interface Incoming2r {
  prId: string;
  date: string;
  cust: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  EMIpartname: string;
  kpp: string;
  qtyPlan: number;
  qtyActual?: number;
  status: "PENDING" | "APPROVED";
  createdAt: string;
}

interface Incoming4r {
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
  status: "PENDING" | "APPROVED";
  uploadedAt: string;
  createdAt: string;
}

interface PackingEntry {
  id: number;
  no: number;
  jamMulai: string;
  jamSelesai: string;
  menitPacking: number;
  packingReqNo: string;
  explannerNo: string;
  customerPartNo: string;
  qtyPlan: number;
  qtyActualPacking: number;
  balancePlanVsActual: number;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  Incoming2r?: Incoming2r | null;
  Incoming4r?: Incoming4r | null;
  tanggalPacking: string;
  lineNo: string;
  pic1?: Manpower;
  pic2?: Manpower;
  pic3?: Manpower;
  createdAt?: string;
}

interface Manpower {
  id: number;
  name: string;
}

interface PackingReport {
  id: number;
  tanggalPacking: string;
  lineNo: string;
  qty2R: number;
  qty4R: number;
  keterangan: string;
  pic1?: Manpower;
  pic2?: Manpower;
  pic3?: Manpower;
  status: string;
  entries: PackingEntry[];
}

export default function PackingReportPage() {
  const [data, setData] = useState<PackingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [showPRIDSearch, setShowPRIDSearch] = useState(false);
  const [searchPRID, setSearchPRID] = useState("");
  const router = useRouter();
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editedEntry, setEditedEntry] = useState<Partial<PackingEntry>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  function sortData(entries: PackingEntry[], type: string): PackingEntry[] {
    let sorted = [...entries];

    if (type === "ALL") {
      sorted.sort(
        (a, b) =>
          new Date(
            b.createdAt ||
              b.Incoming2r?.createdAt ||
              b.Incoming4r?.createdAt ||
              "",
          ).getTime() -
          new Date(
            a.createdAt ||
              a.Incoming2r?.createdAt ||
              a.Incoming4r?.createdAt ||
              "",
          ).getTime(),
      );
    } else {
      sorted.sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;

        const dateA = new Date(a.tanggalPacking).getTime();
        const dateB = new Date(b.tanggalPacking).getTime();

        return dateB - dateA;
      });
    }

    return sorted;
  }

  const startEditing = (entry: PackingEntry) => {
    setEditingEntryId(entry.id);
    setEditedEntry(entry);
  };

  const saveEditedEntry = async () => {
    if (!editingEntryId) return;

    try {
      const res = await fetch(
        `http://10.10.10.5:3001/packing-entry/${editingEntryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedEntry),
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Gagal memperbarui entry");
      await fetchData();
      setEditingEntryId(null);
      setEditedEntry({});
    } catch (err: any) {
      setError(err.message);
    }
  };
  const handleDeleteEntry = async (entryId: number) => {
    const confirmed = confirm("Yakin ingin menghapus entry ini?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://10.10.10.5:3001/packing-entry/${entryId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus entry");
      }

      await fetchData(); // Refresh setelah hapus
    } catch (err: any) {
      setError(err.message || "Gagal menghapus entry");
    }
  };

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:3001/packing-report", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal mengambil data packing report");
      const jsonData: PackingReport[] = await res.json();

      const entriesWithReportInfo = jsonData.flatMap((report) =>
        report.entries.map((entry) => ({
          ...entry,
          tanggalPacking: report.tanggalPacking,
          lineNo: report.lineNo,
          pic1: report.pic1,
          pic2: report.pic2,
          pic3: report.pic3,
          createdAt:
            entry.Incoming2r?.createdAt || entry.Incoming4r?.createdAt || "",
        })),
      );

      setData(entriesWithReportInfo);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setData((prev) => sortData(prev, selectedType));
  }, [selectedType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedType, searchPRID]);

  const handleExportToExcel = async () => {
    const [part2r, part4r] = await Promise.all([
      fetch("http://10.10.10.5:3001/part-database-2r", {
        credentials: "include",
      }).then((res) => res.json()),
      fetch("http://10.10.10.5:3001/part-database-4r", {
        credentials: "include",
      }).then((res) => res.json()),
    ]);

    const rows: any[] = [];

    filtered.forEach((entry) => {
      const pics = [entry.pic1, entry.pic2, entry.pic3].filter(Boolean);
      const jumlahPIC = pics.length || 1; // biar gak bagi nol

      const is4R = entry.type === "4R";
      const is2R = entry.type === "2R";

      const assyNo = is4R
        ? entry.Incoming4r?.assyNo16
        : entry.Incoming2r?.assyNo16;

      // let codeNo = '';
      // if (is4R && assyNo) {
      //   const match = part4r.find((p: any) => p.assyNo16 === assyNo);
      //   if (match) codeNo = match.codeNo || '';
      // } else if (is2R && assyNo) {
      //   const match = part2r.find((p: any) => p.assyNo16 === assyNo);
      //   if (match) codeNo = match.codeNo || '';
      // }
      // let codeNo = '';

      // // Untuk 4R: match berdasarkan assyNo16 + segment (seg) + oeNo
      // if (
      //   is4R &&
      //   assyNo &&
      //   entry.Incoming4r &&
      //   entry.Incoming4r.seg &&
      //   entry.Incoming4r.oeNo
      // ) {
      //   const match = part4r.find((p: any) =>
      //     p.assyNo16 === assyNo &&
      //     p.segment === entry.Incoming4r!.seg &&
      //     p.oeNo === entry.Incoming4r!.oeNo
      //   );
      //   if (match) codeNo = match.codeNo || '';
      // }

      // // Untuk 2R: match berdasarkan assyNo16 + oeNo
      // if (
      //   is2R &&
      //   assyNo &&
      //   entry.Incoming2r &&
      //   entry.Incoming2r.segment &&
      //   entry.Incoming2r.oeNo
      // ) {
      //   const match = part2r.find((p: any) =>
      //     p.assyNo16 === assyNo &&
      //     p.oeNo === entry.Incoming2r!.oeNo
      //   );
      //   if (match) codeNo = match.codeNo || '';
      // }
      // Function Code No

      function normalize(str?: string): string {
        return str?.trim().toUpperCase() ?? "";
      }
      let codeNo = "";

      // Untuk 4R: match berdasarkan assyNo16 + segment (seg) + oeNo
      if (
        is4R &&
        assyNo &&
        entry.Incoming4r &&
        entry.Incoming4r.seg &&
        entry.Incoming4r.oeNo
      ) {
        const match = part4r.find(
          (p: any) =>
            normalize(p.assyNo16) === normalize(assyNo) &&
            normalize(p.segment) === normalize(entry.Incoming4r!.seg) &&
            normalize(p.oeNo) === normalize(entry.Incoming4r!.oeNo),
        );
        if (match) codeNo = match.codeNo || "";
      }

      // Untuk 2R: match berdasarkan assyNo16 + oeNo
      if (
        is2R &&
        assyNo &&
        entry.Incoming2r &&
        entry.Incoming2r.segment &&
        entry.Incoming2r.oeNo
      ) {
        const match = part2r.find(
          (p: any) =>
            normalize(p.assyNo16) === normalize(assyNo) &&
            normalize(p.oeNo) === normalize(entry.Incoming2r!.oeNo),
        );
        if (match) codeNo = match.codeNo || "";
      }

      const menit = entry.menitPacking;
      const mh = menit / 60;
      const qtyPerPic = entry.qtyActualPacking / jumlahPIC;
      const pcsPerMh = mh > 0 ? qtyPerPic / mh : "#DIV/0!";

      pics.forEach((pic) => {
        if (!pic) return;

        const baseData: any = {
          "MR ID": is4R
            ? entry.Incoming4r?.prId || entry.packingReqNo
            : entry.Incoming2r?.prId || entry.packingReqNo,
          "Packing Member": pic.name,
          "Code No": codeNo,
          Date: new Date(entry.tanggalPacking).toLocaleDateString("en-GB"),
          "Cust.": is4R
            ? entry.Incoming4r?.cust || "—"
            : entry.Incoming2r?.cust || "—",
          "Seg.": is4R
            ? entry.Incoming4r?.seg || "—"
            : entry.Incoming2r?.segment || "—",
          "Assy No": assyNo || "—",
          "OE No.": is4R
            ? entry.Incoming4r?.oeNo || entry.customerPartNo || "—"
            : entry.Incoming2r?.oeNo || entry.customerPartNo || "—",
          Model: is4R
            ? entry.Incoming4r?.model || "—"
            : entry.Incoming2r?.model || "—",
          Qty: qtyPerPic,
          M: menit, // tetap total
          "M/H": mh.toFixed(2),
          "Pcs/M/H":
            typeof pcsPerMh === "string" ? pcsPerMh : pcsPerMh.toFixed(2),
        };

        if (is2R) {
          baseData["EMI Part Name"] = entry.Incoming2r?.EMIpartname || "—";
          baseData["KPP"] = entry.Incoming2r?.kpp || "-";
        } else {
          baseData["KPP"] = entry.Incoming4r?.kpp || "—";
          baseData["KPP NP"] = entry.Incoming4r?.kppNp || "—";
        }

        rows.push(baseData);
      });
    });

    // Tentukan urutan kolom
    const header2R = [
      "MR ID",
      "Packing Member",
      "Code No",
      "Date",
      "Cust.",
      "Seg.",
      "Assy No",
      "OE No.",
      "Model",
      "EMI Part Name",
      "KPP",
      "Qty",
      "M",
      "M/H",
      "Pcs/M/H",
    ];

    const header4R = [
      "MR ID",
      "Packing Member",
      "Code No",
      "Date",
      "Cust.",
      "Seg.",
      "Assy No",
      "OE No.",
      "Model",
      "KPP",
      "KPP NP",
      "Qty",
      "M",
      "M/H",
      "Pcs/M/H",
    ];

    const finalHeader = selectedType === "2R" ? header2R : header4R;
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: finalHeader });
    XLSX.utils.sheet_add_aoa(worksheet, [finalHeader], { origin: "A1" });

    // Styling Header
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ c: C, r: 0 });
      const cell = worksheet[cell_address];
      if (cell) {
        cell.s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
          fill: {
            fgColor: { rgb: "D9D9D9" }, // abu-abu
          },
        };
      }
    }

    // Styling untuk seluruh isi cell (selain header)
    for (let R = 1; R <= range.e.r; ++R) {
      // mulai dari baris ke-1 (baris ke-2 di Excel)
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = worksheet[cell_address];
        if (cell && !cell.s) {
          cell.s = {
            alignment: { horizontal: "center" },
          };
        }
      }
    }

    worksheet["!cols"] = finalHeader.map(() => ({ wch: 15 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packing Report");

    // Enable styles
    XLSX.writeFile(
      workbook,
      `PackingReport_${selectedType}_${selectedDate || "AllDates"}.xlsx`,
      { bookType: "xlsx", cellStyles: true },
    );
  };

  async function updateStatus(
    entryId: number,
    status: "APPROVED" | "REJECTED",
  ) {
    setActionLoadingId(entryId);
    try {
      const endpoint =
        status === "APPROVED"
          ? `http://10.10.10.5:3001/packing-entry/approve-grouped/${entryId}`
          : `http://10.10.10.5:3001/packing-entry/reject-grouped/${entryId}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.message || "Gagal update status");

      await fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  const statusBadge = (status: string) => {
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

  const filtered = data.filter((entry) => {
    const entryDate = new Date(entry.tanggalPacking)
      .toISOString()
      .split("T")[0];
    const matchDate = !selectedDate || entryDate === selectedDate;
    const matchType = selectedType === "ALL" || entry.type === selectedType;
    const matchPRID = (
      entry.Incoming2r?.prId ||
      entry.Incoming4r?.prId ||
      entry.packingReqNo ||
      ""
    )
      .toLowerCase()
      .includes(searchPRID.toLowerCase());

    return matchDate && matchType && matchPRID;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <FiPackage className="text-blue-600" />
        Packing Reports
      </h1>
      {/* <button
        type="button"
        onClick={fetchData}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-150
  font-medium shadow-md border text-sm
  ${loading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed animate-pulse'
            : 'bg-white hover:bg-blue-50 border-blue-300 text-blue-700'}
`}
      >
        <FiRefreshCw
          className={`text-lg transition-transform duration-300 
      ${loading ? 'animate-spin scale-110' : 'hover:rotate-90'}
    `}
        />
        <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
      </button> */}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-end gap-6 bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <FiCalendar className="text-gray-600" />
            Filter Tanggal:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <FiFileText className="text-gray-600" />
            Filter Type:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">ALL</option>
            <option value="2R">2R</option>
            <option value="4R">4R</option>
          </select>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleExportToExcel}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-md transition duration-150 flex items-center gap-2"
          >
            <FiFileText /> Export ke Excel
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 font-medium shadow-sm">
          ❌ {error}
        </div>
      )}

      {/* Loading & Table */}

      <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-xl">
        <table className="min-w-[1200px] w-full text-base text-gray-800">
          <thead className="bg-blue-100 text-sm text-gray-700 font-semibold uppercase tracking-wide sticky top-0 z-10">
            <tr>
              {[
                "No",
                "Tanggal Packing",
                "Line No",
                "Jam Mulai",
                "Jam Selesai",
                "Menit",
                "Packing Req No (PRID)",
                "Explanner No",
                "Customer Part No",
                "Qty Plan",
                "Qty Actual",
                "PIC1",
                "PIC2",
                "PIC3",
                "Balance",
                "Type",
                "Status",
                "Actions",
              ].map((title, idx) => (
                <th
                  key={idx}
                  className="px-2 py-1 text-center whitespace-nowrap relative"
                  onClick={() => {
                    if (title.includes("PRID"))
                      setShowPRIDSearch((prev) => !prev);
                  }}
                >
                  <div className="flex justify-center items-center gap-1 cursor-pointer">
                    {title}
                    {title.includes("PRID") && (
                      <span className="text-blue-500 text-xs">🔍</span>
                    )}
                  </div>
                  {/* Popover Search Box */}
                  {title.includes("PRID") && showPRIDSearch && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white shadow-md border border-gray-300 rounded-md z-20 p-2">
                      <input
                        type="text"
                        placeholder="Cari PRID..."
                        className="text-xs px-2 py-1 border border-gray-300 rounded w-40 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                        value={searchPRID}
                        onChange={(e) => setSearchPRID(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={18}
                  className="text-center py-6 italic text-gray-400"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((entry, index) => {
                const isActionDisabled =
                  actionLoadingId === entry.id || entry.status === "APPROVED";

                return (
                  <tr
                    key={entry.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                  >
                    <td className="px-2 py-1 text-center font-semibold">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {new Date(entry.tanggalPacking).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1 text-center">{entry.lineNo}</td>
                    <td className="px-2 py-1 text-center">{entry.jamMulai}</td>
                    <td className="px-2 py-1 text-center">
                      {entry.jamSelesai}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {entry.menitPacking}
                    </td>
                    <td className="px-2 py-1 text-center font-medium text-blue-800">
                      {entry.Incoming2r?.prId ||
                        entry.Incoming4r?.prId ||
                        entry.packingReqNo}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {entry.explannerNo}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {entry.customerPartNo}
                    </td>
                    <td className="px-2 py-1 text-center font-medium text-green-700">
                      {entry.qtyPlan}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {editingEntryId === entry.id ? (
                        <input
                          type="number"
                          value={editedEntry.qtyActualPacking || 0}
                          onChange={(e) =>
                            setEditedEntry({
                              ...editedEntry,
                              qtyActualPacking: Number(e.target.value),
                            })
                          }
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        />
                      ) : (
                        <span className="font-medium text-green-800">
                          {entry.qtyActualPacking}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {entry.pic1?.name || "-"}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {entry.pic2?.name || "-"}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {entry.pic3?.name || "-"}
                    </td>
                    <td className="px-2 py-1 text-center font-medium text-red-500">
                      {entry.qtyPlan - entry.qtyActualPacking}
                    </td>
                    <td className="px-2 py-1 text-center">{entry.type}</td>
                    <td className="px-2 py-1 text-center">
                      {statusBadge(entry.status)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <div className="flex justify-center space-x-2">
                        {editingEntryId === entry.id ? (
                          <>
                            <button
                              type="button"
                              onClick={saveEditedEntry}
                              className="px-3 py-1.5 rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingEntryId(null)}
                              className="px-3 py-1.5 rounded-md text-xs bg-gray-300 text-gray-800 hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(entry)}
                              className="px-3 py-1.5 rounded-md text-xs bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-1"
                            >
                              <FiEdit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(entry.id, "APPROVED")}
                              disabled={isActionDisabled}
                              className={`px-3 py-1.5 rounded-md text-xs text-white flex items-center gap-1 ${isActionDisabled ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(entry.id, "REJECTED")}
                              disabled={
                                actionLoadingId === entry.id ||
                                entry.status === "REJECTED"
                              }
                              className={`px-3 py-1.5 rounded-md text-xs text-white flex items-center gap-1 ${entry.status === "REJECTED" ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="px-3 py-1.5 rounded-md text-xs text-white bg-red-500 hover:bg-red-600 flex items-center gap-1"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="mt-8 px-4 md:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Kiri: Jumlah item per halaman */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setCurrentPage(1);
                setItemsPerPage(Number(e.target.value));
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>

          {/* Kanan: Pagination buttons */}
          <div className="flex items-center justify-center flex-wrap gap-1">
            {/* Tombol Prev */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded border text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              &lt;
            </button>

            {/* Nomor Halaman */}
            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded border text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white border-gray-300 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && page !== 2) ||
                (page === currentPage + 2 && page !== totalPages - 1)
              ) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}

            {/* Tombol Next */}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded border text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
