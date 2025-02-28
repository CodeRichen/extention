// chatGPT.js 

document.addEventListener('load', function() {
    // 寻找具有特定id的可编辑<div>标签(失敗)
    const chatGPTInputBox = document.querySelector('div#prompt-textarea');
    let sendButton = document.querySelector('button:has(svg.icon-2xl)'); // 找到送出按鈕
    if (chatGPTInputBox) {
      chatGPTInputBox.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          // 获取可编辑<div>的文本内容
          const content = chatGPTInputBox.textContent;
          if (!content.includes('(中文)')) {
            chatGPTInputBox.textContent += ' (中文)';
          }
  
          // setTimeout(() => {
            
          //     const chatGPTInputBox = document.querySelector('div#prompt-textarea');            if (searchButton) {
          //       chatGPTInputBox.click(); // 点击
          //   } else {
  
          //     const form = this.closest('form');
          //     if (form) {
          //       form.submit();
          //     }
          //   }
          // }, 100); // 延迟100毫秒
        }
      });
    }
  });