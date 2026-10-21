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
      await bffRequest('manpower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Manpower berhasil ditambahkan');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan manpower');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tambah Data Manpower"
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
          name="nik"
          label="NIK (Nomor Induk Karyawan)"
          rules={[
            { required: true, message: 'NIK wajib diisi' },
            { whitespace: true, message: 'NIK tidak boleh hanya spasi' },
          ]}
        >
          <Input placeholder="Contoh: MP-00123" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Nama Lengkap"
          rules={[
            { required: true, message: 'Nama wajib diisi' },
            { whitespace: true, message: 'Nama tidak boleh hanya spasi' },
          ]}
        >
          <Input placeholder="Nama lengkap karyawan" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
