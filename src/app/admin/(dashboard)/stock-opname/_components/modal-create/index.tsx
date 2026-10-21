"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Table, Row, Col, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';

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

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedType(null);
      setIsAllPart(false);
      setSelectedPartIds([]);
      setWorkspaceData([]);
    }
  }, [open, form]);

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
      return {
        partId: part?.id,
        partNum: part?.oeNo || part?.codeNo || '-',
        partName: part?.model || part?.emiPartName || '-',
        qtySystem: s.totalStock || 0,
        qtyActual: existing ? existing.qtyActual : s.totalStock || 0,
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
      const payload = workspaceData.map((w) => ({
        part2rId: selectedType === '2R' ? w.partId : null,
        part4rId: selectedType === '4R' ? w.partId : null,
        qtySystem: w.qtySystem,
        qtyActual: w.qtyActual,
        keterangan: w.keterangan,
        pic: values.pic,
        status: 'PENDING',
      }));

      await bffRequest('stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      message.success('Stock Opname berhasil dibuat');
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
      render: (text: string, r: any) => (
        <div>
          <span className="font-semibold">{text}</span>
          <div className="text-xs text-gray-500">{r.partNum}</div>
        </div>
      ),
    },
    {
      title: 'Qty System',
      dataIndex: 'qtySystem',
      key: 'qtySystem',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Qty Actual',
      key: 'qtyActual',
      width: 130,
      render: (_: any, r: any) => (
        <InputNumber
          min={0}
          value={r.qtyActual}
          onChange={(val) => handleQtyChange(r.partId, val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Keterangan',
      key: 'keterangan',
      width: 200,
      render: (_: any, r: any) => (
        <Input
          placeholder="Catatan..."
          value={r.keterangan}
          onChange={(e) => handleKetChange(r.partId, e.target.value)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Input Stock Opname Baru"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText="Simpan Stock Opname"
      cancelText="Batal"
      width={800}
      centered
      zIndex={1050}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Pilih Tipe" required>
              <Select
                placeholder="Pilih 2R atau 4R"
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val);
                  setSelectedPartIds([]);
                }}
                options={[
                  { label: '2R (Motor)', value: '2R' },
                  { label: '4R (Mobil)', value: '4R' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pic"
              label="PIC / Penanggung Jawab"
              rules={[{ required: true, message: 'PIC wajib diisi' }]}
            >
              <Input placeholder="Nama PIC Opname" />
            </Form.Item>
          </Col>
        </Row>

        {selectedType && (
          <Row gutter={16} align="middle" className="mb-4">
            <Col span={8}>
              <div className="flex items-center gap-2">
                <Switch checked={isAllPart} onChange={setIsAllPart} />
                <span className="text-sm">Semua Part {selectedType}</span>
              </div>
            </Col>
            {!isAllPart && (
              <Col span={16}>
                <Select
                  mode="multiple"
                  placeholder="Pilih part tertentu"
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
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table
              size="small"
              columns={columns}
              dataSource={workspaceData}
              rowKey="partId"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Form>
    </Modal>
  );
}
