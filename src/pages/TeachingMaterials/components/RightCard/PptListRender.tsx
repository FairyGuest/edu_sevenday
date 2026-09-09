import { useEffect, useRef, useState } from "react";
import { useDispatch } from "@umijs/max";
import { Button } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import throttle from "lodash/debounce";
import { ZYIcon } from "@/components";
import PreviewEditToolbar from "@/components/PreviewEditToolbar";
import "./PPT.less";
import "./PptListRender.less"
import ArtifactsEditor from '../../artifactsEditor';

let artifactsEditor; // 编辑器实例
// let editing = false; // 是否处于编辑状态
let idx = 0; // 当前编辑的元素索引

const PptListRender = (props: any) => {
    const { codeText, session_id, pageIndex } = props;
    const iframeRef = useRef < HTMLIFrameElement > ();
    let containerRef = useRef < HTMLElement > ();
    const [editing, setEditing] = useState(false);
    // const [editingIndex, setEditingIndex] = useState(-1);
    let loaded = false;
    let resizeObserver: ResizeObserver;
    let originalWidth: number | null = null;
    let originalHeight: number | null = null;
    let scale: number = 1;
    const [editCode, setEditCode] = useState()
    const dispatch = useDispatch();
    const [currentCodeText, setCurrentCodeText] = useState(codeText)
    const [type, setType] = useState(props.type || 'preview');

    useEffect(() => {
        setCurrentCodeText(codeText)
    }, [codeText])

    useEffect(() => {
        setType(props.type)
    }, [props.type])




    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const handleIframeLoad = async () => {
        const iframeCurrent = iframeRef?.current;
        if (!iframeCurrent?.contentWindow || !iframeCurrent?.contentDocument) return;
        const iframeDoc = iframeCurrent.contentDocument;
        const iframeBody = iframeDoc.body;
        loaded = true;

        // 注入样式
        const styleEl = iframeDoc.createElement('style');
        styleEl.textContent = `
			html, body {
				margin: 0;
				padding: 0;
				overflow: hidden; /* 防止出现滚动条影响尺寸计算 */
			}
			body > * {
				transform-origin: top left;
			}
		`;
        iframeDoc.head?.appendChild(styleEl);

        // 确保样式生效后再获取尺寸
        // await tick();

        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        resizeObserver = new ResizeObserver(() => {
            resizeIframe();
        });

        if (containerRef) {
            resizeObserver.observe(containerRef?.current);
        }
        await sleep(100); // 由于输出的文档可能没有一个有效的尺寸呢，被流式布局后的高度由于宽高的兜底导致下方有空白区，此时再resize一下即可
        resizeIframe();

        if (editing) {
            artifactsEditor?.invokeEditorCode(iframeRef.current);
            artifactsEditor?.initMessageHandler((type, data) => {
                console.log('通过样式修改-----', type)
                if (type === 'editElement') {
                    setEditing(false)
                    // onEdit(idx, 'submit');
                    const { line, code, text } = data;
                    console.log({ line, code, text })
                    if (line && code && text) {
                        window.postMessage(
                            {
                                type: 'input:prompt:submit',
                                text,
                                vibeInfo: {
                                    vibeMode: 'ppt',
                                    vibeReference: {
                                        line,
                                        code,
                                        filename: 'index.html',
                                        pptIndex: idx + 1
                                    }
                                }
                            },
                            window.origin
                        );
                    }
                }
            });
            artifactsEditor?.scaleInput(1 / scale);
        }

    }

    const resizeIframe = throttle(() => {
        const iframeCurrent = iframeRef?.current;
        if (!iframeCurrent) return;

        const iframeDoc = iframeCurrent.contentDocument;
        const iframeBody = iframeDoc?.body;
        if (iframeBody && iframeCurrent.contentWindow) {
            // 可选：取iframeBody和firstChild中宽度最接近1280的作为采样元素
            // 获取内容的原始尺寸
            if (iframeBody.childElementCount === 1) {
                const firstChild = iframeBody.firstElementChild as HTMLElement;
                originalWidth = firstChild.offsetWidth;
                originalHeight = firstChild.offsetHeight;
            } else {
                originalWidth = iframeBody.scrollWidth;
                originalHeight = iframeBody.scrollHeight;
            }
            // 对文档尺寸的有限兜底，不太过分的基本可以支持
            if (originalWidth < 1280) {
                originalWidth = 1280;
                originalHeight = originalHeight > 1280 ? 720 : originalHeight;
            }

            if (originalWidth && originalHeight && containerRef) {
                const containerWidth = containerRef?.current?.offsetWidth;
                scale = containerWidth / originalWidth;
                // artifactsEditor?.scaleInput(1 / scale);

                iframeCurrent.style.width = `${originalWidth}px`;
                iframeCurrent.style.height = `${originalHeight}px`;
                iframeCurrent.style.transform = `scale(${scale})`;
                iframeCurrent.style.transformOrigin = 'top left';

                const scaledHeight = originalHeight * scale;
                const parentDiv = iframeCurrent.parentElement;
                if (parentDiv) {
                    parentDiv.style.height = `${scaledHeight}px`;
                }
            }
        }
    }, 80);

    function removeCdnPrefixToHtml(html: string): string {
        const regex = /(<script\s+src=|<link\s+(?:[^>]*?\s+)?href=)(["'])([^"']+)\2/gi;
        return html.replace(regex, (match, prefix, quote, url) => {
            return `${prefix}${quote}${url.replace(/https:\/\/artifacts-cdn\.chatglm\.site\//g, '')}${quote}`;
        });
    }

    const onEdit = (itype: 'open' | 'submit' | 'close') => {
        if (itype == 'open') {
            // console.log("打开编辑", currentCodeText)
            artifactsEditor = new ArtifactsEditor(currentCodeText, iframeRef.current);
            artifactsEditor.walkAST();

            artifactsEditor.serializeAST((htmlContent) => {
                // console.log("htmlContent-----", htmlContent)
                setEditCode(htmlContent)
            });
            // setEditingIndex(idx)
            setEditing(true);
        } else if (itype == 'submit') {

            // if (!artifactsEditor.operated) {
            //     onEdit?.(idx, 'close');
            //     setEditing(false);
            //     return;
            // }

            const afterEditHtml = artifactsEditor.getSerializeCode();
            setCurrentCodeText(removeCdnPrefixToHtml(afterEditHtml));
            dispatch({
                type: 'teachingModel/postData',
                apiUrl: "updatePPT",
                payload: {
                    session_id,
                    new_html: removeCdnPrefixToHtml(afterEditHtml),
                    page: pageIndex + 1
                }
            })
            // setEditingIndex(-1)
            setEditing(false);
        } else if (itype == 'close') {
            setEditing(false);
            // setEditingIndex(-1)
        }
    }

    return (
        <div className="pptContainer @container max-w-full relative border-1 border-black/10 rounded-xl overflow-hidden" ref={containerRef}>
            {/* 切换button */}
            <PreviewEditToolbar
                leftBlock={
                    <div className="bg-white rounded-full display ">
                        <div className="ppt-btn flex gap-1 rounded-full bg-white text-nowrap border-black/10 p-0.5 border-b-1">
                            <Button className={`py-1.5 rounded-full border-0  ${type == 'preview' ? 'ppt-active' : 'ppt-hover'}`} onClick={() => setType('preview')}>预览</Button>
                            <Button className={`py-1.5 rounded-full border-0  ${type == 'html' ? 'ppt-active' : 'ppt-hover'}`} onClick={() => setType('html')}>HTML</Button>
                        </div>
                    </div>
                }
                editing={editing}
                onEdit={(type) => onEdit(type)}
                className="tabContainer"
            />
            {/* 代码 */}
            <div className={`w-full flex overflow-auto ${type == 'html' ? '' : 'ppt-html-hidden'}`}
                style={{ height: "442.688px" }}>
                <SyntaxHighlighter
                    lineNumberContainerStyle={{
                        padding: '0 10px',
                        color: '#000',
                        backgroundColor: '#fff',
                        borderRight: '1px solid red',
                    }}
                    showLineNumbers
                    PreTag="div"
                    children={currentCodeText}
                    language="html"
                    style={oneLight}
                    className="syntax-highlighter"
                />
            </div>

            {/* PPT */}
            <div className={`w-full overflow-hidden relative ${type == 'preview' ? '' : 'ppt-html-hidden'}`}
                style={{ height: "442.688px" }}>
                <iframe
                    ref={iframeRef}
                    title="PPT"
                    // srcDoc={codeText}
                    srcDoc={editing ? editCode : currentCodeText}
                    frameBorder="0"
                    allowFullScreen
                    src="about:blank"
                    className="absolute top-0 left-0 w-auto h-auto rounded-b-xl w-full h-full"
                    style={{ border: "none" }}
                    onError={(e) => {
                        console.log(e);
                    }}
                    onLoad={handleIframeLoad}
                >

                </iframe>
            </div>

        </div >
    );
};
export default PptListRender;
