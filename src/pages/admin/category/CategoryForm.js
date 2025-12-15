import React from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import slugify from 'slugify';

const CategoryForm = ({ initialValues, onSubmit, onCancel, categories }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        // Kiểm tra trùng code
        const isCodeExist = categories.some(
            (c) => c.code === values.code && c.id !== initialValues?.id
        );
        if (isCodeExist) {
            message.error("Mã danh mục đã tồn tại!");
            return;
        }

        // Kiểm tra trùng name
        const isNameExist = categories.some(
            (c) => c.name.toLowerCase() === values.name.toLowerCase() && c.id !== initialValues?.id
        );
        if (isNameExist) {
            message.error("Tên danh mục đã tồn tại!");
            return;
        }

        // Tự sinh slug
        const slug = slugify(values.name, { lower: true, strict: true });
        onSubmit({ ...values, slug });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues || {}}
            onFinish={handleFinish}
        >
            <Form.Item
                name="code"
                label="Mã danh mục"
                rules={[{ required: true, message: 'Vui lòng nhập mã danh mục!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                        Lưu
                    </Button>
                    <Button onClick={onCancel} icon={<CloseOutlined />}>
                        Hủy
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default CategoryForm;
