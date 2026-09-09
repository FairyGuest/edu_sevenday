import { useEffect, useState, useImperativeHandle } from "react";
import { useRequest } from "umi";
import { Button, DatePicker, Drawer, Form, Upload, Select, Switch } from "antd";
import { ZYIcon } from "@/components";

import "./index.less";
const { Dragger } = Upload;
const CreateCard = (props: any) => {
  const { onRef } = props;

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  // 定义父调用子的钩子函数
  useImperativeHandle(onRef, () => ({
    // 父组件的方法
    openModal: (record?: any) => {
      setVisible(true);
    },
  }));
  // 处理文件上传
  const normFile = (e: any) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Drawer
      width={500}
      open={visible}
      title="创建讲授课"
      placement="right"
      className="assessment-card"
      onClose={() => setVisible(false)}
      footer={
        <div className="assessment-card-footer">
          <Switch defaultChecked />
          <span style={{ marginLeft: "-6px" }}>自动提交</span>
          <Button onClick={() => setVisible(false)}>取消</Button>
          <Button type="primary" htmlType="submit" form="createForm">
            提交分析
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="存储目录"
          rules={[{ required: true, message: "请选择存储目录" }]}
        >
          <Select placeholder="请选择存储目录" />
        </Form.Item>
        <Form.Item
          name="time"
          label="上课时间"
          rules={[{ required: true, message: "请选择日期时间" }]}
        >
          <DatePicker
            title="请选择日期时间"
            showTime
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="class"
          label="上课班级"
          rules={[{ required: true, message: "请选择上课班级" }]}
        >
          <Select placeholder="请选择上课班级" />
        </Form.Item>
        <Form.Item
          name="teacher"
          label="任课老师"
          rules={[{ required: true, message: "请选择任课老师" }]}
        >
          <Select placeholder="请选择任课老师" />
        </Form.Item>
        <Form.Item
          name="file"
          label="上传教案"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "请上传教案" }]}
        >
          <Dragger
            action={`${process.env.REACT_APP_BASE_URL}/api/upload/file`}
            headers={{}}
            listType="picture-card"
            showUploadList={false}
          >
            <div className="up_top">
              <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
            </div>
            <p className="up_text">
              拖入或 <span>选择文件</span> 上传
            </p>
            <p className="up_desc">
              支持以下文件:Pdf、Txt、Doc、Docx、Xls、Xlsx、Ppt、Pptx、Md格式，大小不超过30M，且仅可上传一个文件。
            </p>
            <p className="up_desc">
              支持以下图片:Jpg、Jpeg、Png、Bmp、Gif格式，最多上传10张图片。
            </p>
            <p className="up_desc">文件和图片不能同时上传。</p>
          </Dragger>
        </Form.Item>
        <Form.Item
          name="video_teacher"
          label="上传教师视角视频"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "请上传教师视角视频" }]}
        >
          <Dragger
            action={`${process.env.REACT_APP_BASE_URL}/api/upload/file`}
            headers={{}}
            listType="picture-card"
            showUploadList={false}
          >
            <div className="up_top">
              <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
            </div>
            <p className="up_text">
              拖入或 <span>选择文件</span> 上传
            </p>
            <p className="up_desc">
              文件支持: Mp4格式，时长不超过1小时，大小不超过2G
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item
          name="video_student"
          label="上传学生视角视频"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "请上传学生视角视频" }]}
        >
          <Dragger
            action={`${process.env.REACT_APP_BASE_URL}/api/upload/file`}
            headers={{}}
            listType="picture-card"
            showUploadList={false}
          >
            <div className="up_top">
              <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
            </div>
            <p className="up_text">
              拖入或 <span>选择文件</span> 上传
            </p>
            <p className="up_desc">
              文件支持: Mp4格式，时长不超过1小时，大小不超过2G
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateCard;
