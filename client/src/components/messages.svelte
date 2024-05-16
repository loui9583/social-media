<script>
	import { userToConnectTo, messages, username, api, token } from '../stores';
	export let closeChat;
	export let socket;
	let currentUser = $username;
	let message = '';

	function formatDate() {
		const date = new Date();
		const day = date.getDate();
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
		const month = monthNames[date.getMonth()];
		const hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');

		return `${day}. ${month} • ${hours}:${minutes}`;
	}

	async function saveMessage(room, message) {
		try {
			const response = await fetch(`${$api}/chatroom/${room}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$token}`
				},
				body: JSON.stringify({ message: message })
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message);
			}
			console.log('Message saved to database');
		} catch (error) {
			console.error('Failed to save message:', error);
		}
	}

	const sendMessage = async () => {
		const room = [$username, $userToConnectTo].sort().join('-');
		if (message.trim() !== '') {
			socket.emit('chat message', { room: room, message: message.trim() });
			await saveMessage(room, message);
			message = '';
		}
		console.log($messages);
	};
</script>

<div class="chatbox-container-container">
	<div class="chatbox-container">
		<div class="chatbox-top">
			<p class="userToConnectTo"><strong>{$userToConnectTo}</strong></p>
			<button class="closeChatButton" on:click={closeChat}>×</button>
		</div>
		<div class="message-container">
			<div class="message-list">
				{#each $messages as { username, message }}
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
	.closeChatButton {
		height: 25px;
		margin-right: 15px;
	}
	.closeChatButton {
		height: 25px;
		margin-right: 15px;
	}
	.userToConnectTo {
		margin-left: 15px;
	}
	.chatbox-top {
		display: flex;
		justify-content: space-between;
		background: lightgrey;
		align-items: center;
	}
	.chatbox-container-container {
		position: fixed;
		bottom: 0;
		right: 0;
		z-index: 1;
	}

	.message-container {
		width: 338px;
		background: #f9f9f9;
		border: 1px solid #ccc;
		border-radius: 5px;
		overflow: hidden;
		padding: 0 10px;
	}

	.message-list {
		height: 400px;
		overflow-y: auto;
		padding: 10px;
		width: 100%;
	}

	.message-input-container {
		border: 1px solid #b3b3b36e;
		max-width: 338px;
		display: flex;
		padding: 15px;
		background-color: #ddd;
	}

	.message-input {
		flex-grow: 1;
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
		margin-left: auto;
		margin-right: 15px;
		max-width: calc(70%);
		box-sizing: border-box;
		overflow-wrap: break-word;
	}

	.other-user .message-body {
		background-color: darkblue;
		color: white;
		padding: 5px;
		border-radius: 8px;

		margin-right: auto;
		max-width: calc(70%);
		box-sizing: border-box;
		overflow-wrap: break-word;
	}
	textarea {
		resize: none;
	}

	.message-info {
		text-align: center;
	}
</style>
