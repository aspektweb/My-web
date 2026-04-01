const micBtn = document.getElementById('mic-btn');
const statusText = document.getElementById('status');
const chatContainer = document.getElementById('chat-container');

// 1. Ovozni aniqlash (Speech Recognition)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; // Tilni o'rnatish
recognition.interimResults = false;

// 2. API bilan ishlash (Siz bergan API kod asosi)
const API_KEY = "SIZNING_API_KALITINGIZ"; 

async function getAIResponse(userText) {
    statusText.innerText = "AI o'ylamoqda...";
    
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: "You are a friendly English teacher. Correct grammar mistakes and reply concisely."},
                    {role: "user", content: userText}
                ]
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        appendMessage('ai', aiText);
        speakText(aiText); // Javobni ovozli chiqarish
    } catch (error) {
        console.error("Xatolik:", error);
        statusText.innerText = "Xatolik yuz berdi.";
    }
}

// 3. Ovozli javob qaytarish (Text-to-Speech)
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
    statusText.innerText = "Tayyor.";
}

// 4. Chat interfeysiga xabar qo'shish
function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'ai-msg';
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 5. Hodisalarni boshqarish
micBtn.onclick = () => {
    recognition.start();
    micBtn.classList.add('active');
    statusText.innerText = "Sizni eshityapman...";
};

recognition.onresult = (event) => {
    micBtn.classList.remove('active');
    const transcript = event.results[0][0].transcript;
    appendMessage('user', transcript);
    getAIResponse(transcript);
};

recognition.onerror = () => {
    micBtn.classList.remove('active');
    statusText.innerText = "Xatolik! Qayta urinib ko'ring.";
};
