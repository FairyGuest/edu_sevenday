import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Modal, Form, Transfer, Cascader, message, Dropdown, Space, Button } from 'antd'
import type { MenuProps } from 'antd';
import { useDispatch } from '@umijs/max';
import ZYIcon from '../ZYIcon';

import { getOrgId, getUserInfo } from '@/utils';
import { addNewTracking } from "@/utils";
import './index.less'

type DeptNode = {
  id: string;
  deptName: string;
  deptType: number;
  children?: DeptNode[];
};

function GradeCascader({
  value,
  onChange,
  options,
}: {
  value?: string;
  onChange?: (grade: string) => void;
  options: DeptNode[];
}) {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    if (!value) {
      setPaths([]);
    }
  }, [value]);

  return (
    <Cascader
      allowClear
      value={paths}
      options={options}
      placeholder="请选择年级"
      fieldNames={{ label: 'deptName', value: 'id', children: 'children' }}
      displayRender={(labels) => labels.join(' / ')}
      onChange={(_value, selectedOptions) => {
        setPaths((_value ?? []) as string[]);
        const grade = selectedOptions?.[selectedOptions.length - 1]?.id ?? '';
        onChange?.(grade);
      }}
    />
  );
}

export default function ShareHomework({
  onRef,
}: {
  onRef: any;
}) {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [selectedTeacherMap, setSelectedTeacherMap] = useState<Record<string, any>>({});
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [curRow, setCurRow] = useState<any>({});
  const [gradeOptions, setGradeOptions] = useState<DeptNode[]>([]);
  const [type, setType] = useState<string>("");
  const [frequentUserType, setFrequentUserType] = useState<string>("all");
  const selectedGrade = Form.useWatch('grade', form);
  const isGradeSelected = Boolean(selectedGrade);
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div 
          onClick={() => handleSelectTeacherType('all')} 
          className={`frequent-dropdown-item${frequentUserType == "all" ? " active" : ""}`}
        >
          全部老师
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div 
          onClick={() => handleSelectTeacherType('frequent')} 
          className={`frequent-dropdown-item${frequentUserType == "frequent" ? " active" : ""}`}
        >
          常用老师
        </div>
      ),
    }
  ]

  const transferDataSource = useMemo(() => {
    const teacherMap = new Map<string, any>();
    teacherData.forEach((teacher) => {
      teacherMap.set(String(teacher.userName), teacher);
    });
    targetKeys.forEach((userName) => {
      const key = String(userName);
      if (!teacherMap.has(key) && selectedTeacherMap[key]) {
        teacherMap.set(key, selectedTeacherMap[key]);
      }
    });
    return Array.from(teacherMap.values());
  }, [teacherData, targetKeys, selectedTeacherMap]);

  useImperativeHandle(onRef, () => ({
    openModal: (item: any, type: string) => {
      open(item);
      setType(type);
    }
  }))

  const open = (item: any) => {
    setIsModalOpen(true);
    setCurRow(item);
    setTeacherData([]);
    setSelectedTeacherMap({});
    setTargetKeys([]);
    form.resetFields();
    getGradeList();
  }

  const getTeacherList = async (grade: string) => {
    if (!grade) {
      setTeacherData([]);
      return;
    }
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getOrgTeacherList",
      payload: {
        org_id: getOrgId(),
        grade_id: grade,
      },
    });
    if (code === 200) {
      // const list = data?.list || data || [];
      const currentUserId = getUserInfo('edu_id');
      const list = (data?.list || data || []).map((teacher: any) => ({
        ...teacher,
        disabled: String(teacher.userName) === String(currentUserId),
      }));
      setTeacherData(list);
      setSelectedTeacherMap((prev) => {
        const nextMap = { ...prev };
        list.forEach((teacher: any) => {
          const key = String(teacher.userName);
          if (targetKeys.includes(key)) {
            nextMap[key] = teacher;
          }
        });
        return nextMap;
      });
      return;
    }
  }

  const handleSelectTeacherType = (type: string) => {
    setFrequentUserType(type);
    if (type == "all") {
      getTeacherList(selectedGrade);
    } else {
      getFrequentTeacherList();
    }
  }

  const getFrequentTeacherList = async () => {
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "getFrequentUserList",
      payload: {
        edu_id: getUserInfo('edu_id'),
      },
    });
    if (code === 200) {
      const list = data ?? [];
      setTeacherData(list);
      setSelectedTeacherMap((prev) => {
        const nextMap = { ...prev };
        list.forEach((teacher: any) => {
          const key = String(teacher.userName);
          if (targetKeys.includes(key)) {
            nextMap[key] = teacher;
          }
        });
        return nextMap;
      });
    }
  }

  const handleGradeChange = (grade: string) => {
    setFrequentUserType("all");
    setTeacherData([]);
    getTeacherList(grade);
  }

  const getGradeList = async () => {
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getOrgGradeList",
      payload: {
        org_id: getOrgId()
      },
    });
    if (code === 200) {
      setGradeOptions(data?.children ?? []);
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setTeacherData([]);
    setSelectedTeacherMap({});
    setTargetKeys([]);
    setFrequentUserType("all");
    form.resetFields();
  }

  const FrequentUserDropdown = useCallback(() =>{
    return (
      <Dropdown menu={{ items }} disabled={!isGradeSelected}>
        <Button
          type="text"
          className='frequent-dropdown-btn'
          disabled={!isGradeSelected}
        >
          {frequentUserType == "all" ? "全部老师" : "常用老师"}
          <ZYIcon type='xiajiantou' />
        </Button>
      </Dropdown>
    )
  }, [isGradeSelected, frequentUserType])

  const onFinish = async(values: any) => {
    const payload = {
      exam_id: curRow?.exam_id,
      receivers: values?.user_id_list?.map((id: any) => ({
        id,
        name: selectedTeacherMap[String(id)]?.nickName ?? transferDataSource.find((teacher: any) => teacher.userName === id)?.nickName,
      })),
      edu_id: getUserInfo('edu_id'),
      edu_name: getUserInfo('name'),
      org_id: getOrgId(),
    }
    setLoading(true);
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "shareHomeworkUrl",
      payload,
    });
    if (code === 200) {
      message.success("共享作业成功");
      handleCancel();
    }
    setLoading(false);
  }

  return (
    <Modal
      title='添加作业共享人'
      open={isModalOpen}
      loading={loading}
      onOk={() => {
        form.submit();
        type == "home" && (
          addNewTracking({
            bt: 'cl',
            ct: 'home_online_hw_share_hw_modal_confirm_click',
            ctid: curRow?.exam_id,
            ctvl: curRow?.title
          })
        ) || (
            addNewTracking({
              bt: 'cl',
              ct: 'hw_assign_share_hw_modal_confirm_click',
              ctid: curRow?.exam_id,
              ctvl: curRow?.title
            })
          )


      }}
      onCancel={handleCancel}
      width={664}
      destroyOnHidden={true}
    >
      <Form
        name="basic"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onValuesChange={(changedValues) => {
          if ('grade' in changedValues) {
            handleGradeChange(changedValues.grade);
          }
        }}
        autoComplete="off"
        form={form}
      >
        <Form.Item
          label="年级"
          name="grade"
          rules={[{ required: true, message: "请选择年级" }]}
        >
          <GradeCascader options={gradeOptions} />
        </Form.Item>
        <Form.Item
          label=""
          name="user_id_list"
          style={{ width: "100%" }}
          rules={[{ required: true, message: "请选择要共享作业的老师" }]}
        >
          <Transfer
            style={{ width: "100%" }}
            listStyle={{
              width: 300,
              height: 300,
            }}
            titles={[<FrequentUserDropdown />]}
            rowKey={(record) => record.userName}
            dataSource={transferDataSource}
            targetKeys={targetKeys}
            locale={{ itemUnit: "人", itemsUnit: "人" }}
            showSearch={{ placeholder: "输入姓名查找老师" }}
            filterOption={(value: string, option: any) =>
              option?.nickName?.includes(value)
            }
            onChange={(newTargetKeys: any) => {
              const normalizedTargetKeys = (newTargetKeys ?? []).map((key: any) => String(key));
              setTargetKeys(normalizedTargetKeys);
              setSelectedTeacherMap((prev) => {
                const nextMap: Record<string, any> = {};
                normalizedTargetKeys.forEach((userName: string) => {
                  const existedTeacher = prev[userName];
                  const latestTeacher = transferDataSource.find((teacher: any) => String(teacher.userName) === userName);
                  if (latestTeacher) {
                    nextMap[userName] = latestTeacher;
                  } else if (existedTeacher) {
                    nextMap[userName] = existedTeacher;
                  }
                });
                return nextMap;
              });
              form.setFieldsValue({ user_id_list: normalizedTargetKeys });
            }}
            render={(item) => item.nickName}
            selectAllLabels={[
              ({ selectedCount, totalCount }) => `${selectedCount}/${totalCount}`,
              ({ selectedCount, totalCount }) => `${selectedCount}/${totalCount}`,
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
