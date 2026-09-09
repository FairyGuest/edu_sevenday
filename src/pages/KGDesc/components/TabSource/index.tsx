import React, { useState, useEffect, useImperativeHandle } from 'react';

import { connect} from '@umijs/max';
import DataEmpty from '../DataEmpty';
import ZYIcon from "@/components/ZYIcon"
import { handleName } from "@/utils";

import "./index.less"


const App = (props: any) => {
  const { nodeData } = props;
  console.log(nodeData, 'nodeData');
  return (
    <div className='tab-source'>
      {
        nodeData?.source?.length > 0 && (
          <div>
            {
              nodeData?.source?.map((item: any, index: number) => {
                return (
                  <div key={index} className='items-materials-list'>
                    <div className='items-materials-list-item'>
                      <div className='items-materials-list-item-img'>
                        
                         <ZYIcon type={handleName(item.doc_name, item.doc_ext).icon} /> 
                        
                      </div>
                      <div className='items-materials-list-item-content'>
                        <span className='items-materials-list-item-content-name'>{handleName(item.doc_name).name}</span>
                        <span className='items-materials-list-item-content-page'>已选第{item.page_idx}页</span>
                      </div>
                    </div>
                    {/* <div className='trash-icon' onClick={() => trashdel(item, index)}>
                      <DeleteOutlined />
                    </div> */}
                  </div>
                )
              })
            }
          </div>
        ) || (
          <div>
            <DataEmpty />
          </div>
        )
      }

    </div>

  )
}



export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
