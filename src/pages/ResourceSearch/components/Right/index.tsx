import { Flex } from "antd";
import FilterSection from "../FilterSection";
import ResultList from "../ResultList";
import "./index.less";

const Right = () => {

  return (
    <Flex className="list-panel" vertical gap={24}>
      {/* 查询表单栏 */}
      <FilterSection />

      {/* 列表结果 */}
      <ResultList />
    </Flex>
  );
};

export default Right;
