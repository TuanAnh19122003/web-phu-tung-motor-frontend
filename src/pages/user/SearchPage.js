/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Pagination, message } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const API_URL = process.env.REACT_APP_API_URL;

// 👉 render giá
const renderPrice = (p) => {
    if (!p.price || p.price === 0) return <span style={{ color: "#999" }}>Liên hệ</span>;

    if (p.discount) {
        return (
            <>
                <span style={{ textDecoration: "line-through", color: "#999", marginRight: 8 }}>
                    {p.price?.toLocaleString()}đ
                </span>
                <span style={{ color: "#d4380d", fontWeight: "bold" }}>
                    {p.finalPrice?.toLocaleString()}đ
                </span>
            </>
        );
    }

    return <span style={{ color: "#d4380d", fontWeight: "bold" }}>{p.price?.toLocaleString()}đ</span>;
};

// 👉 render ảnh
const renderCover = (p) => (
    <div style={{ position: "relative" }}>
        {p.discount && (
            <div
                style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "#cf1322",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: "bold",
                    zIndex: 1,
                }}
            >
                -{p.discount.percentage}%
            </div>
        )}
        {p.image ? (
            <img
                src={`${p.image}`}
                alt={p.name}
                style={{ height: 160, objectFit: "cover", borderRadius: "12px 12px 0 0", width: "100%" }}
            />
        ) : (
            <div
                style={{
                    height: 160,
                    width: "100%",
                    borderRadius: "12px 12px 0 0",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 14,
                }}
            >
                Chưa có ảnh
            </div>
        )}
    </div>
);

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6, total: 0 });

    const fetchData = async (page = 1, pageSize = 6) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`, {
                params: { page, pageSize, search: keyword || null },
            });
            const { data, total } = res.data;
            setProducts(data);
            setPagination({ current: page, pageSize, total });
        } catch (err) {
            message.error("Lỗi khi tải sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize);
    }, [keyword]);

    const handlePageChange = (page, pageSize) => {
        fetchData(page, pageSize);
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <Title level={4}>Kết quả tìm kiếm cho "{keyword}"</Title>
            {products.length === 0 ? (
                <p>Không tìm thấy sản phẩm nào.</p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {products.map((p) => (
                        <Card hoverable key={p.id} cover={renderCover(p)} style={{ borderRadius: 12 }}>
                            <Card.Meta title={<Link to={`/products/${p.id}`}>{p.name}</Link>} description={renderPrice(p)} />
                        </Card>
                    ))}
                </div>
            )}

            {pagination.total > pagination.pageSize && (
                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default SearchPage;
