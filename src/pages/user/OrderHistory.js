/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, message } from 'antd';
import axios from 'axios';
import { formatCurrency } from '../../utils/helpers';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                    message.error('User không tồn tại');
                    return;
                }

                const user = JSON.parse(storedUser);
                const userId = user.id;

                const res = await axios.get(`${API_URL}/orders/user/${userId}/details`);
                setOrders(res.data.data);
            } catch (error) {
                console.error(error);
                message.error('Lấy lịch sử đơn hàng thất bại');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);


    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatCurrency(Number(price)),
        },
        {
            title: 'Tổng',
            key: 'total',
            render: (_, record) => formatCurrency(Number((record.price * record.quantity))),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Lịch sử đơn hàng của bạn</h2>
            {loading ? (
                <Spin spinning={true} tip="Đang tải...">
                    <div style={{ minHeight: 200 }}></div>
                </Spin>
            ) : orders.length === 0 ? (
                <p>Bạn chưa có đơn hàng nào.</p>
            ) : (
                orders.map((order) => (
                    <Card
                        key={order.id}
                        title={`Đơn hàng #${order.id} - Trạng thái: ${order.status}`}
                        style={{ marginBottom: '20px' }}
                    >
                        <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Ghi chú:</strong> {order.note || '-'}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> {order.shipping_address}</p>
                        <Table
                            columns={columns}
                            dataSource={order.orderItems.map((item) => ({
                                key: item.id,
                                product: item.product.name,
                                quantity: item.quantity,
                                price: item.price,
                            }))}
                            pagination={false}
                        />
                        <h3 style={{ textAlign: 'right', marginTop: '10px' }}>
                            Tổng đơn hàng: {formatCurrency(Number(order.total_price))}
                        </h3>
                    </Card>
                ))
            )}
        </div>
    );
};

export default OrderHistory;
