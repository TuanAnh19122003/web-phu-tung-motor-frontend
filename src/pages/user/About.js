import React from 'react';
import { Row, Col, Typography, Card, Button, Tag } from 'antd';
import {
    ToolOutlined,
    SafetyOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const About = () => {
    return (
        <div style={{ background: '#f0f2f5', padding: '60px 20px' }}>
            {/* Hero Section */}
            <div
                style={{
                    background: 'linear-gradient(to right, #cf1322, #ff4d4f)',
                    borderRadius: 20,
                    padding: '60px 40px',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: 60
                }}
            >
                <Title level={1} style={{ color: 'white', marginBottom: 20 }}>Honda Shop</Title>
                <Paragraph style={{ fontSize: 18, color: '#fff', maxWidth: 700, margin: '0 auto' }}>
                    Chuyên cung cấp phụ tùng xe máy Honda chính hãng, chất lượng đảm bảo, giá cả hợp lý và dịch vụ uy tín hàng đầu.
                </Paragraph>
                <Button type="primary" size="large" style={{ marginTop: 24, background: '#fff', color: '#cf1322' }}>
                    Xem sản phẩm
                </Button>
            </div>

            {/* Features Section */}
            <Row gutter={[24, 24]} justify="center">
                {[
                    { icon: <ToolOutlined />, title: 'Phụ tùng chính hãng', desc: 'Sản phẩm được nhập khẩu và phân phối bởi Honda.' },
                    { icon: <SafetyOutlined />, title: 'Chất lượng đảm bảo', desc: 'Đảm bảo độ bền và an toàn cho xe máy.' },
                    { icon: <DollarOutlined />, title: 'Giá cả cạnh tranh', desc: 'Luôn mang đến mức giá tốt nhất cho khách hàng.' },
                ].map((item, index) => (
                    <Col xs={24} md={8} key={index}>
                        <Card
                            hoverable
                            style={{ borderRadius: 16, textAlign: 'center', padding: 20 }}
                        >
                            <div style={{ fontSize: 40, color: '#cf1322', marginBottom: 16 }}>{item.icon}</div>
                            <Title level={4}>{item.title}</Title>
                            <Paragraph style={{ color: '#555' }}>{item.desc}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Info Section */}
            <Row gutter={[32, 32]} style={{ marginTop: 60 }}>
                <Col xs={24} md={12}>
                    <Card style={{ borderRadius: 16, padding: 24, minHeight: 250 }}>
                        <Title level={4}><ClockCircleOutlined style={{ marginRight: 8 }} /> Giờ làm việc</Title>
                        <ul style={{ paddingLeft: 20, marginTop: 16 }}>
                            <li>Thứ 2 - Thứ 7: 08:00 - 20:00</li>
                            <li>Chủ nhật: 08:00 - 18:00</li>
                        </ul>
                        <Tag color="red" style={{ marginTop: 16 }}>Vui lòng gọi trước khi đến</Tag>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card style={{ borderRadius: 16, padding: 24, minHeight: 250 }}>
                        <Title level={4}><EnvironmentOutlined style={{ marginRight: 8 }} /> Liên hệ</Title>
                        <Paragraph>
                            <Text strong>Địa chỉ:</Text> 456 Honda Street, Quận 5, TP. Hồ Chí Minh
                        </Paragraph>
                        <Paragraph>
                            <PhoneOutlined /> <Text strong>0909 123 456</Text>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>

            {/* Map Section */}
            <div style={{ marginTop: 60 }}>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>Vị trí trên bản đồ</Title>
                <iframe
                    title="Honda Shop Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.681!3d10.762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x123456789%3A0xabcdef!2sHonda%20Shop!5e0!3m2!1sen!2s!4v1718800000000!5m2!1sen!2s"
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: 16 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        </div>
    );
};

export default About;
