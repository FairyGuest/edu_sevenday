import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "umi";
import { Card, Button, Space, Flex, Typography, message, Modal } from "antd";
import AudioPlayer from "../AudioPlayer";
import QuestionListModal from "../QuestionListModal";
import { ChildQuestionList } from "../ChildQuestion";
import SafeMathRenderer from "../SafeMathRenderer";
import ZYIcon from "@/components/ZYIcon";

import { useQuestionActions } from "../../hooks/useQuestionActions";
import { useBesket } from "../../hooks/useBesket";

import { selectOptionsData,all_question_number } from "@/global";

import "katex/dist/katex.min.css";
import "./index.less";

const { Text } = Typography;
type QuestionActionKey = "similar" | "favorite" | "basket" | "personalDelete";
interface QuestionCardProps {
  data: any;
  index?: number;
  actions?: QuestionActionKey[];
  isChild?: boolean;
  parentIndex?: number;
  onRefreshList?: () => void;
  showAnswerByDefault?: boolean;
  hideMetaTags?: boolean;
  pageNum?: number;
  pageSize?: number;
}

const QuestionCard = ({
  data,
  index = 1,
  actions,
  isChild = false,
  parentIndex,
  onRefreshList,
  showAnswerByDefault = false,
  hideMetaTags = false,
  pageNum = 1,
  pageSize = 10,
}: QuestionCardProps) => {
  const dispatch = useDispatch();
  const { confirm } = Modal;
  const [modal, contextHolder] = Modal.useModal();

  const [isInBasket, setIsInBasket] = useState(false);
  const [isFavorite, setIsFavorite] = useState(data.is_favorite || false);
  const { toggleQuestionFavorite, toggleQuestionDelete } = useQuestionActions();
  const {
    handleQuestionToBasket,
    loadQuestionBasket,
    getQuestionBasketList,
    getQuestionBasketCount,
  } = useBesket();
  const [showPaper] = useState(true);
  const [showAnswer, setShowAnswer] = useState(showAnswerByDefault);
  const questionData = data;

  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(600);

  const [selectOptions, setSelectOptions] = useState(selectOptionsData);

  const [similarQuestions, setSimilarQuestions]: any = useState([]);
  const [similarModalVisible, setSimilarModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const { questionBasket, activeTab } = useSelector(
    (state: any) => state.resourceSearchModel,
  );
  const basketQuestionList = useMemo(
    () => getQuestionBasketList(questionBasket),
    [getQuestionBasketList, questionBasket],
  );
  const basketQuestionCount = useMemo(
    () => getQuestionBasketCount(questionBasket),
    [getQuestionBasketCount, questionBasket],
  );

  useEffect(() => {
    setIsInBasket(basketQuestionList?.some((item: any) => item.id === data.id));
  }, [basketQuestionList, data.id]);

  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        const width = cardRef.current.offsetWidth - 24;
        setCardWidth(width);
      }
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);

    return () => {
      window.removeEventListener("resize", updateCardWidth);
    };
  }, []);

  const {
    stem,
    quesType,
    difficulty,
    year,
    area,
    scene,
    kgPointList,
    kgPoints: kgPointsField = [],
    options = [],
    updateTime,
    createTime,
    quesAudio,
    answerList,
    answer: answerField,
    quesAnalysis,
    hasChild = false,
    childrenCount = 0,
    publicQuestionList,
    children: childrenField = [],
    paperName,
  } = questionData;
  const answer = answerList ?? answerField;
  const kgPoints = kgPointList ?? kgPointsField;
  const children = publicQuestionList ?? childrenField;
  const hasChildQuestions = Boolean(hasChild || children.length);

  const warningConfig = {
    title: "提示",
    content: <Text>试题篮已达上限{all_question_number}道，请清理后重新添加！</Text>,
  };

  const isSelectQuestion = useMemo(
    () => Array.isArray(options) && options.length > 0,
    [options],
  );

  // 修复：构建符合SafeMathRenderer解析规则的完整题目HTML
  const questionHtml = useMemo(() => {
    if (!stem) return "<p>题目内容</p>";

    // 题干部分
    let html = `<p>${stem}</p>`;

    return html;
  }, [stem, options, isSelectQuestion]);

  const answerDisplay: string = useMemo(() => {
    if (!answer) return "";
    if (!isSelectQuestion) {
      if (Array.isArray(answer)) {
        return answer.join("、");
      }
      return answer;
    }

    if (Array.isArray(answer)) {
      return answer
        .map((ans: any) => {
          if (typeof ans === "number") {
            return String.fromCharCode(65 + ans);
          } else {
            const index = options.findIndex((option: string) => option === ans);
            return index >= 0 ? String.fromCharCode(65 + index) : ans;
          }
        })
        .join("、");
    } else {
      if (typeof answer === "number") {
        return String.fromCharCode(65 + answer);
      } else {
        const index = options.findIndex((option: string) => option === answer);
        return index >= 0 ? String.fromCharCode(65 + index) : answer;
      }
    }
  }, [isSelectQuestion, answer, options]);

  // 修复：答案HTML封装，适配SafeMathRenderer
  const answerHtml = useMemo(() => {
    if (!answer) return "<p>暂无</p>";
    return `<p><strong>【答案】</strong> ${answerDisplay}</p>`;
  }, [answer, answerDisplay]);

  // 修复：解析HTML封装，适配SafeMathRenderer
  const analysisHtml = useMemo(() => {
    if (!quesAnalysis) return "";
    // return `<p><strong>【分析】</strong> ${quesAnalysis}</p>`;
    return `<p>${quesAnalysis}</p>`;
  }, [quesAnalysis]);

  const questionMetaItems = useMemo(
    //   去掉gradeName 年级
    () => [year, area, scene],
    [year, area, scene],
  );

  const questionTagItems = useMemo(
    () => [
      { text: quesType || "单选题", type: "type" },
      { text: difficulty || "中等", type: "difficulty" },
      {
        text: kgPoints.map((point: any) => point.name).join(" "),
        type: "knowledge",
      },
    ],
    [quesType, difficulty, kgPoints],
  );

  const handleAnalysisClick = useCallback(() => {
    setShowAnswer(!showAnswer);
  }, [showAnswer]);

  const handleFavoriteClick = useCallback(async () => {
    const result = await toggleQuestionFavorite(
      data.id,
      { ...data, is_favorite: !isFavorite },
      onRefreshList,
    );
    setIsFavorite(result);
  }, [toggleQuestionFavorite, data, isFavorite, onRefreshList]);

  // 操作试题篮
  const handleAddQuestionToBasketClick = useCallback(async () => {
    if (!isInBasket && basketQuestionCount >= all_question_number) {
      modal.warning(warningConfig);
      return;
    }
    await handleQuestionToBasket(isInBasket ? "remove" : "add", data);
  }, [handleQuestionToBasket, basketQuestionCount, dispatch, isInBasket]);

  // 删除操作
  const handleDeleteClick = useCallback(async () => {
    const result = await toggleQuestionDelete(
      data.id,
      onRefreshList,
      loadQuestionBasket,
    );
  }, [toggleQuestionDelete, data, dispatch, onRefreshList, loadQuestionBasket]);

  const delBtn = () => {
    confirm({
      closable: true,
      title: (
        <div>
          <span>你确定删除该数据吗?</span>
        </div>
      ),
      icon: (
        <span className="anticon">
          <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
        </span>
      ),
      content: "",
      okButtonProps: {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      },
      onOk: async () => {
        handleDeleteClick?.();
      },
    });
  };

  const handleSimilarClick = useCallback(async () => {
    setSimilarModalVisible(true);
    setModalLoading(true);

    const payload = {
      ids: [data.id],
      stage_name: data.stageName,
      subject_name: data.subjectName,
      kg_list: kgPoints.map((item: any) => item.id),
      question_type: [data.quesType],
      difficulties: [data.difficulty],
      bank_source: 1, // 公共题库
      grade_name: data.gradeName,
    };

    try {
      const result: any = await dispatch({
        type: "resourceSearchModel/postData",
        apiUrl: "getSimilarQuestions",
        payload,
      });

      if (result?.code === 200) {
        setSimilarQuestions(result?.data || []);
        return;
      }
    } finally {
      setModalLoading(false);
    }
  }, [data, dispatch]);

  const handleSimilarModalClose = useCallback(() => {
    setSimilarModalVisible(false);
  }, []);

  // 修复：生成题目序号（传给SafeMathRenderer）
  const questionNumber = useMemo(() => {
    if (isChild) {
      return `(${index})`;
    }
    const calculatedIndex = parentIndex || (pageNum - 1) * pageSize + index;
    return `${calculatedIndex}.`;
  }, [isChild, index, parentIndex, pageNum, pageSize]);

  const actionKeys: QuestionActionKey[] = useMemo(
    () => actions ?? ["similar", "favorite", "personalDelete"],
    [actions],
  );

  // 处理选项
  const getOptions = (list: any) => {
    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }
    return list.map((val: any, index: any) => {
      return `<span>${selectOptions?.[index]}、 ${val}</span>`;
    });
  };

  return (
    <Card ref={cardRef} className="question-card" variant="borderless">
      <Flex className="question-content" vertical gap={16}>
        {/* 题目信息区 */}
        {!hideMetaTags && (
          <Flex className="question-header" vertical gap={8}>
            <Flex justify="space-between" align="center">
              <Flex gap={4}>
                <Flex className="question-meta" align="center">
                  {questionMetaItems.map((item, idx) => (
                    item && <span key={idx} className="question-meta-item">{item}</span>
                  ))}
                </Flex>
              </Flex>
              <div className="question-right-info">
                <span className="update-time">
                  创建时间：{createTime || "2024-01-01"}
                </span>
              </div>
            </Flex>

            {/* 题目标签 */}
            <div className="question-tags">
              <div className="question-tags-content">
                {questionTagItems.map(
                  (tag, idx) =>
                    tag.text &&
                    (tag.type === "knowledge" ? (
                      <Text
                        key={idx}
                        className={`question-tag-item question-tag-${tag.type}`}
                        ellipsis={{
                          tooltip: {
                            title: tag.text,
                            styles: { root: { maxWidth: `${cardWidth}px` } },
                            placement: "topRight",
                          },
                        }}
                      >
                        {tag.text}
                      </Text>
                    ) : (
                      <span
                        key={idx}
                        className={`question-tag-item question-tag-${tag.type}`}
                      >
                        {tag.text}
                      </span>
                    )),
                )}
              </div>
            </div>
          </Flex>
        )}

        {/* 题干 + 选项（由SafeMathRenderer统一渲染） */}
        <Flex
          vertical
          gap={8}
          onClick={!hasChildQuestions ? handleAnalysisClick : undefined}
          className={`question-main ${hasChildQuestions ? "has-children" : ""}`}
        >
          <Flex vertical gap={4}>
            <div className="question-stem">
              {/* 修复：移除手动渲染的序号，改为传给SafeMathRenderer的number属性 */}
              <div className="question-text">
                <SafeMathRenderer
                  html={questionHtml}
                  options={getOptions(options)}
                  isSelectQuestion={isSelectQuestion}
                  number={questionNumber} // 传递题目序号
                />
              </div>
            </div>

            {/* 音频播放器 */}
            {/* {quesAudio && (
              <div className="question-audio">
                <AudioPlayer src={quesAudio} />
              </div>
            )} */}
          </Flex>
        </Flex>

        {/* 子题展示 */}
        {hasChild && children.length > 0 && (
          <ChildQuestionList children={children} />
        )}

        {/* 答案 + 解析 */}
        {showAnswer && !hasChild && (
          <Flex vertical gap={8} className="question-answer">
            <div className="question-answer-main">
              <SafeMathRenderer html={answerHtml} />
            </div>
            {quesAnalysis && (
              <div className="question-answer-detail">
                <SafeMathRenderer html={analysisHtml} />
              </div>
            )}
          </Flex>
        )}
      </Flex>

      {/* 底部操作区 */}
      {!isChild && (
        <Flex
          className="question-footer"
          justify="space-between"
          align="center"
        >
          <div
            className="question-source"
            style={{
              visibility: showPaper ? "visible" : "hidden",
            }}
          >
            <span className="reference-text">{paperName}</span>
          </div>

          <div className="question-actions">
            <Space size="middle">
              {activeTab != "personal" && actionKeys.includes("similar") && (
                <Button type="link" size="small" onClick={handleSimilarClick}>
                  <ZYIcon type="xiangsiti" />
                  相似题
                </Button>
              )}
              {activeTab != "personal" && actionKeys.includes("favorite") && (
                <Button type="link" size="small" onClick={handleFavoriteClick}>
                  <ZYIcon
                    type={
                      isFavorite
                        ? "shoucang-yishoucang"
                        : "shoucang-weishoucang"
                    }
                    color={isFavorite ? "#FFAA00" : "#333C55"}
                  />
                  {isFavorite ? "取消收藏" : "收藏"}
                </Button>
              )}
              {actionKeys.includes("personalDelete") && (
                <Button type="link" size="small" onClick={delBtn}>
                  <ZYIcon
                    type={'shanchu'} />
                  删除
                </Button>
              )}
              {actionKeys.includes("basket") && (
                <Button
                  type="link"
                  size="small"
                  onClick={handleAddQuestionToBasketClick}
                  className={isInBasket ? 'in-basket-btn' : ''}
                >
                  <ZYIcon
                    type={isInBasket ? "yichushitilan" : "jiarushitilan"}
                  />
                  {isInBasket ? "移出试题篮" : "加入试题篮"}
                </Button>
              )}
            </Space>
          </div>
        </Flex>
      )}

      {/* 相似题弹窗 */}
      <QuestionListModal
        visible={similarModalVisible}
        onCancel={handleSimilarModalClose}
        title="相似题"
        questionList={similarQuestions}
        loading={modalLoading}
      />

      {contextHolder}
    </Card>
  );
};

export default QuestionCard;
