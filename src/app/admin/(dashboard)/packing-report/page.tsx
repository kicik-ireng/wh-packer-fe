"use client";

import { useEffect, useState } from "react";
import { Check, X, Trash } from "lucide-react";
import * as XLSX from "sheetjs-style";
import { useRouter } from "next/navigation";
import { FiPackage, FiCalendar, FiFileText, FiEdit, FiSearch } from "react-icons/fi";
import { Button, Space, Tag, Input, Select, Popconfirm, message, DatePicker, Modal } from "antd";
import ModernTable from "@/src/app/components/ModernTable";
import dayjs from "dayjs";

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
  pic1?: { id: number; name: string };
  pic2?: { id: number; name: string };
  pic3?: { id: number; name: string };
  createdAt?: string;
}

interface PackingReport {
  id: number;
  tanggalPacking: string;
  lineNo: string;
  qty2R: number;
  qty4R: number;
  keterangan: string;
  pic1?: { id: number; name: string };
  pic2?: { id: number; name: string };
  pic3?: { id: number; name: string };
  status: string;
  entries: PackingEntry[];
}

export default function PackingReportPage() {
  const [data, setData] = useState<PackingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchPRID, setSearchPRID] = useState("");
  
  const router = useRouter();
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editedEntry, setEditedEntry] = useState<Partial<PackingEntry>>({});

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStart, setExportStart] = useState<dayjs.Dayjs | null>(null);
  const [exportEnd, setExportEnd] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const res = await fetch("http://localhost:3001/auth/verify", {
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

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/packing-report", {
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

      setData(sortData(entriesWithReportInfo, selectedType));
    } catch (e: any) {
      message.error(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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

  useEffect(() => {
    setData((prev) => sortData(prev, selectedType));
  }, [selectedType]);

  const startEditing = (entry: PackingEntry) => {
    setEditingEntryId(entry.id);
    setEditedEntry(entry);
  };

  const saveEditedEntry = async () => {
    if (!editingEntryId) return;
    try {
      const res = await fetch(
        `http://localhost:3001/packing-entry/${editingEntryId}`,
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
      message.success("Entry berhasil diupdate");
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      const res = await fetch(
        `http://localhost:3001/packing-entry/${entryId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menghapus entry");
      }

      await fetchData();
      message.success("Entry berhasil dihapus");
    } catch (err: any) {
      message.error(err.message || "Gagal menghapus entry");
    }
  };

  async function updateStatus(
    entryId: number,
    status: "APPROVED" | "REJECTED",
  ) {
    setActionLoadingId(entryId);
    try {
      const endpoint =
        status === "APPROVED"
          ? `http://localhost:3001/packing-entry/approve-grouped/${entryId}`
          : `http://localhost:3001/packing-entry/reject-grouped/${entryId}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.message || "Gagal update status");

      await fetchData();
      message.success(`Status updated to ${status}`);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  const handleExportToExcel = async () => {
    const [part2r, part4r] = await Promise.all([
      fetch("http://localhost:3001/part-database-2r", {
        credentials: "include",
      }).then((res) => res.json()),
      fetch("http://localhost:3001/part-database-4r", {
        credentials: "include",
      }).then((res) => res.json()),
    ]);

    let exportData = filtered;

    if (exportStart && exportEnd) {
      exportData = filtered.filter((entry) => {
        // Gunakan dayjs untuk parse tanggal agar tidak kena isu timezone UTC shift (seperti toISOString)
        const entryDate = dayjs(entry.tanggalPacking).format("YYYY-MM-DD");
        
        // Asumsi entry.jamMulai adalah format "HH:mm"
        const entryStartDateTime = dayjs(`${entryDate} ${entry.jamMulai}`, "YYYY-MM-DD HH:mm");
        const entryEndDateTime = dayjs(`${entryDate} ${entry.jamSelesai}`, "YYYY-MM-DD HH:mm");
        
        // Ambil data jika ada singgungan waktu (overlap)
        // Atau jika waktu mulai/selesai berada di dalam rentang
        const isStartInside = (entryStartDateTime.isAfter(exportStart) || entryStartDateTime.isSame(exportStart)) && 
                              (entryStartDateTime.isBefore(exportEnd) || entryStartDateTime.isSame(exportEnd));
        
        const isEndInside = (entryEndDateTime.isAfter(exportStart) || entryEndDateTime.isSame(exportStart)) && 
                            (entryEndDateTime.isBefore(exportEnd) || entryEndDateTime.isSame(exportEnd));
                            
        const isEnveloping = (entryStartDateTime.isBefore(exportStart) || entryStartDateTime.isSame(exportStart)) && 
                             (entryEndDateTime.isAfter(exportEnd) || entryEndDateTime.isSame(exportEnd));

        return isStartInside || isEndInside || isEnveloping;
      });
    }

    if (exportData.length === 0) {
      message.warning("Tidak ada data pada rentang waktu yang dipilih.");
      return;
    }

    const rows: any[] = [];

    exportData.forEach((entry) => {
      const pics = [entry.pic1, entry.pic2, entry.pic3].filter(Boolean);
      const jumlahPIC = pics.length || 1;

      const is4R = entry.type === "4R";
      const is2R = entry.type === "2R";

      const assyNo = is4R
        ? entry.Incoming4r?.assyNo16
        : entry.Incoming2r?.assyNo16;

      function normalize(str?: string): string {
        return str?.trim().toUpperCase() ?? "";
      }
      let codeNo = "";

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
          M: menit,
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

    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ c: C, r: 0 });
      const cell = worksheet[cell_address];
      if (cell) {
        cell.s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
          fill: { fgColor: { rgb: "D9D9D9" } },
        };
      }
    }

    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = worksheet[cell_address];
        if (cell && !cell.s) {
          cell.s = { alignment: { horizontal: "center" } };
        }
      }
    }

    worksheet["!cols"] = finalHeader.map(() => ({ wch: 15 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packing Report");

    XLSX.writeFile(
      workbook,
      `PackingReport_${selectedType}_${exportStart ? exportStart.format("YYYYMMDD_HHmm") : "All"}.xlsx`,
      { bookType: "xlsx", cellStyles: true },
    );
    
    setShowExportModal(false);
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

  const columns: any = [
    { title: "Tanggal Packing", dataIndex: "tanggalPacking", key: "tanggal", render: (t: string) => new Date(t).toLocaleDateString() },
    { title: "Line No", dataIndex: "lineNo", key: "lineNo" },
    { title: "Jam Mulai", dataIndex: "jamMulai", key: "jamMulai" },
    { title: "Jam Selesai", dataIndex: "jamSelesai", key: "jamSelesai" },
    { title: "Menit", dataIndex: "menitPacking", key: "menitPacking" },
    { 
      title: "Packing Req No (PRID)", 
      key: "prid",
      render: (_: any, record: PackingEntry) => (
        <span className="font-medium text-blue-800">
          {record.Incoming2r?.prId || record.Incoming4r?.prId || record.packingReqNo}
        </span>
      )
    },
    { title: "Explanner No", dataIndex: "explannerNo", key: "explannerNo" },
    { title: "Customer Part No", dataIndex: "customerPartNo", key: "customerPartNo" },
    { 
      title: "Qty Plan", 
      dataIndex: "qtyPlan", 
      key: "qtyPlan",
      render: (q: number) => <span className="font-medium text-green-700">{q}</span>
    },
    { 
      title: "Qty Actual", 
      key: "qtyActual",
      render: (_: any, record: PackingEntry) => {
        if (editingEntryId === record.id) {
          return (
            <Input 
              type="number"
              value={editedEntry.qtyActualPacking || 0}
              onChange={(e) => setEditedEntry({...editedEntry, qtyActualPacking: Number(e.target.value)})}
              className="w-20"
            />
          );
        }
        return <span className="font-medium text-green-800">{record.qtyActualPacking}</span>;
      }
    },
    { title: "PIC1", key: "pic1", render: (_: any, record: PackingEntry) => record.pic1?.name || "-" },
    { title: "PIC2", key: "pic2", render: (_: any, record: PackingEntry) => record.pic2?.name || "-" },
    { title: "PIC3", key: "pic3", render: (_: any, record: PackingEntry) => record.pic3?.name || "-" },
    { 
      title: "Balance", 
      key: "balance",
      render: (_: any, record: PackingEntry) => (
        <span className="font-medium text-red-500">{record.qtyPlan - record.qtyActualPacking}</span>
      )
    },
    { title: "Type", dataIndex: "type", key: "type" },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (status: string) => {
        if (status === "APPROVED") return <Tag color="success">Approved</Tag>;
        if (status === "REJECTED") return <Tag color="error">Rejected</Tag>;
        return <Tag color="warning">Pending</Tag>;
      }
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_: any, record: PackingEntry) => {
        const isActionDisabled = actionLoadingId === record.id || record.status === "APPROVED";
        if (editingEntryId === record.id) {
          return (
            <Space>
              <Button type="primary" size="small" onClick={saveEditedEntry}>Save</Button>
              <Button size="small" onClick={() => setEditingEntryId(null)}>Cancel</Button>
            </Space>
          );
        }
        return (
          <Space>
            <Button size="small" type="dashed" icon={<FiEdit />} onClick={() => startEditing(record)} />
            <Button size="small" type="primary" icon={<Check size={14} />} disabled={isActionDisabled} onClick={() => updateStatus(record.id, "APPROVED")} />
            <Button size="small" danger type="primary" icon={<X size={14} />} disabled={actionLoadingId === record.id || record.status === "REJECTED"} onClick={() => updateStatus(record.id, "REJECTED")} />
            <Popconfirm title="Delete entry?" onConfirm={() => handleDeleteEntry(record.id)}>
              <Button size="small" danger type="text" icon={<Trash size={14} />} />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="w-full">
      <ModernTable
        title="Packing Reports"
        icon={<FiPackage size={24} className="text-blue-600" />}
        filterControls={
          <Space wrap>
            <DatePicker 
              placeholder="Filter Tanggal" 
              onChange={(date, dateString) => setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)} 
              allowClear 
            />
            <Select value={selectedType} onChange={setSelectedType} style={{ width: 120 }}>
              <Select.Option value="ALL">ALL</Select.Option>
              <Select.Option value="2R">2R</Select.Option>
              <Select.Option value="4R">4R</Select.Option>
            </Select>
            <Input 
              placeholder="Cari PRID..." 
              prefix={<FiSearch />} 
              value={searchPRID} 
              onChange={(e) => setSearchPRID(e.target.value)} 
              allowClear 
            />
          </Space>
        }
        extraActions={
          <Button type="primary" icon={<FiFileText />} onClick={() => setShowExportModal(true)}>
            Export ke Excel
          </Button>
        }
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        scroll={{ x: 2000 }}
      />

      <Modal
        title="Export Packing Report"
        open={showExportModal}
        onCancel={() => setShowExportModal(false)}
        onOk={handleExportToExcel}
        okText="Export"
        cancelText="Batal"
      >
        <div className="flex flex-col gap-4 mt-4">
          <p className="text-sm text-gray-600 m-0">
            Pilih rentang waktu untuk mengekspor data laporan packing. Jika tidak memilih waktu, semua data yang tampil di tabel saat ini akan diekspor.
          </p>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Rentang Tanggal & Jam:
            </label>
            <DatePicker.RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm" 
              className="w-full"
              onChange={(dates) => {
                setExportStart(dates?.[0] || null);
                setExportEnd(dates?.[1] || null);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
