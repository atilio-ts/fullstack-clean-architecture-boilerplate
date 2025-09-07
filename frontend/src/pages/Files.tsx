import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Upload,
  Modal,
  message,
  Popconfirm,
  Space,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  Tooltip,
  Tag,
  Divider,
  Empty
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { UploadProps, RcFile } from 'antd/es/upload';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { FileService } from '@/api/fileService';
import type { FileResponse, FileContentResponse } from '@/api/generated/api-client';
import { GetAllFilesParamsSortByEnum, GetAllFilesParamsSortOrderEnum } from '@/api/generated/api-client';

const { Title, Text, Paragraph } = Typography;

interface FileWithActions extends FileResponse {
  key: string;
}

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileWithActions[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<FileContentResponse | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalCount: 0, totalSize: 0 });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sorting, setSorting] = useState<{
    field?: GetAllFilesParamsSortByEnum;
    order?: GetAllFilesParamsSortOrderEnum;
  }>({});

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await FileService.getAllFiles({
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: sorting.field,
        sortOrder: sorting.order
      });

      const filesWithKeys = response.files.map((file, index) => ({
        ...file,
        key: file.id || index.toString()
      }));

      setFiles(filesWithKeys);
      setStats({
        totalCount: response.totalCount,
        totalSize: response.totalSize
      });
      setPagination(prev => ({
        ...prev,
        total: response.totalCount
      }));
    } catch (error) {
      message.error(`Failed to load files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, sorting.field, sorting.order]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (file: RcFile): Promise<boolean> => {
    try {
      setUploadLoading(true);
      
      const validation = FileService.validateFile(file);
      if (!validation.valid) {
        message.error(validation.error);
        return false;
      }

      const result = await FileService.uploadFile(file);
      message.success(`File "${result.filename}" uploaded successfully`);
      await loadFiles(); // Reload the file list
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      message.error(errorMessage);
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: async (file: RcFile) => {
      await handleFileUpload(file);
      return false; // Always prevent default upload behavior
    },
    showUploadList: true,
    accept: '.txt,.md,.json',
    maxCount: 1,
  };

  const handleViewContent = async (fileId: string) => {
    try {
      const content = await FileService.getFileContent(fileId);
      setSelectedFileContent(content);
      setContentModalVisible(true);
    } catch (error) {
      message.error(`Failed to load file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      await FileService.triggerDownload(fileId);
      message.success('Download started');
    } catch (error) {
      message.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (fileId: string, filename: string) => {
    try {
      setDeleteLoading(fileId);
      await FileService.deleteFile(fileId);
      message.success(`File "${filename}" deleted successfully`);
      loadFiles(); // Reload the file list
    } catch (error) {
      message.error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleTableChange: TableProps<FileWithActions>['onChange'] = (paginationInfo, _filters, sorter) => {
    // Handle pagination
    if (paginationInfo) {
      setPagination(prev => ({
        ...prev,
        current: paginationInfo.current || 1,
        pageSize: paginationInfo.pageSize || 10
      }));
    }

    // Handle sorting
    if (sorter && !Array.isArray(sorter)) {
      let field: GetAllFilesParamsSortByEnum | undefined;
      
      switch (sorter.field) {
        case 'filename':
          field = GetAllFilesParamsSortByEnum.Filename;
          break;
        case 'createdAt':
          field = GetAllFilesParamsSortByEnum.CreatedAt;
          break;
        case 'fileSize':
          field = GetAllFilesParamsSortByEnum.FileSize;
          break;
      }

      setSorting({
        field,
        order: sorter.order === 'ascend' ? GetAllFilesParamsSortOrderEnum.ASC : sorter.order === 'descend' ? GetAllFilesParamsSortOrderEnum.DESC : undefined
      });
    } else {
      setSorting({});
    }
  };

  const getFileTypeTag = (contentType: string) => {
    switch (contentType) {
      case 'text/plain':
        return <Tag color="blue">TXT</Tag>;
      case 'text/markdown':
        return <Tag color="green">MD</Tag>;
      case 'application/json':
        return <Tag color="orange">JSON</Tag>;
      default:
        return <Tag color="default">OTHER</Tag>;
    }
  };

  const columns: ColumnsType<FileWithActions> = [
    {
      title: 'File Name',
      dataIndex: 'filename',
      key: 'filename',
      sorter: true,
      render: (filename: string, record: FileWithActions) => (
        <Space>
          <FileTextOutlined />
          <Text strong>{filename}</Text>
          {getFileTypeTag(record.contentType)}
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'formattedSize',
      key: 'fileSize',
      sorter: true,
      align: 'right',
    },
    {
      title: 'Content Type',
      dataIndex: 'contentType',
      key: 'contentType',
      render: (contentType: string) => (
        <Text type="secondary">{contentType}</Text>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (createdAt: string) => (
        <Text type="secondary">{new Date(createdAt).toLocaleString()}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record: FileWithActions) => (
        <Space size="small">
          <Tooltip title="View Content">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewContent(record.id)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete File"
            description={`Are you sure you want to delete "${record.filename}"?`}
            onConfirm={() => handleDelete(record.id, record.filename)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>File Management</Title>
        <Paragraph type="secondary">
          Upload, view, and manage your text files. Supports TXT, MD, and JSON files up to 1MB.
        </Paragraph>
      </div>

      {/* Upload Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Upload Files" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Supports .txt, .md, and .json files up to 1MB
              </Text>
              <Upload
                {...uploadProps}
                disabled={uploadLoading}
              >
                <Button 
                  icon={uploadLoading ? <ReloadOutlined spin /> : <UploadOutlined />} 
                  loading={uploadLoading}
                  type="primary"
                >
                  {uploadLoading ? 'Uploading...' : 'Choose File'}
                </Button>
              </Upload>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" size="small">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadFiles}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12}>
          <Card size="small">
            <Statistic 
              title="Total Files" 
              value={stats.totalCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12}>
          <Card size="small">
            <Statistic 
              title="Total Size" 
              value={FileService.formatFileSize(stats.totalSize)}
            />
          </Card>
        </Col>
      </Row>

      {/* Files Table */}
      <Card title="Your Files">
        {files.length === 0 && !loading ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No files uploaded yet. Use the upload area above to add your first file."
            style={{ padding: '40px' }}
          />
        ) : (
          <Table<FileWithActions>
            columns={columns}
            dataSource={files}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} files`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* File Content Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            {selectedFileContent?.filename}
          </Space>
        }
        open={contentModalVisible}
        onCancel={() => {
          setContentModalVisible(false);
          setSelectedFileContent(null);
        }}
        footer={[
          <Button 
            key="download" 
            type="primary"
            icon={<DownloadOutlined />} 
            onClick={() => {
              if (selectedFileContent) {
                handleDownload(selectedFileContent.id);
              }
            }}
          >
            Download
          </Button>,
          <Button key="close" onClick={() => {
            setContentModalVisible(false);
            setSelectedFileContent(null);
          }}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedFileContent && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary">Size: </Text>
                  <Text strong>{selectedFileContent.formattedSize}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Type: </Text>
                  {getFileTypeTag(selectedFileContent.contentType)}
                </Col>
                <Col span={8}>
                  <Text type="secondary">Created: </Text>
                  <Text>{new Date(selectedFileContent.createdAt).toLocaleString()}</Text>
                </Col>
              </Row>
            </div>
            <Divider />
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '16px',
                backgroundColor: '#fafafa',
                maxHeight: '500px',
                overflow: 'auto',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}
            >
              {selectedFileContent.content}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Files;