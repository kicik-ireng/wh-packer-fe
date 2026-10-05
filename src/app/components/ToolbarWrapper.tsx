import React from 'react';
import { Space } from 'antd';

interface ToolbarWrapperProps {
  title?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function ToolbarWrapper({ title, leftContent, rightContent }: ToolbarWrapperProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-3 mb-4 rounded-lg shadow-sm border border-gray-100 gap-2">
      <div className="flex items-center gap-2">
        {title && <h2 className="text-lg font-semibold text-gray-800 m-0">{title}</h2>}
        {leftContent && <Space size="small">{leftContent}</Space>}
      </div>
      <div className="flex items-center w-full md:w-auto">
        {rightContent && <Space size="small" className="w-full md:w-auto justify-end">{rightContent}</Space>}
      </div>
    </div>
  );
}
