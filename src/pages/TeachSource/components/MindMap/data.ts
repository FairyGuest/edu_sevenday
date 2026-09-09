export const defaultMindMapData = {
    data: {
      text: '项目开发流程',
      expand: true,
      uid: '1',
      richText: false,
      tag: ['核心', '重要'],
      note: '这是一个项目开发全流程的思维导图'
    },
    children: [
      {
        data: {
          text: '需求分析',
          expand: true,
          uid: '2'
        },
        children: [
          {
            data: {
              text: '用户调研',
              expand: true,
              uid: '3'
            },
            children: [
              {
                data: {
                  text: '问卷调查',
                  expand: true,
                  uid: '31'
                },
                children: []
              },
              {
                data: {
                  text: '用户访谈',
                  expand: true,
                  uid: '32'
                },
                children: []
              }
            ]
          },
          {
            data: {
              text: '需求文档',
              expand: true,
              uid: '4'
            },
            children: [
              {
                data: {
                  text: '功能列表',
                  expand: true,
                  uid: '41'
                },
                children: []
              },
              {
                data: {
                  text: '原型设计',
                  expand: true,
                  uid: '42',
                  tag: ['重要']
                },
                children: []
              }
            ]
          }
        ]
      },
      {
        data: {
          text: '产品设计',
          expand: true,
          uid: '5'
        },
        children: [
          {
            data: {
              text: 'UI设计',
              expand: true,
              uid: '6'
            },
            children: [
              {
                data: {
                  text: '视觉规范',
                  expand: true,
                  uid: '61'
                },
                children: []
              },
              {
                data: {
                  text: '交互原型',
                  expand: true,
                  uid: '62'
                },
                children: []
              }
            ]
          },
          {
            data: {
              text: '用户体验',
              expand: true,
              uid: '7'
            },
            children: [
              {
                data: {
                  text: '可用性测试',
                  expand: true,
                  uid: '71'
                },
                children: []
              },
              {
                data: {
                  text: '用户反馈',
                  expand: true,
                  uid: '72'
                },
                children: []
              }
            ]
          }
        ]
      },
      {
        data: {
          text: '开发实现',
          expand: true,
          uid: '8',
          tag: ['核心']
        },
        children: [
          {
            data: {
              text: '前端开发',
              expand: true,
              uid: '9',
              note: '包括Web、移动端等各种用户界面实现'
            },
            children: [
              {
                data: {
                  text: 'HTML/CSS',
                  expand: true,
                  uid: '91'
                },
                children: []
              },
              {
                data: {
                  text: 'JavaScript',
                  expand: true,
                  uid: '92'
                },
                children: [
                  {
                    data: {
                      text: 'React',
                      expand: true,
                      uid: '921'
                    },
                    children: []
                  },
                  {
                    data: {
                      text: 'Vue',
                      expand: true,
                      uid: '922'
                    },
                    children: []
                  }
                ]
              },
              {
                data: {
                  text: '移动端',
                  expand: true,
                  uid: '93'
                },
                children: [
                  {
                    data: {
                      text: 'React Native',
                      expand: true,
                      uid: '931'
                    },
                    children: []
                  },
                  {
                    data: {
                      text: 'Flutter',
                      expand: true,
                      uid: '932'
                    },
                    children: []
                  }
                ]
              }
            ]
          },
          {
            data: {
              text: '后端开发',
              expand: true,
              uid: '10'
            },
            children: [
              {
                data: {
                  text: '服务器',
                  expand: true,
                  uid: '101'
                },
                children: [
                  {
                    data: {
                      text: 'Node.js',
                      expand: true,
                      uid: '1011'
                    },
                    children: []
                  },
                  {
                    data: {
                      text: 'Java',
                      expand: true,
                      uid: '1012'
                    },
                    children: []
                  }
                ]
              },
              {
                data: {
                  text: '数据库',
                  expand: true,
                  uid: '102'
                },
                children: [
                  {
                    data: {
                      text: 'MySQL',
                      expand: true,
                      uid: '1021'
                    },
                    children: []
                  },
                  {
                    data: {
                      text: 'MongoDB',
                      expand: true,
                      uid: '1022'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        data: {
          text: '测试',
          expand: true,
          uid: '11'
        },
        children: [
          {
            data: {
              text: '单元测试',
              expand: true,
              uid: '12'
            },
            children: []
          },
          {
            data: {
              text: '集成测试',
              expand: true,
              uid: '13'
            },
            children: []
          },
          {
            data: {
              text: '用户测试',
              expand: true,
              uid: '14'
            },
            children: []
          }
        ]
      },
      {
        data: {
          text: '部署上线',
          expand: true,
          uid: '15'
        },
        children: [
          {
            data: {
              text: '持续集成',
              expand: true,
              uid: '16'
            },
            children: [
              {
                data: {
                  text: 'Jenkins',
                  expand: true,
                  uid: '161'
                },
                children: []
              },
              {
                data: {
                  text: 'GitLab CI',
                  expand: true,
                  uid: '162'
                },
                children: []
              }
            ]
          },
          {
            data: {
              text: '容器化',
              expand: true,
              uid: '17'
            },
            children: [
              {
                data: {
                  text: 'Docker',
                  expand: true,
                  uid: '171'
                },
                children: []
              },
              {
                data: {
                  text: 'Kubernetes',
                  expand: true,
                  uid: '172'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  };