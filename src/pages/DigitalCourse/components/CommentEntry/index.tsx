import { useState, useRef, useEffect } from 'react'
import { useDispatch, useLocation } from "umi";
import { Tooltip, Divider, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons'
import CommentModal from "../CommentModal";
import { ZYIcon } from "@/components"
import { useTeacherContext } from '@/components/LayoutSider'

import './index.less'

const CommentEntry = () => {
  const dispatch = useDispatch()
  // const { search } = useLocation()
  // const searchParams = new URLSearchParams(search)
  // const courseId = searchParams.get('courseId')
  const [context] = useTeacherContext()
  const courseId = context?.course_id
	const commentModalRef = useRef<{ openModal: () => void }>();
	const [collectLoading, setCollectLoading] = useState<boolean>(false);
	const [commentNum, setCommentNum] = useState<number>(0);
	const [collectNum, setCollectNum] = useState<number>(0);
	const [isCollect, setIsCollect] = useState<boolean>(false);
	const [isCreator, setIsCreator] = useState<boolean>(false);

	useEffect(() => {
		getCommentAndCollectInfo()
	}, [])

  // 获取评论列表
  const getCommentAndCollectInfo = async() => {
    const { code, data = [] }: any = await dispatch({
      type: "digitalCourseModel/postData",
      apiUrl: "getCommentAndCollectInfoUrl",
      payload: {
        space_id: courseId
      },
    });
    if (code == 200) {
      const { 
				comment_total, 
				collect_total, 
				is_user_collect, 
				is_user_create 
			} = data
      setCollectNum(collect_total)
      setCommentNum(comment_total)
			setIsCollect(is_user_collect)
			setIsCreator(is_user_create)
    }
  }

	// 收藏/取消收藏
	const handleCollect = async (e: any) => {
		e.stopPropagation();
		setCollectLoading(true)
    const { code }: any = await dispatch({
			type: "digitalCourseModel/postData",
			apiUrl: "courseCollectUrl",
			payload: {
				course_id: courseId, 
				is_collect: isCollect ? 0 : 1
			},
		});
		if (code == 200) {
			setIsCollect(!isCollect)
			setCollectNum((preNum) => preNum + (isCollect ? -1 : 1))
		}
		setCollectLoading(false)
	}

  return (
    <>
			<div className="comment-entry">
				<Tooltip title="互动评论">
					<button className="button-box" onClick={() => commentModalRef.current?.openModal()}>
						<ZYIcon type="pinglun" className="button-box-icon" />
						<span className="button-box-text">{commentNum > 999 ? '999+' : commentNum}</span>
					</button>
				</Tooltip>
				{!isCreator && (
					<>
						<Divider type="vertical" className="divider" />
						<Tooltip title={isCollect ? '点击取消收藏' : '点击收藏'}>
							<button className="button-box" onClick={(e: any) => handleCollect(e)} disabled={collectLoading}>
								<Spin spinning={collectLoading} indicator={<LoadingOutlined spin />} size="small" delay={300}>
									<ZYIcon type={isCollect ? "shoucang-yishoucang" : "shoucang-weishoucang"} className={`button-box-icon ${isCollect ? "active" : ""}`} />
								</Spin>
								<span className='button-box-text'>
									{collectNum > 999 ? '999+' : collectNum}
								</span>
							</button>
						</Tooltip>
					</>
				)}
			</div>
      <CommentModal onRef={commentModalRef} />
    </>
  );
};

export default CommentEntry