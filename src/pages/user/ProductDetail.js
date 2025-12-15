/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Typography, Spin, InputNumber, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { CartContext } from './CartContext';
import toast, { Toaster } from 'react-hot-toast';
import 'antd/dist/reset.css';

const { Title, Paragraph } = Typography;
const API_URL = process.env.REACT_APP_API_URL;

const ProductDetail = () => {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchCartCount } = useContext(CartContext);

    const productId = location.state?.id;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    // Lấy sản phẩm
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${API_URL}/products/${slug}`);
                setProduct(res.data.data);
            } catch (err) {
                console.error(err);
                toast.error("Không tải được sản phẩm");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    // Thêm vào giỏ hàng
    const handleAddToCart = async () => {
        if (!productId) {
            toast.error("Không tìm thấy ID sản phẩm!");
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) {
            toast.error('Bạn cần đăng nhập để thêm sản phẩm');
            navigate('/auth/login');
            return;
        }

        const payload = { userId, productId, quantity };

        try {
            const res = await axios.post(`${API_URL}/carts/add`, payload);
            if (res.status === 200 || res.status === 201) {
                toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
                fetchCartCount();
            } else {
                toast.error('Thêm vào giỏ hàng thất bại');
            }
        } catch (err) {
            console.error(err);
            toast.error('Thêm vào giỏ hàng thất bại');
        }
    };

    // Mua ngay
    const handleBuyNow = () => {
        toast.success(`Bạn đang mua ${quantity} sản phẩm "${product.name}"`);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    if (!product) return <div style={{ padding: 24 }}>Sản phẩm không tồn tại</div>;

    return (
        <div style={{ padding: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Toaster position="top-right" /> {/* Toast container */}
            <div style={{ flex: '0 0 400px' }}>
                <img
                    src={product.image ? `${product.image}` : undefined}
                    alt={product.name}
                    style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 8, background: '#f0f0f0' }}
                    onError={(e) => { e.target.src = ''; e.target.style.background = '#f0f0f0'; e.target.alt = 'Chưa có ảnh'; }}
                />
            </div>

            <div style={{ flex: '1 1 400px', maxWidth: 600 }}>
                <Title level={2}>{product.name}</Title>

                {product.discount ? (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ textDecoration: 'line-through', color: '#888', fontSize: 18 }}>
                            {product.originalPrice?.toLocaleString()}đ
                        </div>
                        <div style={{ color: 'red', fontSize: 24, fontWeight: 'bold' }}>
                            {product.finalPrice?.toLocaleString()}đ
                        </div>
                        <div style={{ fontSize: 14, color: '#555' }}>
                            Giảm giá: {product.discount.percentage}% ({product.discount.name})
                        </div>
                    </div>
                ) : (
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                        {product.price?.toLocaleString() || 'Liên hệ'}
                    </div>
                )}

                <Paragraph><strong>Danh mục:</strong> {product.category?.name || 'Không xác định'}</Paragraph>
                <Paragraph><strong>Mô tả:</strong> {product.description || 'Không có mô tả'}</Paragraph>
                <Paragraph><strong>Trạng thái:</strong> {product.is_active ? 'Còn hàng' : 'Hết hàng'}</Paragraph>

                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>Số lượng:</span>
                    <InputNumber min={1} max={100} value={quantity} onChange={setQuantity} />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <Button type="primary" onClick={handleBuyNow}>Mua ngay</Button>
                    <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        disabled={product.is_active === 0}
                        onClick={handleAddToCart}
                    >
                        Thêm vào giỏ
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
