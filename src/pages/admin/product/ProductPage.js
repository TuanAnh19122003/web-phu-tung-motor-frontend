/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Button, message, Modal, Spin, Descriptions, Tag, Input, Space, Switch, Card, Tooltip, Popconfirm, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import axios from 'axios';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import normalizeFileName from '../../../utils/normalizeFileName';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [discountLoading, setDiscountLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6, total: 0 });
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // list | card

    const API_URL = process.env.REACT_APP_API_URL;

    const fetchData = async (page = 1, pageSize = 6, keyword = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`, { params: { page, pageSize, search: keyword || null } });
            const { data, total } = res.data;
            setProducts(data);
            setPagination({ current: page, pageSize, total });
        } catch (err) {
            message.error('Lỗi khi tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategory = async () => {
        setCategoryLoading(true);
        try {
            const res = await axios.get(`${API_URL}/categories`);
            setCategories(res.data.data);
        } catch (err) {
            message.error('Lỗi khi tải danh mục');
        } finally {
            setCategoryLoading(false);
        }
    };

    const fetchDiscount = async () => {
        setDiscountLoading(true);
        try {
            const res = await axios.get(`${API_URL}/discounts`);
            setDiscounts(res.data.data);
        } catch (err) {
            message.error('Lỗi khi tải giảm giá');
        } finally {
            setDiscountLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategory();
        fetchDiscount();
    }, []);

    const handleAdd = () => { setEditingProduct(null); setOpen(true); };
    const handleEdit = (product) => { setEditingProduct(product); setOpen(true); };
    const handleView = (product) => { setViewingProduct(product); };
    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/products/${id}`);
            message.success(res.data.message);
            const isLast = products.length === 1 && pagination.current > 1;
            const newPage = isLast ? pagination.current - 1 : pagination.current;
            fetchData(newPage, pagination.pageSize);
        } catch (err) {
            message.error('Xóa thất bại');
        }
    };

    const handleSubmit = async (product) => {
        try {
            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('price', product.price);
            formData.append('description', product.description || '');
            formData.append('categoryId', product.categoryId);
            if (product.discountId) formData.append('discountId', product.discountId);
            formData.append('is_active', product.is_active ? 1 : 0);

            if (Array.isArray(product.image) && product.image.length > 0) {
                const originalFile = product.image[0].originFileObj;
                const normalizedName = normalizeFileName(originalFile.name);
                const newFile = new File([originalFile], normalizedName, { type: originalFile.type });
                formData.append('image', newFile);
            }

            let res;
            if (editingProduct) {
                res = await axios.put(`${API_URL}/products/${editingProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await axios.post(`${API_URL}/products`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            if (res.data.success) {
                message.success(res.data.message);
                fetchData(pagination.current, pagination.pageSize);
            } else {
                message.error(res.data.message || 'Cập nhật thất bại');
            }
            setOpen(false);
        } catch (err) {
            console.error(err);
            message.error('Thao tác thất bại');
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Danh sách sản phẩm</h2>
                <Space>
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); fetchData(1, pagination.pageSize, e.target.value); }}
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
                </Space>
            </div>

            {/* Nội dung */}
            <Spin spinning={loading}>
                {viewMode === 'list' ? (
                    <ProductList
                        data={products}
                        categories={categories}
                        discounts={discounts}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        pagination={pagination}
                        onPageChange={fetchData}
                        viewMode="list"
                    />
                ) : (
                    <>
                        {/* Card view */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {products.map((product) => (
                                <Card
                                    key={product.id}
                                    size="small"
                                    actions={[
                                        <Tooltip title="Chi tiết" key="view"><EyeOutlined onClick={() => handleView(product)} /></Tooltip>,
                                        <Tooltip title="Chỉnh sửa" key="edit"><EditOutlined onClick={() => handleEdit(product)} /></Tooltip>,
                                        <Popconfirm title={`Xóa sản phẩm "${product.name}"?`} onConfirm={() => handleDelete(product.id)} key="delete">
                                            <DeleteOutlined style={{ color: 'red' }} />
                                        </Popconfirm>
                                    ]}
                                >
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 80, height: 80, backgroundColor: '#f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                                            {product.image ? <img src={`${product.image}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#aaa', fontSize: 12 }}>Không có</span>}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                                            <p style={{ margin: 0 }}>Giá: {formatCurrency(Number(product.price))}</p>
                                            <p style={{ margin: 0 }}>Danh mục: {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}</p>
                                            <p style={{ margin: 0 }}>Giảm giá: {discounts.find(d => d.id === product.discountId)?.name || 'Không'}</p>
                                            <p style={{ margin: 0 }}>Trạng thái: {product.is_active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination cho card view */}
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page) => fetchData(page, pagination.pageSize)}
                            />
                        </div>
                    </>
                )}
            </Spin>

            {/* Modal thêm/sửa */}
            <Modal open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose title={editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}>
                <ProductForm
                    initialValues={editingProduct}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    categories={categories}
                    discounts={discounts}
                    categoryLoading={categoryLoading}
                    discountLoading={discountLoading}
                />
            </Modal>

            {/* Modal chi tiết */}
            <Modal open={!!viewingProduct} onCancel={() => setViewingProduct(null)} centered footer={null} title="Chi tiết sản phẩm">
                {viewingProduct && (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="ID">{viewingProduct.id}</Descriptions.Item>
                        <Descriptions.Item label="Tên">{viewingProduct.name}</Descriptions.Item>
                        <Descriptions.Item label="Slug">{viewingProduct.slug}</Descriptions.Item>
                        <Descriptions.Item label="Ảnh">
                            {viewingProduct.image ? (
                                <img
                                    src={`${viewingProduct.image}`}
                                    alt="product"
                                    style={{
                                        width: 150,
                                        height: 150,
                                        objectFit: 'contain',
                                        borderRadius: 8,
                                        border: '1px solid #ccc'
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#aaa' }}>Không có ảnh</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá">{formatCurrency(Number(viewingProduct.price))}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả">{viewingProduct.description}</Descriptions.Item>
                        <Descriptions.Item label="Danh mục">{categories.find(c => c.id === viewingProduct.categoryId)?.name || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Giảm giá">{discounts.find(d => d.id === viewingProduct.discountId)?.name || 'Không'}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">{viewingProduct.is_active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{formatDate(viewingProduct.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">{formatDate(viewingProduct.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ProductPage;
