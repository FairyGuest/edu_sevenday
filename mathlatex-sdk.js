/**
 * MathLatex SDK v3.0.0
 * 公式编辑器 SDK - iframe 模式
 * 
 * 使用方式（兼容 PoLatexMath 接口规范）：
 * 
 * 1. 引入 SDK:
 *    <script src="https://your-domain/mathlatex-sdk.js"></script>
 * 
 * 2. 初始化 SDK:
 *    MathLatexSDK.init({
 *      appID: 'your_app_id',
 *      iframeSrc: 'https://your-domain/sdk-demo'
 *    }, function(data) {
 *      console.log(data.editorType)    // 编辑器类型 'latex'
 *      console.log(data.latexOut)      // LaTeX 源码
 *      console.log(data.outMathML)     // MathML 结构化数据
 *      console.log(data.outSvgImage)   // SVG 图像
 *      console.log(data.spanId)        // 公式锚点 ID
 *    })
 * 
 * 3. 打开编辑器:
 *    MathLatexSDK.open()                                    // 打开空白编辑器
 *    MathLatexSDK.open({ spanId: 'id', content: 'x^2' })    // 打开并回显公式
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MathLatexSDK = factory());
})(this, (function () {
  'use strict';

  /* =========================================================================
   * SDK 样式
   * ========================================================================= */
  const SDK_STYLES = `
.mathlatex-sdk-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  height: auto;
    overflow: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mathlatex-sdk-modal {
  width: calc(100% - 40px);
  max-width: 1200px;
  height: auto; /* 改为自适应高度 */
  max-height: calc(100% - 40px); /* 最大不超过视窗 */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  position: relative;
}
.mathlatex-sdk-overla::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.mathlatex-sdk-overlay {
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
  overflow-x: hidden;
  overflow-y: auto;
}
.mathlatex-sdk-iframe {
  width: 100%;
  height: 580px;
  border: none;
  display: block;
  border-radius: 12px;
}

.mathlatex-sdk-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  font-size: 16px;
  color: #666;
  z-index: 1;
}

.mathlatex-sdk-loading::after {
  content: '';
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: mathlatex-spin 0.8s linear infinite;
  margin-left: 12px;
}

@keyframes mathlatex-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .mathlatex-sdk-overlay {
    padding: 0;
  }
  .mathlatex-sdk-modal {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
`;

  /* =========================================================================
   * SDK 主类
   * ========================================================================= */
  const MathLatexSDK = {
    version: '3.0.0',
    
    // 内部状态
    _config: null,
    _callback: null,
    _isInitialized: false,
    _overlay: null,
    _iframe: null,
    _currentSpanId: '',
    _messageHandler: null,

    /**
     * 初始化 SDK
     * @param {Object} config - 配置项
     * @param {string} config.appID - 应用 ID
     * @param {string} config.secretKey - 密钥（✨ 新增）
     * @param {string} config.iframeSrc - iframe 源地址，指向公式编辑器页面
     * @param {Function} callback - 回调函数，接收返回数据
     */
    init(config, callback) {
      this._config = config || {};
      this._callback = callback;
      this._isInitialized = true;

      // 设置默认 iframeSrc
      if (!this._config.iframeSrc) {
        // 默认使用当前域名下的 /sdk-demo
        this._config.iframeSrc = window.location.origin + '/sdk-demo';
      }

      // 注入样式
      this._injectStyles();

      // 监听来自 iframe 的消息
      this._setupMessageListener();

      console.log('[MathLatex SDK] 初始化成功');
      console.log('[MathLatex SDK] appID:', this._config.appID || '(测试模式)');
      console.log('[MathLatex SDK] secretKey:', this._config.secretKey ? '******(已配置)' : '(未配置)');
      console.log('[MathLatex SDK] iframeSrc:', this._config.iframeSrc);
    },

    /**
     * 打开公式编辑器
     * @param {Object} options - 可选参数
     * @param {string} options.spanId - 公式锚点唯一标识
     * @param {string} options.content - 传入 LaTeX 公式内容（用于编辑已有公式）
     * @param {boolean} options.demoMode - ✨ Demo 模式标记
     */
    open(options = {}) {
      if (!this._isInitialized) {
        console.error('[MathLatex SDK] 请先调用 init() 初始化');
        return;
      }

      const { spanId = '', content = '', demoMode = false } = options;
      this._currentSpanId = spanId;

      // 创建弹窗
      this._createModal();

      // 构建 iframe URL，携带参数
      let iframeSrc = this._config.iframeSrc;
      const params = new URLSearchParams();
      
      if (spanId) params.set('spanId', spanId);
      if (content) params.set('content', content);
      if (this._config.appID) params.set('appID', this._config.appID);
      // ✨ 新增：传递 secretKey 到 iframe
      if (this._config.secretKey) params.set('secretKey', this._config.secretKey);
      // ✨ 新增：传递 demoMode 参数
      if (demoMode) params.set('demoMode', 'true');
      
      // 添加 SDK 模式标记
      params.set('mode', 'sdk');
      
      const queryString = params.toString();
      if (queryString) {
        iframeSrc += (iframeSrc.includes('?') ? '&' : '?') + queryString;
      }

      // 设置 iframe src
      this._iframe.src = iframeSrc;
    },

    /**
     * 关闭编辑器
     */
    close() {
      if (this._overlay) {
        this._overlay.remove();
        this._overlay = null;
        this._iframe = null;
      }
      // 移除事件监听器
      if (this._escHandler) {
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = null;
      }
      if (this._popstateHandler) {
        window.removeEventListener('popstate', this._popstateHandler);
        this._popstateHandler = null;
      }
    },

    /**
     * 注入样式
     * @private
     */
    _injectStyles() {
      if (!document.getElementById('mathlatex-sdk-styles')) {
        const style = document.createElement('style');
        style.id = 'mathlatex-sdk-styles';
        style.textContent = SDK_STYLES;
        document.head.appendChild(style);
      }
    },

    /**
     * 创建弹窗
     * @private
     */
    _createModal() {
      // 如果已存在，先移除
      if (this._overlay) {
        this._overlay.remove();
      }

      // 创建遮罩层
      this._overlay = document.createElement('div');
      this._overlay.className = 'mathlatex-sdk-overlay';

      // 创建弹窗容器
      const modal = document.createElement('div');
      modal.className = 'mathlatex-sdk-modal';

      // 创建加载提示
      const loading = document.createElement('div');
      loading.className = 'mathlatex-sdk-loading';
      loading.textContent = '加载中';

      // 创建 iframe
      this._iframe = document.createElement('iframe');
      this._iframe.className = 'mathlatex-sdk-iframe';
      this._iframe.allow = 'clipboard-write';
      this._iframe.setAttribute('scrolling', 'no');
      // 移除内联样式中的 height: 100%，让 CSS 类控制高度
      this._iframe.style.cssText = 'width: 100%; border: none; display: block; margin: 0; padding: 0;';
      
      // iframe 加载完成后隐藏 loading
      this._iframe.onload = () => {
        loading.style.display = 'none';
      };

      modal.appendChild(loading);
      modal.appendChild(this._iframe);
      this._overlay.appendChild(modal);
      document.body.appendChild(this._overlay);

      // 点击遮罩关闭（可选）
      this._overlay.addEventListener('click', (e) => {
        if (e.target === this._overlay) {
          // 可以选择是否允许点击遮罩关闭
          // this.close();
        }
      });

      // ESC 键关闭
      this._escHandler = (e) => {
        if (e.key === 'Escape') {
          this.close();
        }
      };
      document.addEventListener('keydown', this._escHandler);

      // 浏览器回退时关闭弹框
      this._popstateHandler = () => {
        this.close();
      };
      window.addEventListener('popstate', this._popstateHandler);
    },

    /**
     * 设置消息监听
     * @private
     */
    _setupMessageListener() {
      // 移除旧的监听器
      if (this._messageHandler) {
        window.removeEventListener('message', this._messageHandler);
      }

      // 创建新的监听器
      this._messageHandler = (event) => {
        // 安全检查：验证消息来源（生产环境应该严格验证）
        // if (event.origin !== new URL(this._config.iframeSrc).origin) {
        //   return;
        // }

        const data = event.data;

        // 处理来自编辑器的消息
        if (data && data.type === 'mathlatex-insert') {
          // 添加 spanId
          const result = {
            editorType: data.editorType || 'latex',
            latexOut: data.latexOut || '',
            outMathML: data.outMathML || '',
            outSvgImage: data.outSvgImage || '',
            spanId: this._currentSpanId || data.spanId || '',
            // 🔥 新增：传递完整的 HTML 和 ID
            formulaHTML: data.formulaHTML || '',
            formulaId: data.formulaId || ''
          };

          // 调用回调函数
          if (typeof this._callback === 'function') {
            this._callback(result);
          }

          // 关闭弹窗
          this.close();

          // 移除 ESC 监听
          if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
          }
        }

        // 处理关闭消息
        if (data && data.type === 'mathlatex-close') {
          this.close();
          if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
          }
        }

        // 处理高度调整请求
        if (data && data.type === 'mathlatex-resize') {
          if (this._iframe && data.height) {
            this._iframe.style.height = data.height + 'px';
          }
        }
      };

      window.addEventListener('message', this._messageHandler);
    },

    /**
     * 向 iframe 发送消息
     * @param {Object} message - 消息对象
     */
    postMessage(message) {
      if (this._iframe && this._iframe.contentWindow) {
        this._iframe.contentWindow.postMessage(message, '*');
      }
    }
  };

  return MathLatexSDK;
}));
