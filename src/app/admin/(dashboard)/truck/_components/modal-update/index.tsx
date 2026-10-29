"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { Truck } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: Truck | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdate({ open, data, onCancel, onSuccess }: ModalUpdateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue(data);
    } else {
      form.resetFields();
    }
  }, [open, data, form]);

  const handleOk = async () => {
    if (!data) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await bffRequest(`truck/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Data truck berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui truck');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Perbarui Data Truck"
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
          name="noPol"
          label="Nomor Polisi"
          rules={[
            { required: true, message: 'Nomor polisi wajib diisi' },
            { whitespace: true, message: 'Nomor polisi tidak boleh kosong' },
          ]}
        >
          <Input placeholder="Contoh: B 1234 VUT" />
        </Form.Item>

        <Form.Item
          name="color"
          label="Warna / Tipe"
          rules={[
            { required: true, message: 'Warna wajib diisi' },
            { whitespace: true, message: 'Warna tidak boleh kosong' },
          ]}
        >
          <Input placeholder="Contoh: Biru / Wing Box" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
