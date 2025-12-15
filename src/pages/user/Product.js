/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Input, Checkbox, Slider, Typography, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast'; // import toast
import 'antd/dist/reset.css';
import { formatCurrency } from '../../utils/helpers';

const { Title } = Typography;
const { Search } = Input;

const API_URL = process.env.REACT_APP_API_URL;

const Product = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: [],
        price: [0, 10000000],
        keyword: ''
    });

    // Lấy sản phẩm
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`, {
                params: {
                    categories: filters.category.join(','),
                    priceMin: filters.price[0],
                    priceMax: filters.price[1],
                    search: filters.keyword
                }
            });
            setProducts(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi tải sản phẩm"); // toast hiển thị lỗi
        } finally {
            setLoading(false);
        }
    };

    // Lấy categories từ API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_URL}/categories`);
                setCategories(res.data.data.map(cat => cat.name));
            } catch (err) {
                console.error(err);
                toast.error("Lỗi khi tải danh mục"); // toast lỗi
            }
        };
        fetchCategories();
    }, []);

    // Reload sản phẩm khi filters thay đổi
    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const handleClickProduct = (product) => {
        navigate(`/products/${product.slug}`, { state: { id: product.id } });
    };

    return (
        <div style={{ padding: 24 }}>
            <Toaster position="top-right" /> {/* Component hiển thị toast */}
            <Row gutter={24}>
                {/* Cột trái: Filters */}
                <Col xs={24} md={6}>
                    <Title level={4}>Lọc sản phẩm</Title>
                    <Search
                        placeholder="Tìm kiếm..."
                        onSearch={(value) => setFilters({ ...filters, keyword: value })}
                        style={{ marginBottom: 16 }}
                    />
                    <Title level={5}>Phân loại phụ tùng</Title>
                    <Checkbox.Group
                        options={categories}
                        value={filters.category}
                        onChange={(checked) => setFilters({ ...filters, category: checked })}
                        style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}
                    />
                    <Title level={5}>Giá sản phẩm</Title>
                    <Slider
                        range
                        min={0}
                        max={10000000}
                        step={1000}
                        value={filters.price}
                        onChange={(value) => setFilters({ ...filters, price: value })}
                        tooltipVisible
                        style={{ marginBottom: 16 }}
                    />
                    <div>Giá: {filters.price[0].toLocaleString()}đ - {filters.price[1].toLocaleString()}đ</div>
                </Col>

                {/* Cột phải: Products */}
                <Col xs={24} md={18}>
                    <Title level={4}>Tất cả sản phẩm</Title>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {products.map(p => (
                                <Col xs={12} sm={8} md={6} key={p.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            p.image ? (
                                                <img
                                                    src={`${process.env.REACT_APP_API_IMAGE}/${p.image}`}
                                                    alt={p.name}
                                                    style={{ height: 150, objectFit: 'cover', cursor: 'pointer' }}
                                                    onClick={() => handleClickProduct(p)}
                                                />
                                            ) : (
                                                <div style={{
                                                    height: 150,
                                                    background: '#f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#999',
                                                    cursor: 'pointer'
                                                }} onClick={() => handleClickProduct(p)}>
                                                    Chưa có ảnh
                                                </div>
                                            )
                                        }
                                    >
                                        <Card.Meta
                                            title={<div style={{ cursor: 'pointer' }} onClick={() => handleClickProduct(p)}>{p.name}</div>}
                                            description={
                                                p.discount ? (
                                                    <div>
                                                        <div style={{ textDecoration: 'line-through', color: '#888' }}>
                                                            {formatCurrency(Number(p.originalPrice))}
                                                        </div>
                                                        <div style={{ color: 'red', fontWeight: 'bold' }}>
                                                            {formatCurrency(Number(p.finalPrice))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    p.price ? formatCurrency(Number(p.price)) : "Liên hệ"
                                                )
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default Product;
