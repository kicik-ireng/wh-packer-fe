"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

type ManpowerOption = {
  value: string;
  label: string;
};

export default function ProductionProblemPage() {
  const [manpowerList, setManpowerList] = useState<ManpowerOption[]>([]);
  const [loadingManpower, setLoadingManpower] = useState(false);
  const [form, setForm] = useState({
    no: "",
    jamMulai: "",
    jamSelesai: "",
    problemItem: "",
    pic: "",
    slOrDl: "",
    status: "",
    keterangan: "",
  });

  useEffect(() => {
    async function fetchManpower() {
      setLoadingManpower(true);
      try {
        const res = await fetch("http://localhost:3001/manpower");
        const data = await res.json();
        const options = data.map((m: any) => ({
          value: m.id.toString(),
          label: m.name,
        }));
        setManpowerList(options);
      } catch (error) {
        console.error("Fetch manpower error:", error);
      } finally {
        setLoadingManpower(false);
      }
    }

    fetchManpower();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePicChange = (selected: ManpowerOption | null) => {
    setForm((prev) => ({ ...prev, pic: selected ? selected.value : "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const today = new Date();
      const [startHour, startMin] = form.jamMulai.split(":").map(Number);
      const [endHour, endMin] = form.jamSelesai.split(":").map(Number);

      const mulai = new Date(today);
      mulai.setHours(startHour, startMin, 0, 0);

      const selesai = new Date(today);
      selesai.setHours(endHour, endMin, 0, 0);

      if (selesai <= mulai) {
        alert("Jam selesai harus lebih besar dari jam mulai");
        return;
      }

      const menit = Math.floor((selesai.getTime() - mulai.getTime()) / 60000);
      const response = await fetch(
        "http://localhost:3001/production-problem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            no: Number(form.no),
            jamMulai: mulai.toISOString(),
            jamSelesai: selesai.toISOString(),
            menit,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      alert("Problem report terkirim");

      setForm({
        no: "",
        jamMulai: "",
        jamSelesai: "",
        problemItem: "",
        pic: "",
        slOrDl: "",
        status: "",
        keterangan: "",
      });
    } catch (error) {
      alert("Gagal mengirim laporan");
      console.error(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl">
      <div className="mb-4">
        <Link
          href="/manpower/packing-report"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-sm mr-2" />
          Kembali
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Form Masalah Produksi
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span className="font-semibold mb-1 text-gray-700">No</span>
            <input
              name="no"
              type="number"
              min={0}
              value={form.no}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="No"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold mb-1 text-gray-700">Jam Mulai</span>
            <input
              name="jamMulai"
              type="time"
              value={form.jamMulai}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span className="font-semibold mb-1 text-gray-700">
              Jam Selesai
            </span>
            <input
              name="jamSelesai"
              type="time"
              value={form.jamSelesai}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold mb-1 text-gray-700">
              Problem Item
            </span>
            <input
              name="problemItem"
              type="text"
              value={form.problemItem}
              onChange={handleChange}
              required
              placeholder="Problem Item"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">PIC</label>
          <Select
            options={manpowerList}
            isLoading={loadingManpower}
            onChange={handlePicChange}
            value={manpowerList.find((m) => m.value === form.pic) || null}
            placeholder="Pilih PIC"
            isClearable
            classNamePrefix="react-select"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <label className="flex flex-col">
            <span className="font-semibold mb-1 text-gray-700">SL/DL</span>
            <input
              name="slOrDl"
              type="text"
              value={form.slOrDl}
              onChange={handleChange}
              required
              placeholder="SL/DL"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold mb-1 text-gray-700">Status</span>
            <input
              name="status"
              type="text"
              value={form.status}
              onChange={handleChange}
              required
              placeholder="Status"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <div></div>
        </div>

        <label className="flex flex-col">
          <span className="font-semibold mb-1 text-gray-700">Keterangan</span>
          <textarea
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Keterangan"
            className="border rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
