"use client";

import { useEffect, useState } from "react";
import { Loader2, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Stock2R {
  totalStock: number;
  rack: string;
  part2r: {
    id: number;
    codeNo: string;
    assyNo16: string;
    assyNo10: string;
    oeNo: string;
    model: string;
    emiPartName: string;
    kpp: string;
    customer: string;
    segment: string;
  };
}

export default function Stock2RPage() {
  const [data, setData] = useState<Stock2R[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();
  const [pasteText, setPasteText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:3001/stock/2r", {
        credentials: "include",
        cache: "no-cache", // don't get from cache
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal ambil data stock", err);
    } finally {
      setLoading(false);
    }
  };

  //auth
  useEffect(() => {
    fetchData();
    fetch("http://10.10.10.5:3001/auth/verify", {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (!res.ok) router.replace("/admin/login");
    });
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.part2r.assyNo16.toLowerCase().includes(search.toLowerCase()) ||
      item.part2r.assyNo10.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 🔹 Fungsi update stock dari paste textarea
  //      const handleUpdateStock = async () => {
  //     if (!pasteText.trim()) return alert("Paste data stock dulu!");
  //     setUpdating(true);
  //     try {
  //         const res = await fetch("http://10.10.10.5:3001/stock/paste-qty", {
  //             method: "POST",
  //             credentials: "include",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ data: pasteText, type: "2r" }),
  //         });
  //         if (!res.ok) {
  //             const err = await res.json();
  //             throw new Error(err.message || "Gagal update stock");
  //         }

  //         // rgeek
  //         const newQtys = pasteText
  //             .split(/\r?\n|\t/)
  //             .map((v) => v.trim())
  //             .filter((v) => v.length > 0)
  //             .map(Number);

  //         setData((prev) =>
  //             prev.map((item, i) => ({
  //                 ...item,
  //                 totalStock: newQtys[i] ?? item.totalStock,
  //             }))
  //         );

  //         alert("Stock berhasil diupdate!");
  //         setPasteText("");
  //         setShowPasteBox(false);
  //     } catch (e: any) {
  //         alert(e.message);
  //     } finally {
  //         setUpdating(false);
  //     }
  // };

  // const handleUpdateStock = async () => {
  //   if (!pasteText.trim()) return alert("Paste data stock dulu!");
  //   setUpdating(true);
  //   try {
  //     const res = await fetch("http://10.10.10.5:3001/stock/paste-qty", {
  //       method: "POST",
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ data: pasteText, type: "2r" }),
  //     });
  //     if (!res.ok) {
  //       const err = await res.json();
  //       throw new Error(err.message || "Gagal update stock");
  //     }

  //     // ✅ Refetch dari DB biar sinkron
  //     await fetchData();

  //     alert("Stock berhasil diupdate!");
  //     setPasteText("");
  //     setShowPasteBox(false);
  //   } catch (e: any) {
  //     alert(e.message);
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
        <PackageCheck className="text-blue-600" /> Stock 2R
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        {/* Input Pencarian */}
        <input
          type="text"
          placeholder="Cari AssyNo16 / AssyNo10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-lg w-full max-w-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Container tombol dan info total */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          {/* Info Total */}
          <p className="text-sm text-gray-600 hidden md:block">
            Total: {filteredData.length} item
          </p>

          {/* Tombol Export */}
          <button
            onClick={() => {
              window.open("http://10.10.10.5:3001/stock/export/2r", "_blank");
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Export to Excel
          </button>

          {/* Tombol Update Stock */}
          {/* <div className="mt-2 md:mt-0 w-full md:w-auto">
  <button
    onClick={() => setShowPasteBox(true)}
    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  >
    Update Stock
  </button>
</div> */}

          {/* Modal */}
          {/* {showPasteBox && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-4">
      <h3 className="text-lg font-bold mb-2">Update Stock 2R</h3>
      <textarea
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        placeholder="Paste stock 2R dari Excel di sini, satu qty per baris"
        className="w-full border rounded p-2 h-32 resize-none text-sm mb-4"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={handleUpdateStock}
          disabled={updating}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
        >
          {updating ? "Updating..." : "Update"}
        </button>
        <button
          onClick={() => {
            setShowPasteBox(false);
            setPasteText("");
          }}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)} */}
        </div>
      </div>

      <div className="overflow-auto rounded border border-gray-300 shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
          <thead className="bg-blue-50 text-xs font-bold text-gray-700">
            <tr>
              {[
                "No",
                // "Code No",
                // "AssyNo16",
                "AssyNo10",
                "OE No",
                "Model",
                "EMI",
                "KPP",
                "Customer",
                "Segment",
                "Qty",
                "Update",
                "Rack",
              ].map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-4">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-4 text-gray-400 italic">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paginatedData.map((d, i) => (
                <tr key={i}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  {/* <td>{d.part2r.codeNo}</td>
                                    <td>{d.part2r.assyNo16}</td> */}
                  <td>{d.part2r.assyNo10}</td>
                  <td>{d.part2r.oeNo}</td>
                  <td>{d.part2r.model}</td>
                  <td>{d.part2r.emiPartName}</td>
                  <td>{d.part2r.kpp}</td>
                  <td>{d.part2r.customer}</td>
                  <td>{d.part2r.segment}</td>
                  {/* <td className="font-semibold text-green-600">
                                        {d.totalStock}
                                    </td> */}
                  <td>
                    <input
                      type="number"
                      className="border px-2 py-1 rounded w-20 text-sm text-center"
                      value={d.totalStock}
                      onChange={(e) => {
                        const newQty = Number(e.target.value);
                        setData((prev) =>
                          prev.map((item, idx) =>
                            idx === i ? { ...item, totalStock: newQty } : item,
                          ),
                        );
                      }}
                    />
                  </td>

                  <td>
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      disabled={updating}
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          const res = await fetch(
                            `http://10.10.10.5:3001/stock/update-part-2r`,
                            {
                              method: "POST",
                              credentials: "include",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                partId: d.part2r.id,
                                newQty: d.totalStock,
                              }),
                            },
                          );
                          if (!res.ok) {
                            const err = await res.json();
                            throw new Error(
                              err.message || "Gagal update stock",
                            );
                          }
                          alert(`Stock ${d.part2r.codeNo} berhasil diupdate!`);
                        } catch (e: any) {
                          alert(e.message);
                        } finally {
                          setUpdating(false);
                        }
                      }}
                    >
                      Update
                    </button>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="border px-2 py-1 rounded w-24 text-sm text-center"
                      value={d.rack ?? ""}
                      onChange={(e) => {
                        const newRack = e.target.value;
                        setData((prev) =>
                          prev.map((item, idx) =>
                            idx === i ? { ...item, rack: newRack } : item,
                          ),
                        );
                      }}
                      onBlur={(e) => {
                        fetch(
                          `http://10.10.10.5:3001/stock/2r/rack/${d.part2r.id}`,
                          {
                            method: "PATCH",
                            credentials: "include",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ rack: e.target.value }),
                          },
                        );
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border rounded-b">
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
  );
}
