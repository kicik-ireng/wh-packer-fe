"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, InputNumber, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { bffRequest } from '@/src/lib/client-api';
import type { ScheduleTruck } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: ScheduleTruck | null;
  trucks: { id: number; noPol: string }[];
  drivers: { id: number; name: string }[];
  customers: { id: number; name: string }[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdate({
  open,
  data,
  trucks,
  drivers,
  customers,
  onCancel,
  onSuccess,
}: ModalUpdateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        truckId: data.truck?.id,
        driverId: data.driver?.id,
        customerIds: (data.customers || []).map((c) => c.customer?.id),
        scheduleAt: data.scheduleAt ? dayjs(data.scheduleAt) : null,
        cycle: data.cycle ?? 1,
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
      const payload = {
        truckId: values.truckId,
        driverId: values.driverId,
        customerIds: values.customerIds,
        scheduleAt: values.scheduleAt.format('YYYY-MM-DD'),
        cycle: values.cycle,
      };

      await bffRequest(`schedule-truck/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      message.success('Jadwal truck berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui jadwal truck');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Perbarui Jadwal Truck"
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="truckId"
              label="Pilih Truck"
              rules={[{ required: true, message: 'Truck wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih nomor polisi"
                options={trucks.map((t) => ({ label: t.noPol, value: t.id }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="scheduleAt"
              label="Tanggal Jadwal"
              rules={[{ required: true, message: 'Tanggal wajib diisi' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cycle"
              label="Cycle / Putaran"
              rules={[{ required: true, message: 'Cycle wajib diisi' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="customerIds"
          label="Tujuan (Customer)"
          rules={[{ required: true, message: 'Minimal pilih 1 customer' }]}
        >
          <Select
            mode="multiple"
            placeholder="Pilih satu atau lebih customer"
            options={customers.map((c) => ({ label: c.name, value: c.id }))}
            maxTagCount="responsive"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
