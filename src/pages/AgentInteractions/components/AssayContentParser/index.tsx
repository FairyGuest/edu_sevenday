import { useMemo, useState, useRef } from 'react'
import { Popover } from 'antd'
import './index.less'

interface Sentence {
  id: string
  type: 'mistake' | 'optimization' | 'standout_point'
  analysis: {
    title: string
    content: string
  }
  raw_content: string
  recommended_change?: {
    content: string
    replace_word?: {
      src: string
      dest: string
      offset: number
    }
  }
}

interface ParsedSegment {
  text: string
  sentence?: Sentence
  index?: number
}

interface ContentParserProps {
  content: string
  parserData: Sentence[]
}

const getTypeClass = (type: string) => {
  switch (type) {
    case 'mistake':
      return 'type-mistake'
    case 'optimization':
      return 'type-optimization'
    case 'standout_point':
      return 'type-standout'
    case 'key_sentence_analysis':
      return 'type_default'
    default:
      return ''
  }
}

const PopoverContent = ({ sentence }: { sentence: Sentence }) => {
  return (
    <div className="parser-popover-content">
      <div className='title'>{sentence.analysis.title}</div>
      <div className='content'>{sentence.analysis.content}</div>
      {sentence.recommended_change && 
        <>
          <div className="title">建议修改为</div>
          <div className="content">{sentence.recommended_change.content}</div>
        </>
      }
    </div>
  )
}

const HighlightedText = ({
  sentence,
  index,
  activeId,
  onHover,
}: {
  sentence: Sentence
  index: number
  activeId: string | null
  onHover: (id: string | null) => void
}) => {
  const isActive = activeId === sentence.id
  const typeClass = getTypeClass(sentence.type)
  const badgeRef = useRef<HTMLSpanElement>(null)

  return (
    <span
      className={`highlighted-text ${typeClass} ${isActive ? 'active' : ''}`}
      onMouseEnter={() => onHover(sentence.id)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="text-content">{sentence.raw_content}</span>
      <Popover
        content={<PopoverContent sentence={sentence} />}
        open={isActive}
        overlayClassName="content-parser-popover"
        getPopupContainer={() => badgeRef.current?.parentElement || document.body}
      >
        <span 
          ref={badgeRef}
          className={`index-badge ${typeClass} ${isActive ? 'active' : ''}`}
        >
          {index}
        </span>
      </Popover>
    </span>
  )
}

const ContentParser = ({ content, parserData }: ContentParserProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  // 普通文本和需要高亮的文本分开
  const parsedContent = useMemo(() => {
    if (!parserData || parserData.length === 0) {
      return [{ text: content }]
    }

    // 找到所有需要标记的位置
    const markers: { start: number; end: number; sentence: Sentence; index: number }[] = []
    
    parserData.forEach((sentence) => {
      const startIndex = content.indexOf(sentence.raw_content)
      if (startIndex !== -1) {
        markers.push({
          start: startIndex,
          end: startIndex + sentence.raw_content.length,
          sentence,
          index: 0,
        })
      }
    })

    markers.sort((a, b) => a.start - b.start)
    markers.forEach((marker, idx) => {
      marker.index = idx + 1
    })

    const result: ParsedSegment[] = []
    let lastEnd = 0

    markers.forEach((marker) => {
      // 添加标记之前的普通文本
      if (marker.start > lastEnd) {
        result.push({ text: content.slice(lastEnd, marker.start) })
      }
      // 添加高亮文本
      result.push({
        text: marker.sentence.raw_content,
        sentence: marker.sentence,
        index: marker.index,
      })
      lastEnd = marker.end
    })

    // 普通文本
    if (lastEnd < content.length) {
      result.push({ text: content.slice(lastEnd) })
    }

    return result
  }, [content, parserData])

  const renderText = (text: string) => {
    return text.split('\n').map((line, idx, arr) => (
      <span key={idx}>
        {line}
        {idx < arr.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="content-parser">
      {parsedContent.map((segment, idx) => {
        if (segment.sentence && segment.index !== undefined) {
          return (
            <HighlightedText
              key={`${segment.sentence.id}-${idx}`}
              sentence={segment.sentence}
              index={segment.index}
              activeId={activeId}
              onHover={setActiveId}
            />
          )
        }
        return <span key={idx}>{renderText(segment.text)}</span>
      })}
    </div>
  )
}

export default ContentParser

