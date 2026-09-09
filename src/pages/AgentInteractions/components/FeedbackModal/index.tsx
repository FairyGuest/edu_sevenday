import React, { useState, useImperativeHandle, useEffect } from 'react'
import { Modal, Button, Input, message } from 'antd'
import { useDispatch } from '@umijs/max'

import './index.less'

const { TextArea } = Input

export default function FeedbackModal({ id, onRef }: { id: string | number, onRef: any }) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [understand, setUnderstand] = useState<string[]>([])
  const [quality, setQuality] = useState<string[]>([])
  const [feedbackContent, setFeedbackContent] = useState('')

  // 需求理解选项
  const requirementOptions = [
    { label: '没理解问题', value: 'not_understood' },
    { label: '没完成需求', value: 'not_completed' }
  ]

  // 回复质量选项
  const qualityOptions = [
    { label: '有事实性错误', value: 'factual_error' },
    { label: '内容太啰嗦', value: 'too_verbose' },
    { label: '逻辑不清晰', value: 'unclear_logic' },
    { label: '重复输出/截断', value: 'repetitive_truncated' },
    { label: '遗忘上文信息', value: 'forgot_context' },
    { label: '风格不喜欢', value: 'dislike_style' }
  ]

  const isSubmitDisabled = () => {
    return understand.length === 0 || quality.length === 0 
  }

  const handleRequirementChange = (value: string) => {
    setUnderstand(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const handleQualityChange = (value: string) => {
    setQuality(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const handleOtherFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 200) {
      setFeedbackContent(value)
    }
  }

  const resetForm = () => {
    setUnderstand([])
    setQuality([])
    setFeedbackContent('')
  }

  const handleSubmit = async () => {
    if (isSubmitDisabled()) {
      message.warning('请选择要反馈的内容')
      return
    }

    const feedbackData = {
      understand,
      quality,
      otherFeedback: feedbackContent.trim().substring(0, 200)
    }

    const { code, data }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "feedbackUrl",
      payload: {
        message_id: id,
        feedback: feedbackData
      },
    })

    if (code == 200) {
      message.success(data.msg)
    }
    setOpen(false)
    resetForm()
  }

  const handleCancel = () => {
    resetForm()
    setOpen(false)
  }

  useImperativeHandle(onRef, () => ({
    showModal: () => {
      setOpen(true)
    }
  }))

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="你的反馈将帮助大模型优化"
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={isSubmitDisabled()}
          onClick={handleSubmit}
        >
          确定
        </Button>
      ]}
      className="feedback-modal"
      width={600}
    >
      <div className="feedback-modal-content">
        {/* 需求理解部分 */}
        <div className="feedback-section">
          <div className="feedback-section-title">
            <span className="required">*</span>需求理解 
          </div>
          <div className="feedback-options">
            {requirementOptions.map(option => (
              <Button
                key={option.value}
                className={`feedback-option-btn ${understand.includes(option.value) ? 'selected' : ''}`}
                onClick={() => handleRequirementChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 回复质量部分 */}
        <div className="feedback-section">
          <div className="feedback-section-title">
            <span className="required">*</span>回复质量 
          </div>
          <div className="feedback-options">
            {qualityOptions.map(option => (
              <Button
                key={option.value}
                className={`feedback-option-btn ${quality.includes(option.value) ? 'selected' : ''}`}
                onClick={() => handleQualityChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 其他反馈和建议部分 */}
        <div className="feedback-section">
          <div className="feedback-section-title">
            其他反馈和建议
          </div>
          <TextArea
            value={feedbackContent}
            onChange={handleOtherFeedbackChange}
            placeholder="请输入您的反馈和建议"
            rows={6}
            maxLength={200}
            showCount
            className={`feedback-textarea ${feedbackContent.length > 200 ? 'error' : ''}`}
          />
        </div>
      </div>
    </Modal>
  )
}
