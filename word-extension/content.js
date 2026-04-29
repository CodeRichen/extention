const style = document.createElement('style'); 
document.head.appendChild(style);

// 判斷是否為影片資料夾
function isVideoFolder(folder) {
  return ['videos', 'videos_anime', 'videos_catgril', 'videos_miku', 'videos_view'].includes(folder);
}

// 取得影片在 deptop.mp4 的子路徑
function getVideoDirPath(folder) {
  const map = {
    'videos':        'deptop.mp4',
    'videos_anime':  'deptop.mp4/anime',
    'videos_catgril':'deptop.mp4/catgril',
    'videos_miku':   'deptop.mp4/miku',
    'videos_view':   'deptop.mp4/view'
  };
  return map[folder] || 'deptop.mp4';
}

// 影片失敗後回退到對應圖片資料夾
function getFallbackImageFolder(videoFolder) {
  const map = {
    'videos': 'miku',
    'videos_miku': 'miku',
    'videos_view': 'pho',
    'videos_anime': 'beauty',
    'videos_catgril': 'beauty'
  };
  return map[videoFolder] || 'miku';
}

// 兼容舊設定值，避免抓不到清單導致背景沿用舊內容
function normalizeFolderSelection(folder) {
  if (folder === 'videos') return 'videos_miku';
  return folder;
}

function clearInlineBackground() {
  document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundPosition = '';
  document.body.style.backgroundRepeat = '';
}

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
  // 移除背景影片（如果存在）
  const existingVideo = document.getElementById('custom-bg-video');
  if (existingVideo) {
    existingVideo.remove();
  }
  // 移除暴色遺罩
  const existingOverlay = document.getElementById('custom-bg-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  clearInlineBackground();
  
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

  // 若設定為「僅 AI 網頁」且目前不是 AI 頁面，完全不套用任何樣式
  if (!applyToAll && !isAIPage) {
    const existingVideo = document.getElementById('custom-bg-video');
    if (existingVideo) existingVideo.remove();
    const existingOverlay = document.getElementById('custom-bg-overlay');
    if (existingOverlay) existingOverlay.remove();
    clearInlineBackground();
    style.textContent = '';
    return;
  }

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

  // 背景設置（圖片或影片）
  if (applyToAll || isAIPage) {
    const folder = normalizeFolderSelection(settings.imageFolder || defaultSettings.imageFolder);
    
    // 載入圖片列表
    const imageList = await loadImageList();
    
    if (imageList && imageList[folder]) {
      let mediaFiles;
      
      // 檢查是否為影片資料夾
      if (isVideoFolder(folder)) {
        mediaFiles = imageList[folder].videos;
      } else {
        mediaFiles = imageList[folder].images;
      }
      
      // 處理 PowerShell 產生的結構 (可能是陣列或物件)
      if (mediaFiles && mediaFiles.value && Array.isArray(mediaFiles.value)) {
        // PowerShell 物件結構: { value: [], Count: number }
        mediaFiles = mediaFiles.value;
      } else if (!Array.isArray(mediaFiles)) {
        // 如果不是陣列也沒有 value,則跳過
        console.error('媒體檔案列表格式錯誤');
        return;
      }
      
      if (mediaFiles && mediaFiles.length > 0) {
        let randomMedia;
        
        if (isVideoFolder(folder)) {
          // 影片資料夾：優先選擇MP4
          const mp4Videos = mediaFiles.filter(file => file.toLowerCase().endsWith('.mp4'));
          const allVideos = mp4Videos.length > 0 ? mp4Videos : mediaFiles;
          randomMedia = allVideos[Math.floor(Math.random() * allVideos.length)];
          console.log('✅ 選擇影片:', randomMedia);
        } else {
          // 圖片資料夾：直接隨機選取
          randomMedia = mediaFiles[Math.floor(Math.random() * mediaFiles.length)];
          console.log('✅ 選擇圖片:', randomMedia);
        }
        
        console.log('選中的媒體檔案:', randomMedia, '資料夾:', folder);
        
        if (isVideoFolder(folder)) {
          // 移除現有的背景影片元素（如果存在）
          const existingVideo = document.getElementById('custom-bg-video');
          if (existingVideo) {
            existingVideo.remove();
          }
          
          const videoDirPath = getVideoDirPath(folder);
          console.log('🎬 開始載入影片背景');
          console.log('📁 影片資料夾:', videoDirPath);
          console.log('🎞️ 選中的影片:', randomMedia);
          console.log('📋 完整媒體列表:', mediaFiles);
          
          // 創建影片背景元素
          const video = document.createElement('video');
          video.id = 'custom-bg-video';
          const videoUrl = chrome.runtime.getURL(`${videoDirPath}/${randomMedia}`);
          console.log('🔗 影片URL:', videoUrl);
          let hasRetried = false;
          let hasFinalFallback = false;
          
          // 設置影片屬性
          video.src = videoUrl;
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.preload = 'metadata';
          video.controls = false;
          
          // 檢查文件格式並設置 MIME type
          const fileExtension = randomMedia.split('.').pop().toLowerCase();
          console.log('🎞️ 文件擴展名:', fileExtension);
          
          if (fileExtension === 'mov') {
            console.log('⚠️ MOV格式檢測到，Chrome支援可能有限');
            video.setAttribute('type', 'video/quicktime');
          } else if (fileExtension === 'mp4') {
            video.setAttribute('type', 'video/mp4');
          }
          
          // 正式版本：影片作為背景
          video.controls = false;
          
          video.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            object-fit: cover !important;
            z-index: -1000 !important;
            pointer-events: none !important;
          `;
          
          // 詳細的事件監聽器
          video.addEventListener('loadstart', () => {
            console.log('✅ 影片開始載入:', randomMedia);
          });
          
          video.addEventListener('loadedmetadata', () => {
            console.log('✅ 影片元資料已載入:', randomMedia, `分辨率: ${video.videoWidth}x${video.videoHeight}`);
            
            // 檢查MOV文件是否載入了有效的視頻數據
            if (randomMedia.endsWith('.mov') && (video.videoWidth === 0 || video.videoHeight === 0)) {
              console.error('❌ MOV文件分辨率為0，可能載入失敗');
              handleVideoFailure('MOV分辨率異常');
              return;
            }
          });
          
          video.addEventListener('loadeddata', () => {
            console.log('✅ 影片數據已載入:', randomMedia);
            video.play().then(() => {
              console.log('✅ 影片播放成功!');
            }).catch(e => {
              console.error('❌ 影片播放失敗:', e);
              handleVideoFailure('影片播放失敗');
            });
          });
          
          video.addEventListener('canplay', () => {
            console.log('✅ 影片可以播放:', randomMedia);
          });
          
          video.addEventListener('canplaythrough', () => {
            console.log('✅ 影片可以流暢播放:', randomMedia);
            
            // MOV文件需要額外檢查實際播放情況
            if (randomMedia.endsWith('.mov')) {
              setTimeout(() => {
                if (video.currentTime === 0 && !video.paused) {
                  console.error('❌ MOV文件無法正常播放');
                  handleVideoFailure('MOV播放卡住');
                }
              }, 3000); // 等待3秒檢查是否真正開始播放
            }
          });
          
          video.addEventListener('error', (e) => {
            console.error('❌ 影片載入錯誤:', e);
            console.error('❌ 錯誤詳情:', video.error);
            handleVideoFailure('影片載入錯誤');
          });
          
          video.addEventListener('stalled', () => {
            console.warn('⚠️ 影片載入停滯:', randomMedia);
          });
          
          video.addEventListener('waiting', () => {
            console.warn('⚠️ 影片載入等待中:', randomMedia);
          });
          
          function handleVideoFailure(reason) {
            if (!hasRetried) {
              hasRetried = true;
              const retryUrl = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}retry=1&t=${Date.now()}`;
              console.warn(`⚠️ 影片失敗，先重試一次: ${reason}`);
              video.src = retryUrl;
              video.load();
              video.play().catch(() => {
                // 重試後若仍失敗，交給 error / loadeddata 捕捉後執行最終回退
              });
              return;
            }

            if (hasFinalFallback) {
              return;
            }
            hasFinalFallback = true;
            console.warn(`⚠️ 重試後仍失敗，回退到對應圖片資料夾: ${reason}`);
            loadFallbackImageBackground();
          }

          function loadFallbackImageBackground() {
            const imageList2 = imageListCache;
            const fallbackFolder = getFallbackImageFolder(folder);
            const fallbackEntry = imageList2 && imageList2[fallbackFolder];
            let fallbackImages = fallbackEntry ? fallbackEntry.images : null;

            if (fallbackImages && fallbackImages.value && Array.isArray(fallbackImages.value)) {
              fallbackImages = fallbackImages.value;
            }

            if (!Array.isArray(fallbackImages) || fallbackImages.length === 0) {
              fallbackImages = (imageList2 && imageList2.miku && imageList2.miku.images) || [];
            }

            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }

            const overlay = document.getElementById('custom-bg-overlay');
            if (overlay) {
              overlay.remove();
            }

            if (fallbackImages.length > 0) {
              const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
              const finalFolder = (imageList2 && imageList2[fallbackFolder] && imageList2[fallbackFolder].images) ? fallbackFolder : 'miku';
              document.body.style.backgroundImage = `url('chrome-extension://${chrome.runtime.id}/${finalFolder}/${randomImage}')`;
              document.body.style.backgroundSize = 'cover';
              document.body.style.backgroundPosition = 'center';
              document.body.style.backgroundRepeat = 'no-repeat';
              chrome.storage.sync.set({ currentBackgroundName: `${finalFolder}/${randomImage} (影片重試失敗回退)` });
            }
          }
          
          // 將影片插入到 body 的最前面
          document.body.insertBefore(video, document.body.firstChild);
          console.log('✅ 影片元素已插入DOM');

          // 新增暴色遺罩層（模擬 video::after dark overlay）
          let overlay = document.getElementById('custom-bg-overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'custom-bg-overlay';
          }
          overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.35) !important;
            z-index: -999 !important;
            pointer-events: none !important;
          `;
          document.body.appendChild(overlay);
          console.log('✅ 暴色遺罩層已加入');
          
          // GPT/OpenAI 頁面需要讓根元素透明，否則影片被遮住
          if (isGPTPage) {
            cssRules += `
              body,
              #__next,
              #__next > div,
              .flex.h-full.flex-col,
              main,
              [class*="react-scroll"],
              .overflow-hidden,
              .h-full {
                background-color: transparent !important;
              }
            `;
          }
          
          chrome.storage.sync.set({ currentBackgroundName: `${folder}/${randomMedia}` });
        } else {
          // 移除影片背景（如果存在）
          const existingVideo = document.getElementById('custom-bg-video');
          if (existingVideo) {
            existingVideo.remove();
          }
          const existingOverlay = document.getElementById('custom-bg-overlay');
          if (existingOverlay) {
            existingOverlay.remove();
          }
          
          // 設置圖片背景
          cssRules += `
            body {
              background-image: url('chrome-extension://${chrome.runtime.id}/${folder}/${randomMedia}') !important;
              background-size: cover !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
            }
          `;
          chrome.storage.sync.set({ currentBackgroundName: `${folder}/${randomMedia}` });
        }
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