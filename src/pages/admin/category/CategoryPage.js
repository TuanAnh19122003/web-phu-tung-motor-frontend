/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
    Button,
    message,
    Modal,
    Spin,
    Descriptions,
    Input,
    Switch,
    Card,
    Table,
    Tooltip,
    Popconfirm,
    Pagination,
    Dropdown
} from 'antd';
import CategoryForm from './CategoryForm';
import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import axios from 'axios';
import { formatDate } from '../../../utils/helpers';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewingCategory, setViewingCategory] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6, total: 0 });
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // list | card

    const API_URL = process.env.REACT_APP_API_URL;

    const fetchCategory = async (page = 1, pageSize = 6, keyword = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/categories`, {
                params: { page, pageSize, search: keyword || null }
            });
            const { data, total } = res.data;
            setCategories(data);
            setPagination({ current: page, pageSize, total });
        } catch (err) {
            message.error('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleAdd = () => {
        setEditingCategory(null);
        setOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setOpen(true);
    };

    const handleView = (category) => {
        setViewingCategory(category);
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/categories/${id}`);
            message.success(res.data.message || 'Xóa thành công');
            const isLast = categories.length === 1 && pagination.current > 1;
            const newPage = isLast ? pagination.current - 1 : pagination.current;
            fetchCategory(newPage, pagination.pageSize);
        } catch (err) {
            message.error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleSubmit = async (category) => {
        try {
            let res;
            if (editingCategory) {
                res = await axios.put(`${API_URL}/categories/${editingCategory.id}`, category);
            } else {
                res = await axios.post(`${API_URL}/categories`, category);
            }
            if (res.data.success) {
                message.success(res.data.message || 'Thao tác thành công');
                fetchCategory(pagination.current, pagination.pageSize);
                setOpen(false);
            } else {
                message.error(res.data.message || 'Thao tác thất bại');
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Thao tác thất bại');
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Danh sách danh mục</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            fetchCategory(1, pagination.pageSize, value);
                        }}
                        allowClear
                        style={{ width: 250 }}
                    />
                    <Switch
                        style={{ marginTop: 5 }}
                        checkedChildren={<AppstoreOutlined />}
                        unCheckedChildren={<UnorderedListOutlined />}
                        checked={viewMode === 'card'}
                        onChange={(checked) => setViewMode(checked ? 'card' : 'list')}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm</Button>
                </div>
            </div>

            {/* Nội dung */}
            <Spin spinning={loading}>
                {viewMode === 'list' ? (
                    <Table
                        rowKey="id"
                        dataSource={categories}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: false,
                            onChange: (page) => fetchCategory(page, pagination.pageSize)
                        }}
                    >
                        <Table.Column
                            title="STT"
                            key="index"
                            render={(_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1}
                        />
                        <Table.Column title="Code" dataIndex="code" key="code" />
                        <Table.Column title="Tên danh mục" dataIndex="name" key="name" />
                        <Table.Column title="Slug" dataIndex="slug" key="slug" />
                        <Table.Column
                            title="Hành động"
                            key="action"
                            render={(_, record) => {
                                const items = [
                                    { key: 'view', label: <div onClick={() => handleView(record)}><EyeOutlined style={{ marginRight: 8 }} /> Xem chi tiết</div> },
                                    { key: 'edit', label: <div onClick={() => handleEdit(record)}><EditOutlined style={{ marginRight: 8 }} /> Chỉnh sửa</div> },
                                    { key: 'delete', label: <div onClick={() => handleDelete(record.id)} style={{ color: 'red' }}><DeleteOutlined style={{ marginRight: 8 }} /> Xóa</div> },
                                ];
                                return <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                                    <Button shape="circle" icon={<MoreOutlined />} />
                                </Dropdown>;
                            }}
                        />
                    </Table>
                ) : (
                    <>
                        {/* Card view */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {categories.map((category) => (
                                <Card
                                    key={category.id}
                                    size="small"
                                    actions={[
                                        <Tooltip title="Chi tiết" key="view"><EyeOutlined onClick={() => handleView(category)} /></Tooltip>,
                                        <Tooltip title="Chỉnh sửa" key="edit"><EditOutlined onClick={() => handleEdit(category)} /></Tooltip>,
                                        <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(category.id)} key="delete">
                                            <DeleteOutlined style={{ color: 'red' }} />
                                        </Popconfirm>,
                                    ]}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        {/* Biểu tượng code */}
                                        <div style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            backgroundColor: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            color: '#555'
                                        }}>
                                            {category.code?.substring(0, 2).toUpperCase()}
                                        </div>
                                        {/* Thông tin */}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{category.name}</p>
                                            <p style={{ margin: '4px 0' }}><b>Code:</b> {category.code}</p>
                                            <p style={{ margin: '4px 0' }}><b>Slug:</b> {category.slug}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page) => fetchCategory(page, pagination.pageSize)}
                            />
                        </div>
                    </>
                )}
            </Spin>

            {/* Modal thêm/sửa */}
            <Modal open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục'}>
                <CategoryForm
                    initialValues={editingCategory}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    categories={categories}
                />

            </Modal>

            {/* Modal chi tiết */}
            <Modal open={!!viewingCategory} onCancel={() => setViewingCategory(null)} centered footer={null} title="Chi tiết danh mục">
                {viewingCategory && (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="ID">{viewingCategory.id}</Descriptions.Item>
                        <Descriptions.Item label="Code">{viewingCategory.code}</Descriptions.Item>
                        <Descriptions.Item label="Tên danh mục">{viewingCategory.name}</Descriptions.Item>
                        <Descriptions.Item label="Slug">{viewingCategory.slug}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{formatDate(viewingCategory.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">{formatDate(viewingCategory.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default CategoryPage;
