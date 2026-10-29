"use client";

import React, { useState } from 'react';
import { Modal, message, Upload as AntdUpload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { bffRequest } from '@/src/lib/client-api';

interface ModalImportProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ModalImport({ open, onCancel, onSuccess }: ModalImportProps) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Pilih file Excel terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);

    setUploading(true);
    try {
      await bffRequest('stock/upload/4r', {
        method: 'POST',
        body: formData,
      });
      message.success('Stock 4R berhasil diimpor');
      setFileList([]);
      onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Gagal mengimpor file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Import Stock 4R dari Excel"
      open={open}
      onOk={handleUpload}
      onCancel={() => {
        setFileList([]);
        onCancel();
      }}
      confirmLoading={uploading}
      okText="Upload & Proses"
      cancelText="Batal"
      centered
      zIndex={1050}
    >
      <AntdUpload.Dragger
        name="file"
        multiple={false}
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([file]);
          return false;
        }}
        onRemove={() => {
          setFileList([]);
        }}
        accept=".xlsx,.xls"
        className="my-4"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 36, color: '#1677ff' }} />
        </p>
        <p className="ant-upload-text">Klik atau seret file Excel ke area ini</p>
        <p className="ant-upload-hint">Gunakan template resmi dari tombol Download Template.</p>
      </AntdUpload.Dragger>
    </Modal>
  );
}
