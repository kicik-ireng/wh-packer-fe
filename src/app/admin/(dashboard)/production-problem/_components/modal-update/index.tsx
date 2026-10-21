"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { bffRequest } from '@/src/lib/client-api';
import type { ProductionProblem } from '../data-table';

interface ModalUpdateProps {
  open: boolean;
  data: ProductionProblem | null;
  manpowerList: { id: number; nik: string; name: string }[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalUpdate({
  open,
  data,
  manpowerList,
  onCancel,
  onSuccess,
}: ModalUpdateProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        no: data.no,
        jamMulai: data.jamMulai ? dayjs(data.jamMulai) : null,
        jamSelesai: data.jamSelesai ? dayjs(data.jamSelesai) : null,
        menit: data.menit,
        problemItem: data.problemItem,
        pic: data.pic,
        slOrDl: data.slOrDl,
        status: data.status,
        keterangan: data.keterangan,
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
        no: values.no,
        jamMulai: values.jamMulai ? values.jamMulai.toISOString() : undefined,
        jamSelesai: values.jamSelesai ? values.jamSelesai.toISOString() : undefined,
        menit: values.menit,
        problemItem: values.problemItem,
        pic: values.pic,
        slOrDl: values.slOrDl,
        status: values.status,
        keterangan: values.keterangan,
      };

      await bffRequest(`production-problem/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      message.success('Masalah produksi berhasil diperbarui');
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui masalah produksi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Perbarui Data Masalah Produksi"
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
