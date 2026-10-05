"use client";

import React, { useState, useRef } from "react";
import { Table, Input, Button, Space, Card, Typography } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import type { FilterConfirmProps } from "antd/es/table/interface";

const { Title } = Typography;

interface ModernTableProps<T> {
  title?: string;
  icon?: React.ReactNode;
  extraActions?: React.ReactNode;
  filterControls?: React.ReactNode;
  dataSource: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  pagination?: object | false;
  [key: string]: any; // Allow other antd table props like expandable
}

export default function ModernTable<T extends object>({
  title,
  icon,
  extraActions,
  filterControls,
  dataSource,
  columns,
  loading = false,
  rowKey,
  pagination,
  ...restProps
}: ModernTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<any>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: any
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // Enhance columns with auto-search functionality if not explicitly disabled or overridden
  const enhancedColumns = columns.map((col: any) => {
    if (col.disableSearch || col.filterDropdown) {
      return col;
    }
    
    // Only apply search to dataIndex columns
    if (!col.dataIndex) return col;

    const dataIndexStr = Array.isArray(col.dataIndex)
      ? col.dataIndex.join(".")
      : col.dataIndex.toString();

    return {
      ...col,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }: any) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search ${col.title}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndexStr)
            }
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                handleSearch(selectedKeys as string[], confirm, dataIndexStr)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              Close
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      onFilter: (value: any, record: any) => {
        // Handle nested dataIndex like ['part4r', 'assyNo10']
        let recordValue = record;
        if (Array.isArray(col.dataIndex)) {
          col.dataIndex.forEach((key: string) => {
            recordValue = recordValue ? recordValue[key] : "";
          });
        } else {
          recordValue = record[col.dataIndex];
        }

        return recordValue
          ? recordValue
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase())
          : false;
      },
      onFilterDropdownOpenChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    };
  });

  const cardTitle = title ? (
    <Space>
      {icon}
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
    </Space>
  ) : null;

  return (
    <div className="w-full">
      <Card
        title={cardTitle}
        extra={extraActions ? <Space>{extraActions}</Space> : null}
        bordered={false}
        className="shadow-sm"
      >
        {filterControls && (
          <Space style={{ marginBottom: 16 }} wrap>
            {filterControls}
          </Space>
        )}
        <Table
          dataSource={dataSource}
          columns={enhancedColumns}
          loading={loading}
          rowKey={rowKey}
          pagination={
            pagination !== false
              ? {
                  defaultPageSize: 25,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '25', '50', '100'],
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                  ...pagination,
                }
              : false
          }
          scroll={{ x: "max-content" }}
          size="small"
          {...restProps}
        />
      </Card>
    </div>
  );
}
