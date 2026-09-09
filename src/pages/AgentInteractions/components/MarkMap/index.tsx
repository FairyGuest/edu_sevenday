import { useEffect, useRef } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import './index.less'

export default function MarkMap({ markdown }: { markdown: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapInstanceRef = useRef<Markmap | null>(null)
  const transformerRef = useRef<Transformer | null>(null)

  useEffect(() => {
    if (!svgRef.current || !markdown) return

    if (!transformerRef.current) {
      transformerRef.current = new Transformer()
    }
  
    // 将 markdown 转换为 markmap 数据
    const { root } = transformerRef.current.transform(markdown)
    
    // 创建 markmap 实例
    if (!markmapInstanceRef.current) {
      markmapInstanceRef.current = Markmap.create(svgRef.current, {
        // 配置选项
        color: (node: any) => {
          // 根据层级设置颜色：根节点红色，一级分支蓝色，二级绿色，三级黄色
          if (node.state.depth === 0) return '#ff4444'
          if (node.state.depth === 1) return '#007bff'
          if (node.state.depth === 2) return '#28a745'
          return '#ffc107'
        },
        duration: 500,
        maxWidth: 300,
        initialExpandLevel: 10,
      })
    }
    
    // 设置数据并渲染
    markmapInstanceRef.current.setData(root)
    requestAnimationFrame(() => {
      markmapInstanceRef.current?.fit()
    })

    return () => {
      if (markmapInstanceRef.current) {
        markmapInstanceRef.current.destroy?.()
        markmapInstanceRef.current = null
      }
    }
  }, [markdown])

  return (
    <div className="markmap-container">
      <svg ref={svgRef} className='mind-map-svg' />
    </div>
  )
}
