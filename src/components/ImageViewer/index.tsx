import { useState } from 'react'
import { Image, Button } from 'antd';
import { ZYIcon } from '@/components';

import './index.less'
export interface ImageItem {
  url: string;
  name: string;
}
interface ImageViewerProps {
  images: ImageItem[]
  onSelect?: (image: ImageItem, index: number) => void
  selectedIndex?: number
}

export default function ImageViewer({
  images,
  onSelect,
  selectedIndex,
}: ImageViewerProps) {
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  const handleImageClick = (index: number) => {
    if (onSelect) {
      onSelect(images[index], index);
    }
  };

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };

  return (
    <div className='image-viewer'>
      <div className='image-box'>
        {images.map((item, index) => (
          <div
            key={item.name || index}
            className={`image-item ${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => handleImageClick(index)}
          >
            <img
              src={item.url}
              alt={item.name}
              className='image-preview'
            />
            <Button
              type="primary"
              size="small"
              icon={<ZYIcon type='datu' />}
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(index);
              }}
              className='preview-button'
            >
              大图
            </Button>
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <div className='preview-container'>
          <Image.PreviewGroup
            preview={{
              visible: previewVisible,
              current: previewIndex,
              onVisibleChange: (visible) => {
                if (!visible) handleClosePreview();
              },
              onChange: (current) => setPreviewIndex(current),
            }}
          >
            {images.map((item) => (
              <Image key={item.name} src={item.url} alt={item.name} />
            ))}
          </Image.PreviewGroup>
        </div>
      )}
    </div>
  )
}
