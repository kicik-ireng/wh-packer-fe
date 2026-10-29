"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { Stock4R } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: Stock4R | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdate({ open, data, onCancel, onSuccess }: ModalUpdateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        totalStock: data.totalStock,
        rack: data.rack,
      });
    } else {
      form.resetFields();
    }
  }, [open, data, form]);

  const handleOk = async () => {
    if (!data) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Update Qty if changed
      if (values.totalStock !== data.totalStock) {
        await bffRequest('stock/update-part-4r', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partId: data.part4r?.id || data.part4rId,
            newQty: values.totalStock,
          }),
        });
      }

      // Update Rack if changed
      if (values.rack !== data.rack) {
        await bffRequest(`stock/4r/rack/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rack: values.rack }),
        });
      }

      message.success('Stock 4R berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui Stock 4R');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Update Stock & Rack (4R)"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText="Simpan"
      cancelText="Batal"
      centered
      zIndex={1050}
      destroyOnClose
    >
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
        <p className="m-0 font-medium text-gray-800">
          <strong>Assy No 16:</strong> {data?.part4r?.assyNo16}
        </p>
        <p className="m-0 text-gray-600">
          <strong>Model:</strong> {data?.part4r?.model} | <strong>KPP NP:</strong> {data?.part4r?.kppNp}
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="totalStock"
          label="Total Stock (Qty)"
          rules={[{ required: true, message: 'Qty wajib diisi' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item name="rack" label="Rack Location">
          <Input placeholder="Lokasi rak (misal: RAK-02-B)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
