"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Select from "react-select";
import { FaTrashAlt } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import Link from "next/link";
import {
  HiCalendar,
  HiClipboardCheck,
  HiClipboardList,
  HiOutlineAdjustments,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineSave,
  HiOutlineViewList,
  HiOutlineUsers,
} from "react-icons/hi";
import toast, { Toaster } from "react-hot-toast";

type PackingEntry = {
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
  type: "2R" | "4R" | "";
};

type FormState = {
  tanggalPacking: string;
  lineNo: string;
  type: "2R" | "4R" | "";
  entries: PackingEntry[];
  pic1: string;
  pic2: string;
  pic3: string;
  keterangan: string;
  qty4R: number;
  qty2R: number;
};

type ManpowerOption = { value: string; label: string };
type PackingReqNoOption = { value: string; label: string };

export default function PackingReportPage() {
  const [allReportsCache, setAllReportsCache] = useState<any[]>([]);
  const [todayEntries, setTodayEntries] = useState<any[]>([]);
  const [manpowerList, setManpowerList] = useState<ManpowerOption[]>([]);
  const [loadingManpower, setLoadingManpower] = useState(false);
  const [packingreqnoList, setPackingReqNoList] = useState<
    PackingReqNoOption[]
  >([]);
  const [loadingPackingReqNo, setLoadingPackingReqNo] = useState(false);
  const [incomingDataList, setIncomingDataList] = useState<any[]>([]);

  const [form, setForm] = useState<FormState>({
    tanggalPacking: "",
    lineNo: "",
    type: "",
    entries: [
      {
        no: 1,
        jamMulai: "",
        jamSelesai: "",
        menitPacking: 0,
        packingReqNo: "",
        explannerNo: "",
        customerPartNo: "",
        qtyPlan: 0,
        qtyActualPacking: 0,
        balancePlanVsActual: 0,
        type: "",
      },
    ],
    pic1: "",
    pic2: "",
    pic3: "",
    keterangan: "",
    qty4R: 0,
    qty2R: 0,
  });

  const fetchReportsData = useCallback(async () => {
    try {
      const res = await fetch("http://10.10.10.5:5055/packing-report", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal fetch data");

      const allReports = await res.json();
      setAllReportsCache(allReports);

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayEntriesList = allReports
        .filter((report: any) => report.tanggalPacking?.startsWith(todayStr))
        .flatMap((report: any) =>
          report.entries.map((entry: any) => ({
            ...entry,
            tanggalPacking: report.tanggalPacking,
            lineNo: report.lineNo,
            type: entry.type,
            pic1: report.pic1,
            pic2: report.pic2,
            pic3: report.pic3,
            createdAt:
              entry.Incoming2r?.createdAt || entry.Incoming4r?.createdAt || "",
          })),
        );

      todayEntriesList.sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0));
      setTodayEntries(todayEntriesList);
    } catch (err) {
      console.error("Gagal ambil data report:", err);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    setForm((f) => ({ ...f, tanggalPacking: localDate }));
  }, []);

  useEffect(() => {
    fetchReportsData();

    const fetchManpower = async () => {
      setLoadingManpower(true);
      try {
        const res = await fetch("http://10.10.10.5:5055/manpower");
        const data = await res.json();
        setManpowerList(
          data.map((m: any) => ({ value: m.id.toString(), label: m.name })),
        );
      } catch (error) {
        console.error("Fetch manpower error:", error);
      } finally {
        setLoadingManpower(false);
      }
    };
    fetchManpower();
  }, [fetchReportsData]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPackingReqNo() {
      if (form.type !== "2R" && form.type !== "4R") {
        setPackingReqNoList([]);
        setIncomingDataList([]);
        return;
      }

      setLoadingPackingReqNo(true);
      try {
        const url =
          form.type === "2R"
            ? "http://10.10.10.5:5055/incoming2r"
            : "http://10.10.10.5:5055/incoming4r";
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        // 1. Filter data yang belum APPROVED
        // 2. Reverse() agar data terbaru ada di paling atas
        // 3. Slice(0, 150) batasi maksimal 150 opsi saja agar dropdown tidak berat/ngelag
        const filteredData = data
          .filter((item: any) => item.status !== "APPROVED")
          .reverse()
          .slice(0, 150);

        const options = filteredData.map((item: any) => ({
          value: item.id.toString(),
          label: item.prId,
        }));

        setPackingReqNoList(options);
        setIncomingDataList(filteredData);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Fetch Packing Req No error:", error);
          setPackingReqNoList([]);
          setIncomingDataList([]);
          toast.error("Gagal memuat data Req No");
        }
      } finally {
        setLoadingPackingReqNo(false);
      }
    }

    fetchPackingReqNo();
    return () => controller.abort();
  }, [form.type]);

  const recalcQtyByType = (entries: PackingEntry[]) => {
    let sum2R = 0;
    let sum4R = 0;
    for (const e of entries) {
      const actual = e.qtyActualPacking;
      if (e.type === "2R") sum2R += actual;
      else if (e.type === "4R") sum4R += actual;
    }
    return { sum2R, sum4R };
  };

  const updateEntry = (
    index: number,
    field: keyof PackingEntry,
    value: string,
  ) => {
    const newEntries = [...form.entries];
    const entry = { ...newEntries[index] };

    if (field === "menitPacking" || field === "balancePlanVsActual") {
      (entry as any)[field] = Number(value);
    } else {
      (entry as any)[field] = value;
    }

    if (field === "jamMulai" || field === "jamSelesai") {
      if (!entry.jamMulai || !entry.jamSelesai) {
        entry.menitPacking = 0;
        newEntries[index] = entry;
        setForm({ ...form, entries: newEntries });
        return;
      }

      const [hMulai, mMulai] = entry.jamMulai.split(":").map(Number);
      const [hSelesai, mSelesai] = entry.jamSelesai.split(":").map(Number);
      const diff = hSelesai * 60 + mSelesai - (hMulai * 60 + mMulai);

      if (diff > 0) {
        entry.menitPacking = diff;
      } else {
        toast.error(
          `❌ ⚠️ Menit tidak boleh 0 !!!\n🕒 Cek kembali jam mulai dan jam selesai.`,
        );
        entry.menitPacking = 0;
        entry.jamMulai = "";
        entry.jamSelesai = "";
        newEntries[index] = entry;
        setForm({ ...form, entries: newEntries });
        return;
      }
    }

    const plan = entry.qtyPlan;
    const actual = entry.qtyActualPacking;
    entry.balancePlanVsActual = plan - actual;

    if (actual > plan) {
      toast.error(`⚠️ Qty Actual (${actual}) Melebihi Qty Plan (${plan}) !!!`);
      entry.qtyActualPacking = 0;
      entry.balancePlanVsActual = plan;
    }
    newEntries[index] = entry;

    const { sum2R, sum4R } = recalcQtyByType(newEntries);
    setForm({ ...form, entries: newEntries, qty2R: sum2R, qty4R: sum4R });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "qty2R" || name === "qty4R" ? Number(value) : value,
    }));
  };

  const handlePicChange = (
    field: keyof FormState,
    selected: ManpowerOption | null,
  ) => {
    setForm((prev) => ({ ...prev, [field]: selected ? selected.value : "" }));
  };

  const addEntry = () => {
    setForm((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          no: prev.entries.length + 1,
          jamMulai: "",
          jamSelesai: "",
          menitPacking: 0,
          packingReqNo: "",
          explannerNo: "",
          customerPartNo: "",
          qtyPlan: 0,
          qtyActualPacking: 0,
          balancePlanVsActual: 0,
          type: form.type,
        },
      ],
    }));
  };

  const removeEntry = (index: number) => {
    if (form.entries.length > 1) {
      const newEntries = form.entries
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, no: i + 1 }));
      const { sum2R, sum4R } = recalcQtyByType(newEntries);
      setForm({ ...form, entries: newEntries, qty2R: sum2R, qty4R: sum4R });
    }
  };

  const handlePackingReqNoChange = async (
    index: number,
    selected: PackingReqNoOption | null,
  ) => {
    if (!selected) return;

    const selectedData = incomingDataList.find(
      (d) => d.id.toString() === selected.value,
    );
    if (!selectedData) return;

    try {
      const reports = allReportsCache;

      const matchingEntry = reports
        .flatMap((report: any) =>
          report.entries.map((entry: any) => ({
            packingReqNo: entry.packingReqNo,
            tanggal: report.tanggalPacking,
          })),
        )
        .find(
          (e: { packingReqNo: string; tanggal: string }) =>
            e.packingReqNo === selected.value,
        );

      const prId = selectedData.prId;
      const matchingEntries = reports.flatMap((r: any) =>
        r.entries.filter(
          (e: any) => e.packingReqNo === prId && e.type === form.type,
        ),
      );

      const totalQtySebelumnya = matchingEntries.reduce(
        (sum: number, e: any) => sum + (e.qtyActualPacking || 0),
        0,
      );

      if (totalQtySebelumnya >= selectedData.qtyPlan) {
        alert("❗ PR ini sudah mencapai batas Plan. Tidak bisa input lagi.");
        return;
      } else {
        toast.success(
          `Info: Qty sebelumnya dari PR ${prId} sudah mencapai ${selectedData.done} dari Plan ${selectedData.qtyPlan}`,
          { icon: "ℹ️" },
        );
      }

      if (matchingEntry) {
        const formattedDate = new Date(
          matchingEntry.tanggal,
        ).toLocaleDateString("id-ID");
        const confirmed = window.confirm(
          `PR ini sudah pernah diinput tanggal ${formattedDate}. Lanjutkan?`,
        );
        if (!confirmed) return;
      }

      const newEntries = [...form.entries];
      newEntries[index] = {
        ...newEntries[index],
        packingReqNo: selected.value,
        explannerNo: selectedData.assyNo16 || "",
        customerPartNo: selectedData.oeNo || "",
        qtyPlan: Number(selectedData.qtyPlan) || 0,
        balancePlanVsActual:
          (selectedData.qtyPlan ?? 0) -
          (newEntries[index].qtyActualPacking ?? 0),
        type: form.type,
      };

      const { sum2R, sum4R } = recalcQtyByType(newEntries);
      setForm({ ...form, entries: newEntries, qty2R: sum2R, qty4R: sum4R });
    } catch (error) {
      console.error("Error checking existing PR entry:", error);
    }
  };

  const parseOrNull = (val: string | null | undefined) => {
    const n = parseInt(val || "");
    return isNaN(n) ? null : n;
  };

  const handleSubmit = async () => {
    if (!form.tanggalPacking || !form.lineNo || !form.type || !form.pic1) {
      toast.error("Tanggal, Line No, Tipe, dan PIC 1 wajib diisi!");
      return;
    }

    const invalidMenit = form.entries.filter((e) => e.menitPacking === 0);
    if (invalidMenit.length > 0) {
      toast.error(`⚠️ Isi Jam Mulai dan Jam Selesai dengan benar!`);
      return;
    }

    const validEntryExists = form.entries.some((e) => e.qtyActualPacking > 0);
    if (!validEntryExists) {
      toast.error("⚠️ Isi Qty Actual dengan sesuai!");
      return;
    }

    try {
      const payload = {
        tanggalPacking: form.tanggalPacking,
        lineNo: form.lineNo,
        type: form.type,
        keterangan: form.keterangan,
        qty2R: form.qty2R,
        qty4R: form.qty4R,
        pic1Id: parseOrNull(form.pic1),
        pic2Id: parseOrNull(form.pic2),
        pic3Id: parseOrNull(form.pic3),
        entries: form.entries.map((e) => ({
          no: e.no,
          jamMulai: e.jamMulai,
          jamSelesai: e.jamSelesai,
          menitPacking: e.menitPacking,
          packingReqNo: e.packingReqNo,
          explannerNo: e.explannerNo,
          customerPartNo: e.customerPartNo,
          qtyPlan: e.qtyPlan,
          qtyActualPacking: e.qtyActualPacking,
          balancePlanVsActual: e.balancePlanVsActual,
          type: e.type,
          Incoming2rId:
            form.type === "2R" ? parseInt(e.packingReqNo) : undefined,
          Incoming4rId:
            form.type === "4R" ? parseInt(e.packingReqNo) : undefined,
        })),
      };

      const res = await fetch("http://10.10.10.5:5055/packing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal simpan ke API");

      toast.success("Data berhasil disimpan");
      await fetchReportsData();

      setForm({
        tanggalPacking: new Date().toISOString().slice(0, 10),
        lineNo: "",
        type: "",
        entries: [
          {
            no: 1,
            jamMulai: "",
            jamSelesai: "",
            menitPacking: 0,
            packingReqNo: "",
            explannerNo: "",
            customerPartNo: "",
            qtyPlan: 0,
            qtyActualPacking: 0,
            balancePlanVsActual: 0,
            type: "",
          },
        ],
        pic1: "",
        pic2: "",
        pic3: "",
        keterangan: "",
        qty4R: 0,
        qty2R: 0,
      });
    } catch (error: any) {
      console.error("Gagal submit:", error);
      toast.error(`Gagal menyimpan data: ${error.message}`);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { totalPages, paginatedEntries } = useMemo(() => {
    const total = Math.ceil(todayEntries.length / itemsPerPage);
    const paginated = todayEntries.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
    return { totalPages: total, paginatedEntries: paginated };
  }, [todayEntries, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-1 px-1">
      <div className="w-full space-y-2">
        <Toaster position="top-center" />

        {/* --- HEADER TITLE --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <HiClipboardList className="text-blue-600 dark:text-blue-400 text-3xl md:text-4xl" />
            Packing Daily Report
          </h1>
          <Link
            href="/manpower/production-problem"
            className="inline-flex items-center gap-2 text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-none hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-100 dark:border-red-800"
          >
            <HiOutlineExclamationCircle className="text-xl" />
            Masalah Produksi
          </Link>
        </div>

        {/* --- TOP SETTINGS: CONFIG & MANPOWER --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {/* Base Configuration Card */}
          <section className="bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <HiOutlineAdjustments className="text-blue-500 text-xl" />{" "}
              Konfigurasi Produksi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="tanggalPacking"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  <HiCalendar className="text-lg text-blue-500" /> Tanggal
                </label>
                <input
                  type="date"
                  id="tanggalPacking"
                  name="tanggalPacking"
                  value={form.tanggalPacking}
                  onChange={handleChange}
                  className="w-full rounded-none border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="lineNo"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  <HiOutlineViewList className="text-lg text-blue-500" /> Line
                  No
                </label>
                <select
                  id="lineNo"
                  name="lineNo"
                  value={form.lineNo}
                  onChange={handleChange}
                  className="w-full rounded-none border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                >
                  <option value="">Pilih Line</option>
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Line {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="type"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  <HiClipboardCheck className="text-lg text-blue-500" /> Tipe
                  Packing
                </label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-none border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                >
                  <option value="">Pilih Tipe</option>
                  <option value="2R">2R</option>
                  <option value="4R">4R</option>
                </select>
              </div>
            </div>
          </section>

          {/* Manpower / PIC Card */}
          <section className="bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <HiOutlineUsers className="text-blue-500 text-xl" /> Person In
              Charge (PIC)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  PIC 1 *
                </label>
                <Select
                  options={manpowerList}
                  isLoading={loadingManpower}
                  onChange={(val) => handlePicChange("pic1", val)}
                  value={
                    manpowerList.find((m) => m.value === form.pic1) || null
                  }
                  placeholder="Pilih PIC 1"
                  isClearable
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                    }),
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  PIC 2
                </label>
                <Select
                  options={manpowerList.filter((m) => m.value !== form.pic1)}
                  isLoading={loadingManpower}
                  onChange={(val) => handlePicChange("pic2", val)}
                  value={
                    manpowerList.find((m) => m.value === form.pic2) || null
                  }
                  placeholder="Pilih PIC 2"
                  isClearable
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                    }),
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  PIC 3
                </label>
                <Select
                  options={manpowerList.filter(
                    (m) => m.value !== form.pic1 && m.value !== form.pic2,
                  )}
                  isLoading={loadingManpower}
                  onChange={(val) => handlePicChange("pic3", val)}
                  value={
                    manpowerList.find((m) => m.value === form.pic3) || null
                  }
                  placeholder="Pilih PIC 3"
                  isClearable
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                    }),
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* --- DATA ENTRY TABLE CARD --- */}
        <section className="bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <HiClipboardList className="text-blue-500 text-xl" /> Form Input
              Data Packing
            </h2>
            <button
              onClick={addEntry}
              className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-none transition-colors font-medium border border-blue-200 dark:border-blue-800"
            >
              <AiOutlinePlus /> Tambah Baris
            </button>
          </div>

          <div className="w-full space-y-4 pb-4">
            {form.entries.map((entry, i) => (
              <div
                key={entry.no}
                className="border border-gray-200 dark:border-gray-700 rounded-none bg-white dark:bg-gray-800/40 p-3 md:p-4 relative shadow-sm transition-all hover:border-blue-300"
              >
                {/* Header Card */}
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 mb-3">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 text-sm md:text-base">
                    Entry #{entry.no}
                  </h3>
                  <button
                    onClick={() => removeEntry(i)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded-none transition-colors"
                  >
                    <FaTrashAlt /> <span className="hidden sm:inline">Hapus Baris</span>
                  </button>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 items-end">

                  {/* Waktu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mulai</label>
                    <input
                      type="time"
                      value={entry.jamMulai}
                      onChange={(e) => updateEntry(i, "jamMulai", e.target.value)}
                      className="w-full rounded-none px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Selesai</label>
                    <input
                      type="time"
                      value={entry.jamSelesai}
                      onChange={(e) => updateEntry(i, "jamSelesai", e.target.value)}
                      className="w-full rounded-none px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Ref Data */}
                  <div className="space-y-1.5 sm:col-span-2 md:col-span-2 lg:col-span-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Packing Req No</label>
                    <Select
                      options={packingreqnoList}
                      onChange={(selected) => handlePackingReqNoChange(i, selected)}
                      isLoading={loadingPackingReqNo}
                      isClearable
                      placeholder="Pilih Req"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "38px",
                          borderRadius: "0.5rem",
                          borderColor: "#d1d5db",
                        }),
                      }}
                      className="text-left w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Explanner</label>
                    <div className="w-full rounded-none px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 truncate border border-transparent" title={entry.explannerNo}>
                      {entry.explannerNo || "-"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Part No</label>
                    <div className="w-full rounded-none px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 truncate border border-transparent" title={entry.customerPartNo}>
                      {entry.customerPartNo || "-"}
                    </div>
                  </div>

                  <div className="col-span-full border-t border-gray-100 dark:border-gray-700 my-2"></div>

                  {/* Calculation / Output */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Menit</label>
                    <div className="w-full rounded-none px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/50 text-center font-bold text-gray-600 dark:text-gray-300 border border-transparent">
                      {entry.menitPacking} m
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qty Plan</label>
                    <div className="w-full rounded-none px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/50 text-center font-bold text-gray-600 dark:text-gray-300 border border-transparent">
                      {entry.qtyPlan}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1">
                      Qty Actual <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={entry.qtyActualPacking || ""}
                      onChange={(e) => updateEntry(i, "qtyActualPacking", e.target.value)}
                      className="w-full rounded-none px-3 py-2 text-sm border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-center focus:border-blue-500 outline-none font-bold text-blue-700 dark:text-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Balance</label>
                    <div className={`w-full rounded-none px-3 py-2 text-sm text-center font-bold border ${entry.balancePlanVsActual > 0 ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800" : "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:border-green-800"}`}>
                      {entry.balancePlanVsActual}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- BOTTOM SECTION: KETERANGAN & SUBMIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <section className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <label
              htmlFor="keterangan"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"
            >
              <HiOutlineDocumentText className="text-lg text-blue-500" />{" "}
              Keterangan Tambahan
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              rows={3}
              value={form.keterangan}
              onChange={handleChange}
              placeholder="Catatan kendala mesin, delay material, dll..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
            />
          </section>

          <section className="bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-between space-y-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Total Output
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-none p-4 text-center border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                    Total 2R
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {form.entries.reduce(
                      (sum, e) =>
                        sum +
                        (e.type === "2R" ? Number(e.qtyActualPacking) || 0 : 0),
                      0,
                    )}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-none p-4 text-center border border-purple-100 dark:border-purple-800/30">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                    Total 4R
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {form.entries.reduce(
                      (sum, e) =>
                        sum +
                        (e.type === "4R" ? Number(e.qtyActualPacking) || 0 : 0),
                      0,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-none font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all"
            >
              <HiOutlineSave className="text-xl" />
              Simpan Laporan
            </button>
          </section>
        </div>

        {/* --- REPORT HARI INI --- */}
        <section className="bg-white dark:bg-gray-900 rounded-none shadow-sm border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              📋 Laporan Masuk Hari Ini{" "}
              <span className="text-sm font-normal text-gray-500">
                ({form.tanggalPacking})
              </span>
            </h2>
          </div>

          <div className="w-full border border-gray-200 dark:border-gray-700 rounded-none overflow-x-auto">
            <table className="w-full text-sm text-gray-700 dark:text-gray-200 min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-left border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {[
                    "No",
                    "Line",
                    "Menit",
                    "PIC 1",
                    "PIC 2",
                    "Req No",
                    "Plan",
                    "Actual",
                    "Balance",
                    "Tipe",
                  ].map((head, i) => (
                    <th key={i} className="px-4 py-3 font-semibold text-center">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {todayEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      Belum ada laporan yang disubmit hari ini.
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry: any, idx: number) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {entry.lineNo}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.menitPacking}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.pic1?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.pic2?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-blue-700 dark:text-blue-400">
                        {entry.Incoming2r?.prId ||
                          entry.Incoming4r?.prId ||
                          entry.packingReqNo}
                      </td>
                      <td className="px-4 py-3 text-center">{entry.qtyPlan}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600 dark:text-green-400">
                        {entry.qtyActualPacking}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-red-500 dark:text-red-400">
                        {entry.qtyPlan - entry.qtyActualPacking}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-semibold">
                          {entry.type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 text-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Prev
              </button>
              <span className="text-gray-500 dark:text-gray-400">
                Halaman{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentPage}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalPages}
                </span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
