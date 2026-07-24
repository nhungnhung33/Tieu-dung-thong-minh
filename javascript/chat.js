window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global'
    }
};

const MEGALLM_API_KEY = 'sk-mega-631721608dbcc17465bb6b27a7b7d29a.a6a36a45e76c3a5697e6777af76dc7a45a7b0875c5279dfc0a2a1ee916ffd742';
const MODEL_NAME = 'gemini-2.5-pro';
const API_URL = 'https://ai.megallm.io/v1/chat/completions';

const localData = [
    { prompt: 'tiết kiệm để làm gì', completion: 'để cho những mục đích tương lai' },
    { prompt: 'học lớp nào', completion: 'DH25CS03.' },
    { prompt: 'giới thiệu', completion: 'Được tạo bởi 4 con thỏ và 1 con chồn.' }
];

const allSuggestions = [
    'Thầy Bảy có tốt không',
    'Học Ứng dụng Web có zui không',
    'HoanggSangg dễ thương tốt tính',
    'Hồng Nhun khùm',
    'Mỹ Tin khùm',
    'Như É khùm',
    'Huỳnh Lý khùm'
];

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const errorMessage = document.getElementById('error-message');
const previewMessage = document.getElementById('preview-message');
const imageInput = document.getElementById('image-input');
const suggestionsContainer = document.getElementById('suggestions-container');

function hasValidApiKey() {
    const key = MEGALLM_API_KEY.trim();

    return key.startsWith('sk-mega-') && key.length > 20;
}

function showApiKeyError() {
    errorMessage.style.display = 'block';
    errorMessage.innerText = 'Lỗi: Vui lòng nhập MegaLLM API key hợp lệ.';
}

window.addEventListener('load', function () {
    if (!hasValidApiKey()) {
        showApiKeyError();
    } else {
        errorMessage.style.display = 'none';
    }

    const voiceButton = document.querySelector(
        'button[title="Chat bằng giọng nói"]'
    );

    if (
        voiceButton &&
        !window.SpeechRecognition &&
        !window.webkitSpeechRecognition
    ) {
        voiceButton.style.display = 'none';
    }
});

function getRandomSuggestions(exclude = []) {
    const filtered = allSuggestions.filter(
        suggestion => !exclude.includes(suggestion)
    );

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

    for (const item of localData) {
        const keywords = item.prompt.toLowerCase().split(' ');

        if (keywords.every(keyword => normalizedInput.includes(keyword))) {
            return item.completion;
        }
    }

    return null;
}

function showLoading() {
    const oldLoading = document.getElementById('loading-message');
    if (oldLoading) oldLoading.remove();

    const loadingDiv = document.createElement('div');

    loadingDiv.classList.add('loading-message');
    loadingDiv.id = 'loading-message';
    loadingDiv.textContent = 'Đang xử lý...';

    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading-message');

    if (loadingDiv) {
        loadingDiv.remove();
    }
}

async function askMegaLLM(messages) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MEGALLM_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: messages,
            max_tokens: 800,
            temperature: 0.7
        })
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error('Máy chủ trả về phản hồi không hợp lệ.');
    }

    if (!response.ok) {
        console.error('Lỗi MegaLLM:', data);
        throw new Error(
            data?.error?.message || 'Không thể kết nối đến MegaLLM.'
        );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
        throw new Error('Không nhận được phản hồi hợp lệ từ MegaLLM.');
    }

    return reply;
}

async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    if (!hasValidApiKey()) {
        showApiKeyError();
        return;
    }

    appendMessage('user', message);
    userInput.value = '';
    previewMessage.style.display = 'none';

    const localResponse = findBestMatch(message);

    if (localResponse) {
        appendMessage('gemini', localResponse);
        return;
    }

    showLoading();

    try {
        const reply = await askMegaLLM([
            {
                role: 'user',
                content: message
            }
        ]);

        appendMessage('gemini', reply);
    } catch (error) {
        appendMessage('gemini', `Lỗi: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function escapeHtml(text) {
    const replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return String(text).replace(/[&<>"']/g, character => replacements[character]);
}

function formatAIMessage(text) {
    text = escapeHtml(text);

    text = text.replace(/\*\*\*/g, '');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    text = text.replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>');

    if (text.includes('<li>')) {
        text = `<ul>${text}</ul>`;
    }

    text = text.replace(/\n\n+/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');

    if (text.includes('</p><p>')) {
        text = `<p>${text}</p>`;
    }

    return text;
}

function appendMessage(sender, message, imageUrl = null) {
    const messageDiv = document.createElement('div');

    messageDiv.classList.add(
        sender === 'user' ? 'user-message' : 'gemini-message'
    );

    if (imageUrl) {
        messageDiv.classList.add('image-message');

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Hình ảnh đã tải lên';

        messageDiv.appendChild(img);
    }

    if (message) {
        const textDiv = document.createElement('div');

        if (sender === 'gemini') {
            textDiv.innerHTML = formatAIMessage(message);
        } else {
            textDiv.innerHTML = escapeHtml(message).replace(/\n/g, '<br>');
        }

        messageDiv.appendChild(textDiv);
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(error => {
            console.error('Lỗi MathJax:', error);
        });
    }
}

userInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

function startRecognition() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
        return;
    }

    const oldListening = document.getElementById('listening-message');
    if (oldListening) oldListening.remove();

    const listeningDiv = document.createElement('div');

    listeningDiv.classList.add('loading-message');
    listeningDiv.id = 'listening-message';
    listeningDiv.textContent = '🎤 Đang nghe...';
    listeningDiv.style.backgroundColor = '#e3f7e6';

    chatBox.appendChild(listeningDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const recognition = new (
        window.SpeechRecognition || window.webkitSpeechRecognition
    )();

    recognition.lang = 'vi-VN';

    recognition.onresult = function (event) {
        const voiceInput = event.results[0][0].transcript;
            userInput.value = voiceInput;
        previewMessage.innerText = `Bạn vừa nói: "${voiceInput}"`;
        previewMessage.style.display = 'block';

        const listeningMsg = document.getElementById('listening-message');
        if (listeningMsg) listeningMsg.remove();
    };

    recognition.onerror = function (event) {
        const listeningMsg = document.getElementById('listening-message');
        if (listeningMsg) listeningMsg.remove();

        alert(`Lỗi nhận dạng giọng nói: ${event.error}`);
    };

    recognition.onend = function () {
        const listeningMsg = document.getElementById('listening-message');
        if (listeningMsg) listeningMsg.remove();
    };

    recognition.start();
}

async function handleImageUpload() {
    const file = imageInput.files[0];

    if (!file) return;

    if (!hasValidApiKey()) {
        showApiKeyError();
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (event) {
        const base64Image = event.target.result;

        appendMessage(
            'user',
            'Bạn đã tải lên một hình ảnh, đợi tôi một chút...',
            base64Image
        );

        showLoading();

        try {
            const description = await askMegaLLM([
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Hãy phân tích và mô tả nội dung của hình ảnh này một cách chi tiết.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: base64Image,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ]);

            appendMessage('gemini', description);
        } catch (error) {
            appendMessage('gemini', `Lỗi phân tích ảnh: ${error.message}`);
        } finally {
            hideLoading();
            imageInput.value = '';
        }
    };

    reader.readAsDataURL(file);
}

     
