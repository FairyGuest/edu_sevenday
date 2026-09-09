
import React, { useEffect, useImperativeHandle, useRef, useState } from "react"
import ForceGraph3D from "3d-force-graph"
import SpriteText from "three-spritetext" // 导入 three-spritetext 库:cite[1]:cite[2]
import * as d3 from "d3-force-3d"


import { connect, useDispatch, useLocation } from "@umijs/max";
import { cloneDeep } from 'lodash';
import { Spin } from "antd";

import "./index.less";

const Home = (props: any) => {
  const { onRef, doc_ids, } = props;
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const space_id = searchParams.get("courseId"); // 课程id
  const dispatch = useDispatch();
  const dom = useRef(null)
  const [laoding, setLoading] = useState(false); // 水平数据


  useImperativeHandle(onRef, () => ({
    getGraph: async (param: any) => {
      if (param){
        return 
      }
      getDataArr({ doc_ids: param["doc_ids"] })
    },
  }));


  useEffect(() => {
    getDataArr({ doc_ids})
}, [doc_ids]);







  // 获取智能体列表
  const getDataArr = async (payload = {}) => {
    setLoading(true)
    const { code, data } = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "graphsandcatalog3Url",
      payload: {
        // doc_id: docids[0] || "",
        doc_ids: doc_ids || [],
        space_id: space_id,
        ...payload
      },
    });
    setLoading(false)
    let nodes:any=[] 
    let links = []
    if (data?.id ) {
      const newData = cloneDeep(data?.child_nodes)
      nodes = getNodes(newData) || []
      links = getLinks(getParentNodes(newData))
    }
    initData(nodes, links)

  };



  function initData(nodes: any, links: any) {

    new ForceGraph3D(dom.current as HTMLDivElement)
      .graphData({
        nodes: nodes,
        links: links.map((item: any) => {
          // item.distance = 100 // 设置链接距离
          return item
        }),
      })
      .nodeColor((node: any) => {
        let color = node.color || "#CBD2E1"
        if (node.group == 1) {
          return color
        }
        let _node = node
        while (_node) {
          _node = _node.parent
          if (_node && _node.group > 1 && _node?.color) {
            color = _node.color
          }
        }
        return color
      })
      // 设置一级节点颜色
      .nodeAutoColorBy("group")
      .nodeLabel((node) => `${node.name}`)
      .nodeVal((node) => node.val)
      .d3Force("link", d3.forceLink().distance(100)) // 设置链接距离
      .nodeThreeObjectExtend(true) // 扩展而非替换默认节点对象:cite[1]:cite[2]:cite[4]
      .nodeThreeObject((node) => {
      
        const sprite = new SpriteText(node.name)
        sprite.color = "#000000ff" // 设置文本颜色
        sprite.textHeight = 3 // 设置文本大小
        sprite.padding = 5 // 设置内边距（可选）
        // 调整标签位置，避免与节点球体重叠
        sprite.position.set(0, 10, 0)
        sprite.material.transparent = true // 使文本精灵透明
        sprite.material.opacity = 0.7 // 设置文本透明度
        return sprite
      })
      .linkWidth(1) // 设置链接宽度
      .linkColor("#000000ff") // 设置链接颜色
      .linkDirectionalParticles(0) // 粒子数量
      .linkDirectionalParticleWidth(0) // 粒子宽度
      .linkDirectionalArrowLength(0)  // 箭头长度
      .linkDirectionalArrowRelPos(0) // 箭头位置
      // 背景颜色
      .backgroundColor("#ffffffff")
      // 添加背景图片
      // .linkCurvature(0.25) 
      // console.log(ForceGraph3D)
      // const myGraph = new ForceGraph3D(dom.current as HTMLDivElement, myData)
      // console.log(myGraph)
      // myGraph(dom).graphData(myData)
      // .nodeThreeObjectExtend(true) // 扩展而非替换默认节点对象
      // 拖动节点
      .onNodeDragEnd((node) => {
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
      })
      // 点击节点
      .onNodeClick((node) => {
        console.log("点击节点", node)
      })
  }




  // 数据扁平化
  const colors = ["#B3BBCD", "#F5A401", "#486AFF", "#793DD8"];
  function getNodes<T extends data>(arr: T[], initData: T[] = [],index:number = 0) {
    arr.forEach((item) => {
      const { title, child_nodes, content_list} = item; 
      item["children"] = content_list || child_nodes
      item["color"] = colors[index] || colors[3]
      initData.push({ ...item, name: title })
      if (item.children) {
        getNodes(item.children, initData,index+1)
      }
    })
    return initData
  }


  // 构建父子拥有级关系的数据
  function getParentNodes<T extends data>(
    arr: T[],
    group: number = 1,
    parent: T | null = null
  ) {
    arr.forEach((item) => {
      item.group = group
      if (parent) {
        item.parent = parent
      }
      if (item.children) {
        getParentNodes(item.children, group + 1, item)
      }
    })
    return arr
  }


  // 获取链接层数据
  function getLinks(arr: any, result: any = []) {
    arr.forEach((item) => {
      if (item.parent) {
        result.push({ source: item.parent.id, target: item.id })
      }
      if (item.children) {
        getLinks(item.children, result)
      }
    })
    return result
  }
  //   const onclgraph = (item: any) => {
  //     const targetNode = nodesdata.find((node) => node.id === item.id)
  //     console.log(targetNode);
  //     const {x, y, z} = targetNode; // 获取节点的位置
  //      if (targetNode && dom.current) {
  //     const { x, y, z } = targetNode; // 获取节点的位置 
  //     const camera = graph3D.current?.camera; // 获取相机对象
  //     const controls = graph3D.current?.controls; // 获取控制器对象
  //     const target = new THREE.Vector3(x, y, z); // 创建目标位置向量
  //     controls?.lookAt(target); // 设置控制器目标位置
  //     camera?.lookAt(target); // 设置相机目标位置
  //     // 添加动画效果
  //     new TWEEN.Tween(camera.position) // 创建动画对象
  //       .to({ x: x, y: y, z: z + 100 }, 1000) // 设置动画目标位置和持续时间
  //       .easing(TWEEN.Easing.Quadratic.Out) // 设置动画缓动函数
  //       .start(); // 启动动画
  //       TWEEN.update(); // 更新动画状态
  //       // 更新渲染器状态
  //   }
  // }

  return (
    <Spin
    className="graph_loading_container"
    tip="图谱更新中..."
    size="large"
    spinning={laoding}
  >
    <div className="home-container">
      <div id="home-content" style={{ position: "relative", width: "100vw", height: "100vh" }} ref={dom}></div>
    </div>
    </Spin>

  );
};


export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
  commonModel: state.commonModel,
}))(Home);
