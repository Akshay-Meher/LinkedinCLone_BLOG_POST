var socket = io();

function setActiveUser(userId) {
    document.querySelectorAll('.user').forEach(function (userElement) {
        userElement.classList.remove('active');
    });
    var activeUserElement = document.querySelector(`.user[data-user-id="${userId}"]`);
    if (activeUserElement) {
        activeUserElement.classList.add('active');
    }
}

function showPrevMessages(messages) {
    console.log('messages', messages);


    const chatBox = document.getElementById('chatBox');

    while (chatBox.firstChild) {
        chatBox.removeChild(chatBox.firstChild);
    }

    messages.forEach((message) => {
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        if (message.senderId == document.getElementById('chatBox').getAttribute('data-user-id')) {
            messageDiv.classList.add('outgoing');
        } else {
            messageDiv.classList.add('incoming');
        }
        var p = document.createElement('p');
        p.textContent = message.content;
        messageDiv.appendChild(p);

        chatBox.insertBefore(messageDiv, chatBox.firstChild);
    });
}

document.querySelectorAll('.user').forEach(function (userElement) {
    userElement.addEventListener('click', async function () {
        var userId = this.getAttribute('data-user-id');
        var loginUserId = this.getAttribute('login-userId');
        const apiEndpoint = 'http://localhost:3000/chat/create';
        const requestPayload = {
            user1Id: loginUserId,
            user2Id: userId
        };

        setActiveUser(userId);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            const data = await response.json();
            console.log('Success1:', data);


            if (data.chatId) {


                const chat = await fetch(`http://localhost:3000/chat/${data.chatId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const chatData = await chat.json();
                console.log('Success2:', chatData);
                showPrevMessages(chatData.chat.Messages);

                var chatBox = document.getElementById('chatBox');
                chatBox.setAttribute("data-chat-id", chatData.chat.id);
                chatBox.setAttribute("data-user-id", chatData.chat.userId1);

            }

        } catch (error) {
            console.error('Error:', error);
            // Handle any errors
        }

        console.log('Opening chat with loginUserId: ' + loginUserId);
        console.log('Opening chat with user: ' + userId);
    });
});

document.getElementById('chatForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    var chatBox = document.getElementById('chatBox');
    var chatId = chatBox.getAttribute('data-chat-id');
    var userId = chatBox.getAttribute('data-user-id');
    var content = document.getElementById('messageContent').value;

    var message = {
        chatId: chatId,
        senderId: userId,
        content: content,
        type: 'text'
    };

    socket.emit('sendMessage', message);

    try {

        const response = await fetch("http://localhost:3000/chat/sendMessage", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        const data = await response.json();
        console.log('Success last:', data);

    } catch (error) {
        console.log(error);
    }

    document.getElementById('messageContent').value = '';
});

socket.on('receiveMessage', function (message) {

    console.log("receiveMessage", message);

    var messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    if (message.senderId == document.getElementById('chatBox').getAttribute('data-user-id')) {
        messageDiv.classList.add('outgoing');
    } else {
        messageDiv.classList.add('incoming');
    }

    var p = document.createElement('p');
    p.textContent = message.content;
    messageDiv.appendChild(p);

    document.getElementById('chatBox').appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
});
