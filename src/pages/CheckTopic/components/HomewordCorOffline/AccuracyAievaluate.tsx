import React, { useState, useEffect, useRef } from 'react'
import ZYIcon from "@/components/ZYIcon"
import { Tag } from 'antd';
import "./AccuracyAievaluate.less"
// import KnowledgeRightChart from '../KnowledgeRightChart';
import { connect, useDispatch } from "@umijs/max";
import ImageViewer from "../ImageViewer/index"
function index(props: any) {
  const {
    testPaper,
    selectedValue,
  } = props;


  const dispatch = useDispatch();
  const [knowledgeRightChartData, setKnowledgeRightChartData] = useState<any>([])
  const [isExpanded, setIsExpanded] = useState(false); // 展开/收起状态
  const [showToggleBtn, setShowToggleBtn] = useState(false); // 是否显示展开按钮
  const tagContainerRef = useRef<HTMLDivElement>(null); // 知识点Tag容器Ref
  useEffect(() => {
    if (testPaper?.exam_id && testPaper?.user_id && selectedValue) {
      getTestPaper()
    }
  }, [testPaper, selectedValue])
  useEffect(() => {
    const calcShowToggleBtn = () => {
      if (!tagContainerRef.current || !testPaper?.knowledge_points?.length) {
        setShowToggleBtn(false);
        return;
      }
      const twoLineHeight = 85;
      const realHeight = tagContainerRef.current.scrollHeight;
      console.log(realHeight, twoLineHeight);
      setShowToggleBtn(realHeight > twoLineHeight);
    };
    calcShowToggleBtn();
    window.addEventListener('resize', calcShowToggleBtn);
    return () => window.removeEventListener('resize', calcShowToggleBtn);
  }, [testPaper?.knowledge_points]);
  const getTestPaper = async () => {
    let { code, data } = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getEchartsdata",
      payload: {
        exam_id: testPaper?.exam_id,
        class_id: selectedValue,
        student_id: testPaper?.user_id
      },
    });
    if (code == 200) {
      setKnowledgeRightChartData(data)
    }
  };
  const handleSelect = (image: any, index: number) => {
    console.log('选中图片:', image, '索引:', index);
  };
  const vardertd = () => {
    // 处理  imageList 
    const newImageList = testPaper?.ori_img_urls?.map((image: any, index: number) => ({
      url: image,
      name: index
    }));
    return newImageList;
  }

  return (
    <div className='accuracy-evaluate'>
      <div className='accuracy-evaluate-title'>
        <div className='accuracy-evaluate-title-top'>
          <span className='accuracy-evaluate-title-top-text'>本次作业主要知识点</span>
        </div>
        <div ref={tagContainerRef} className={`accuracy-evaluate-title-bottonex-bottom${isExpanded ? 'expanded' : ''}`}>
          {
            testPaper?.knowledge_points?.map((item: any, index: number) => {
              return <Tag className='accuracy-evaluate-title-bottonex-bottom-tag' key={index}>{item}</Tag>
            })
          }
        </div>
        {
          showToggleBtn && <div className='varaccuracytag-container'>
            <Tag className='varaccuracytag'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {
                isExpanded ?
                  <span className='varaccuracytag-zyicon'>
                    收起
                    <ZYIcon size={20} type='arrow-up'></ZYIcon>
                  </span>
                  :
                  <span className='varaccuracytag-zyicon'>
                    展开 <ZYIcon size={20} type='arrow-down'></ZYIcon>
                  </span>
              }
            </Tag>
          </div>
        }
      </div>
      {/* <div className='accuracy-evaluate-knowledge'>
        <KnowledgeRightChart dataSource={knowledgeRightChartData} classOpen={true} />
      </div> */}
      {/* {
        testPaper?.answer_method == "offline" && testPaper?.ori_img_urls?.length > 0 && <div className='accuracy-evaluate-image'>
          <ImageViewer
            images={vardertd()}
            onSelect={handleSelect}
          />
        </div>
      } */}
    </div>
  )
}
export default connect((state: any) => ({
  authModel: state.authModel,
  commonModel: state.commonModel,
}))(index);
