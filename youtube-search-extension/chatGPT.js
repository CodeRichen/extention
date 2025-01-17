// chatGPT.js 
document.addEventListener('DOMContentLoaded', function() {
    // 寻找具有特定id的可编辑<div>标签(失敗)
    const chatGPTInputBox = document.querySelector('div#prompt-textarea');
  
    if (chatGPTInputBox) {
      chatGPTInputBox.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          // 获取可编辑<div>的文本内容
          const content = chatGPTInputBox.textContent;
          if (!content.includes('(中文)')) {
            chatGPTInputBox.textContent += ' (中文)';
          }
  
          // 模拟按下Enter键
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            keyCode: 13, // Enter键的keyCode是13
            which: 13, // which属性也用于表示按键代码
            shiftKey: false,
            ctrlKey: false,
            metaKey: false
          });
  
          // 触发事件
          chatGPTInputBox.dispatchEvent(enterEvent);
        }
      });
    }
  });