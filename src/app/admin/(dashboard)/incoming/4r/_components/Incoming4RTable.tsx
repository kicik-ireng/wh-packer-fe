import React from 'react';
import ModernTable from '@/src/app/components/ModernTable';
import { Button, Tag, Space, Select, InputNumber } from 'antd';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

export interface Incoming4r {
  id: number;
  prId: string;
  date: string;
  cust: string;
  seg: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  kpp: string;
  kppNp: string;
  qtyPlan: number;
  qtyActual?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Incoming4RTableProps {
  data: Incoming4r[];
  loading: boolean;
  updating: boolean;
  editingRow: number | null;
  editedData: Record<number, Partial<Incoming4r>>;
  onEdit: (id: number, currentData: Incoming4r) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onEditChange: (id: number, field: keyof Incoming4r, value: any) => void;
  extraActions?: React.ReactNode;
}

export default function Incoming4RTable({
  data,
  loading,
  updating,
  editingRow,
  editedData,
  onEdit,
  onSave,
  onDelete,
  onEditChange,
  extraActions
}: Incoming4RTableProps) {
  
  const columns: any = [
    {
      title: 'PR ID',
      dataIndex: 'prId',
      key: 'prId',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'AssyNo10',
      dataIndex: 'assyNo10',
      key: 'assyNo10',
    },
    {
      title: 'OE No',
      dataIndex: 'oeNo',
      key: 'oeNo',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Customer',
      dataIndex: 'cust',
      key: 'cust',
    },
    {
      title: 'Qty Plan',
      dataIndex: 'qtyPlan',
      key: 'qtyPlan',
      disableSearch: true,
      render: (text: number, record: Incoming4r) => {
        if (editingRow === record.id) {
          return (
            <InputNumber 
              value={editedData[record.id]?.qtyPlan ?? text} 
              onChange={(val) => onEditChange(record.id, 'qtyPlan', val)} 
            />
          );
        }
        return text;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      disableSearch: true,
      render: (text: string, record: Incoming4r) => {
        if (editingRow === record.id) {
          return (
            <Select 
              value={editedData[record.id]?.status ?? text} 
              onChange={(val) => onEditChange(record.id, 'status', val)}
              options={[
                { value: 'PENDING', label: 'PENDING' },
                { value: 'APPROVED', label: 'APPROVED' },
                { value: 'REJECTED', label: 'REJECTED' },
              ]}
              style={{ width: 120 }}
            />
          );
        }
        
        let color = 'default';
        if (text === 'APPROVED') color = 'success';
        if (text === 'REJECTED') color = 'error';
        if (text === 'PENDING') color = 'warning';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      disableSearch: true,
      render: (_: any, record: Incoming4r) => {
        if (editingRow === record.id) {
          return (
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={() => onSave(record.id)}
              loading={updating}
            >
              Save
            </Button>
          );
        }
        return (
          <Space>
            <Button 
              type="text" 
              icon={<EditOutlined className="text-blue-500" />} 
              onClick={() => onEdit(record.id, record)}
            />
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(record.id)}
            />
          </Space>
        );
      }
    }
  ];

  return (
    <ModernTable 
      title="Incoming 4R"
      icon={<SearchOutlined style={{ fontSize: 24 }} />}
      extraActions={extraActions}
      columns={columns} 
      dataSource={data} 
      rowKey={(r: any) => r.id.toString()} 
      loading={loading}
    />
  );
}
