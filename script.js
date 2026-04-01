const micBtn = document.getElementById('mic-btn');
const statusText = document.getElementById('status');
const chatContainer = document.getElementById('chat-container');

// 1. API Sozlamasi (Kalitingizni shu yerga qo'ying)
const API_KEY = "SIZNING_API_KALITINGIZ"; 

// 2. Ovozni aniqlash sozlamalari
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; 
recognition.interimResults = false;

// 3. AI bilan bog'lanish funksiyasi
async function getAIResponse(userText) {
    statusText.innerText = "AI is thinking...";
    
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
                    { role: "system", content: "You are an expert English teacher. Correct grammar and reply naturally." },
                    { role: "user", content: userText }
                ]
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        appendMessage('ai', aiText);
        speakText(aiText); // AI javobini ovoz chiqarib o'qiydi
        statusText.innerText = "Ready.";
    } catch (error) {
        console.error("Error:", error);
        statusText.innerText = "API Error!";
    }
}

// 4. AI javobini ovozli o'qish (Text-to-Speech)
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

// 5. Chatga xabar yozish
function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = role;
    div.innerText = (role === 'user' ? "You: " : "AI: ") + text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 6. Tugma bosilganda ishlash
micBtn.onclick = () => {
    recognition.start();
    micBtn.classList.add('active');
    statusText.innerText = "Listening...";
};

recognition.onresult = (event) => {
    micBtn.classList.remove('active');
    const transcript = event.results[0][0].transcript;
    appendMessage('user', transcript);
    getAIResponse(transcript);
};

recognition.onerror = () => {
    micBtn.classList.remove('active');
    statusText.innerText = "Error! Try again.";
};
