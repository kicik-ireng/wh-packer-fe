"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface StockTransaction {
  id: number;
  part2rId?: number | null;
  part4rId?: number | null;
  type: string;
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  pic?: string | null;
  reference?: string | null;
  description?: string | null;
  createdAt: string;
  part2r?: { emiPartName: string; codeNo: string } | null;
  part4r?: { model: string; codeNo: string } | null;
}

export default function TraceabilityPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");

  const fetchTransactions = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `http://10.10.10.5:5055/stock-transaction?reference=${encodeURIComponent(query)}`
        : `http://10.10.10.5:5055/stock-transaction`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions(reference);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Traceability / Tx Log</h1>
            <p className="text-gray-500 mt-1">Lacak riwayat transaksi masuk/keluar berdasarkan Part atau PR ID</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari PR ID (PCS...)" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Cari
            </button>
            {reference && (
              <button 
                type="button"
                onClick={() => {
                  setReference("");
                  fetchTransactions("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear
              </button>
            )}
          </form>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 border-b">Tanggal</th>
                  <th className="p-4 border-b">Part / Model</th>
                  <th className="p-4 border-b">Type</th>
                  <th className="p-4 border-b">Qty (Sblm ➔ Ssdh)</th>
                  <th className="p-4 border-b">Change</th>
                  <th className="p-4 border-b">PIC</th>
                  <th className="p-4 border-b">Reference (PR/DO)</th>
                  <th className="p-4 border-b">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="flex justify-center mb-2">
                        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                      Memuat data...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(tx.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        {tx.part2r && (
                          <div className="text-sm font-medium text-gray-800">
                            2R: {tx.part2r.emiPartName} <br/>
                            <span className="text-xs text-gray-500">{tx.part2r.codeNo}</span>
                          </div>
                        )}
                        {tx.part4r && (
                          <div className="text-sm font-medium text-gray-800">
                            4R: {tx.part4r.model} <br/>
                            <span className="text-xs text-gray-500">{tx.part4r.codeNo}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tx.type === "IN" ? "bg-green-100 text-green-700" :
                          tx.type === "OUT" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono text-gray-600">
                        {tx.qtyBefore} ➔ {tx.qtyAfter}
                      </td>
                      <td className="p-4 text-sm font-bold">
                        <span className={tx.qtyChange > 0 ? "text-green-600" : tx.qtyChange < 0 ? "text-red-600" : "text-gray-500"}>
                          {tx.qtyChange > 0 ? `+${tx.qtyChange}` : tx.qtyChange}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{tx.pic || "-"}</td>
                      <td className="p-4 text-sm font-mono bg-gray-50 rounded">{tx.reference || "-"}</td>
                      <td className="p-4 text-sm text-gray-500">{tx.description || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
