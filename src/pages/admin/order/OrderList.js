import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Modal, Select } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'orange' },
    { value: 'paid', label: 'Đã thanh toán', color: 'blue' },
    { value: 'shipped', label: 'Đã giao', color: 'cyan' },
    { value: 'completed', label: 'Hoàn thành', color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', color: 'red' },
];

const OrderList = ({ data, users, onView, onEdit, onDelete, onUpdateStatus, pagination, onPageChange }) => {
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        setSelectedStatus(order.status);
        setStatusModalVisible(true);
    };

    const updateStatus = () => {
        if (selectedOrder && selectedStatus !== selectedOrder.status) {
            onUpdateStatus(selectedOrder.id, selectedStatus);
        }
        setStatusModalVisible(false);
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {
            title: "Khách hàng",
            dataIndex: "userId",
            key: "userId",
            render: userId => {
                const user = users?.find(u => u.id === userId);
                return user ? `${user.lastname} ${user.firstname}` : "Không xác định";
            }
        },
        {
            title: "Tổng tiền",
            dataIndex: "total_price",
            key: "total_price",
            render: price => formatCurrency(Number(price))
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                const current = statusOptions.find(s => s.value === status) || { label: status, color: 'default' };
                return (
                    <Tag
                        color={current.color}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openStatusModal(record)}
                    >
                        {current.label}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày đặt",
            dataIndex: "createdAt",
            key: "createdAt",
            render: date => formatDate(date)
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                const items = [
                    { key: 'view', label: <div onClick={() => onView(record)}><EyeOutlined /> Xem chi tiết</div> },
                    { key: 'edit', label: <div onClick={() => onEdit(record)}><EditOutlined /> Chỉnh sửa</div> },
                    { key: 'delete', label: <div onClick={() => onDelete(record.id)} style={{ color: 'red' }}><DeleteOutlined /> Xóa</div> },
                ];

                return <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                    <Button shape="circle" icon={<MoreOutlined />} />
                </Dropdown>;
            }
        }
    ];

    return (
        <>
            <Table
                rowKey="id"
                dataSource={data}
                columns={columns}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: false,
                    onChange: onPageChange
                }}
            />

            <Modal
                title="Cập nhật trạng thái đơn hàng"
                open={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                onOk={updateStatus}
                okText="Cập nhật"
                cancelText="Hủy"
                centered
            >
                <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: '100%' }}>
                    {statusOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                            <Tag color={option.color} style={{ marginRight: 8 }}>{option.label}</Tag>
                            {option.label}
                        </Select.Option>
                    ))}
                </Select>
            </Modal>
        </>
    );
};

export default OrderList;
