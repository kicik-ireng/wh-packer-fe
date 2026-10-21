"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';
import type { Part4r } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: Part4r | null;
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
      await bffRequest(`part-database-4r/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Part 4R berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui Part 4R');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Perbarui Data Part 4R"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText="Perbarui"
      cancelText="Batal"
      width={700}
      centered
      zIndex={1050}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="codeNo"
              label="Code No"
              rules={[{ required: true, message: 'Code No wajib diisi' }]}
            >
              <Input placeholder="Contoh: CD-4R-001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customer"
              label="Customer"
              rules={[{ required: true, message: 'Customer wajib diisi' }]}
            >
              <Input placeholder="Contoh: TOYOTA" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="segment" label="Segment">
              <Input placeholder="Contoh: 4R" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="model" label="Model">
              <Input placeholder="Contoh: AVANZA" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assyNo16" label="Assy No 16">
              <Input placeholder="Assy No 16" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="assyNo10" label="Assy No 10">
              <Input placeholder="Assy No 10" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="oeNo" label="OE No">
              <Input placeholder="OE No" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="kpp" label="KPP">
              <Input placeholder="KPP" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="kppNp" label="KPP NP">
          <Input placeholder="KPP NP" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
