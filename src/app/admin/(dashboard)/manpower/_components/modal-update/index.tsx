"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { Manpower } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: Manpower | null;
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
      await bffRequest(`manpower/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Data manpower berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui manpower');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Perbarui Data Manpower"
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
