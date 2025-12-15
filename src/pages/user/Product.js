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
        <div style={{ 
            padding: '30px 20px',
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)'
        }}>
            <Toaster position="top-right" /> {/* Component hiển thị toast */}
            <Row gutter={24}>
                {/* Cột trái: Filters */}
                <Col xs={24} md={6}>
                    <div style={{
                        background: '#fff',
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'sticky',
                        top: 20
                    }}>
                        <Title level={4} style={{ marginBottom: 20, color: '#cf1322' }}>Lọc sản phẩm</Title>
                        <Search
                            placeholder="Tìm kiếm..."
                            onSearch={(value) => setFilters({ ...filters, keyword: value })}
                            style={{ marginBottom: 24 }}
                            size="large"
                        />
                        <Title level={5} style={{ marginBottom: 12, fontSize: 15 }}>Phân loại phụ tùng</Title>
                        <Checkbox.Group
                            options={categories}
                            value={filters.category}
                            onChange={(checked) => setFilters({ ...filters, category: checked })}
                            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}
                        />
                        <Title level={5} style={{ marginBottom: 12, fontSize: 15 }}>Giá sản phẩm</Title>
                        <Slider
                            range
                            min={0}
                            max={10000000}
                            step={100000}
                            value={filters.price}
                            onChange={(value) => setFilters({ ...filters, price: value })}
                            tooltipVisible
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ 
                            color: '#666', 
                            fontSize: 13,
                            background: '#f5f5f5',
                            padding: '8px 12px',
                            borderRadius: 6
                        }}>
                            <strong>Giá:</strong> {formatCurrency(filters.price[0])} - {formatCurrency(filters.price[1])}
                        </div>
                    </div>
                </Col>

                {/* Cột phải: Products */}
                <Col xs={24} md={18}>
                    <Title level={4} style={{ 
                        marginBottom: 24,
                        paddingBottom: 12,
                        borderBottom: '2px solid #cf1322'
                    }}>
                        Tất cả sản phẩm
                        <span style={{ 
                            fontSize: 14, 
                            color: '#999', 
                            fontWeight: 'normal',
                            marginLeft: 12
                        }}>
                            ({products.length} sản phẩm)
                        </span>
                    </Title>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[24, 24]}>
                            {products.map(p => (
                                <Col xs={12} sm={8} md={6} key={p.id}>
                                    <Card
                                        hoverable
                                        onClick={() => handleClickProduct(p)}
                                        style={{
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                        }}
                                        cover={
                                            <div style={{ position: 'relative' }}>
                                                {p.discount && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        left: 8,
                                                        background: '#cf1322',
                                                        color: '#fff',
                                                        padding: '4px 8px',
                                                        borderRadius: 6,
                                                        fontSize: 12,
                                                        fontWeight: 'bold',
                                                        zIndex: 1
                                                    }}>
                                                        -{p.discount.percentage}%
                                                    </div>
                                                )}
                                                {p.image ? (
                                                    <img
                                                        src={`${p.image}`}
                                                        alt={p.name}
                                                        style={{ 
                                                            height: 180, 
                                                            width: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        height: 180,
                                                        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#999',
                                                        fontSize: 14
                                                    }}>
                                                        Chưa có ảnh
                                                    </div>
                                                )}
                                            </div>
                                        }
                                        styles={{
                                            body: { padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }
                                        }}
                                    >
                                        <Card.Meta
                                            title={
                                                <div style={{ 
                                                    fontSize: 14, 
                                                    fontWeight: 500,
                                                    marginBottom: 8,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    minHeight: 40
                                                }}>
                                                    {p.name}
                                                </div>
                                            }
                                            description={
                                                <div style={{ marginTop: 8 }}>
                                                    {p.discount ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                            <span style={{ 
                                                                textDecoration: 'line-through', 
                                                                color: '#999',
                                                                fontSize: 13
                                                            }}>
                                                                {formatCurrency(Number(p.originalPrice))}
                                                            </span>
                                                            <span style={{ 
                                                                color: '#d4380d', 
                                                                fontWeight: 'bold',
                                                                fontSize: 16
                                                            }}>
                                                                {formatCurrency(Number(p.finalPrice))}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ 
                                                            color: p.price ? '#d4380d' : '#999',
                                                            fontWeight: 'bold',
                                                            fontSize: 16
                                                        }}>
                                                            {p.price ? formatCurrency(Number(p.price)) : "Liên hệ"}
                                                        </span>
                                                    )}
                                                </div>
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
