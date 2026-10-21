"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';

interface ModalCreateProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalCreate({ open, onCancel, onSuccess }: ModalCreateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await bffRequest('customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Customer berhasil ditambahkan');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tambah Customer"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={submitting}
      okText="Simpan"
      cancelText="Batal"
      centered
      zIndex={1050}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Nama Customer"
          rules={[
            { required: true, message: 'Nama customer wajib diisi' },
            { whitespace: true, message: 'Nama customer tidak boleh kosong' },
          ]}
        >
          <Input placeholder="Contoh: PT Astra Honda Motor" />
        </Form.Item>

        <Form.Item name="address" label="Alamat">
          <Input.TextArea rows={3} placeholder="Alamat lengkap customer" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
