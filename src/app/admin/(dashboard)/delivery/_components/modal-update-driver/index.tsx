"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { bffRequest } from '@/src/lib/client-api';
import type { DeliveryOrder } from '../data-table';

interface ModalUpdateDriverProps {
  open: boolean;
  data: DeliveryOrder | null;
  drivers: { id: number; name: string }[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdateDriver({
  open,
  data,
  drivers,
  onCancel,
  onSuccess,
}: ModalUpdateDriverProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        driverId: data.driver?.id,
        date: data.date ? dayjs(data.date) : null,
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
      await bffRequest(`delivery-order/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: values.driverId,
          date: values.date ? values.date.toISOString() : undefined,
        }),
      });
      message.success('Data delivery order berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui DO');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Update Driver & Tanggal (${data?.noDo || ''})`}
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
          name="driverId"
          label="Pilih Driver"
          rules={[{ required: true, message: 'Driver wajib dipilih' }]}
        >
          <Select
            placeholder="Pilih driver"
            options={drivers.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Form.Item>

        <Form.Item name="date" label="Tanggal Kirim">
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
