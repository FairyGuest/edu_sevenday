import { useEffect, useMemo, useState } from 'react'
import { useSelector, history, useDispatch,useSearchParams } from "umi";
import { FloatButton, Drawer, Alert, Flex, Empty, Button, Space, message } from 'antd';
import { ZYIcon } from '@/components';
import QuestionCard from '../QuestionCard';

import { useBesket } from "../../hooks/useBesket";
import { addNewTracking } from "@/utils";
import { all_question_number } from "@/global";

import './index.less'

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty > 0.9 && difficulty <= 1) {
    return '容易';
  } else if (difficulty > 0.8 && difficulty <= 0.9) {
    return '较易';
  } else if (difficulty > 0.5 && difficulty <= 0.8) {
    return '适中';
  } else if (difficulty > 0.3 && difficulty <= 0.5) {
    return '较难';
  } else if (difficulty > 0 && difficulty <= 0.3) {
    return '困难';
  } else {
    return '';
  }
};

const chineseNumber: any = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九',
  10: '十',
  11: '十一',
  12: '十二',
  13: '十三',
  14: '十四',
  15: '十五',
  16: '十六',
  17: '十七',
  18: '十八',
  19: '十九',
  20: '二十',
}

export default function QuestionBasket() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { clearQuestionBasket, getQuestionBasketList, getQuestionBasketCount } = useBesket();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const id = searchParams.get('id') || '';
  // 从models获取状态
  const {
    activeTab,
    questionBasket,
    questionBasketLoading,
  } = useSelector((state: any) => state.resourceSearchModel);

  const questionList = useMemo(
    () => getQuestionBasketList(questionBasket),
    [getQuestionBasketList, questionBasket]
  );
  const questionCount = useMemo(
    () => getQuestionBasketCount(questionBasket),
    [getQuestionBasketCount, questionBasket]
  );
  const questionTypeStat = useMemo(() => {
    const questionGroups = questionBasket?.ques_type_stat;
    if (!questionGroups || typeof questionGroups !== "object" || Array.isArray(questionGroups)) {
      return [];
    }
    return Object.entries(questionGroups)
      .map(([type, data]: [string, any]) => ({
        type,
        count: Number(data?.count) || (Array.isArray(data?.list) ? data.list.length : 0)
      }))
      .filter((item) => item.count > 0);
  }, [questionBasket]);
  const groupedQuestionList = useMemo(() => {
    const questionGroups = questionBasket?.ques_type_stat;
    if (!questionGroups || typeof questionGroups !== "object" || Array.isArray(questionGroups)) {
      return [];
    }

    let globalIndex = 0;
    return Object.entries(questionGroups).reduce((acc: any[], [type, data]: [string, any]) => {
      const list = Array.isArray(data?.list) ? data.list : [];
      const count = Number(data?.count) || list.length;
      if (count <= 0 || list.length === 0) {
        return acc;
      }

      const groupStartIndex = globalIndex;
      globalIndex += list.length;
      acc.push({
        type,
        list,
        groupStartIndex,
      });
      return acc;
    }, []);
  }, [questionBasket]);

  const onPaperdetail = async () => {
    if (questionCount === 0) {
      message.error('试题篮为空');
      return;
    }

    const firstQuestion = questionList?.[0];
    const { code, data }: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: "postQuestionCreatepaper",
      payload: {
        stage: firstQuestion?.stageName,
        subject: firstQuestion?.subjectName,
        bank_source: activeTab === 'public' ? 1 : 2
      },
    });
    if (code === 200) {

      const paperid = data?.paper_id;
      history.push(`/source/resourceSearch/paperDetail?paper_id=${paperid}&editPaper=true&isFromBasket=true&id=${id}`);
      //  clearQuestionBasket();
    }
  }

  return (
    <div className='question-basket-wrap'>
      <FloatButton
        shape="square"
        badge={{ count: questionCount, showZero: false, overflowCount: all_question_number }}
        description={activeTab == 'personal' ? '个人题库试题篮' : '公共题库试题篮'}
        icon={<ZYIcon type="shitilan" />}
        className='float-button'
        onClick={() => {
          setIsModalVisible(true)
          // if (activeTab == 'personal') {
          //   addNewTracking({
          //     bt: 'cl',
          //     ct: 'ind_qbank_assign_q_basket_click'
          //   })
          //   addNewTracking({
          //     bt: 'pv',
          //     ct: 'ind_qbank_assign_q_basket_show'
          //   })
          // }

          // if (activeTab == 'public') {
          //   addNewTracking({
          //     bt: 'cl',
          //     ct: 'pub_qbank_assign_q_basket_click'
          //   })
          //   addNewTracking({
          //     bt: 'pv',
          //     ct: 'pub_qbank_assign_q_basket_show'
          //   })
          // }
        }}
      />
      <Drawer
        className='question-basket-wrap-drawer'
        title={activeTab == 'personal' ? '个人题库试题篮' : '公共题库试题篮'}
        open={isModalVisible}
        loading={questionBasketLoading}
        onClose={() => setIsModalVisible(false)}
        width={860}
        closable={{ placement: 'end' }}
        mask={true}  // 点击遮罩层关闭
        footer={<Space>
          <Button onClick={() => setIsModalVisible(false)} disabled={questionBasketLoading}>取消</Button>
          <Button onClick={() => clearQuestionBasket()} disabled={questionBasketLoading || questionCount === 0}>全部清空</Button>
          <Button type="primary" onClick={() => {
            // if (activeTab == 'personal') {
            //   addNewTracking({
            //     bt: 'cl',
            //     ct: 'ind_qbank_assign_q_basket_group_click'
            //   })
            // }

            // if (activeTab == 'public') {
            //   addNewTracking({
            //     bt: 'cl',
            //     ct: 'pub_qbank_assign_q_basket_group_click'
            //   })
            // }
            onPaperdetail()
          }} disabled={questionBasketLoading || questionCount === 0}>去组题</Button>
        </Space>}
      >
        {questionCount > 0
          ? <Flex vertical>
            {questionBasket?.basket_difficulty &&
              <Alert
                className='alter-info'
                message={
                  <div>
                    <ZYIcon type="tishi" style={{ marginRight: 4, fontSize: 14 }} />
                    共计 <b>{questionCount}</b> 道题，平均难度 <b>{getDifficultyLabel(Number(questionBasket.basket_difficulty))}</b>，
                    {questionTypeStat.map((item: any, idx: number, arr: any[]) => (
                      <span key={item.type}>
                        {item.type} <b>{item.count}</b> 道{idx !== arr.length - 1 ? '，' : ''}
                      </span>
                    ))}
                  </div>
                }
                type="info"
              />
            }
            <div className='question-basket-list'>
              {groupedQuestionList.map((group: any, index: number) => (
                <div key={group.type} className='question-basket-group'>
                  <div className='question-basket-group-title'>{chineseNumber[index + 1]}. {group.type}</div>
                  {group.list.map((item: any, index: number) => (
                    <QuestionCard
                      key={item.id}
                      data={item}
                      index={group.groupStartIndex + index + 1}
                      actions={['basket']}
                    />
                  ))}
                </div>
              ))}
            </div>
          </Flex>
          : <Empty
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            description="暂无试题"
            image={require("@/assets/courseEmpty.png")}
            styles={{ image: { width: 80, height: 48, margin: "0 auto 10px" } }}
          />
        }
      </Drawer>
    </div>
  )
}
