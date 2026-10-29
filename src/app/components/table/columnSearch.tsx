import React from "react";
import { Input, Button, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";

export function getColumnSearchProps<T>(
  dataIndexOrAccessor: keyof T | string | ((record: T) => any),
  title: string,
  customFilterOrAccessor?: ((value: string, record: T) => boolean) | ((record: T) => any)
): Partial<ColumnType<T>> {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: any) => (
      <div className="filter-panel" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          autoFocus
          placeholder={`Search ${title}`}
          value={selectedKeys?.[0] ?? ""}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ minWidth: 70 }}
          >
            Apply
          </Button>
          <Button
            size="small"
            onClick={() => {
              clearFilters?.();
              confirm();
            }}
            style={{ minWidth: 70 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#4F46E5" : undefined }} />
    ),
    onFilter: (value: any, record: T) => {
      if (typeof customFilterOrAccessor === "function") {
        if (customFilterOrAccessor.length >= 2) {
          return (customFilterOrAccessor as (value: string, record: T) => boolean)(String(value), record);
        } else {
          const raw = (customFilterOrAccessor as (record: T) => any)(record);
          if (raw === null || raw === undefined) return false;
          return String(raw).toLowerCase().includes(String(value).toLowerCase());
        }
      }
      const rawVal =
        typeof dataIndexOrAccessor === "function"
          ? dataIndexOrAccessor(record)
          : (record as any)[dataIndexOrAccessor];
      if (rawVal === null || rawVal === undefined) return false;
      return String(rawVal).toLowerCase().includes(String(value).toLowerCase());
    },
  };
}
