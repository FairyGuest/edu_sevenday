import { useState, useEffect, useRef, useCallback, useImperativeHandle, memo } from 'react'
import { useDispatch, useLocation } from "umi";
import {
  Drawer,
  Tooltip,
  Tabs,
  Input,
  List,
  Divider,
  Spin,
  message,
  Modal
} from "antd";
import type { TabsProps } from 'antd'
import { ZYIcon } from "@/components"
import { getUserInfo } from "@/utils"
import { useTeacherContext } from '@/components/LayoutSider'

import './index.less'

const { confirm } = Modal

interface CommentOrReply {
  id: string | number;
  space_id: string | number;
  comment_by: string;
  comment_by_name: string;
  content: string;
  created_time: string;
  target_by: string;
  target_by_name: string;
  isReplying?: boolean;
  children?: CommentOrReply[];
  is_created_by: number;
}

interface Collect {
  user_name: string;
  user_id: string;
  created_time: string;
}

interface SendCommentParams extends Pick<CommentOrReply, 'space_id' | 'content' | 'comment_by' | 'target_by'> {
  target_id: string | number;
}

// 评论框组件
const ReplyInput = memo(({
  type,
  commentInfo,
  isReplying,
  showReplyInput,
  sendComment
}: {
  type: 'comment' | 'reply'
  commentInfo: Partial<CommentOrReply>
  isReplying?: boolean
  showReplyInput?: (isReplying: boolean) => void
  sendComment: (commentParams: SendCommentParams) => Promise<void>
}) => {
  const textareaRef = useRef<any>(null)
  const [commentContent, setCommentContent] = useState('')
  const [placeholder, setPlaceholder] = useState('请评论...')
  const [couldReplyModalHide, setCouldReplyModalHide] = useState(false)
  const [maxLength, setMaxLength] = useState(200)

  const onSendComment = () => {
    const params: SendCommentParams = {
      space_id: commentInfo.space_id || '', // 课程id
      content: commentContent.trim(),  // 评论内容
      comment_by: getUserInfo() || '', // 评论人id
      target_by: type === 'comment' ? '' : commentInfo.comment_by || '',  // 被评论人id, 没有默认为空字符串
      target_id: commentInfo.id || '-1'  // 被评论id, 没有默认为-1
    }

    sendComment(params)
    setCommentContent('')
    showReplyInput?.(false)
  }

  useEffect(() => {
    if (commentInfo && type === 'reply' && !couldReplyModalHide) {
      textareaRef.current.focus()
      setPlaceholder(`回复${commentInfo.comment_by_name}：`)
    }
  }, [commentInfo, isReplying])

  // 回复没有被提交，但回复文字被删除 + 点击任意处后消失，未点击任意处，回复框不消失
  const onContentChange = (value: string) => {
    setCouldReplyModalHide(commentContent && !value ? true : false)
    setCommentContent(() => value)
  }

  const onInputBlur = () => {
    if (couldReplyModalHide) {
      showReplyInput?.(false)
    }
  }

  return (
    <div className='reply-modal'>
      <Input.TextArea
        ref={textareaRef}
        maxLength={maxLength}
        placeholder={placeholder}
        value={commentContent}
        className='reply-modal-textarea'
        onBlur={onInputBlur}
        onChange={(e) => onContentChange(e.target.value)}
      />
      <div className='reply-modal-footer'>
        <span className='reply-modal-footer-count'>
          <span className={`${
              commentContent.length >= maxLength 
              ? 'warning' 
              : commentContent.length === 0 
                ? 'empty' 
                : 'normal'
            }`}
          >
            {commentContent.length}&nbsp;
          </span>
          /&nbsp;{maxLength}
        </span>
        <button 
          className='reply-modal-footer-btn' 
          disabled={!commentContent}
          onClick={onSendComment}
          style={!commentContent || commentContent.length > maxLength
            ? { background: '#EDF4FF', color: '#A8C8FF' } 
            : { background: '#1C6CFF', color: '#ffffff' }
          }
        >
          <ZYIcon type='send' size={20} />
        </button>
      </div>
    </div>
  )
})

// 评论项组件
const CommentItem = memo(({ 
  comment,
  sendComment,
  deleteComment
}: { 
  comment: CommentOrReply
  sendComment: (commentParams: SendCommentParams) => Promise<void>
  deleteComment: (id: string | number) => void
}) => {
  const [showAll, setShowAll] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    setIsReplying(false)
  }, [comment])

  const onDeleteComment = (e: React.MouseEvent<HTMLDivElement>, id: string | number) => {
    e.stopPropagation()
    confirm({
      title: '是否删除评论？',
      icon: <ZYIcon type='shanchu1' className='modal-delete-icon' size={20} />,
      content: '若删除评论，该评论的回复将一并删除。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: {
        style: {
          backgroundColor: "#EF4444",
        }
      },
      onOk() {
        deleteComment(id)
      }
    })
  }

  return (
    <>
       <List.Item className='comment-item'>
         <div className='comment-item-box' onClick={() => setIsReplying(true)}>
          <div className='comment-item-box-header'>
            <div className='comment-item-box-header-left'>
              <span className='user-name'>{comment.comment_by_name}</span>
              {comment.is_created_by === 1 && <span className='creator'>创建人</span>}
              <div className='time'>{comment.created_time}</div>
            </div>
            
            {comment.comment_by === getUserInfo() && <Tooltip title='删除' placement='top'>
              <div className='comment-item-box-header-actions' onClick={(e) => onDeleteComment(e, comment.id)}>
                <ZYIcon type='shanchu' className='delete-icon' />
              </div>
            </Tooltip>}
          </div>
          <div className='comment-item-box-content'>
            <span className='target-by'>
              {comment.target_by 
              && comment.target_by_name 
              && <>回复 <span className='user-name'>{comment.target_by_name}：</span></>
              }
            </span>
            <span className='content'>{comment.content}</span>
          </div>
         </div>
        {isReplying 
          && <div className='in-comment-reply-modal'>
            <ReplyInput 
              type='reply'
              commentInfo={comment} 
              isReplying={isReplying}
              showReplyInput={(v) => setIsReplying(v)}
              sendComment={sendComment}
            />
          </div>}
        {comment.children && comment.children.length > 0 
          ? (
            <div className='reply-list-wrap'>
              <Divider className='comment-divider' />
              <List
                itemLayout="horizontal"
                dataSource={showAll ? comment.children : comment.children.slice(0, 3)}
                renderItem={(reply: CommentOrReply) => (
                  <CommentItem 
                    comment={reply} 
                    sendComment={sendComment} 
                    deleteComment={deleteComment} 
                  />
                )}
              />
              {comment.children.length > 3 
                && !showAll
                && <div className='show-all-btn' onClick={() => setShowAll(true)}>
                    展示更多{comment.children.length - 3}个回复
                    <ZYIcon className='arrow-down-icon' type='xia' />
                  </div>
              }
            </div>
          ) : null}
      </List.Item>
    </>
  )
})

const CommentModal = (props: any) => {
  const { onRef } = props
  const dispatch = useDispatch()
  const [context] = useTeacherContext()
  const courseId = context?.course_id
  
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTabKey, setActiveTabKey] = useState('1')
  const [loadingComment, setLoadingComment] = useState(false)
  const [loadingCollect, setLoadingCollect] = useState(false)
  const [commentList, setCommentList] = useState<CommentOrReply[]>([])
  const [collectList, setCollectList] = useState<Collect[]>([])
  const [commentNum, setCommentNum] = useState(0)
  const [collectNum, setCollectNum] = useState(0)
  const [messageApi, contextHolder] = message.useMessage();
  
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `评论 ${commentNum || 0}`,
      children: (
        <>
          {loadingComment 
          ? <Spin spinning={loadingComment} className='comment-list-spin' />
          : <div className='comment-list-wrap'>
              {commentList.length > 0
                ? <List
                    itemLayout="horizontal"
                    dataSource={commentList}
                    renderItem={(comment: CommentOrReply) => (
                      <CommentItem 
                        comment={comment} 
                        sendComment={sendComment} 
                        deleteComment={deleteComment} 
                      />
                    )}
                  />
                : <div className='empty-box'>
                    <ZYIcon className='empty-box-icon' type='kongpinglun' />
                  <span className='empty-box-text'>暂无评论</span>
                </div>
              }
            </div>
          }
        </>
      ),
    },
    {
      key: '2',
      label: `收藏 ${collectNum || 0}`,
      children: (
        <>
          {loadingCollect 
          ? <Spin spinning={loadingCollect} className='collect-list-spin' />
          : <div className='collect-list-wrap'>
              {collectList.length > 0
                ? <List
                    itemLayout="horizontal"
                    dataSource={collectList}
                    renderItem={(collect: Collect) => (
                      <List.Item className='collect-item' key={collect.user_id}>
                        <span className='user-name'>{collect.user_name}</span>收藏于 <span className='time'>{collect.created_time}</span>
                      </List.Item>
                    )}
                  />
                : <div className='empty-box'>
                    <ZYIcon className='empty-box-icon' type='kongshoucang' />
                  <span className='empty-box-text'>暂无收藏</span>
                </div>
              }
            </div>
          }
        </>
      )
    }
  ]

  useImperativeHandle(onRef, () => ({
    openModal: () => {
      setModalVisible(true);
      getCommentList()
      getCollectList()
    }
  }))

  // 获取评论列表
  const getCommentList = async() => {
    setLoadingComment(true)
    const { code, data = [] }: any = await dispatch({
      type: "digitalCourseModel/postData",
      apiUrl: "getCommentListUrl",
      payload: {
        space_id: courseId
      },
    });
    if (code == 200) {
      const { total, list } = data
      setCommentList(list)
      setCommentNum(total)
    }
    setLoadingComment(false)
  }

  // 获取收藏列表
  const getCollectList = async() => {
    setLoadingCollect(true)
    const { code, data = [] }: any = await dispatch({
      type: "digitalCourseModel/postData",
      apiUrl: "getCollectListUrl",
      payload: {
        space_id: courseId
      },
    })

    if (code == 200) {
      const { total, list } = data
      setCollectList(list)
      setCollectNum(total)
    }
    setLoadingCollect(false)
  }

  // 发布评论
  const sendComment = useCallback(async (commentParams: SendCommentParams) => {
    if (commentParams.content.trim() === '') {
      messageApi.open({
        type: 'warning',
        content: '评论内容不能为空！',
      });
      return
    }

    setLoadingComment(true)
    const { code }: any = await dispatch({
      type: "digitalCourseModel/postData",
      apiUrl: "sendCommentUrl",
      payload: commentParams,
    })
    if (code == 200) {
      getCommentList()
    }
    setLoadingComment(false)
  }, [])

  // 删除评论
  const deleteComment = async (id: string | number) => {
    setLoadingComment(true)
    const { code }: any = await dispatch({
      type: "digitalCourseModel/postData",
      apiUrl: "deleteCommentUrl",
      payload: { comment_id: id },
    })
    if (code == 200) {
      getCommentList()
    }
    setLoadingComment(false)
  }

  const onChangeTabKey = (key: string) => {
    if (key === '1') getCommentList()
    setActiveTabKey(key)
  }

  const onModalClose = () => {
    setModalVisible(false)
    setCommentList([])
    setCollectList([])
    setCommentNum(0)
    setCollectNum(0)
  }

  return (
    <Drawer
      className="comment-drawer"
      title='课程互动社区'
      open={modalVisible}
      width={580}
      placement="right"
      onClose={onModalClose}
      forceRender
      footer={
        !loadingComment
        && activeTabKey === '1' 
        && <div className="drawer_footer">
            <ReplyInput 
              type='comment' 
              commentInfo={{
                space_id: courseId || '', //课程id
                comment_by: getUserInfo(), // 评论人id
                target_by: '',  // 被评论人id, 无则空
                id: '-1', // 被评论id, 无则-1
              }} 
              sendComment={sendComment} 
            />
          </div>
      }>
        <Tabs 
          defaultActiveKey={activeTabKey}
          items={items} 
          onChange={(key) => onChangeTabKey(key)}
        />
        {contextHolder}
    </Drawer> 
  )
}

export default CommentModal