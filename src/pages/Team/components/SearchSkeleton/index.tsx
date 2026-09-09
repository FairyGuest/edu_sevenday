import React from 'react';
import { Col, Row, Skeleton } from 'antd';
import './index.less';

const SearchSkeleton = () => {
  return (

    <Row gutter={[16, 16]}>
      <Col span={6} ><Skeleton active className='rec_skeleton_col'/></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
      <Col span={6} ><Skeleton active className='rec_skeleton_col' /></Col>
    </Row>


  );
};

export default SearchSkeleton; 