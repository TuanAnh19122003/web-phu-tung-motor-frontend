/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
    Card, Col, Row, Table, Typography, Tag, message, Button
} from 'antd';
import axios from 'axios';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'];

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchData = () => {
            axios.get(`${API_URL}/products`)
                .then(res => setProducts(res.data.data))
                .catch(() => message.error('Không tải được danh sách sản phẩm'));

            axios.get(`${API_URL}/categories`)
                .then(res => setCategories(res.data.data))
                .catch(() => message.error('Không tải được danh mục'));

            axios.get(`${API_URL}/orders`)
                .then(res => setOrders(res.data.data || []))
                .catch(() => message.error('Không tải được đơn hàng'));
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Tính toán dữ liệu thống kê
    const revenueByMonth = {};
    const orderByMonth = {};
    const statusCounts = {};
    const revenueByDate = {};

    orders.forEach(order => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + Number(order.total_price || 0);
        orderByMonth[monthKey] = (orderByMonth[monthKey] || 0) + 1;
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

        const dayKey = date.toLocaleDateString('vi-VN');
        revenueByDate[dayKey] = (revenueByDate[dayKey] || 0) + Number(order.total_price || 0);
    });

    const orderData = Object.keys(orderByMonth).map(key => ({ month: key, orders: orderByMonth[key] }));
    const revenueData = Object.keys(revenueByMonth).map(key => ({ month: key, revenue: revenueByMonth[key] }));
    const revenueByDateData = Object.keys(revenueByDate).map(date => ({
        date,
        revenue: revenueByDate[date]
    })).sort((a, b) => {
        const [d1, m1, y1] = a.date.split('/').map(Number);
        const [d2, m2, y2] = b.date.split('/').map(Number);
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

    const statusData = Object.keys(statusCounts).map((status, i) => ({
        name: status.toUpperCase(),
        value: statusCounts[status],
        color: COLORS[i % COLORS.length],
    }));

    const columns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Danh mục', dataIndex: ['category', 'name'], key: 'category_name', render: category => <Tag color="blue">{category}</Tag> },
        { title: 'Giá bán', dataIndex: 'finalPrice', key: 'final_price', render: price => <Text strong>{Number(price).toLocaleString()} đ</Text> },
        { title: 'Giảm giá (%)', dataIndex: ['discount', 'percentage'], key: 'discount_percentage', render: percent => percent ? `${percent}%` : 'Không' },
    ];

    // Xuất Excel
    const exportProducts = () => {
        if (!products.length) return;
        const data = products.map(p => ({
            "Tên sản phẩm": p.name,
            "Danh mục": p.category?.name || '',
            "Giá bán": Number(p.finalPrice) || 0,
            "Giảm giá (%)": p.discount?.percentage || 0,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "products.xlsx");
    };

    const exportOrders = () => {
        if (!orders.length) return;
        const data = orders.map(o => ({
            "Mã đơn": o.id,
            "Ngày tạo": new Date(o.createdAt).toLocaleDateString("vi-VN"),
            "Tổng tiền": Number(o.total_price) || 0,
            "Trạng thái": o.status,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "orders.xlsx");
    };

    const exportRevenueByMonth = () => {
        if (!revenueData.length) return;
        const data = revenueData.map(item => ({
            "Tháng": item.month,
            "Doanh thu": Number(item.revenue) || 0
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Doanh thu theo tháng");
        saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "revenue_by_month.xlsx");
    };

    const exportRevenueByDate = () => {
        if (!revenueByDateData.length) return;
        const data = revenueByDateData.map(item => ({
            "Ngày": item.date,
            "Doanh thu": Number(item.revenue) || 0
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Doanh thu theo ngày");
        saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "revenue_by_date.xlsx");
    };

    return (
        <div style={{ padding: 24 }}>
            {/* Summary cards */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Card hoverable>
                        <Title level={4}>Tổng số sản phẩm</Title>
                        <Text style={{ fontSize: 24 }}>{products.length}</Text>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable>
                        <Title level={4}>Tổng số danh mục</Title>
                        <Text style={{ fontSize: 24 }}>{categories.length}</Text>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable>
                        <Title level={4}>Tổng số đơn hàng</Title>
                        <Text style={{ fontSize: 24 }}>{orders.length}</Text>
                    </Card>
                </Col>
            </Row>

            {/* Hàng sơ đồ 3 biểu đồ */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Card title="Số lượng đơn hàng theo tháng" extra={<Button onClick={exportOrders}>Xuất Excel</Button>}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={orderData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Doanh thu theo tháng" extra={<Button onClick={exportRevenueByMonth}>Xuất Excel</Button>}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={revenueData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={value => Number(value).toLocaleString() + ' đ'} />
                                <Bar dataKey="revenue" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Doanh thu theo ngày" extra={<Button onClick={exportRevenueByDate}>Xuất Excel</Button>}>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={revenueByDateData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={value => Number(value).toLocaleString() + ' đ'} />
                                <Line type="monotone" dataKey="revenue" stroke="#faad14" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ trạng thái đơn hàng */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col xs={24}>
                    <Card title="Tỷ lệ trạng thái đơn hàng">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="40%"
                                    cy="50%"
                                    outerRadius={110}
                                    innerRadius={60}
                                    paddingAngle={3}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={value => [`${value} đơn`, ""]} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Bảng sản phẩm */}
            <Card title="Danh sách sản phẩm" extra={<Button onClick={exportProducts}>Xuất Excel</Button>}>
                <Table
                    dataSource={products}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
