"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, message } from 'antd';
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
      await bffRequest('incoming2r/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Incoming 2R berhasil ditambahkan');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan Incoming 2R');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tambah Data Incoming 2R"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={submitting}
      okText="Simpan"
      cancelText="Batal"
      width={700}
      centered
      zIndex={1050}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4" initialValues={{ segment: '2R' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="prId"
              label="PR ID"
              rules={[{ required: true, message: 'PR ID wajib diisi' }]}
            >
              <Input placeholder="Contoh: PR-2026-001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Tanggal"
              rules={[{ required: true, message: 'Tanggal wajib diisi' }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cust"
              label="Customer"
              rules={[{ required: true, message: 'Customer wajib diisi' }]}
            >
              <Input placeholder="Contoh: YAMAHA" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Model wajib diisi' }]}>
              <Input placeholder="Contoh: 2PV" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assyNo16" label="Assy No 16" rules={[{ required: true, message: 'Assy No 16 wajib diisi' }]}>
              <Input placeholder="Assy No 16" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="assyNo10" label="Assy No 10" rules={[{ required: true, message: 'Assy No 10 wajib diisi' }]}>
              <Input placeholder="Assy No 10" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="oeNo" label="OE No" rules={[{ required: true, message: 'OE No wajib diisi' }]}>
              <Input placeholder="OE No" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="kpp" label="KPP" rules={[{ required: true, message: 'KPP wajib diisi' }]}>
              <Input placeholder="KPP" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="EMIpartname" label="Part Name" rules={[{ required: true, message: 'Part Name wajib diisi' }]}>
              <Input placeholder="Nama part" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="qtyPlan"
              label="Qty Plan"
              rules={[{ required: true, message: 'Qty Plan wajib diisi' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Jumlah plan" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
