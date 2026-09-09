import { useState, useMemo, useEffect, useRef, useImperativeHandle } from "react";
import { message, Image, Upload, Tooltip, Button } from "antd";
import { useDispatch } from "@umijs/max"; // Fixed umi import

// import "viewerjs/dist/viewer.css";
import "./index.less";
import { PlusOutlined } from "@ant-design/icons";
import { formatStaticUrl } from "@/utils";

const pWidth = 674;

const PDFPrecise = (props: any) => {

  let { id, list, page_images, onRef } = props

  const dispatch = useDispatch();
  const [sortedList, setSortedList] = useState<any[]>([]);
  const containerRef = useRef(null);
  const [isEdit, setIsEdit] = useState<any>(false);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    setEditStatus: (status: any) => {
      setIsEdit(status)
    }
  }));



  const doUpdateChunks = async (param: any) => {
    const { del_ids, chunks } = param
    const { code, data } = await dispatch({
      type: "commonModel/postData",
      apiUrl: "updateChunksUrl",
      payload: {
        file_id: id,
        del_ids,
        chunks,
      },
    });

    if (code !== 200) {
      return [];
    }

    return data;
  };



  //  合并操作
  const handleMerge = async (idx: number) => {


    const prefixBlock = sortedList[idx];
    const suffixBlock = sortedList[idx + 1];
    console.log("prefixBlock", prefixBlock);
    console.log("suffixBlock", suffixBlock);

    const { detail, file_id, image_folder, page_idx, page_image, id } =
      prefixBlock;
    const { detail: suffix_detail, id: suffix_id } = suffixBlock;

    const { position: prefix_position, index, type, merges } = detail;
    const {
      position: suffix_position,
      type: suffix_type,
      merges: suffix_merges,
    } = suffix_detail;

    const x0 = Math.min(prefix_position[0], suffix_position[0]);
    const y0 = Math.min(prefix_position[1], suffix_position[1]);
    const x1 = Math.max(prefix_position[2], suffix_position[2]);
    const y1 = Math.max(prefix_position[3], suffix_position[3]);

    let new_merges = [];

    if (type === "merge" && suffix_type === "merge") {
      new_merges = [...merges, ...suffix_merges];
    } else if (type === "merge" && suffix_type !== "merge") {
      new_merges = [...merges, suffix_detail];
    } else if (type !== "merge" && suffix_type === "merge") {
      new_merges = [detail, ...suffix_merges];
    } else {
      new_merges = [detail, suffix_detail];
    }

    const hide = message.loading("正在合并...", 0);

    let merge = {
      file_id,
      image_folder,
      page_idx,
      page_image,
      detail: {
        position: [x0, y0, x1, y1],
        type: "merge",
        index,
        merges: new_merges,
      },
    };


    // try {

    //   const res = await doUpdateChunks({
    //     del_ids: [id, suffix_id],
    //     chunks: [merge],
    //   });

    //   hide();

    //   if (res.length <= 0) {
    //     message.error("合并失败，请重试");
    //     return;
    //   }

    //   message.success("合并成功");

    //   const ret_id = res[0];

    //   merge = {
    //     ...merge,
    //     id: ret_id,
    //   };

    //   console.log("res---", res);

    //   const newList = sortedList.slice();
    //   newList.splice(idx, 2, merge);

    //   setSortedList(newList);
    // } catch (error) {
    //   hide();
    //   message.error("合并失败，请重试");
    //   return;
    // }



  };






  //  计算系统坐标
  const getBlockSty = (param: any) => {

    const baseWidth = pWidth
    const { page_size, position } = param
    const pageWidth = page_size?.[0]  // 页面的宽
    const ratio = pageWidth / baseWidth // 缩放比例

    let [x0, y0, x1, y1] = position;
    x0 = x0 / ratio
    y0 = y0 / ratio
    x1 = x1 / ratio
    y1 = y1 / ratio

    return {
      left: x0,
      top: y0,
      width: x1 - x0,
      height: y1 - y0,
    }
  }


  const getStringHtml = (str: any) => {
    const htmlRegex = /<html>[\s\S]*<\/html>/i;
    const match = str.match(htmlRegex);
    return match[0]
  }




  const RenderItem = (param: any) => {
    const { idx, detail, is_last, } = param
    const { index } = detail;
    return (
      <div
        key={`p-${index}`}
        className={`paragraph-block`}
        style={getBlockSty(detail)}
      >

        {!is_last && (
          <Tooltip title="合并下一个chunk">
            <div
              className="merge_container"
              onClick={(e) => {
                e.stopPropagation();
                // handleMerge(idx);
              }}
            >
              <Button size="small" variant="outlined" icon={<PlusOutlined />}></Button>
            </div>
          </Tooltip>
        )}
      </div>
    );
  };


  return (

    <div className="pdf_precise_parse_container" style={{ width: `${isEdit ? '1200px' : '100%'}` }}>

      {/* <div className="left_precise_container relative" style={{ width: pWidth }}> */}
      <div className="left_precise_container relative" style={{ width: pWidth }}>
        {/* 预览图片渲染 */}
        {page_images?.map((page, index) => (
          <img
            key={`pre-${index}`}
            src={formatStaticUrl(`/static/${page}`)}
            className="page-image relative select-none -z-1"
            style={{ width: pWidth }}
          />

        ))}

        {list?.map?.((item: any, idx: any) => {
          const is_last = idx === list.length - 1;
          const { content, detail, page_image } = item;
          return (
            <RenderItem idx={idx} is_last={is_last} key={idx} {...item} />
          );
        })}
      </div>
      {/* </div> */}

      {isEdit &&
        <div className="right_edit_container">
          {list?.map?.((item: any, pIndex: any) => {


            const { content, detail, image_folder } = item;
            const { type } = detail
            if (type == "table") return <div className="text_cart" contentEditable key={pIndex}>{getStringHtml(content) || ""}</div>
            if (type == "image") {
              return <Image src={formatStaticUrl(`/static/precise/${image_folder}/inner/images/${content}`)} />
            }
            return <div className="text_cart" contentEditable key={pIndex}>{content || ""}</div>


          })}
        </div>
      }
    </div>
  );
};

export default PDFPrecise;
