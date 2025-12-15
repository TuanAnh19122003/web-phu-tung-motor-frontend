import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Input, message, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LeftOutlined, RightOutlined, ToolOutlined, SafetyOutlined, DollarOutlined, RocketOutlined } from "@ant-design/icons";
import axios from "axios";
import { formatCurrency } from "../../utils/helpers";

const { Search } = Input;
const { Title, Paragraph } = Typography;

const API_URL = process.env.REACT_APP_API_URL

// Arrow Button
const ArrowButton = ({ onClick, direction }) => {
    const [hover, setHover] = useState(false);
    const styleBase = {
        position: "absolute",
        top: "40%",
        transform: "translateY(-50%)",
        zIndex: 2,
        cursor: "pointer",
        background: hover ? "#d4380d" : "#fff",
        borderRadius: "50%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
    };
    const style = direction === "left" ? { ...styleBase, left: -20 } : { ...styleBase, right: -20 };
    return (
        <div
            style={style}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {direction === "left" ? <LeftOutlined style={{ fontSize: 18, color: hover ? "#fff" : "#333" }} /> :
                <RightOutlined style={{ fontSize: 18, color: hover ? "#fff" : "#333" }} />}
        </div>
    );
};

// Render Price
const renderPrice = (p) => {
    if (!p.price || p.price === 0) return <span style={{ color: "#999" }}>Liên hệ</span>;
    if (p.discount) {
        return (
            <>
                <span style={{ textDecoration: "line-through", color: "#999", marginRight: 8 }}>{formatCurrency(Number(p.price))}</span>
                <span style={{ color: "#d4380d", fontWeight: "bold" }}>{formatCurrency(Number(p.finalPrice))}</span>
            </>
        );
    }
    return <span style={{ color: "#d4380d", fontWeight: "bold" }}>{formatCurrency(Number(p.price))}</span>;
};

// Render Cover
const renderCover = (p) => (
    <div style={{ position: "relative" }}>
        {p.discount && <div style={{ position: "absolute", top: 8, left: 8, background: "#cf1322", color: "#fff", padding: "2px 6px", borderRadius: 6, fontSize: 12, fontWeight: "bold", zIndex: 1 }}>-{p.discount.percentage}%</div>}
        {p.image ? <img src={`${p.image}`} alt={p.name} style={{ height: 160, objectFit: "cover", borderRadius: "12px 12px 0 0", width: "100%" }} /> :
            <div style={{ height: 160, width: "100%", borderRadius: "12px 12px 0 0", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>Chưa có ảnh</div>}
    </div>
);

// Slider Settings
const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    arrows: true,
    swipeToSlide: true,
    draggable: true,
    nextArrow: <ArrowButton direction="right" />,
    prevArrow: <ArrowButton direction="left" />,
    responsive: [
        { breakpoint: 1400, settings: { slidesToShow: 4, slidesToScroll: 4 } },
        { breakpoint: 1100, settings: { slidesToShow: 3, slidesToScroll: 3 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
        { breakpoint: 520, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
};

// Product Card with Hover Effect + Link Wrapper
const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/products/${product.slug}`, { state: { id: product.id } });
    };

    return (
        <Card
            hoverable
            onClick={handleClick}
            style={{
                minWidth: 220,
                maxWidth: 260,
                borderRadius: 12,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                margin: "0 auto",
                cursor: "pointer"
            }}
            cover={renderCover(product)}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            }}
            styles={{
                body: { padding: 16 }
            }}
        >
            <Card.Meta
                title={product.name}
                description={renderPrice(product)}
            />
        </Card>
    );
};

const ProductSlider = ({ title, products }) => {
    if (!products || products.length === 0) return null;

    const isFewProducts = products.length < 6;

    return (
        <div style={{ marginTop: 50 }}>
            <Title level={4}>{title}</Title>

            {isFewProducts ? (
                <div
                    style={{
                        display: "flex",
                        gap: 24,
                        flexWrap: "wrap",
                        rowGap: 28,
                        padding: "0 8px",
                    }}
                >
                    {products.map(product => (
                        <div key={product.id} style={{ minWidth: 220, maxWidth: 260, flex: "1 0 220px" }}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <Slider {...sliderSettings}>
                    {products.map(product => (
                        <div key={product.id} style={{ padding: "0 16px 30px" }}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </Slider>
            )}
        </div>
    );
};

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();

    const fetchSearch = async (keyword) => {
        if (!keyword) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`, { params: { search: keyword } });
            setSearchResults(res.data.data || []);
        } catch (err) {
            message.error("Lỗi khi tìm kiếm sản phẩm");
        } finally { setLoading(false); }
    };

    const onSearch = (value) => {
        const keyword = value.trim();
        setSearchKeyword(keyword);
        if (keyword) { fetchSearch(keyword); navigate(`/search?keyword=${encodeURIComponent(keyword)}`); }
        else setSearchResults([]);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resFeatured = await axios.get(`${API_URL}/products`, { params: { featured: true } });
                setFeaturedProducts(resFeatured.data.data || []);
                const resCategories = await axios.get(`${API_URL}/categories/with-products`);
                setCategories(resCategories.data.data || []);
                console.log(resCategories);

            } catch (err) { console.error("Lỗi khi load home:", err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ textAlign: "center", padding: 40 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: "30px 20px" }}>
            {/* Features */}
            <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 50 }}>
                {[
                    { icon: <ToolOutlined />, title: "Phụ tùng chính hãng", desc: "Sản phẩm nhập khẩu và phân phối chính thức bởi Honda." },
                    { icon: <SafetyOutlined />, title: "Chất lượng đảm bảo", desc: "Đảm bảo độ bền, an toàn cho xe máy." },
                    { icon: <DollarOutlined />, title: "Giá cả cạnh tranh", desc: "Luôn mang đến mức giá tốt nhất." },
                    { icon: <RocketOutlined />, title: "Giao hàng nhanh chóng", desc: "Đặt hàng dễ dàng và nhận hàng nhanh chóng trên toàn quốc." },
                ].map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card hoverable style={{ borderRadius: 16, textAlign: 'center', padding: 20 }}>
                            <div style={{ fontSize: 40, color: '#cf1322', marginBottom: 16 }}>{item.icon}</div>
                            <Title level={4}>{item.title}</Title>
                            <Paragraph style={{ color: '#555' }}>{item.desc}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Search Box */}
            <div style={{ maxWidth: 400, margin: "0 auto 50px" }}>
                <Search placeholder="Tìm kiếm sản phẩm..." enterButton onSearch={onSearch} size="large" />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && <ProductSlider title={`Kết quả tìm kiếm cho "${searchKeyword}"`} products={searchResults} />}

            {/* Featured Products */}
            <ProductSlider title="Sản phẩm nổi bật" products={featuredProducts} />

            {/* Categories */}
            {categories.map(cat => <ProductSlider key={cat.id} title={cat.name} products={cat.products || []} />)}
        </div>
    );
};

export default Home;
