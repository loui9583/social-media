<script>
    import { userToConnectTo, messages, username } from '../stores';
    export let closeChat;
    export let socket;
    let currentUser = $username;
    let message = '';

    function formatDate() {
        const date = new Date();
        const day = date.getDate(); // Get the day as a number (1-31)
        const monthNames = [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec'
        ];
        const month = monthNames[date.getMonth()]; // Get the month as a name
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes

        return `${day}. ${month} • ${hours}:${minutes}`;
    }

    const sendMessage = () => {
        const room = [$username, $userToConnectTo].sort().join('-');
        if (message.trim() !== '') {
            socket.emit('chat message', { room: room, message: message.trim() });
            message = '';
        }
    };
</script>

<div style="position: fixed; bottom: 0; right: 0; z-index: 1">
    <div class="chatbox-container">
        <div style="display: flex; justify-content: space-between; background: lightgrey; align-items: center;">
            <p style="margin-left: 15px;"><strong>{$userToConnectTo}</strong></p>
            <button style="height: 25px; margin-right: 15px;" on:click={closeChat}>×</button>
        </div>
        <div class="message-container">
            <div class="message-list">
                {#each $messages as { message, username }}
                    <div class={username === currentUser ? 'message current-user' : 'message other-user'}>
                        <p class="message-info">{username} • {[formatDate()]}</p>
                        <div class="message-body">{message}</div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="message-input-container">
            <textarea
                class="message-input"
                type="text"
                bind:value={message}
                placeholder="Type your message..."
            ></textarea>
            <button class="send-button" on:click={sendMessage}>→</button>
        </div>
    </div>
</div>
<style>
    .message-container {
        width: 338px;
        background: #f9f9f9;
        border: 1px solid #ccc;
        border-radius: 5px;
        overflow: hidden;
        padding: 0 10px; /* Ensures padding does not affect inner elements */
    }

    .message-list {
        height: 400px;
        overflow-y: auto;
        padding: 10px;
        width: 100%; /* Ensure it fills the parent's width minus padding */
    }

    .message-input-container {
        border: 1px solid #b3b3b36e;
        max-width: 338px;
        display: flex;
        padding: 15px;
        background-color: #ddd;
    }

    .message-input {
        flex-grow: 1; /* Takes up the available space */
        margin-right: 10px;
        padding: 5px;
        border: 1px solid #b3b3b3;
        border-radius: 5px;
    }

    .send-button {
        padding: 5px 15px;
        background-color: #007bff;
        border: none;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }

    .message {
        margin-bottom: 10px;
    }

    .current-user .message-body {
        background-color: lightblue;
        padding: 5px;
        border-radius: 8px;
        margin-left: auto; /* Keeps the message aligned to the right */
        margin-right: 15px; /* Adds margin on the right */
        max-width: calc(70%); /* Adjusted width to account for padding/margins on both sides */
        box-sizing: border-box;
        overflow-wrap: break-word; /* Standard approach */
    }

    .other-user .message-body {
        background-color: darkblue;
        color: white;
        padding: 5px;
        border-radius: 8px;

        margin-right: auto; /* Keeps the message aligned to the left */
        max-width: calc(70%); /* Consistent with current-user styling */
        box-sizing: border-box;
        overflow-wrap: break-word; /* Standard approach */
    }
    textarea {
        resize: none;
    }

    .message-info {
        text-align: center;
    }
</style>
