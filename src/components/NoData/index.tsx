import React from 'react';
import { Button } from 'antd';
import './index.less';

interface NoDataProps {
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const NoData: React.FC<NoDataProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="no_data">
      <div className="no_data_name">{title}</div>
      {description && <div className="no_data_desc">{description}</div>}
      {buttonText && onButtonClick && (
        <Button
          className="no_data_btn"
          type="primary"
          size="large"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default NoData;