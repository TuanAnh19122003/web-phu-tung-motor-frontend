/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Button, message, Modal, Spin, Descriptions, Card, Tooltip, Pagination, Popconfirm, Switch, Tag } from 'antd';
import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import OrderList from './OrderList';
import OrderForm from './OrderForm';

const statusColors = {
    pending: 'orange',
    paid: 'blue',
    shipped: 'cyan',
    completed: 'green',
    cancelled: 'red'
};

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6, total: 0 });
    const [viewMode, setViewMode] = useState('list'); // list | card

    const API_URL = process.env.REACT_APP_API_URL;

    const fetchOrders = async (page = 1, pageSize = 6) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/orders`, { params: { page, pageSize } });
            setOrders(res.data.data);
            setPagination({ current: page, pageSize, total: res.data.total });
        } catch (err) {
            message.error('Lỗi khi tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`${API_URL}/orders/status`, {
                orderId,
                status: newStatus,
            });

            if (res.data.success) {
                message.success('Cập nhật trạng thái thành công');
                fetchOrders(pagination.current, pagination.pageSize);
            } else {
                message.error(res.data.message || 'Cập nhật trạng thái thất bại');
            }
        } catch (err) {
            console.error(err);
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data.data);
        } catch (err) { }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data.data);
        } catch (err) { }
    };

    useEffect(() => {
        fetchOrders();
        fetchUsers();
        fetchProducts();
    }, []);

    const handleAdd = () => { setEditingOrder(null); setOpen(true); };
    const handleEdit = (order) => { setEditingOrder(order); setOpen(true); };
    const handleView = (order) => { setViewingOrder(order); };
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/orders/${id}`);
            message.success('Xóa đơn hàng thành công');
            const isLast = orders.length === 1 && pagination.current > 1;
            fetchOrders(isLast ? pagination.current - 1 : pagination.current, pagination.pageSize);
        } catch { message.error('Xóa thất bại'); }
    };

    const handleSubmit = async (order) => {
        const items = order.items || order.order_item?.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price
        })) || [];

        const payload = {
            userId: order.userId,
            totalPrice: order.total_price,
            shipping_address: order.shipping_address,
            note: order.note || '',
            items
        };

        try {
            if (editingOrder) await axios.put(`${API_URL}/orders/${editingOrder.id}`, payload);
            else await axios.post(`${API_URL}/orders`, payload);
            message.success('Thao tác thành công');
            fetchOrders(pagination.current, pagination.pageSize);
            setOpen(false);
        } catch (err) {
            message.error('Lỗi khi gửi dữ liệu');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Đơn hàng</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Switch
                        style={{ marginTop: 5 }}
                        checkedChildren={<AppstoreOutlined />}
                        unCheckedChildren={<UnorderedListOutlined />}
                        checked={viewMode === 'card'}
                        onChange={checked => setViewMode(checked ? 'card' : 'list')}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm đơn hàng</Button>
                </div>
            </div>

            <Spin spinning={loading}>
                {viewMode === 'list' ? (
                    <OrderList
                        data={orders}
                        users={users}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        pagination={pagination}
                        onPageChange={fetchOrders}
                        onUpdateStatus={handleUpdateStatus}
                    />
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {orders.map(order => {
                                const user = users.find(u => u.id === order.userId);
                                return (
                                    <Card
                                        key={order.id}
                                        size="small"
                                        title={`#${order.id}`}
                                        actions={[
                                            <Tooltip title="Xem chi tiết" key="view"><EyeOutlined onClick={() => handleView(order)} /></Tooltip>,
                                            <Tooltip title="Chỉnh sửa" key="edit"><EditOutlined onClick={() => handleEdit(order)} /></Tooltip>,
                                            <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(order.id)} key="delete">
                                                <DeleteOutlined style={{ color: 'red' }} />
                                            </Popconfirm>,
                                        ]}
                                    >
                                        <p><b>Khách hàng:</b> {user ? `${user.lastname} ${user.firstname}` : 'Không xác định'}</p>
                                        <p><b>Trạng thái:</b> <Tag color={statusColors[order.status]}>{order.status}</Tag></p>
                                        <p><b>Tổng tiền:</b> {formatCurrency(Number(order.total_price))}</p>
                                        <p><b>Ngày đặt:</b> {formatDate(order.createdAt)}</p>
                                    </Card>
                                );
                            })}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={page => fetchOrders(page, pagination.pageSize)}
                            />
                        </div>
                    </>
                )}
            </Spin>

            {/* Modal tạo/sửa */}
            <Modal open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose title={editingOrder ? 'Cập nhật đơn hàng' : 'Thêm đơn hàng'}>
                <OrderForm
                    initialValues={editingOrder}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    users={users}
                    products={products}
                />
            </Modal>

            {/* Modal chi tiết */}
            <Modal open={!!viewingOrder} onCancel={() => setViewingOrder(null)} footer={null} width={700} centered title="Chi tiết đơn hàng">
                {viewingOrder && (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="ID">{viewingOrder.id}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{users.find(u => u.id === viewingOrder.userId)?.lastname + ' ' + users.find(u => u.id === viewingOrder.userId)?.firstname || 'Không xác định'}</Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">{formatCurrency(Number(viewingOrder.total_price))}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái"><Tag color={statusColors[viewingOrder.status]}>{viewingOrder.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Sản phẩm">
                            {viewingOrder.items?.map((item, index) => (
                                <div key={index} style={{ marginBottom: 8 }}>
                                    <strong>{item.product?.name}</strong><br />
                                    SL: {item.quantity} | Đơn giá: {formatCurrency(item.price)} | Tổng: {formatCurrency(item.price * item.quantity)}
                                </div>
                            ))}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">{viewingOrder.note || 'Không có'}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{formatDate(viewingOrder.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Cập nhật gần nhất">{formatDate(viewingOrder.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default OrderPage;
