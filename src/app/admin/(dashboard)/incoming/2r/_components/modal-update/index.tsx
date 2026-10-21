"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, Select, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { Incoming2r } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: Incoming2r | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdate({ open, data, onCancel, onSuccess }: ModalUpdateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        qtyPlan: data.qtyPlan,
        qtyActual: data.qtyActual,
        status: data.status,
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
      await bffRequest(`incoming2r/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Incoming 2R berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui Incoming 2R');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Perbarui Status / Qty Incoming (${data?.prId || ''})`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText="Perbarui"
      cancelText="Batal"
      centered
      zIndex={1050}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="qtyPlan"
          label="Qty Plan"
          rules={[{ required: true, message: 'Qty Plan wajib diisi' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item name="qtyActual" label="Qty Actual">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Status wajib dipilih' }]}
        >
          <Select
            options={[
              { label: 'PENDING', value: 'PENDING' },
              { label: 'APPROVED', value: 'APPROVED' },
              { label: 'REJECTED', value: 'REJECTED' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
