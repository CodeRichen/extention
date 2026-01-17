const style = document.createElement('style'); 
document.head.appendChild(style);

// 定義默認設置
const defaultSettings = {
  fontFamily: '微軟正黑體',
  enableBackground: true,
  backgroundScope: 'ai',
  imageFolder: 'miku',
  selectionColor: 'purple'
};

// 儲存圖片列表的全局變數
let imageListCache = null;

// 載入圖片列表
async function loadImageList() {
  if (imageListCache) return imageListCache;
  
  try {
    const response = await fetch(chrome.runtime.getURL('image-list.json'));
    imageListCache = await response.json();
    return imageListCache;
  } catch (error) {
    console.error('無法載入圖片列表:', error);
    return null;
  }
}

// 設置樣式
async function setCustomStyles(settings) {
  const isGPTPage = window.location.hostname.includes('gpt') || window.location.hostname.includes('openai');
  const isGrokPage = window.location.hostname.includes('grok');
  const isGeminiPage = window.location.hostname.includes('gemini');
  const isClaudePage = window.location.hostname.includes('claude') || window.location.hostname.includes('anthropic');
  const isPerplexityPage = window.location.hostname.includes('perplexity');
  const isAIPage = isGPTPage || isGrokPage || isGeminiPage || isClaudePage || isPerplexityPage;
  const applyToAll = settings.backgroundScope === 'all';
  let cssRules = '';

  // 如果關閉背景與所有樣式，自動還原為預設字體與樣式
if (!settings.enableBackground) {
  style.textContent = `
    /* 還原背景 */
    body {
      background: none !important;
    }

    /* 還原字體 */
    * {
      font-family: default,-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Liberation Sans", Arial, sans-serif !important;
    }

    /* 移除你注入的選取樣式，不要強制背景色 */
    ::selection,
    ::-moz-selection {
      background-color: initial !important;
    }
  `;
  chrome.storage.sync.set({ currentBackgroundName: '' });
  return;
}


  // ----------- 以下是開啟背景時的處理 --------------

// 套用文字顏色（如果開啟了）
if (settings.enableFontColor) {
  cssRules += `
    * {
      color: ${settings.fontColor} !important;
    }
  `;
}

// 字體設置 (針對 Gemini 深度優化版)
  if (settings.fontFamily && settings.fontFamily !== 'default' ) {
    cssRules += `
      /* 1. 基礎文字標籤套用字體，避免使用萬用字元 * */
      body, p, div, span, a, li, input, textarea, button:not([class*="icon"]):not(.google-symbols) {
        font-family: '${settings.fontFamily}', sans-serif !important;
      }
      
      /* 2. 核心排除：保護所有可能包含圖示的組件 */
      .google-symbols,
      .material-symbols-outlined,
      .mat-icon,
      .material-icons,
      [data-mat-icon-name],
      [fonticon],
      mat-icon {
        /* 強制將圖示字體拉回最優先 */
        font-family: 'Google Symbols', 'Material Symbols Outlined', 'Material Icons' !important;
        
        /* 下面這些是確保 'mic' 變成圖示的關鍵渲染指令 */
        font-weight: normal !important;
        font-style: normal !important;
        line-height: 1 !important;
        letter-spacing: normal !important;
        text-transform: none !important;
        display: inline-block !important;
        white-space: nowrap !important;
        word-wrap: normal !important;
        direction: ltr !important;
        -webkit-font-feature-settings: 'liga' !important;
        font-feature-settings: 'liga' !important;
      }

      /* 3. 針對 Gemini 麥克風按鈕的特殊修正 */
      mat-icon[data-mat-icon-name="mic"], 
      mat-icon[fonticon="mic"] {
        font-family: 'Google Symbols' !important;
      }
    `;
    cssRules += `

        /* 2. 移除底部免責聲明容器 */
        hallucination-disclaimer,
        .hallucination-disclaimer,
        .capabilities-disclaimer,
        footer {
          display: none !important;
        }
      `;
  }

  // 選取文字樣式
  cssRules += `
    ::selection {
      background-color: ${settings.selectionColor || defaultSettings.selectionColor} !important;
    }
    ::-moz-selection {
      background-color: ${settings.selectionColor || defaultSettings.selectionColor} !important;
    }
  `;

  // 背景圖片設置
  if (applyToAll || isAIPage) {
    const folder = settings.imageFolder || defaultSettings.imageFolder;
    
    // 載入圖片列表
    const imageList = await loadImageList();
    
    if (imageList && imageList[folder] && imageList[folder].images) {
      // 處理 PowerShell 產生的結構 (可能是陣列或物件)
      let images = imageList[folder].images;
      if (images.value && Array.isArray(images.value)) {
        // PowerShell 物件結構: { value: [], Count: number }
        images = images.value;
      } else if (!Array.isArray(images)) {
        // 如果不是陣列也沒有 value,則跳過
        console.error('圖片列表格式錯誤');
        return;
      }
      
      if (images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        const randomImage = images[randomIndex];
        
        cssRules += `
          body {
            background-image: url('chrome-extension://${chrome.runtime.id}/${folder}/${randomImage}') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
          }
        `;
        chrome.storage.sync.set({ currentBackgroundName: `${folder}/${randomImage}` });
      }
    }
    
    // 針對 Gemini 頁面的透明背景設置
    if (isGeminiPage) {
      cssRules += `
        /* Gemini 主要容器透明 */
        .response-container,
        .response-container-content,
        .response-content,
        .presented-response-container,
        .model-response-text,
        message-content,
        .markdown,
        .markdown-main-panel,
        chat-window,
        .conversation-container,
        mat-sidenav-content,
        .main-container,
        .chat-history,
        message-list {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* 側邊欄完全透明 */
        bard-sidenav,
        side-navigation-content,
        .sidenav-with-history-container,
        mat-sidenav,
        .mat-drawer,
        .mat-sidenav,
        .overflow-container,
        .chat-history,
        .chat-history-list,
        .conversations-container,
        .conversation-items-container,
        .gems-list-container,
        .bots-list-container,
        .mat-mdc-action-list,
        .mdc-list,
        .top-action-list,
        .desktop-controls,
        .explore-gems-container,
        .title-container,
        .side-nav-action-button,
        .mat-mdc-list-item,
        .conversation,
        infinite-scroller,
        bot-list,
        conversations-list,
        search-nav-button,
        side-nav-action-button {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        
        /* 移除側邊欄漸變效果 */
        .top-gradient-container,
        .bottom-gradient-container,
        .top-gradient,
        .bottom-gradient {
          display: none !important;
          opacity: 0 !important;
        }
        
        /* 輸入框區域透明 */
        .text-input-field,
        .text-input-field_textarea-wrapper,
        .text-input-field-main-area,
        .text-input-field_textarea-inner,
        .text-input-field_textarea,
        .ql-container,
        .ql-editor,
        rich-textarea,
        .leading-actions-wrapper,
        .trailing-actions-wrapper,
        .input-buttons-wrapper-bottom,
        .uploader-button-container,
        .toolbox-drawer-container,
        .model-picker-container,
        .pill-ui-logo-container,
        .input-area-container,
        .input-area,
        input-area-v2 {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* 移除輸入框所有陰影、邊框和漸變效果 */
        .input-area-container,
        .input-area,
        .text-input-field,
        input-area-v2,
        .input-gradient,
        .input-box-shadow,
        input-container,
        .with-toolbox-drawer,
        .ui-improvements-phase-1,
        .discovery-feed-theme {
          border: none !important;
          border-top: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
          outline: none !important;
          background-image: none !important;
          filter: none !important;
          backdrop-filter: none !important;
        }
        
        /* 移除輸入框容器的所有視覺效果 */
        input-container::before,
        input-container::after,
        .input-area-container::before,
        .input-area-container::after,
        .input-gradient::before,
        .input-gradient::after {
          display: none !important;
          content: none !important;
        }
        
        /* 代碼區塊保持半透明深色背景 */
        .code-block,
        pre,
        code {
          background-color: rgba(0, 0, 0, 0.6) !important;
        }
        
        /* 按鈕和交互元素保持半透明可見 */
        button,
        .mat-mdc-button,
        .mdc-button,
        .mdc-icon-button,
        .mat-mdc-icon-button {
          background-color: rgba(0, 0, 0, 0.3) !important;
        }
        
        /* 懸停效果 */
        button:hover,
        .mat-mdc-button:hover,
        .conversation:hover,
        .mat-mdc-list-item:hover {
          background-color: rgba(0, 0, 0, 0.5) !important;
        }
        
        /* 選中狀態 */
        .conversation.selected {
          background-color: rgba(0, 0, 0, 0.4) !important;
        }
      `;
    }
  }

  style.textContent = cssRules;
}

// 從儲存中獲取設置並應用
async function loadAndApplyStyles() {
chrome.storage.sync.get([
  'fontFamily',
  'enableBackground',
  'backgroundScope',
  'imageFolder',
  'selectionColor',
  'enableFontColor',
  'fontColor',
  'updateTimestamp'
], async (result) => {
  const settings = {
    fontFamily: result.fontFamily || defaultSettings.fontFamily,
    enableBackground: result.enableBackground !== undefined ? result.enableBackground : defaultSettings.enableBackground,
    backgroundScope: result.backgroundScope || defaultSettings.backgroundScope,
    imageFolder: result.imageFolder || defaultSettings.imageFolder,
    selectionColor: result.selectionColor || defaultSettings.selectionColor,
    enableFontColor: result.enableFontColor || false,
    fontColor: result.fontColor || '#ffffff'
  };
  await setCustomStyles(settings);
});

}

// 初始載入樣式
loadAndApplyStyles();

// 監聽儲存變化(包含時間戳變化)
chrome.storage.onChanged.addListener((changes, namespace) => {
  // 只更新目前背景名稱時，不重新載入，避免無限刷新
  if (changes.currentBackgroundName && Object.keys(changes).length === 1) {
    return;
  }
  // 其他設定變化重新載入
  loadAndApplyStyles();
});