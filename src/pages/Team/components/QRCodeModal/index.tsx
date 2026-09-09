import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect, useDispatch } from '@umijs/max';
import {  Modal,  message,  QRCode } from 'antd';
import { getOrgId } from "@/utils";

const App = (props: any) => {

  const { onRef, teamModel } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { orgInfo } = teamModel

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: (param?: any) => {
      initModal()
    },
  }));

  const initModal = () => {
    setIsModalOpen(true)
  }

  const copyQRCode = () => {
    const canvas = document.createElement('canvas');
    const qrCodeElement = document.querySelector('#qr-code'); // 选择二维码元素
    if (!qrCodeElement) return;

    const qrCodeCanvas = qrCodeElement.querySelector('canvas');
    if (!qrCodeCanvas) return;

    const spaceName = orgInfo?.title && orgInfo?.title < 7 ? orgInfo?.title : "";
    const label = `扫一扫，注册成为${spaceName}成员`;
    // const label = "扫一扫，注册成为一个字二个字成员";

    canvas.width = qrCodeCanvas.width + 60;
    canvas.height = qrCodeCanvas.height + 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(qrCodeCanvas, 30, 30);
      ctx.fillStyle = '#1E253B';
      ctx.font = '30px PingFang SC';
      ctx.textAlign = 'center';
      ctx.fillText(label, canvas.width / 2, canvas.height - 30);
      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            message.success('二维码已复制');
          }).catch(() => {
            message.error('复制失败');
          });
        }
      });
    }
  };


  return <>
      <Modal
        title={`邀请注册`}
        width={480}
        maskClosable={false}
        open={isModalOpen}
        okButtonProps={{ style: { marginLeft: '12px' } }}
        okText={`复制二维码`}
        onOk={() => copyQRCode()}
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="modal-info -mt-4">对方可查阅或使用团队内的其他资源</div>
        <div className="py-24 bg-white" id="qr-code">
          <QRCode className="mx-auto" size={240} bgColor="white" value={`https://analysis.aminer.cn/edu/register?code=${getOrgId("code")}`} />
          <div className="modal-form-label w-full text-center mt-12">扫一扫，注册成为{orgInfo?.title}成员</div>
        </div>
      </Modal>
  </>
};


export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
