import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "antd";
import { ZYIcon } from "@/components";

type TopicQuestion = {
  question_group_id?: string;
  status?: string;
};

interface TopicNumberPaginationProps {
  questions: TopicQuestion[];
  activeIndex: number;
  onActiveIndexChange: (nextIndex: number) => void;
  onQuestionsReorder?: (questions: TopicQuestion[]) => void;
  tagIcon?: ReactNode;
}

type SortableNumberItemProps = {
  id: string;
  index: number;
  page: number;
  item: TopicQuestion;
  isActive: boolean;
  tagIcon: ReactNode;
  setItemRef?: (node: HTMLDivElement | null) => void;
  onActiveIndexChange: (nextIndex: number) => void;
};

const SortableNumberItem = ({
  id,
  index,
  page,
  item,
  isActive,
  tagIcon,
  setItemRef,
  onActiveIndexChange,
}: SortableNumberItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handleItemKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActiveIndexChange(index);
    }
  };

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    setItemRef?.(node);
  };

  return (
    <div
      ref={setRefs}
      className={`number-item ${item?.status === "selected" ? "number-item-selected" : ""} ${isActive ? "number-item-active" : ""} ${isDragging ? "number-item-is-dragging" : ""}`}
      style={
        transform || isDragging
          ? {
              transform: transform
                ? `translate3d(${transform.x}px, 0, 0)`
                : undefined,
              transition,
              zIndex: isDragging ? 999 : undefined,
            }
          : undefined
      }
      onClick={() => onActiveIndexChange(index)}
      onKeyDown={handleItemKeyDown}
      {...attributes}
      {...listeners}
    >
      <div className="number-item-tag">{tagIcon}</div>
      <div className="number-item-text">{page}</div>
    </div>
  );
};

const TopicNumber = ({
  questions,
  activeIndex,
  onActiveIndexChange,
  onQuestionsReorder,
  tagIcon = <ZYIcon type="xuanze" />,
}: TopicNumberPaginationProps) => {
  const contentNumberRef = useRef<HTMLDivElement | null>(null);
  const numberListRef = useRef<HTMLDivElement | null>(null);
  const innerListRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const sortableIds = questions?.map(
    (item, index) => item?.question_group_id || `topic-number-${index}`,
  ) ?? [];

  useEffect(() => {
    const container = contentNumberRef.current;
    const inner = innerListRef.current;
    if (!container || !inner) return;

    const updateScrollable = () => {
      const arrowArea = 28 * 2 + 12 * 2;
      const availableWidth = container.clientWidth - arrowArea;
      setIsScrollable(inner.scrollWidth > availableWidth);
    };

    updateScrollable();

    const resizeObserver = new ResizeObserver(updateScrollable);
    resizeObserver.observe(container);
    resizeObserver.observe(inner);

    return () => resizeObserver.disconnect();
  }, [questions?.length]);

  useEffect(() => {
    const list = numberListRef.current;
    const activeItem = activeItemRef.current;
    if (!list || !activeItem) return;

    if (!isScrollable) {
      list.scrollLeft = 0;
      return;
    }

    const targetScrollLeft =
      activeItem.offsetLeft - (list.clientWidth - activeItem.offsetWidth) / 2;

    list.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  }, [activeIndex, questions?.length, isScrollable]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(String(active.id));
    const newIndex = sortableIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
    onQuestionsReorder?.(reorderedQuestions);
  };

  return (
    <div
      ref={contentNumberRef}
      className={`content-number ${isScrollable ? "content-number--scrollable" : "content-number--compact"}`}
    >
      <div className="content-number-group">
        <Button
          className="number-prev"
          color="default"
          variant="filled"
          icon={<ZYIcon type="zuo" />}
          disabled={activeIndex === 0}
          style={{border:'none'}}
          onClick={() => onActiveIndexChange(Math.max(activeIndex - 1, 0))}
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="content-number-list" ref={numberListRef}>
              <div className="content-number-list-inner" ref={innerListRef}>
                {questions?.map((item, index) => {
                  const id = sortableIds[index];
                  return (
                    <SortableNumberItem
                      key={id}
                      id={id}
                      index={index}
                      page={index + 1}
                      item={item}
                      isActive={activeIndex === index}
                      tagIcon={tagIcon}
                      setItemRef={
                        activeIndex === index
                          ? (node) => {
                              activeItemRef.current = node;
                            }
                          : undefined
                      }
                      onActiveIndexChange={onActiveIndexChange}
                    />
                  );
                })}
              </div>
            </div>
          </SortableContext>
        </DndContext>
        <Button
          className="number-next"
          icon={<ZYIcon type="you" />}
          color="default"
          variant="filled"
          style={{border:'none'}}
          disabled={activeIndex >= (questions?.length ?? 0) - 1}
          onClick={() =>
            onActiveIndexChange(Math.min(activeIndex + 1, (questions?.length ?? 0) - 1))
          }
        />
      </div>
    </div>
  );
};

export default TopicNumber;
