import { useCallback, useEffect, useState } from 'react'
import { connect, history } from 'umi'
import { useDispatch } from "@umijs/max";
import { getOrgId } from "@/utils";
import { Button } from 'antd'
import List from '../List'
import { useTeacherContext } from '@/components/LayoutSider'
import { addNewTracking } from "@/utils";
import { usePolling } from '@/pages/Home/hooks/usePolling'

import './index.less'
import { ZYIcon } from '@/components'

const Homework = () => {
  const [context, contextLoading] = useTeacherContext()
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);

  useEffect(() => {
    if (contextLoading || !context?.course_id) return;
    getList()
  }, [context?.course_id, contextLoading])

  // 获取列表
  const getList = useCallback(async (payload?: any, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    let { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postDistributionPaperList",
      payload: {
        org_id: getOrgId(),
        course_id: context?.course_id,
        page_num: 1,
        page_size: 3,
      },
    });
    if (code === 200) {
      console.log("列表数据", data);
      setHomeworkList(data?.exams)
    }
    if (!silent) {
      setLoading(false);
    }
  }, [context?.course_id, dispatch]);

  usePolling(
    () => getList(undefined, { silent: true }),
    {
      interval: 20000,
      enabled: !!context?.course_id && !contextLoading,
      immediate: false,
    },
  );

  return (
    <div className='homework'>
      <div className='homework-header'>
        <span className='title'>在线作业</span>
        {context?.course_id && <div className='right'>
          <Button type='text' onClick={() => {
            addNewTracking({
              bt: 'cl',
              ct: 'home_online_hw_view_all_click'
            })
            history.push(`/setTopic?courseId=${context?.course_id}`)
          }}>
            <span>查看全部</span>
            <ZYIcon type='arrow-go' />
          </Button>
        </div>}
      </div>

      {loading ? (
        <div className='homework-content'>
          <div className="loading-box">
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
            </span>
            <span className="text">加载中</span>
          </div>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className='empty-box'>
          <ZYIcon type='kongshuju6' className='icon' />
          <span className='text'>暂未布置作业</span>
        </div>
      ) : (
        <List examsList={[...homeworkList]} courseId={context?.course_id} refreshListFn={() => {
          getList()
        }} />
      )}
    </div>
  )
}

export default connect(({ homePageModel }: any) => ({
  homePageModel,
}))(Homework);
