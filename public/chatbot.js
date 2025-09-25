document.addEventListener('DOMContentLoaded', () => {
    // Select elements from the HTML
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Backend URL
    const backendUrl = '/api/chatbot';

    // Toggle chatbot window on button click
    chatbotToggle.addEventListener('click', () => {
        if (chatbotWindow.style.display === 'flex') {
            chatbotWindow.style.display = 'none';
        } else {
            chatbotWindow.style.display = 'flex';
            chatbotMessages.innerHTML = ''; // Clear previous messages
            appendMessage('bot', '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?');
        }
    });

    // Handle user input on 'Enter' key press
    // Manejar la entrada del usuario con la tecla 'Enter'
    chatbotInput.addEventListener('keypress', (e) => {
        // Si la tecla presionada es 'Enter'
        if (e.key === 'Enter') {
            // Obtener el mensaje del usuario y quitar espacios en blanco
            const userMessage = chatbotInput.value.trim();
            // Si hay un mensaje válido
            if (userMessage) {
                // Añadir el mensaje del usuario al chat
                appendMessage('user', userMessage);
                // Limpiar el campo de entrada para la próxima pregunta
                chatbotInput.value = '';
                
                // Deshabilitar el input para evitar múltiples envíos
                chatbotInput.disabled = true;

                // Enviar la pregunta a la IA y esperar la respuesta
                respondToUser(userMessage.toLowerCase()).finally(() => {
                    // Habilitar el input de nuevo cuando el bot termine
                    chatbotInput.disabled = false;
                    chatbotInput.focus(); // Poner el cursor de vuelta en el campo
                });
            }
        }
    });

    // Function to add a message to the chat
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = message;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Function to send user message to the backend and get a response
    async function respondToUser(userMessage) {
        appendMessage('bot', 'Pensando...');

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Error al conectar con la IA.');
            }

            const data = await response.json();
            const botResponse = data.response;

            const lastMessage = document.querySelector('#chatbot-messages .message:last-child');
            if (lastMessage && lastMessage.textContent === 'Pensando...') {
                lastMessage.textContent = botResponse;
            } else {
                appendMessage('bot', botResponse);
            }

        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Lo siento, hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.');
        }
    }
});
