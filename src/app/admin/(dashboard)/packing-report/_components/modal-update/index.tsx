"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { PackingEntry } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: PackingEntry | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdate({ open, data, onCancel, onSuccess }: ModalUpdateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        jamMulai: data.jamMulai,
        jamSelesai: data.jamSelesai,
        menitPacking: data.menitPacking,
        qtyActualPacking: data.qtyActualPacking,
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
      await bffRequest(`packing-entry/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Entry berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Edit Packing Entry (${data?.packingReqNo || ''})`}
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
            <Form.Item name="jamMulai" label="Jam Mulai">
              <Input placeholder="08:00" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="jamSelesai" label="Jam Selesai">
              <Input placeholder="09:00" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="menitPacking" label="Menit Packing">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="qtyActualPacking"
              label="Qty Actual Packing"
              rules={[{ required: true, message: 'Qty actual wajib diisi' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
