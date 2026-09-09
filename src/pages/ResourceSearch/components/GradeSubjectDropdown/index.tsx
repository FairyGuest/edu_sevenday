import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Flex, Tabs } from 'antd';
import { useSelector } from 'umi';
import { useHeader } from '../../hooks/useHeader';
import stageSubjectData from '../../enums/stageSubjectList.json';
import './index.less';
import ZYIcon from "@/components/ZYIcon";

const GRADE_SUBJECT_OPTIONS = stageSubjectData.stage_subject_list;

const GradeSubjectDropdown: React.FC = () => {
  // 从models获取数据
  const { gradeName, subjectName } = useSelector((state: any) => state.resourceSearchModel);

  // 从hooks获取状态变更操作
  const { onSubjectChange } = useHeader();
  const [open, setOpen] = useState(false);
  const [tempGradeLevel, setTempGradeLevel] = useState(gradeName);
  const [selectedLabel, setSelectedLabel] = useState(""); // 本地展示值：点击后立即更新，避免触发区文案使用旧值
  const triggerRef = useRef<any>(null);

  const gradeSubjectOptions = GRADE_SUBJECT_OPTIONS;

  // 获取当前学段的学科列表
  const currentGradeData = gradeSubjectOptions.find((item: any) => item.stage_name === tempGradeLevel);
  const subjects = currentGradeData?.subject_list || [];

  useEffect(() => {
    setSelectedLabel(`${gradeName || ""}${subjectName || ""}`);
  }, [gradeName, subjectName]);

  const handleGradeClick = (gradeName: string) => {
    setTempGradeLevel(gradeName);
  };

  const handleSubjectClick = (subjectNametab: string) => {
    if (!subjectNametab || subjectNametab == subjectName && tempGradeLevel == gradeName) return;
    const nextGradeLevel = tempGradeLevel || gradeName;
    setSelectedLabel(`${nextGradeLevel || ""}${subjectNametab}`);
    onSubjectChange(subjectNametab, nextGradeLevel);
    setOpen(false);
  };

  const handleOpenChange = (flag: boolean) => {
    setOpen(flag);
    if (flag) {
      setTempGradeLevel(gradeName);
    }
  };

  const dropdownContent = (
    <div className="grade-subject-dropdown-content" style={{ width: triggerRef.current?.offsetWidth || 'auto' }}>
      {/* 学段选择 */}
      <Tabs
        activeKey={tempGradeLevel}
        onChange={handleGradeClick}
        items={gradeSubjectOptions.map((grade: any) => ({
          key: grade.stage_name,
          label: grade.stage_name,
        }))}
        className="grade-selector"
      />

      {/* 学科选择 */}
      <Flex wrap="wrap" gap="16px 34px" className="subject-selector">
        {subjects.map((subjectItem: any) => (
          <div
            key={subjectItem.name}
            className={`subject-item ${subjectName === subjectItem.name && gradeName === tempGradeLevel ? 'active' : ''}`}
            onClick={() => handleSubjectClick(subjectItem.name)}
          >
            {subjectItem.name}
          </div>
        ))}
      </Flex>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={handleOpenChange}
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomLeft"
    >
      <Flex className="grade-subject-dropdown-trigger" align="center" gap={6} ref={triggerRef}>
        <ZYIcon type="jiaocai" size={14} color='#475069'/>
        <span className="trigger-text">
          {selectedLabel || `${gradeName || ""}${subjectName || ""}`}
        </span>
        <ZYIcon type="xiajiantou" size={16} color='#64748B'/>
      </Flex>
    </Dropdown>
  );
};

export default GradeSubjectDropdown;
