import { DownloadOutlined } from "@ant-design/icons";
import { Button, Select, Spin } from "antd";
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import MindMap from "simple-mind-map";
import Export from "simple-mind-map/src/plugins/Export.js";
import ExportPDF from "simple-mind-map/src/plugins/ExportPDF.js";
import { connect, useDispatch, useLocation } from "@umijs/max";
import KegHeader from "../KegHeader";
import "./index.less";

MindMap.usePlugin(Export);
MindMap.usePlugin(ExportPDF);
const SimpleMindMap = (props: any) => {
  const { onRef, docId, setQuestionsModel } = props;
  const mindMapRef = useRef(null);
  const mindMapInstanceRef = useRef<any>(null);
  const dispatch = useDispatch();
  const [currentLevel, setCurrentLevel] = useState<string>("3");
  const updateTimerRef = useRef<any>(null);
  const { MindLoading } = setQuestionsModel;

  useEffect(() => {
    if (docId) {
      getData();
    }
  }, [docId]);

  // 使用防抖处理层级变化，避免频繁更新
  const handleLevelChange = useCallback((value: string) => {
    setCurrentLevel(value);

    // 清除之前的定时器
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    // 如果思维导图实例已创建，则更新显示
    if (mindMapInstanceRef.current) {
      try {
        // 延迟执行以确保DOM更新完成
        updateTimerRef.current = setTimeout(() => {
          updateDisplayByLevel(value);
          updateTimerRef.current = null;
        }, 300);
      } catch (error) {
        console.error("切换层级时出错:", error);
      }
    }
  }, []);

  // 根据层级更新思维导图显示
  const updateDisplayByLevel = useCallback((level: string) => {
    const numLevel = parseInt(level);
    const instance = mindMapInstanceRef.current;
    if (!instance || !instance.renderer || !instance.renderer.root) {
      console.warn("思维导图实例或根节点未准备好");
      return;
    }

    try {
      // 直接更新节点数据，而不是调用命令
      updateNodesExpandState(instance.renderer.root, 1, numLevel);

      // 重新渲染
      instance.render();
    } catch (error) {
      console.error("更新思维导图层级显示时出错:", error);
    }
  }, []);

  // 更新节点的展开状态
  const updateNodesExpandState = (
    node: any,
    currentLevel: number,
    maxLevel: number,
  ) => {
    //  console.log(1, node);
    if (!node || !node.nodeData.data) return;

    // 如果是顶层节点，始终展开
    if (currentLevel <= maxLevel) {
      node.nodeData.data.expand = true;
    } else {
      // 超过最大层级，折叠节点
      node.nodeData.data.expand = false;
    }

    // 继续处理子节点
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        updateNodesExpandState(child, currentLevel + 1, maxLevel);
      });
    }
  };

  // 下载思维导图为PNG图片
  const downloadMindMapAsPng = () => {
    const instance = mindMapInstanceRef.current;
    if (!instance) {
      console.warn("思维导图实例未初始化");
      return;
    }

    try {
      // 使用官方API导出为PNG图片
      instance.export("png", true, "思维导图");
    } catch (error) {
      console.error("导出思维导图为PNG图片失败:", error);
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(onRef, () => ({
    zoomIn: () => {
      if (mindMapRef.current) {
        console.log("mindMapRef.current 所有属性和方法:");
        console.dir(mindMapRef.current);
        // return
        // 使用 renderer.scale 方法进行缩放
        // mindMapRef.current.execCommand('ZOOM', { scale: 1.5 }); // 放大 10%
      }
    },
    zoomOut: () => {
      if (mindMapRef.current) {
        // 使用 renderer.scale 方法进行缩放
        // mindMapRef.current.renderer.scale(0.9); // 缩小 10%
      }
    },

    toggleFullscreen: () => {
      const container = mindMapRef.current;
      if (!container) return;
    },
  }));

  let instanceRef: any = useRef(null);

  const initMind = (param: any) => {
    if (mindMapRef.current) {
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
      const instance = new MindMap({
        el: mindMapRef.current,
        scaleRatio: 0.1, // 放大缩小的增量比例
        minZoomRatio: 20, // 最小缩放比例
        maxZoomRatio: 400, // 最大缩放比例
        // 添加鼠标滚轮相关配置
        mousewheelAction: "zoom", // zoom（放大缩小）、move（上下移动）
        mousewheelMoveStep: 100, // 当mousewheelAction设为move时，控制鼠标滚动一下视图移动的步长
        mouseScaleCenterUseMousePosition: true, // 以鼠标当前位置为中心点进行缩放
        mousewheelZoomActionReverse: false, // false表示向前滚动放大，向后滚动缩小
        disableMouseWheelZoom: false, // 允许使用鼠标滚轮缩放
        data: param,
        layout: "logicalStructure", // 逻辑结构图布局
        theme: "classic",
        enableFreeDrag: true, // 允许节点自由拖拽
        textAutoWrapWidth: 300, // 文字自动换行宽度
        initRootNodePosition: ["left", "center"], //初始根节点的位置
      } as any); // 使用类型断言解决TypeScript警告

      instanceRef.current = instance;

      // 保存实例引用
      mindMapInstanceRef.current = instance;
      // 检查实例和根节点是否已准备好
      if (instance && instance.renderer && instance.renderer.root) {
        updateDisplayByLevel(currentLevel);
      }
    }
  };

  const buildTree = (arr: any, parentId = null) => {
    const tree = [];
    for (const item of arr) {
      item.data = {
        text: item.title,
        expand: true,
      };
      if (item.parent_id === parentId) {
        const children = buildTree(arr, item.id); // 递归查找子节点
        if (children.length > 0) {
          item.children = children; // 如果有子节点，添加到 children 属性
        }
        tree.push(item); // 将当前节点添加到树中
      }
    }
    return tree;
  };

  // getMindMap
  const getData = async () => {
    const result: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getMindMapUrl",
      mLoading: "MindLoading",
      payload: { doc_id: docId },
    });

    if (result?.code == 200) {
      const newData = buildTree(result.data.mind_dic); // 数据转换
      initMind(newData?.[0] || {});
    }
  };

  return (
    <>
      {/* <KegHeader {...props} title="思维导图" defaultValue={"mindMap"} /> */}

      <Spin spinning={MindLoading}>
        <div className="mind_map_continer">
          <div
            ref={mindMapRef}
            id="mindMapContainer"
            style={{
              height: "100%",
              width: "100%",
            }}
          ></div>
          {/* <div className="choose-container">
            <Select
              value={currentLevel}
              style={{ width: 70, height: 24 }}
              onChange={handleLevelChange}
              options={[
                { value: "1", label: "一级" },
                { value: "2", label: "二级" },
                { value: "3", label: "三级" },
              ]}
            />
            <span className="line-box"> | </span>
            <Button
              type="text"
              icon={<DownloadOutlined style={{ fontSize: "18px" }} />}
              onClick={downloadMindMapAsPng}
            />
          </div> */}
        </div>
      </Spin>
    </>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(SimpleMindMap);
