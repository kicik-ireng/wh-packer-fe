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
      await bffRequest('truck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Truck berhasil ditambahkan');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan truck');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tambah Data Truck"
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
