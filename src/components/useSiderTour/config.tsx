
import ZYIcon from "@/components/ZYIcon"
import siderTourHi from '@/assets/sidertourhi.svg';
export const siderTourSteps = (
    homeRef: HTMLElement,
    teachRef: HTMLElement,
    agentRef: HTMLElement,
): any => [
        {
            title: <p className="tourstepsimg">
                <img src={siderTourHi} style={{
                    width: "28px",
                    height: "28px",
                    marginRight: '10px',
                }} />
                <span className='tourtitle'>
                    老师您好～欢迎来到您的专属主页
                </span>
            </p>,
            description: <div className='tourdescription'>
                在这里您可以快速查看和处理<span className='tourdescription_con'>最近作业、互动记录</span>，轻松掌握教学动态。
            </div>,
            target: () => homeRef,
            placement: 'right',
            mask: true, // 显示遮罩层
            closable: false, // 点击遮罩不关闭引导
            nextButtonProps: {
                children: "下一步",
                onClick: Function,
                style: {
                    color: '#1C6CFF',
                    border: "1px solid #A8C8FF",
                    background: '#fff',
                    height: '28px',
                }
            }

        },
        {
            title: '',
            description: <div className='tourdescription'>
                在课程教学中，支持
                <span className='tourdescription_con'>
                    创建课程、设计教学内容、布置作业，
                </span>
                还能一键查看
                <span className='tourdescription_con'>
                    批改结果。
                </span>
            </div>,
            target: () => teachRef,
            placement: 'right',
            mask: true,
            closable: false,
            prevButtonProps: {
                disabled: true,
                style: {
                    display: 'none',
                }
            },
            nextButtonProps: {
                children: "下一步",
                onClick: Function,
                style: {
                    color: '#1C6CFF',
                    border: "1px solid #A8C8FF",
                    background: '#fff',
                    height: '28px',
                }
            }
        },
        {
            title: '',
            description: <div className='tourdescription'>
                进入智能体中心，可以创建和管理
                <span className='tourdescription_con'>
                    专属教学智能体
                </span>
                ，让教学更高效。
            </div>,
            target: () => agentRef,
            placement: 'right',
            mask: true,
            closable: false,
            prevButtonProps: {
                disabled: true,
                style: {
                    display: 'none',
                }
            },
            nextButtonProps: {
                children: "知道了",
                onClick: Function,
                style: {
                    color: '#1C6CFF',
                    border: "1px solid #A8C8FF",
                    background: '#fff',
                    height: '28px',
                }
            }
        },
    ];

export const siderTourStepstow = (
    hometowRef: HTMLElement,
): any => [
        {
            title: <p>
                <ZYIcon type="zhaohu" size={25} style={{ marginRight: '10px' }} />
                <span className='tourtitle'>
                    这里是课程管理页
                </span>
            </p>,
            description: <div className='tourdescription'>
                点击
                <span className='tourdescription_con'>
                    创建课程
                </span>
                ，就能快速搭建课程、布置作业，轻松管理您的所有课程。
            </div>,
            target: () => hometowRef,
            placement: 'right',
            mask: true, // 显示遮罩层
            closable: false, // 点击遮罩不关闭引导
            prevButtonProps: {
                disabled: true,
                style: {
                    display: 'none',
                }
            },
            nextButtonProps: {
                children: "知道了",
                onClick: Function,
                style: {
                    color: '#1C6CFF',
                    border: "1px solid #A8C8FF",
                    background: '#fff',
                    height: '28px',
                }
            }
        }
    ];

export const shouldShowTour = (): boolean => {
    const hasShownTour = localStorage.getItem('siderTourShown');

    return !hasShownTour;
};