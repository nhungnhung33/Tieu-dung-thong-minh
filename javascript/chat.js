import { GoogleGenAI } from "https://esm.sh/@google/genai";

// 1. Điền API Key và tên Model hợp lệ
const GEMINI_API_KEY = "AQ.Ab8RN6Kdw3CcJdUiiD6bAuynclz1SJOibxl6WmlldarxtaLObg"; // Thay API Key thật của bạn vào đây
const MODEL_NAME = "gemini-2.5-flash"; 

// Khởi tạo GoogleGenAI SDK
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']]
  },
  svg: {
    fontCache: 'global'
  }
};

const localData = [
  { "prompt": "tiết kiệm để làm gì", "completion": "để cho những mục đích tương lai" },
  { "prompt": "học lớp nào", "completion": "DH25CS03." },
  { "prompt": "giới thiệu", "completion": "cDH25CS03ược tạo bởi 4 con thỏ 1 con chồn." }
];

const allSuggestions = [
  "Thầy Bảy có tốt không",
  "Học Ứng dụng Web có zui kh",
  "HoanggSangg dễ thương tốt tính ",
  "Hồng Nhun khùm",
  "Mỹ Tin khùm",
  "Như É khùm",
  "Huỳnh Lý khùm",
];

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const errorMessage = document.getElementById('error-message');
const previewMessage = document.getElementById('preview-message');
const imageInput = document.getElementById('image-input');
const suggestionsContainer = document.getElementById('suggestions-container');

// Kiểm tra khi trang load
window.addEventListener('load', function() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY') {
    errorMessage.style.display = 'block';
    errorMessage.innerText = 'Lỗi: Vui lòng nhập Gemini API key hợp lệ trong mã nguồn.';
  }
  const voiceButton = document.querySelector('button[title="Chat bằng giọng nói"]');
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    if (voiceButton) voiceButton.style.display = 'none';
  }
});

function getRandomSuggestions(exclude = []) {
  const filtered = allSuggestions.filter(s => !exclude.includes(s));
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

function displaySuggestions(currentSuggestions) {
  suggestionsContainer.innerHTML = '';
  currentSuggestions.forEach(suggestion => {
    const suggestionDiv = document.createElement('div');
    suggestionDiv.classList.add('suggestion');
    suggestionDiv.title = suggestion;
    suggestionDiv.textContent = suggestion;
    suggestionDiv.onclick = () => {
      userInput.value = suggestion;
      sendMessage();
      const newSuggestions = getRandomSuggestions([suggestion]);
      displaySuggestions(newSuggestions);
    };
    suggestionsContainer.appendChild(suggestionDiv);
  });
}

displaySuggestions(getRandomSuggestions());

function findBestMatch(input) {
  const normalizedInput = input.toLowerCase().trim();
  for (let item of localData) {
    const keywords = item.prompt.split(' ');
    if (keywords.every(k => normalizedInput.includes(k))) {
      return item.completion;
    }
  }
  return null;
}

function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('loading-message');
  loadingDiv.id = 'loading-message';
  loadingDiv.textContent = 'Đang xử lý...';
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return loadingDiv;
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-message');
  if (loadingDiv) loadingDiv.remove();
}

// Gửi tin nhắn dạng văn bản bằng SDK mới
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY') {
    errorMessage.style.display = 'block';
    errorMessage.innerText = 'Lỗi: Vui lòng nhập Gemini API key hợp lệ.';
    return;
  }

  appendMessage('user', message);
  userInput.value = '';
  if (previewMessage) previewMessage.style.display = 'none';

  const localResponse = findBestMatch(message);
  if (localResponse) {
    appendMessage('gemini', localResponse);
    return;
  }

  showLoading();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: message,
    });

    hideLoading();
    appendMessage('gemini', response.text);
  } catch (error) {
    hideLoading();
    console.error('Lỗi Gemini API:', error);
    appendMessage('gemini', `Lỗi: ${error.message}`);
  }
}

// Xử lý gửi hình ảnh bằng SDK mới
async function handleImageUpload() {
  const file = imageInput.files[0];
  if (!file) return;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY') {
    errorMessage.style.display = 'block';
    errorMessage.innerText = 'Lỗi: Vui lòng nhập Gemini API key hợp lệ.';
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(event) {
    const base64Image = event.target.result;
    const base64Data = base64Image.split(',')[1];

    appendMessage('user', 'Bạn đã tải lên 1 hình ảnh, đợi tôi một chút...', base64Image);
    showLoading();

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { text: "Hãy phân tích và mô tả nội dung của hình ảnh này một cách chi tiết." },
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          }
        ],
      });

      hideLoading();
      appendMessage('gemini', response.text);
    } catch (error) {
      hideLoading();
      console.error('Lỗi phân tích ảnh:', error);
      appendMessage('gemini', `Lỗi khi phân tích hình ảnh: ${error.message}`);
    }
  };

  reader.readAsDataURL(file);
}

function formatAIMessage(text) {
  text = text.replace(/\*\*\*/g, '');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');

  if (text.includes('</p><p>')) {
    text = '<p>' + text + '</p>';
  }

  return text;
}

function appendMessage(sender, message, imageUrl = null) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add(sender === 'user' ? 'user-message' : 'gemini-message');

  if (imageUrl) {
    messageDiv.classList.add('image-message');
    const img = document.createElement('img');
    img.src = imageUrl;
    messageDiv.appendChild(img);
  }

  if (message) {
    const textDiv = document.createElement('div');
    if (sender === 'gemini') {
      textDiv.innerHTML = formatAIMessage(message);
    } else {
      textDiv.innerHTML = message.replace(/\n/g, "<br>");
    }
    messageDiv.appendChild(textDiv);
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(err => {
      console.error('Lỗi MathJax:', err);
    });
  }
}

userInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') sendMessage();
});

// Gán hàm vào window để các sự kiện onclick trên HTML hoạt động bình thường
window.sendMessage = sendMessage;
window.handleImageUpload = handleImageUpload;
