"use client";

import React, { useEffect, useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";
import {
  QrCode,
  ScanLine,
  Save,
  Calendar,
  PackageSearch,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PartItem {
  id: number;
  customer: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  emiPartName?: string;
  kpp: string;
  kppNp?: string;
}

export default function DandoriPage() {
  const [type, setType] = useState<"2r" | "4r">("2r");
  const [partList, setPartList] = useState<PartItem[]>([]);
  const [selectedPrId, setSelectedPrId] = useState("");
  const [selectedPart, setSelectedPart] = useState<PartItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [qtyPlan, setQtyPlan] = useState<number | "">("");
  const [scanMode, setScanMode] = useState(false);
  const [incomingList, setIncomingList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [trolleyQty, setTrolleyQty] = useState<number | "">(""); // input qty per troli
  const [trolleyList, setTrolleyList] = useState<number[]>([]); // daftar qty per troli
  const [incomingType, setIncomingType] = useState<"normal" | "other">(
    "normal",
  );

  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return now.toISOString().slice(0, 10);
  });

  const formatDateToDDMMYYYY = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const yearNow = new Date().getFullYear().toString().slice(-2);
    setSelectedPrId(`PCS${yearNow}`);
  }, []);

  useEffect(() => {
    const url =
      type === "2r"
        ? "http://10.10.10.5:5055/incoming2r"
        : "http://10.10.10.5:5055/incoming4r";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            // Pastikan format date sama: DD/MM/YYYY
            const [da, ma, ya] = a.date.split("/");
            const [db, mb, yb] = b.date.split("/");
            const dateA = new Date(`${ya}-${ma}-${da}`);
            const dateB = new Date(`${yb}-${mb}-${db}`);
            return dateB.getTime() - dateA.getTime();
          });
          setIncomingList(sorted);
          setCurrentPage(1);
        } else {
          setIncomingList([]);
        }
      })
      .catch(() => setIncomingList([]));
  }, [type]);
  const totalPages = Math.ceil(incomingList.length / itemsPerPage);
  const paginatedData = incomingList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    const url =
      type === "2r"
        ? "http://10.10.10.5:5055/part-database-2r"
        : "http://10.10.10.5:5055/part-database-4r";

    fetch(url)
      .then((res) => res.json())
      .then((data) => setPartList(Array.isArray(data) ? data : []))
      .catch(() => setPartList([]));
  }, [type]);

  const filteredPart = partList.filter(
    (p) =>
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assyNo16.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isPrIdValid = (prId: string) => prId.length === 12;

  // const handleSubmit = async () => {
  //   if (!selectedPrId || !selectedPart) {
  //     toast.error('❌ Lengkapi semua data terlebih dahulu.');
  //     return;
  //   }

  //   const qtyPlanNum = Number(qtyPlan);

  //   const payload = type === '2r' ? {
  //     prId: selectedPrId,
  //     date: formatDateToDDMMYYYY(date),
  //     cust: selectedPart.customer,
  //     segment: selectedPart.segment,
  //     assyNo16: selectedPart.assyNo16,
  //     assyNo10: selectedPart.assyNo10,
  //     oeNo: selectedPart.oeNo,
  //     model: selectedPart.model,
  //     EMIpartname: selectedPart.emiPartName ?? '',
  //     kpp: selectedPart.kpp,
  //     qtyPlan: Number.isInteger(qtyPlanNum) && qtyPlanNum > 0 ? qtyPlanNum : 0,
  //   } : {
  //     prId: selectedPrId,
  //     date: formatDateToDDMMYYYY(date),
  //     cust: selectedPart.customer,
  //     seg: selectedPart.segment,
  //     assyNo16: selectedPart.assyNo16,
  //     assyNo10: selectedPart.assyNo10,
  //     oeNo: selectedPart.oeNo,
  //     model: selectedPart.model,
  //     kpp: selectedPart.kpp,
  //     kppNp: selectedPart.kppNp ?? '',
  //     qtyPlan: Number.isInteger(qtyPlanNum) && qtyPlanNum > 0 ? qtyPlanNum : 0,
  //   };

  //   const url = type === '2r'
  //     ? 'http://10.10.10.5:5055/incoming2r/manual'
  //     : 'http://10.10.10.5:5055/incoming4r/manual';

  //   await toast.promise(
  //     fetch(url, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     }),
  //     {
  //       loading: (
  //         <div className="flex items-center gap-2">
  //           <Loader2 className="animate-spin w-4 h-4 text-blue-600" />
  //           <span>Menyimpan data...</span>
  //         </div>
  //       ),
  //       success: async (res) => {
  //         if (!res.ok) {
  //           const err = await res.json();
  //           throw new Error(err.message || 'Gagal menyimpan data.');
  //         }

  //         setSelectedPrId('');
  //         setSelectedPart(null);
  //         setQtyPlan('');
  //         setSearchTerm('');
  //         return (
  //           <div className="flex items-center gap-2 text-green-600">
  //             {/* <CheckCircle2 className="w-5 h-5" /> */}
  //             <span>Data berhasil disimpan!</span>
  //           </div>
  //         );
  //       },
  //       error: (err) => (
  //         <div className="flex items-center gap-2 text-red-600">
  //           {/* <XCircle className="w-5 h-5" /> */}
  //           <span>{err?.message || 'Gagal menyimpan data.'}</span>
  //         </div>
  //       ),
  //     }
  //   );
  // };

  const handleSubmit = async () => {
    if (!selectedPrId || !selectedPart) {
      toast.error("❌ Lengkapi semua data terlebih dahulu.");
      return;
    }
    //     if (!isPrIdValid(selectedPrId)) {
    //   toast.error('❌ PR ID harus 10 karakter!');
    //   return;
    // }
    if (incomingType === "normal" && !isPrIdValid(selectedPrId)) {
      toast.error("❌ PR ID (Normal) harus 12 karakter!");
      return;
    }

    if (trolleyList.length === 0) {
      toast.error("❌ Tambahkan qty per troli terlebih dahulu.");
      return;
    }

    const totalQty = trolleyList.reduce((a, b) => a + b, 0);

    const payload =
      type === "2r"
        ? {
          prId: selectedPrId,
          date: formatDateToDDMMYYYY(date),
          cust: selectedPart.customer,
          segment: selectedPart.segment,
          assyNo16: selectedPart.assyNo16,
          assyNo10: selectedPart.assyNo10,
          oeNo: selectedPart.oeNo,
          model: selectedPart.model,
          EMIpartname: selectedPart.emiPartName ?? "",
          kpp: selectedPart.kpp,
          qtyPlan: totalQty,
        }
        : {
          prId: selectedPrId,
          date: formatDateToDDMMYYYY(date),
          cust: selectedPart.customer,
          seg: selectedPart.segment,
          assyNo16: selectedPart.assyNo16,
          assyNo10: selectedPart.assyNo10,
          oeNo: selectedPart.oeNo,
          model: selectedPart.model,
          kpp: selectedPart.kpp,
          kppNp: selectedPart.kppNp ?? "",
          qtyPlan: totalQty,
        };

    const url =
      type === "2r"
        ? "http://10.10.10.5:5055/incoming2r/manual"
        : "http://10.10.10.5:5055/incoming4r/manual";

    await toast.promise(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      {
        loading: (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4 text-blue-600" />
            <span>Menyimpan data...</span>
          </div>
        ),
        success: async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Gagal menyimpan data.");
          }

          // Reset semua setelah berhasil
          setSelectedPrId("");
          setSelectedPart(null);
          setTrolleyList([]);
          setTrolleyQty("");
          setSearchTerm("");

          return (
            <div className="flex items-center gap-2 text-green-600">
              <span>Data berhasil disimpan!</span>
            </div>
          );
        },
        error: (err) => (
          <div className="flex items-center gap-2 text-red-600">
            <span>{err?.message || "Gagal menyimpan data."}</span>
          </div>
        ),
      },
    );
  };

  const TableRow = ({ label, value }: { label: string; value: string }) => (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 font-semibold text-slate-600 w-40">{label}</td>
      <td className="px-4 py-3">
        {value || <span className="text-slate-400 italic">-</span>}
      </td>
    </tr>
  );

  return (
    <section className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 min-h-screen text-black rounded-none p-1 shadow-2xl space-y-2">
      {/* HEADER */}
      <div className="text-4xl font-extrabold flex items-center gap-2 tracking-tight drop-shadow-lg">
        <ScanLine className="w-8 h-8" />
        <span className="uppercase">Incoming Entry</span>
      </div>

      {/* FORM & PART LIST */}
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-none border border-slate-300 min-h-[520px] bg-gradient-to-r from-slate-50 to-white shadow-2xl overflow-hidden p-2"
      >
        {/* FORM PANEL */}
        <ResizablePanel defaultSize={40} className="min-w-[320px] bg-white">
          <div className="p-3 space-y-6 text-slate-800">
            {/* TIPE SELECT */}
            <div className="relative w-full">
              <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-semibold text-blue-600 transform translate-y-[-50%] z-10">
                Tipe Incoming
              </label>
              <Select
                value={type}
                onValueChange={(val: "2r" | "4r") => setType(val)}
              >
                <SelectTrigger className="w-full h-11 rounded-none border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 px-4 text-sm text-slate-800">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent className="rounded-none bg-white border border-slate-200 shadow-xl text-sm z-50 text-black">
                  <SelectItem
                    value="2r"
                    className="px-4 py-2 text-black hover:bg-blue-50 aria-selected:bg-blue-100 cursor-pointer font-medium"
                  >
                    Incoming 2R
                  </SelectItem>
                  <SelectItem
                    value="4r"
                    className="px-4 py-2 text-black hover:bg-blue-50 aria-selected:bg-blue-100 cursor-pointer font-medium"
                  >
                    Incoming 4R
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PR ID */}
            {/* <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">PR ID</label>
              <div className="flex gap-2">
                <input
                  value={selectedPrId}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase();
                    const yearNow = new Date().getFullYear().toString().slice(-2);

                    // pastikan selalu diawali dengan PCS + tahun sekarang
                    if (!val.startsWith(`PCS${yearNow}`)) {
                      val = `PCS${yearNow}` + val.replace(/^PCS/i, "").replace(/^(\d{2})/, "");
                    }

                    setSelectedPrId(val);
                  }}
                  placeholder="Scan atau masukkan PR ID"
                  className="flex-1 rounded-none border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
                />


                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300 text-blue-600 hover:bg-blue-100"
                  onClick={() => setScanMode(!scanMode)}
                >
                  <QrCode className="w-5 h-5" />
                </Button>
              </div>
            </div> */}

            {/* PR ID & Jenis Incoming */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Jenis Incoming
              </label>
              <Select
                value={incomingType}
                onValueChange={(val: "normal" | "other") =>
                  setIncomingType(val)
                }
              >
                <SelectTrigger className="w-full h-11 rounded-none border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 px-4 text-sm text-slate-800">
                  <SelectValue placeholder="Pilih Jenis Incoming" />
                </SelectTrigger>
                <SelectContent className="rounded-none bg-white border border-slate-200 shadow-xl text-sm z-50 text-black">
                  <SelectItem
                    value="normal"
                    className="px-4 py-2 text-black hover:bg-blue-50 cursor-pointer font-medium"
                  >
                    Normal (PCS)
                  </SelectItem>
                  <SelectItem
                    value="other"
                    className="px-4 py-2 text-black hover:bg-blue-50 cursor-pointer font-medium"
                  >
                    Other Incoming
                  </SelectItem>
                </SelectContent>
              </Select>

              <label className="text-sm font-semibold text-slate-700 mt-2">
                PR ID
              </label>
              <div className="flex gap-2">
                <input
                  value={selectedPrId}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase();
                    if (incomingType === "normal") {
                      const yearNow = new Date()
                        .getFullYear()
                        .toString()
                        .slice(-2);
                      if (!val.startsWith(`PCS${yearNow}`)) {
                        val =
                          `PCS${yearNow}` +
                          val.replace(/^PCS/i, "").replace(/^(\d{2})/, "");
                      }
                    }
                    setSelectedPrId(val);
                  }}
                  placeholder={
                    incomingType === "normal"
                      ? "Scan atau masukkan PR ID (PCS...)"
                      : "Masukkan PR ID Manual (contoh: 1/DN)"
                  }
                  className="flex-1 rounded-none border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
                />

                {incomingType === "normal" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-300 text-blue-600 hover:bg-blue-100"
                    onClick={() => setScanMode(!scanMode)}
                  >
                    <QrCode className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* TANGGAL */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-none border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* QTY PLAN */}
            {/* <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Qty Plan</label>
              <input
                type="number"
                value={qtyPlan}
                onChange={(e) => setQtyPlan(e.target.value ? +e.target.value : "")}
                placeholder="Masukkan Qty Plan"
                className="w-full rounded-none border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div> */}

            {/* QTY PER TROLI */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Qty per Troli
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={trolleyQty}
                  onChange={(e) =>
                    setTrolleyQty(e.target.value ? +e.target.value : "")
                  }
                  placeholder="Masukkan Qty"
                  className="flex-1 rounded-none border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (trolleyQty && trolleyQty > 0) {
                      setTrolleyList((prev) => [...prev, trolleyQty]);
                      setTrolleyQty("");
                    }
                  }}
                  className="bg-blue-600 text-white rounded-none hover:bg-blue-700"
                >
                  + Tambah
                </Button>
              </div>
            </div>

            {/* LIST TROLI */}
            {trolleyList.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Daftar Troli
                </label>
                <ul className="space-y-1 text-sm border rounded-none p-2 bg-slate-50">
                  {trolleyList.map((qty, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>
                        Troli #{index + 1}: {qty} pcs
                      </span>
                      <button
                        onClick={() =>
                          setTrolleyList((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="text-red-500 text-xs hover:underline"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="text-right font-semibold text-slate-700">
                  Total Plan: {trolleyList.reduce((a, b) => a + b, 0)} pcs
                </div>
              </div>
            )}

            {/* SIMPAN BUTTON */}
            <Button
              onClick={handleSubmit}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-none flex items-center justify-center shadow-md"
            >
              <Save className="mr-2 w-4 h-4" /> Simpan Dandori
            </Button>

            {/* 👇 SCANNER DITARUH DI SINI 👇 */}
            {scanMode && (
              <div className="mt-4 border-2 border-blue-300 rounded-none bg-white shadow-md p-3 w-fit mx-auto">
                <BarcodeScanner
                  width={360}
                  height={240}
                  onUpdate={(err, result) => {
                    if (result && typeof result.getText === "function") {
                      const text = result.getText();
                      if (text) {
                        setSelectedPrId(text);
                        setScanMode(false);
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-slate-100" />

        {/* PART LIST PANEL */}
        <ResizablePanel defaultSize={55} className="bg-slate-50">
          <div className="p-3 flex flex-col gap-2 h-full">
            {/* SEARCH */}
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari part..."
                className="w-full rounded-none border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <PackageSearch className="absolute top-2.5 right-3 w-4 h-4 text-black" />
            </div>

            {/* LIST PART */}
            <ScrollArea className="h-[300px] pr-2">
              <ul className="space-y-2">
                {filteredPart.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => setSelectedPart(p)}
                    className={`p-3 rounded-none border text-sm cursor-pointer transition-all duration-200 shadow-sm ${selectedPart?.id === p.id
                      ? "bg-white border-blue-500 text-blue-800 font-semibold"
                      : "text-black hover:bg-slate-100"
                      }`}
                  >
                    {p.model} – {p.assyNo16} – {p.customer}
                  </li>
                ))}
              </ul>
            </ScrollArea>

            {/* PEMBATAS */}
            {selectedPart && <div className="border-t border-slate-300 my-2" />}

            {/* DETAIL PART */}
            {selectedPart && (
              <div className="mt-auto bg-white rounded-none shadow-inner border border-slate-200 overflow-hidden">
                <table className="min-w-full text-sm text-slate-700">
                  <tbody className="divide-y divide-slate-100">
                    <TableRow label="Customer" value={selectedPart.customer} />
                    <TableRow label="Segment" value={selectedPart.segment} />
                    <TableRow label="AssyNo16" value={selectedPart.assyNo16} />
                    <TableRow label="AssyNo10" value={selectedPart.assyNo10} />
                    <TableRow label="OE No" value={selectedPart.oeNo} />
                    <TableRow label="Model" value={selectedPart.model} />
                    <TableRow
                      label="EMI Partname"
                      value={selectedPart.emiPartName ?? ""}
                    />
                    <TableRow label="KPP NP" value={selectedPart.kppNp ?? ""} />
                    <TableRow label="KPP" value={selectedPart.kpp} />
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="mt-10 bg-white rounded-none shadow-lg border border-slate-200 overflow-x-auto">
        <h2 className="text-lg font-bold text-slate-700 px-6 py-4 border-b border-slate-200 bg-slate-50">
          Data Incoming (Terbaru)
        </h2>
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left">PR ID</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Assy No 16</th>
              <th className="px-4 py-3 text-left">Qty Plan</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-slate-400 italic"
                >
                  Tidak ada data incoming.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 border-b">
                  <td className="px-4 py-2">{item.prId}</td>
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">{item.cust || item.customer}</td>
                  <td className="px-4 py-2">{item.model}</td>
                  <td className="px-4 py-2">{item.assyNo16}</td>
                  <td className="px-4 py-2">{item.qtyPlan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-none border text-sm hover:bg-blue-100 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-none border text-sm hover:bg-blue-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
