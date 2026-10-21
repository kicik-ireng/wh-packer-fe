"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { Driver } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: Driver | null;
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
      await bffRequest(`driver/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Data driver berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Perbarui Data Driver"
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
