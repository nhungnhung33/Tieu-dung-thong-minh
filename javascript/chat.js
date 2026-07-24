
	window.MathJax = {
    	tex: {
        	inlineMath: [['$', '$'], ['\\(', '\\)']]
    	},
        svg: {
            fontCache: 'global'
        }
    };
 const GEMINI_API_KEY = "AQ.Ab8RN6KUkJQPfES53of4NK_20muZ2ljpSB2NqeuQA0I7QahFHg"; // Thay bằng Gemini API key thực tế
    const MODEL_NAME = 'gemini-3-flash-preview';
 
   
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
    	if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        	errorMessage.style.display = 'block';
        	errorMessage.innerText = 'Lỗi: Vui lòng nhập Gemini API key hợp lệ trong mã nguồn.';
    	}
    	const voiceButton = document.querySelector('button[title="Chat bằng giọng nói"]');
    	if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        	voiceButton.style.display = 'none';
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
    	if (loadingDiv) {
        	loadingDiv.remove();
    	}
	}
 
	async function sendMessage() {
    	const message = userInput.value.trim();
    	if (!message) return;
 
    	if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        	errorMessage.style.display = 'block';
        	errorMessage.innerText = 'Lỗi: Vui lòng nhập Gemini API key hợp lệ trong mã nguồn.';
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
 
    	const loadingDiv = showLoading();
 
    	try {
        	console.log('Gửi yêu cầu đến Gemini API với key:', GEMINI_API_KEY);
        	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
            	method: 'POST',
            	headers: {
                	'Content-Type': 'application/json',
            	},
            	body: JSON.stringify({
                	contents: [
                    	{
                        	parts: [
                            	{
                                	text: message
                            	}
                        	]
                    	}
                	]
            	}),
        	});
 
        	hideLoading();
 
        	const data = await response.json();
        	if (!response.ok) {
            	const errorMessage = data?.error?.message || 'Không thể kết nối đến Gemini API';
            	console.error('Lỗi Gemini API:', data);
            	appendMessage('gemini', `Lỗi: ${errorMessage}`);
            	return;
        	}
        	if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
            	appendMessage('gemini', 'Không nhận được phản hồi hợp lệ từ Gemini API.');
            	return;
        	}
 
        	const reply = data.candidates[0].content.parts[0].text;
        	appendMessage('gemini', reply);
    	} catch (error) {
        	hideLoading();
        	console.error('Lỗi kết nối mạng:', error);
        	appendMessage('gemini', `Lỗi kết nối mạng: ${error.message}`);
    	}
	}
 
	function formatAIMessage(text) {
    	// Loại bỏ các dấu *** không cần thiết
    	text = text.replace(/\*\*\*/g, '');
 
    	// Chuyển đổi **text** thành <strong>text</strong>
    	text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
 
    	// Chuyển đổi *text* thành <em>text</em>
    	text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
 
    	// Xử lý danh sách (- hoặc •)
    	text = text.replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>');
    	text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
 
    	// Thay thế xuống dòng thành <br>
    	text = text.replace(/\n\n/g, '</p><p>');
    	text = text.replace(/\n/g, '<br>');
 
    	// Bọc các đoạn văn bằng <p> nếu chúng chứa nội dung
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
 
	function startRecognition() {
    	if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        	alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
        	return;
    	}
 
    	// Hiển thị loading "đang nghe"
    	const listeningDiv = document.createElement('div');
        listeningDiv.classList.add('loading-message');
    	listeningDiv.id = 'listening-message';
    	listeningDiv.textContent = '🎤 Đang nghe...';
    	listeningDiv.style.backgroundColor = '#e3f7e6';
    	chatBox.appendChild(listeningDiv);
    	chatBox.scrollTop = chatBox.scrollHeight;
 
    	const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    	recognition.lang = 'vi-VN';
 
    	recognition.onstart = function() {
        	const listeningMsg = document.getElementById('listening-message');
        	if (listeningMsg) {
            	listeningMsg.textContent = '🎤 Đang nghe...';
        	}
    	};
 
    	recognition.onresult = function(event) {
        	const voiceInput = event.results[0][0].transcript;
        	userInput.value = voiceInput;
        	previewMessage.innerText = `Bạn vừa nói: "${voiceInput}"`;
        	previewMessage.style.display = 'block';
 
        	// Xóa loading message
        	const listeningMsg = document.getElementById('listening-message');
        	if (listeningMsg) {
            	listeningMsg.remove();
        	}
    	};
 
    	recognition.onerror = function(event) {
        	// Xóa loading message khi có lỗi
        	const listeningMsg = document.getElementById('listening-message');
        	if (listeningMsg) {
            	listeningMsg.remove();
        	}
        	alert('Lỗi nhận dạng giọng nói: ' + event.error);
    	};
 
    	recognition.onend = function() {
        	// Xóa loading message khi kết thúc
        	const listeningMsg = document.getElementById('listening-message');
        	if (listeningMsg) {
            	listeningMsg.remove();
        	}
    	};
 
    	recognition.start();
	}
 
	async function handleImageUpload() {
    	const file = imageInput.files[0];
    	if (!file) return;
 
    	if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        	errorMessage.style.display = 'block';
        	errorMessage.innerText = 'Lỗi: Vui lòng nhập Gemini API key hợp lệ trong mã nguồn.';
        	return;
    	}
 
    	const reader = new FileReader();
    	reader.onload = async function(event) {
        	const base64Image = event.target.result;
        	const base64Data = base64Image.split(',')[1];
 
        	appendMessage('user', 'Bạn đã tải lên 1 hình ảnh, đợi tôi một chút...', base64Image);
 
        	const loadingDiv = showLoading();
 
        	try {
            	console.log('Gửi yêu cầu phân tích hình ảnh đến Gemini API với key:', GEMINI_API_KEY);
            	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
                	method: 'POST',
                	headers: {
                    	'Content-Type': 'application/json',
                	},
                	body: JSON.stringify({
                    	contents: [
                        	{
                            	parts: [
                                	{
                                    	text: "Hãy phân tích và mô tả nội dung của hình ảnh này một cách chi tiết."
                                	},
                                	{
                                        inline_data: {
                                            mime_type: file.type,
                                            data: base64Data
                                    	}
                                	}
                            	]
                        	}
                    	]
                	}),
            	});
 
            	hideLoading();
 
            	const data = await response.json();
            	if (!response.ok) {
                	const errorMessage = data?.error?.message || 'Không thể phân tích hình ảnh';
                	console.error('Lỗi Gemini API:', data);
                	appendMessage('gemini', `Lỗi: ${errorMessage}`);
                	return;
            	}
            	if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
                	appendMessage('gemini', 'Không nhận được phản hồi hợp lệ từ Gemini API.');
                	return;
            	}
 
            	const description = data.candidates[0].content.parts[0].text;
            	appendMessage('gemini', description);
        	} catch (error) {
            	hideLoading();
            	console.error('Lỗi kết nối mạng:', error);
            	appendMessage('gemini', `Lỗi kết nối mạng khi phân tích hình ảnh: ${error.message}`);
        	}
    	};
 
    	reader.readAsDataURL(file);
	}