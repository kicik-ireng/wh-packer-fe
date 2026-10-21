"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, DatePicker, message } from 'antd';
import { bffRequest } from '@/src/lib/client-api';

interface ModalCreateProps {
  open: boolean;
  manpowerList: { id: number; nik: string; name: string }[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalCreate({
  open,
  manpowerList,
  onCancel,
  onSuccess,
}: ModalCreateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        no: values.no,
        jamMulai: values.jamMulai.toISOString(),
        jamSelesai: values.jamSelesai.toISOString(),
        menit: values.menit,
        problemItem: values.problemItem,
        pic: values.pic,
        slOrDl: values.slOrDl,
        status: values.status || 'OPEN',
        keterangan: values.keterangan,
      };

      await bffRequest('production-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      message.success('Masalah produksi berhasil ditambahkan');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan masalah produksi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Catat Masalah Produksi"
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
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ no: 1, slOrDl: 'DL', status: 'OPEN' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="no"
              label="Nomor Urut"
              rules={[{ required: true, message: 'Nomor wajib diisi' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pic"
              label="PIC (Manpower)"
              rules={[{ required: true, message: 'PIC wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih PIC"
                options={manpowerList.map((m) => ({
                  label: `${m.name} (${m.nik})`,
                  value: m.nik,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="jamMulai"
              label="Waktu Mulai"
              rules={[{ required: true, message: 'Waktu mulai wajib diisi' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="jamSelesai"
              label="Waktu Selesai"
              rules={[{ required: true, message: 'Waktu selesai wajib diisi' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="menit"
              label="Durasi (Menit)"
              rules={[{ required: true, message: 'Durasi menit wajib diisi' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="slOrDl"
              label="SL / DL"
              rules={[{ required: true, message: 'SL / DL wajib dipilih' }]}
            >
              <Select
                options={[
                  { label: 'DL (Direct Labor)', value: 'DL' },
                  { label: 'SL (Semi Labor)', value: 'SL' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Status wajib dipilih' }]}
            >
              <Select
                options={[
                  { label: 'OPEN', value: 'OPEN' },
                  { label: 'CLOSED', value: 'CLOSED' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="problemItem"
          label="Problem Item"
          rules={[{ required: true, message: 'Problem item wajib diisi' }]}
        >
          <Input placeholder="Contoh: Mesin mati / Part delay" />
        </Form.Item>

        <Form.Item name="keterangan" label="Keterangan Tambahan">
          <Input.TextArea rows={3} placeholder="Penjelasan / tindakan perbaikan" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
