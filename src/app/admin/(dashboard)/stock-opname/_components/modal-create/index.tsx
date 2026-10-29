"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Table, Row, Col, message, Tag } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import { useVuteqSso } from '@vuteq/sso-client-react/react';

interface ModalCreateProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  stock2R: any[];
  stock4R: any[];
}

export default function ModalCreate({
  open,
  onCancel,
  onSuccess,
  stock2R,
  stock4R,
}: ModalCreateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<'2R' | '4R' | null>(null);
  const [isAllPart, setIsAllPart] = useState(false);
  const [selectedPartIds, setSelectedPartIds] = useState<number[]>([]);
  const [workspaceData, setWorkspaceData] = useState<any[]>([]);

  const { session } = useVuteqSso();
  const userName = (session as any)?.profile?.FullName || (session as any)?.profile?.name || (session as any)?.email || 'Stockist';

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedType(null);
      setIsAllPart(false);
      setSelectedPartIds([]);
      setWorkspaceData([]);
    } else {
      form.setFieldsValue({
        picStockist: userName,
      });
    }
  }, [open, form, userName]);

  useEffect(() => {
    if (!selectedType) {
      setWorkspaceData([]);
      return;
    }

    const currentStockList = selectedType === '2R' ? stock2R : stock4R;

    let filteredStocks = [];
    if (isAllPart) {
      filteredStocks = currentStockList;
    } else {
      filteredStocks = currentStockList.filter((s) => {
        const pId = selectedType === '2R' ? s.part2r?.id : s.part4r?.id;
        return selectedPartIds.includes(pId);
      });
    }

    const newWorkspaceData = filteredStocks.map((s) => {
      const part = selectedType === '2R' ? s.part2r : s.part4r;
      const existing = workspaceData.find((w) => w.partId === part?.id);
      const qtySystem = s.totalStock || 0;
      const qtyActual = existing ? existing.qtyActual : qtySystem;
      const rack = existing ? existing.rack : (s.rack || '-');
      const qtyBeginning = existing?.qtyBeginning !== undefined ? existing.qtyBeginning : qtySystem;

      return {
        partId: part?.id,
        partNum: part?.oeNo || part?.codeNo || '-',
        partName: part?.model || part?.emiPartName || '-',
        rack,
        qtyBeginning,
        qtySystem,
        qtyActual,
        keterangan: existing ? existing.keterangan : '',
      };
    });

    setWorkspaceData(newWorkspaceData);
  }, [selectedType, isAllPart, selectedPartIds, stock2R, stock4R]);

  const handleQtyChange = (partId: number, val: number | null) => {
    setWorkspaceData((prev) =>
      prev.map((item) => (item.partId === partId ? { ...item, qtyActual: val ?? 0 } : item)),
    );
  };

  const handleRackChange = (partId: number, val: string) => {
    setWorkspaceData((prev) =>
      prev.map((item) => (item.partId === partId ? { ...item, rack: val } : item)),
    );
  };

  const handleKetChange = (partId: number, val: string) => {
    setWorkspaceData((prev) =>
      prev.map((item) => (item.partId === partId ? { ...item, keterangan: val } : item)),
    );
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (workspaceData.length === 0) {
        message.warning('Pilih minimal 1 part untuk di-opname');
        return;
      }

      setSubmitting(true);
      const payload = workspaceData.map((w) => {
        const diff = w.qtyActual - w.qtySystem;
        return {
          part2rId: selectedType === '2R' ? w.partId : null,
          part4rId: selectedType === '4R' ? w.partId : null,
          qtyBeginning: w.qtyBeginning,
          qtySystem: w.qtySystem,
          qtyActual: w.qtyActual,
          qtyDiff: diff,
          rack: w.rack || null,
          picStockist: values.picStockist,
          pic: values.picStockist,
          keterangan: w.keterangan || (diff === 0 ? 'Fisik Cocok' : diff > 0 ? 'Surplus Fisik' : 'Defisit Fisik'),
          status: 'PENDING',
        };
      });

      await bffRequest('stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      message.success(`Berhasil mencatat ${payload.length} item stock opname! Menunggu approval.`);
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menyimpan Stock Opname');
    } finally {
      setSubmitting(false);
    }
  };

  const partOptions = (selectedType === '2R' ? stock2R : stock4R).map((s) => {
    const p = selectedType === '2R' ? s.part2r : s.part4r;
    return {
      value: p?.id,
      label: `${p?.model || p?.oeNo || p?.codeNo} (Stock: ${s.totalStock || 0})`,
    };
  });

  const columns = [
    {
      title: 'Part / Model',
      dataIndex: 'partName',
      key: 'partName',
      width: 170,
      render: (text: string, r: any) => (
        <div>
          <span className="font-bold text-gray-900">{text}</span>
          <div className="text-xs text-blue-600 font-mono">{r.partNum}</div>
        </div>
      ),
    },
    {
      title: 'Rak',
      dataIndex: 'rack',
      key: 'rack',
      width: 90,
      render: (_: any, r: any) => (
        <Input
          size="small"
          value={r.rack}
          placeholder="Lokasi Rak"
          onChange={(e) => handleRackChange(r.partId, e.target.value)}
        />
      ),
    },
    {
      title: 'Saldo Sistem',
      dataIndex: 'qtySystem',
      key: 'qtySystem',
      width: 95,
      align: 'right' as const,
      render: (val: number) => <span className="font-bold text-gray-700 font-mono">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Fisik Aktual',
      key: 'qtyActual',
      width: 110,
      render: (_: any, r: any) => (
        <InputNumber
          min={0}
          size="small"
          value={r.qtyActual}
          onChange={(val) => handleQtyChange(r.partId, val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Selisih',
      key: 'diff',
      width: 110,
      align: 'center' as const,
      render: (_: any, r: any) => {
        const diff = (r.qtyActual ?? 0) - (r.qtySystem ?? 0);
        if (diff === 0) return <Tag color="success">MATCH (0)</Tag>;
        if (diff > 0) return <Tag color="blue">+{diff} (LEBIH)</Tag>;
        return <Tag color="error">{diff} (KURANG)</Tag>;
      },
    },
    {
      title: 'Catatan / Alasan Selisih',
      key: 'keterangan',
      width: 180,
      render: (_: any, r: any) => (
        <Input
          size="small"
          placeholder="Analisa selisih / kondisi part..."
          value={r.keterangan}
          onChange={(e) => handleKetChange(r.partId, e.target.value)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Audit Fisik Stock Opname (Petugas Stockist)"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText="Simpan Hasil Opname"
      cancelText="Batal"
      width={900}
      centered
      zIndex={1050}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-3">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Pilih Tipe Gudang" required>
              <Select
                placeholder="Pilih 2R atau 4R"
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val);
                  setSelectedPartIds([]);
                }}
                options={[
                  { label: '2R (Roda Dua / Motor)', value: '2R' },
                  { label: '4R (Roda Empat / Mobil)', value: '4R' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="picStockist"
              label="Petugas Stockist (Penanggung Jawab Hitung Fisik)"
              rules={[{ required: true, message: 'Nama petugas stockist wajib diisi' }]}
            >
              <Input placeholder="Nama Petugas Stockist" />
            </Form.Item>
          </Col>
        </Row>

        {selectedType && (
          <Row gutter={16} align="middle" className="mb-3">
            <Col span={7}>
              <div className="flex items-center gap-2">
                <Switch checked={isAllPart} onChange={setIsAllPart} />
                <span className="text-sm font-semibold">Semua Part {selectedType}</span>
              </div>
            </Col>
            {!isAllPart && (
              <Col span={17}>
                <Select
                  mode="multiple"
                  placeholder="Pilih part tertentu untuk di-audit..."
                  style={{ width: '100%' }}
                  value={selectedPartIds}
                  onChange={setSelectedPartIds}
                  options={partOptions}
                  maxTagCount="responsive"
                />
              </Col>
            )}
          </Row>
        )}

        {workspaceData.length > 0 && (
          <div className="border border-[#D9DDDF] shadow-sm">
            <Table
              size="small"
              className="small-table"
              columns={columns}
              dataSource={workspaceData}
              rowKey="partId"
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}
      </Form>
    </Modal>
  );
}
