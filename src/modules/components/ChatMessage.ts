export function addMessage(container: Element | null, text: string, sender: 'user' | 'ai') {
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.wordWrap = 'break-word';
    messageDiv.style.display = 'inline-block';
    messageDiv.style.marginBottom = '8px';

    if (sender === 'user') {
      messageDiv.style.maxWidth = '70%';
      messageDiv.style.padding = '8px';
      messageDiv.style.borderRadius = '8px';
      messageDiv.style.backgroundColor = '#FFFFFF';
      messageDiv.style.marginLeft = 'auto';
    } else {
      messageDiv.style.marginRight = 'auto';
    }

    messageDiv.textContent = text;

    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.width = '100%';
    messageDiv.style.padding = '5px';
    wrapperDiv.style.display = 'flex';
    wrapperDiv.style.flexDirection = sender === 'user' ? 'row-reverse' : 'row';
    wrapperDiv.appendChild(messageDiv);

    container.appendChild(wrapperDiv);
    container.scrollTop = container.scrollHeight;
  }