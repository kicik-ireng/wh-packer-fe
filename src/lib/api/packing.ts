export async function createPackingReport(data: any) {
  const res = await fetch("/api/packing-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengirim laporan packing");
  return res.json();
}
