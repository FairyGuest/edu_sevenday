import React, { useEffect, useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  dndList?: any[]
  handleDndList?: (list: any[]) => void
  ItemRender?: (item: any, index: number) => React.ReactNode
  className?: string
  itemClass?: string
  itemStyle?: React.CSSProperties
}

type SortableItemProps = {
  item: any
  index: number
  itemClass?: string
  itemStyle?: React.CSSProperties
  ItemRender?: (item: any, index: number) => React.ReactNode
}

const getItemKey = (item: any, index: number) => {
  return (
    item?.id ||
    item?.appId ||
    item?.app_id ||
    item?.detailId ||
    item?.detail_id ||
    item?.detailIdCopy ||
    `dnd-item-${index}`
  )
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  index,
  itemClass,
  itemStyle,
  ItemRender,
}) => {
  const id = getItemKey(item, index)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    opacity: isDragging ? 0.9 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
    ...itemStyle,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={itemClass}
      {...attributes}
      {...listeners}
    >
      {ItemRender?.(item, index)}
    </div>
  )
}

const DndKitList: React.FC<Props> = (props) => {
  const [dndList, setDndList] = useState<any[]>(props.dndList || [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 鼠标移动超过 5px 才认为是拖拽，否则当作点击
      },
    }),
  )

  useEffect(() => {
    setDndList(props.dndList || [])
  }, [props.dndList])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = dndList.map((item, index) => getItemKey(item, index))
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newList = arrayMove(dndList, oldIndex, newIndex)
    setDndList(newList)
    props.handleDndList?.(newList)
  }

  const itemsIds = dndList.map((item, index) => getItemKey(item, index))

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemsIds} strategy={rectSortingStrategy}>
        <div className={props.className}>
          {dndList.map((item, index) => (
            <SortableItem
              key={itemsIds[index]}
              item={item}
              index={index}
              itemClass={props.itemClass}
              itemStyle={props.itemStyle}
              ItemRender={props.ItemRender}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DndKitList

