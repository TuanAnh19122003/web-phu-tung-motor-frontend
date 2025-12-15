import React from 'react'
import { Table, Button, Tag, Dropdown } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { formatCurrency } from '../../../utils/helpers';

const ProductList = ({ data, onEdit, onDelete, onView, pagination, onPageChange, categories, discounts }) => {
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            render: (_, __, index) => (
                <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
            ),
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price) => `${formatCurrency(Number(price))}`,
        },
        {
            title: "Danh mục",
            dataIndex: "categoryId",
            key: "categoryId",
            render: (categoryId) => (categories?.find(r => r.id === categoryId)?.name || "Không xác định"),
        },
        {
            title: "Giảm giá",
            dataIndex: "discountId",
            key: "discountId",
            render: (discountId) => (discounts?.find(r => r.id === discountId)?.name || "Không có giảm giá")
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (active) =>
                active ? (
                    <Tag color="green">Hoạt động</Tag>
                ) : (
                    <Tag color="red">Ngừng hoạt động</Tag>
                ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                const items = [
                    {
                        key: 'view',
                        label: (
                            <div onClick={() => onView(record)}>
                                <EyeOutlined style={{ marginRight: 8 }} /> Xem chi tiết
                            </div>
                        ),
                    },
                    {
                        key: 'edit',
                        label: (
                            <div onClick={() => onEdit(record)}>
                                <EditOutlined style={{ marginRight: 8 }} /> Chỉnh sửa
                            </div>
                        ),
                    },
                    {
                        key: 'delete',
                        label: (
                            <div
                                onClick={() => onDelete(record.id)}
                                style={{ color: 'red' }}
                            >
                                <DeleteOutlined style={{ marginRight: 8 }} /> Xóa
                            </div>
                        ),
                    },
                ];

                return (
                    <Dropdown
                        menu={{ items }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button shape="circle" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        }
    ];

    return (
        <Table
            rowKey="id"
            dataSource={data}
            columns={columns}
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
                onChange: (page, pageSize) => onPageChange(page, pageSize)
            }}
        />
    )
}

export default ProductList
