import React, { useState, useRef } from 'react'
import { useDispatch } from '@umijs/max'
import { Button, Tooltip, message } from 'antd'
import { ZYIcon } from '@/components'
import FeedbackModal from '../FeedbackModal'
import { copyParagraphText } from '@/utils'

import './index.less'

export default function ActionButtons({
  id,
  upvoteStatus: initialUpvoteStatus,
  downvoteStatus: initialDownvoteStatus,
  content,  
}: {
  id: string | number
  upvoteStatus: boolean
  downvoteStatus: boolean
  content: string
}) {
  const dispatch = useDispatch()
  const [upvoteStatus, setUpvoteStatus] = useState(initialUpvoteStatus)
  const [downvoteStatus, setDownvoteStatus] = useState(initialDownvoteStatus)
  const feedbackModalRef = useRef<any>(null)

  const onDownvote = () => {
    if (!downvoteStatus) {
      feedbackModalRef?.current?.showModal()
    }
    handleDownvote()
  }

  const handleDownvote = async() => {
    const { code, data }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "downVoteUrl",
      payload: {
        message_id: id
      },
    });
    if (code == 200) {
      setUpvoteStatus(data.is_like)
      setDownvoteStatus(data.is_dislike)
    }
  }

  const handleUpvote = async() => {
    const { code, data }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "upVoteUrl",
      payload: {
        message_id: id
      },
    });
    if (code == 200) {
      setUpvoteStatus(data.is_like)
      setDownvoteStatus(data.is_dislike)
      message.success(data.msg)
    }
  }

  const handleCopy = async () => {
    if (!content) {
      message.warning('没有可复制的内容')
      return
    }
    await copyParagraphText(content)
  }

  return (
    <div className='action-buttons-container'>
      <Tooltip title="复制" className='action-buttons-item'>
        <Button 
          color="default" 
          variant="text" 
          icon={<ZYIcon type="copy" />}
          onClick={handleCopy}
        />
      </Tooltip>
      <Tooltip title="点赞" className='action-buttons-item'>
        <Button 
          color="default" 
          variant="text" 
          onClick={handleUpvote}
          icon={upvoteStatus ? <ZYIcon type="xuanzhongzan" /> : <ZYIcon type="zan1" />} 
        />
      </Tooltip>
      <Tooltip title="踩" className='action-buttons-item'>
        <Button 
          color="default" 
          variant="text" 
          onClick={onDownvote}
          icon={downvoteStatus ? <ZYIcon type="xuanzhongcai" /> : <ZYIcon type="cai1" />} 
        />
      </Tooltip>
      <FeedbackModal id={id} onRef={feedbackModalRef} />
    </div>
  )
}
