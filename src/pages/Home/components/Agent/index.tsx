import { useState, useEffect } from 'react'
import { connect, useDispatch, history } from '@umijs/max'

import { Button, Space, message, Tabs, Pagination, Tooltip } from 'antd'
import { ZYIcon } from '@/components'
import DndKitList from '@/components/DndKitList'
import { useTeacherContext } from '@/components/LayoutSider'

import { getOrgId, addNewTracking, getStorageToken, getUserInfo } from '@/utils'
import { getQingliuUrl } from '@/utils/host'
import dayjs from 'dayjs'

import './index.less'

const typeLabelMap: Record<string, string> = {
  QUESTION_AND_ANSWER: '对话型',
  CREATION: '文本型',
  KNOW_QUESTION_AND_ANSWER: '知识问答型',
}

const typeIconMap: Record<string, string> = {
  QUESTION_AND_ANSWER: 'duihuaxing',
  CREATION: 'wenbenxing',
  KNOW_QUESTION_AND_ANSWER: 'zhishiwendaxing',
}

const parseIcon = (icon: any) => {
  if (!icon) return {} as any;
  if (typeof icon === 'object') return icon;
  try {
    return JSON.parse(icon);
  } catch {
    return {} as any;
  }
}

const AgentShop = ({
  handleItem,
  commonAgentList
}: {
  handleItem: (item: any, type: 'remove' | 'add') => void;
  commonAgentList: any[]
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [agentShopList, setAgentShopList] = useState<any[]>([]);

  useEffect(() => {
    getAgentShopList()
  }, [])

  const getAgentShopList = async (currentPage?: number) => {
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "homePageModel/getData",
      apiUrl: "getAgentShopListUrl",
      payload: {
        org_id: getOrgId()
      }
    })

    if (code == 200) {
      setAgentShopList(data)
    }
    setLoading(false)
  }

  const addAgent = (item: any, type: 'remove' | 'add') => {
    if (commonAgentList.some((i: any) => i?.app_id === item?.app_id)) return
    handleItem(item, type)
  }

  const isInCommon = (app_id: string) => commonAgentList.some((i: any) => i?.app_id === app_id)

  return <div className='agent-shop'>
    {loading ? (
      <div className="loading-box agent">
        <span className="anticon-spin">
          <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
        </span>
        <span className="text">加载中</span>
      </div>
    ) : agentShopList.length === 0 ? (
      <div className='empty-box agent'>
        <ZYIcon type='kongshuju7' className='icon' />
        <span className='text'>暂无智能体</span>
      </div>
    ) : (
      <div className='agent-list'>
        {agentShopList.map((item: any) => (
          <AgentItem
            key={item?.app_id}
            item={{ ...item, disabled: isInCommon(item?.app_id) }}
            type='custom'
            setting={true}
            handleItem={(item: any, type: 'remove' | 'add') => addAgent(item, type)}
          />
        ))}
      </div>
    )}
  </div>
}

const MyAgent = ({
  handleItem,
  commonAgentList
}: {
  handleItem: (item: any, type: 'remove' | 'add') => void;
  commonAgentList: any[]
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [myAgentList, setMyAgentList] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    getMyAgentList()
  }, [])

  const getMyAgentList = async (currentPage?: number) => {
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "homePageModel/getData",
      apiUrl: "getMyAgentListUrl",
      payload: {
        page: currentPage || page,
        size: 9,
        org_id: getOrgId()
      }
    })

    if (code == 200) {
      setMyAgentList(data?.applications?.filter((item: any) => item.released === true))
      setTotal(data?.total)
    }
    setLoading(false)
  }

  const addAgent = (item: any, type: 'remove' | 'add') => {
    if (commonAgentList.some((i: any) => i?.app_id === item?.app_id)) return
    handleItem(item, type)
  }

  const isInCommon = (app_id: string) => commonAgentList.some((i: any) => i?.app_id === app_id)

  return <div className='my-agent'>
    {loading ? (
      <div className="loading-box agent">
        <span className="anticon-spin">
          <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
        </span>
        <span className="text">加载中</span>
      </div>
    ) : myAgentList.length === 0 ? (
      <>
        <div className='empty-box agent'>
          <ZYIcon type='kongshuju7' className='icon' />
          <span className='text'>暂无智能体</span>
        </div>
      </>
    ) : (
      <div className='agent-list-wrap'>
        <div className='agent-list'>
          {myAgentList.map((item: any) => (
            <AgentItem
              key={item?.app_id}
              item={{ ...item, disabled: isInCommon(item?.app_id) }}
              type='custom'
              setting={true}
              handleItem={(item: any, type: 'remove' | 'add') => addAgent(item, type)}
            />
          ))}
        </div>
        {total > 0 && <Pagination
          className='agent-pagination'
          align="center"
          total={total}
          current={page}
          showTotal={(total: number) => `共 ${total} 条`}
          onChange={(page: number) => {
            setPage(page)
            getMyAgentList(page)
          }}
        />}
      </div>
    )}
  </div>
}

const AgentItem = ({
  item,
  setting,
  type,
  handleItem
}: {
  item: any,
  setting?: boolean,
  type?: 'common' | 'custom',
  handleItem?: (item: any, type: 'remove' | 'add') => void
}) => {
  const iconConfig = parseIcon(item.icon);
  const typeLabel = typeLabelMap[item.type] || item.type || '';
  const typeIcon = typeIconMap[item.type] || item.type || '';

  const getSpaceInfo = () => {
    return getUserInfo('spaceList').filter((item: any) => item.schoolId == getOrgId())[0]
  }

  const jumpToAgentDetail = (item: any) => {
    const basicEdu = {
      'tenant-id': getSpaceInfo().tenantId,
      'user-id': getUserInfo('edu_id'),
      'space-id': getSpaceInfo().spaceId,
      'jwt': getStorageToken(),
    }
    const infoParam = encodeURIComponent(JSON.stringify(basicEdu));
    const url = `${getQingliuUrl()}/basic-edu-flow/chat?app_id=${item.detail_id}&from=${item.agent_type === 'myself' ? 'experience' : 'template'}&info=${infoParam}`
    window.open(url, '_blank')
  }

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();
    if (type === 'common') {
      handleItem?.(item, 'remove');
    } else {
      handleItem?.(item, 'add');
    }
  }

  return (
    <div className={`agent-item ${item.disabled ? 'disabled' : ''}`} onClick={() => {
      addNewTracking({
        bt: 'cl',
        ct: 'home_common_agent_title_click',
        ctid: item?.detail_id,
        ctvl: item?.description
      })
      jumpToAgentDetail(item)
    }}>
      {setting && <div className={`handle-btn ${type === 'common' ? 'jian-btn' : 'jia-btn'}`}>
        <ZYIcon type={type === 'common' ? 'jian' : 'jia'} onClick={(e: React.MouseEvent<SVGSVGElement>) => handleClick(e)} />
      </div>
      }
      <div className='agent-item-top'>
        <div className='agent-item-avatar'>
          {iconConfig?.icon_url
            ? <img src={iconConfig.icon_url} alt={item.name} />
            : <ZYIcon type={iconConfig?.type || 'icon-wdrobot1'} />
          }
        </div>
        <div className='agent-item-info'>
          <div className='agent-item-title-row'>
            <span className='agent-item-title'>{item.name}</span>
          </div>
          <div className='agent-item-meta'>
            {item.app_id && <span className='meta-id'>ID:{item.app_id}</span>}
            {(item.app_id && item.source) && <span className='meta-divider'>|</span>}
            {item.creator && <span className='meta-source'>来自 {item.creator}</span>}
          </div>
        </div>
        {/* {item.collect && (
          <div className='agent-item-favorite'>
            <ZYIcon type='shoucang1' />
          </div>
        )} */}
      </div>
      {item.description && (
        <div className='agent-item-desc'>{item.description}</div>
      )}
      {/* {Array.isArray(item.tags) && item.tags.length > 0 && (
        <div className='agent-item-tags'>
          {item.tags.map((tag: any) => (
            <span key={tag} className='tag-chip'>
              {tag}
            </span>
          ))}
        </div>
      )} */}
      <div className='agent-item-footer'>
        <div className='footer-left'>
          {item.update_time && (
            <span className='footer-time'>{dayjs(item.update_time).format('YYYY-M-D')} 更新</span>
          )}
          {/* <div className='footer-chips'>
            {item.region && (
              <span className='footer-chip'>{item.region}</span>
            )}
            {item.visibleRole && (
              <span className='footer-chip'>{item.visibleRole}</span>
            )}
          </div> */}
        </div>
        {typeLabel && (
          <div className='footer-type'>
            <ZYIcon type={typeIcon} />
            <span className='text'>{typeLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const Agent = () => {
  const [context, contextLoading, setContext] = useTeacherContext()
  const [setting, setSetting] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('myAgent');
  const [commonAgentList, setCommonAgentList] = useState<any[]>([]);

  useEffect(() => {
    if (contextLoading || !context?.agent_apps) return
    if (context?.agent_apps?.length > 0) {
      setCommonAgentList(context?.agent_apps)
    }
  }, [context?.agent_apps, contextLoading])

  const onCancelSetting = () => {
    setSetting(false)
    setCommonAgentList(context?.agent_apps)
  }

  const onSaveSetting = () => {
    // console.log(commonAgentList)
    setSetting(false)
    setContext({ agentApps: commonAgentList })
  }

  const handleItem = (item: any, type: 'remove' | 'add') => {
    if (type === 'remove') {
      if (commonAgentList.length === 1) {
        message.error('至少保留一个常用智能体')
        return;
      }
      setCommonAgentList(commonAgentList.filter((i: any) => item?.app_id !== i?.app_id))
    } else {
      if (commonAgentList.length >= 12) {
        message.error('最多添加12个常用智能体')
        return;
      }
      setCommonAgentList([...commonAgentList, item])
    }
  }

  return (
    <div className='agent'>
      <div className='agent-header'>
        <span className='title'>常用智能体</span>
        {commonAgentList.length > 0 && <div className='agent-header-right'>
          {!setting
            ? <Tooltip title='设置' placement='bottom'>
                <Button
                  type='text'
                  icon={<ZYIcon type='shezhi1' style={{ color: '#646E8B', fontSize: 16 }} />}
                  onClick={() => setSetting(true)}
                />
              </Tooltip>
            : <Space>
              <Button type='default' onClick={onCancelSetting}>取消</Button>
              <Button type='primary' onClick={onSaveSetting}>保存</Button>
            </Space>
          }
        </div>}
      </div>
      <div className='agent-content'>
        {commonAgentList.length === 0 ? (
          <div className='empty-box'>
            <ZYIcon type='a-kongshuju1' className='icon' />
            <span className='text'>暂无常用智能体</span>
          </div>
        ) : (
          <div className='agent-wrap'>
            {!setting
              ? <div className='agent-list'>
                {commonAgentList.map((item: any) => (
                  <AgentItem key={item?.app_id} item={item} />
                ))}
              </div>
              : <DndKitList
                className='agent-list setting-mode'
                dndList={commonAgentList}
                handleDndList={(list: any) => setCommonAgentList(list)}
                ItemRender={(item: any) => (
                  <AgentItem
                    key={item?.app_id}
                    item={item}
                    type='common'
                    setting={setting}
                    handleItem={(item: any, type: 'remove' | 'add') => handleItem(item, type)}
                  />
                )}
              />
            }
            {setting && <div className='custom-agent-list'>
              <Tabs
                activeKey={activeKey}
                onChange={setActiveKey}
                items={[
                  { key: 'myAgent', label: '我的智能体' },
                  { key: 'agentShop', label: '智能体广场' }
                ]}
              />
              <div className={`my-agent-wrap ${activeKey === 'myAgent' ? 'show' : 'hidden'}`}>
                <MyAgent handleItem={handleItem} commonAgentList={commonAgentList} />
              </div>
              <div className={`agent-shop-wrap ${activeKey === 'agentShop' ? 'show' : 'hidden'}`}>
                <AgentShop handleItem={handleItem} commonAgentList={commonAgentList} />
              </div>
            </div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default connect(({ homePageModel }: any) => ({
  homePageModel,
}))(Agent);
