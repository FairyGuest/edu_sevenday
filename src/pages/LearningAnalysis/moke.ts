const classList: any[] = [{
    name: "一年级 1班",
    id: 1,
    last_submit_time: "2025-11-07 11:21:41",
    students: [
        {
            id: 1,
            name: "张三",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 2,
            name: "李四",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 3,
            name: "王五",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 4,
            name: "孙七",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 5,
            name: "张三a",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 6,
            name: "李四d",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 7,
            name: "王五ce",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 8,
            name: "孙七edf",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 9,
            name: "张三f",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 10,
            name: "李四f",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 11,
            name: "王五f",
            last_submit_time: "2025-11-07 11:21:41",
        },
        {
            id: 12,
            name: "孙七3",
            last_submit_time: "2025-11-07 11:21:41",
        },
    ]
}, {
    name: "一年级 2班",
    id: 2,
    last_submit_time: "2025-11-07 11:21:41",
    students: [
        {
            id: 14,
            name: "赵六",
            last_submit_time: "2025-11-07 11:21:41",
        },
    ]
}, {
    name: "一年级 3班",
    id: 3,
    last_submit_time: "2025-11-07 11:21:41",
    students: [
        {
            id: 15,
            name: "孙七",
            last_submit_time: "2025-11-07 11:21:41",
        },
    ]
}]

const baseInfo = {
    data: {
        "student_name": "新组织学生5",
        "teacher_name": "陈志明新管理员1",
        "subject_name": "数学",
        "class_name": "测试自动批改",
        "report_generated_date": "2025-11-20",
        "start_time": "2025-10-31",
        "end_time": "2025-11-06",
        "task_stats": {
          "assigned_count": 23,
          "submitted_count": 9,
          "class_avg_submitted_count": 5.1
        },
        "question_stats": {
          "student_completed_questions": 69,
          "teacher_assigned_questions": 167,
          "class_avg_completed_questions": 40.1
        },
        "accuracy_stats": {
          "student_avg_accuracy": 43.5,
          "class_avg_accuracy": 49.8
        },
        "kp_excellence_stats": {
          "student_rate": 36.4,
          "class_rate": 34.2,
          "student_detail": {
            "good_kp_count": 28,
            "total_kp_count": 77
          }
        },
        "ai_analysis": "本阶段数学学习（2025-10-31至2025-11-06）中，你与班级存在差距，基础或高阶掌握待提升约6.3个百分点。本阶段共提交9次，较班级多3.9次，频次充足，显示出较好的学习投入。你的知识点掌握呈现两极分化，有28个知识点达到优异水平，但49个知识点处于较薄弱或急需提升状态，基础项需优先回补。建议你先用错题回溯概念与步骤，确保基础知识点理解透彻；然后针对薄弱知识点进行分层练习，逐步提升熟练度；最后通过限时小卷自检与方法卡复盘来巩固学习成果。你深夜提交2次，建议把练习适度前移以保证专注。稳定投入、循序渐进，你能看见自己的进步。",
        "ai_triggered": 1
    }
}

const homeworkChartData = {
    data: [
      {
          "date": "2025-10-29",
          "submissions": [
              {
                  "submit_time": "2025-10-29 20:00:00"
              },
              {
                  "submit_time": "2025-10-29 20:00:00"
              }
          ],
          "student_accuracy": 50,
          "class_accuracy": 43.8
      },
      {
          "date": "2025-10-30",
          "submissions": [
              {
                  "submit_time": "2025-10-30 20:00:00"
              },
              {
                  "submit_time": "2025-10-30 20:00:00"
              }
          ],
          "student_accuracy": 50,
          "class_accuracy": 55.6
      },
      {
          "date": "2025-11-01",
          "submissions": [
              {
                  "submit_time": "2025-11-01 06:20:00"
              },
              {
                  "submit_time": "2025-11-01 19:30:00"
              }
          ],
          "student_accuracy": 50,
          "class_accuracy": 66.7
      },
      {
          "date": "2025-11-02",
          "submissions": [
              {
                  "submit_time": "2025-11-02 12:59:00"
              },
              {
                  "submit_time": "2025-11-02 14:59:00"
              }
          ],
          "student_accuracy": 57.1,
          "class_accuracy": 54.8
      },
      {
          "date": "2025-11-03",
          "submissions": [
              {
                  "submit_time": "2025-11-03 06:20:00"
              },
              {
                  "submit_time": "2025-11-03 06:20:00"
              }
          ],
          "student_accuracy": 100,
          "class_accuracy": 59.5
      },
      {
          "date": "2025-11-04",
          "submissions": [
              {
                  "submit_time": "2025-11-04 11:41:57"
              },
              {
                  "submit_time": "2025-11-04 15:20:16"
              }
          ],
          "student_accuracy": 30.4,
          "class_accuracy": 24.1
      },
      {
          "date": "2025-11-05",
          "submissions": [
              {
                  "submit_time": "2025-11-05 10:52:20"
              }
          ],
          "student_accuracy": 66.7,
          "class_accuracy": 66.7
      },
      {
          "date": "2025-11-06",
          "submissions": [
              {
                  "submit_time": "2025-11-06 11:21:41"
              },
              {
                  "submit_time": "2025-11-06 11:25:13"
              }
          ],
          "student_accuracy": 40,
          "class_accuracy": 58.8
      },
      {
          "date": "2025-11-07",
          "submissions": [
              {
                  "submit_time": "2025-11-07 17:10:32"
              }
          ],
          "student_accuracy": 66.7,
          "class_accuracy": 46.7
      }
  ]
}

const knowledgeGraspChartData = {
    data: {
      "personalData": [
          {
              "name": "优异",
              "value": 27,
              "accuracy": 100
          },
          {
              "name": "良好",
              "value": 3,
              "accuracy": 84.7
          },
          {
              "name": "一般",
              "value": 3,
              "accuracy": 75
          },
          {
              "name": "较薄弱",
              "value": 16,
              "accuracy": 50
          },
          {
              "name": "急需提升",
              "value": 50,
              "accuracy": 2
          }
      ],
      "classData": [
          {
              "name": "优异",
              "value": 7,
              "accuracy": 98.6
          },
          {
              "name": "良好",
              "value": 5,
              "accuracy": 80
          },
          {
              "name": "一般",
              "value": 4,
              "accuracy": 72.2
          },
          {
              "name": "较薄弱",
              "value": 22,
              "accuracy": 57.1
          },
          {
              "name": "急需提升",
              "value": 61,
              "accuracy": 20.2
          }
      ],
      "knowledge_point_count": 99
  }
}

const knowledgeChartData = {
    data:[
        {
          "knowledgeName": "第十三章 轴对称",
          "personalRate": 100,
          "classRate": 40,
          "simpleNum": 289,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 99,
          "mediumRightRate": 0,
          "hardRightRate": 100,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 100
        },
        {
          "knowledgeName": "第十二章 全等三角形",
          "personalRate": 100,
          "classRate": 60,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 100,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 100
        },
        {
          "knowledgeName": "12.3 角的平分线的性质",
          "personalRate": 100,
          "classRate": 60,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 100,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 100
        },
        {
          "knowledgeName": "13.4 课题学习 最短路径问题",
          "personalRate": 100,
          "classRate": 40,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 100,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 100
        },
        {
          "knowledgeName": "角平分线的性质与判定的综合",
          "personalRate": 100,
          "classRate": 60,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 100,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 100
        },
        {
          "knowledgeName": "利用轴对称和平移解决最短路径问题",
          "personalRate": 100,
          "classRate": 40,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 100,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 100
        },
        {
          "knowledgeName": "角平分线的有关计算",
          "personalRate": 100,
          "classRate": 90,
          "simpleNum": 10,
          "mediumNum": 0,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 100,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "构造二元一次方程组求解",
          "personalRate": 100,
          "classRate": 80,
          "simpleNum": 5,
          "mediumNum": 0,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 100,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "7.3 定义、命题、定理",
          "personalRate": 0,
          "classRate": 0,
          "simpleNum": 5,
          "mediumNum": 0,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "第十六章 整式的乘法",
          "personalRate": 0,
          "classRate": 20,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "与垂直定义有关的计算",
          "personalRate": 0,
          "classRate": 40,
          "simpleNum": 0,
          "mediumNum": 5,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "9.2 坐标方法的简单应用",
          "personalRate": 0,
          "classRate": 20,
          "simpleNum": 0,
          "mediumNum": 5,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "第七章 相交线与平行线",
          "personalRate": 0,
          "classRate": 22,
          "simpleNum": 25,
          "mediumNum": 20,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "第九章 平面直角坐标系",
          "personalRate": 0,
          "classRate": 20,
          "simpleNum": 0,
          "mediumNum": 5,
          "hardNum": 0,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0
        },
        {
          "knowledgeName": "同旁内角互补两直线平行",
          "personalRate": 0,
          "classRate": 40,
          "simpleNum": 0,
          "mediumNum": 10,
          "hardNum": 0,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0
        },
        {
          "knowledgeName": "平行线性质与判定的专题",
          "personalRate": 0,
          "classRate": 40,
          "simpleNum": 0,
          "mediumNum": 5,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "用平行线性质与判定解决拐角问题",
          "personalRate": 0,
          "classRate": 40,
          "simpleNum": 0,
          "mediumNum": 5,
          "hardNum": 0,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        },
        {
          "knowledgeName": "整式混合运算与新定义型及规律性问题",
          "personalRate": 0,
          "classRate": 20,
          "simpleNum": 0,
          "mediumNum": 0,
          "hardNum": 5,
          "littleSimpleNum": 0,
          "littleHardNum": 12,
          "simpleRightRate": 0,
          "mediumRightRate": 0,
          "hardRightRate": 0,
          "littleSimpleRightRate": 0,
          "littleHardRightRate": 0
        }
    ]
}

export default {
    classList,
    baseInfo,
    homeworkChartData,
    knowledgeGraspChartData,
    knowledgeChartData
}