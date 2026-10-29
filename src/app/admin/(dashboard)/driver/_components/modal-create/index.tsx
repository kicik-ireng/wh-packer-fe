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
      await bffRequest('driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Driver berhasil ditambahkan');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tambah Driver"
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
          label="Nama Driver"
          rules={[
            { required: true, message: 'Nama driver wajib diisi' },
            { whitespace: true, message: 'Nama driver tidak boleh kosong' },
          ]}
        >
          <Input placeholder="Nama lengkap driver" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
