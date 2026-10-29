"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { DeliveryItem } from '../data-table';

interface ModalUpdateItemProps {
  open: boolean;
  data: DeliveryItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdateItem({
  open,
  data,
  onCancel,
  onSuccess,
}: ModalUpdateItemProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        qtyDelivered: data.qtyDelivered,
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
      await bffRequest(`delivery-item/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qtyDelivered: values.qtyDelivered }),
      });
      message.success('Qty item delivery berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui qty item');
    } finally {
      setSubmitting(false);
    }
  };

  const partName = data?.part2r?.model || data?.part4r?.model || 'Item';

  return (
    <Modal
      title={`Update Qty Delivery (${partName})`}
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
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="qtyDelivered"
          label="Qty Delivered"
          rules={[{ required: true, message: 'Qty wajib diisi' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
