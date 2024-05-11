<script>
	import { onMount } from 'svelte';
	import io from 'socket.io-client';
	import { api, username, token, friends, chatVisible, userToConnectTo } from '../../stores';
	import { goto } from '$app/navigation';
	import Navbar from '../../components/navbar.svelte';
	const API = $api;

	let socket;
	let message = '';
	let messages = [];
	
	let currentUser = $username;

	let intervalId = setInterval(getFriends, 10000);

	async function getFriends() {
			const response = await fetch(`${API}/user`, {
				headers: {
					Authorization: `Bearer ${$token}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			friends.set(data.friends); // Correct way to set the store value
	}

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

	function closeChat() {
        $chatVisible = false; // Use $ to interact with store
    }

    function changeFriend(friend) {
        $userToConnectTo = friend; // Use $ to interact with store
        changeUserToConnectTo();
        $chatVisible = true; // Open the chat box when a new friend is selected
    }


	const changeUserToConnectTo = () => {
		const room = [$username, $userToConnectTo].sort().join('-');
		socket.emit('leave room', room); // Leave current room
		socket.emit('join room', room); // Join new room
		messages = []; // Clear messages
	};

	onMount(() => {
		if ($token) {
			socket = io(API, {
				auth: {
					token: $token
				},
				transports: ['websocket', 'polling'],
				rejectUnauthorized: false // For development only, remember to handle properly in production
			});

			socket.on('connect_error', (error) => {
				console.error('Connection error:', error);
				// Optionally, update UI to show an error message
			});

			const room = [$username, $userToConnectTo].sort().join('-');
			socket.emit('join room', room);

			socket.on('chat message', ({ message, username: senderUsername }) => {
				messages = [...messages, { message, username: senderUsername }];
				console.log(messages);
			});
		}
		getFriends();
	});
</script>

<Navbar></Navbar>

<div class="chatContainerContainer">
	{#if $chatVisible}
		<div class="chatbox-container">
			<div
				style="display: flex; justify-content: space-between; background: lightgrey; align-items: center;"
			>
				<p style="margin-left: 15px;"><strong>{$userToConnectTo}</strong></p>
				<button style="height: 25px; margin-right: 15px;" on:click={closeChat}>Close Chat</button>
			</div>
			<div class="message-container">
				<div class="message-list">
					{#each messages as { message, username }}
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
				<button class="send-button" on:click={sendMessage}>Send</button>
			</div>
		</div>
	{/if}

	<div
		style="margin-left: 1vw; background: #DCDBDD; height: calc(100vh - 100px); overflow-y: scroll"
		id="friends"
	>
		<h4>Contacts</h4>
		<ul>
			{#each $friends as friend}
				<li>
					<button
						on:click={() => {
							changeFriend(friend);
						}}
					>
						<div class="initial-circle">{friend.charAt(0)}</div>
						{friend}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	textarea {
		resize: none;
	}
	.chatContainerContainer {
		width: 100%;
		display: flex;
		justify-content: end;
		align-items: end;
	}



	.message-container {
		width: 70vw;
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
		max-width: 70vw;
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

	/* Style for friend list */
	#friends h4 {
		margin-top: 20px;
		color: #333;
	}

	#friends ul {
		list-style: none;
		padding: 0;
	}

	.initial-circle {
		width: 30px;
		height: 30px;
		background-color: #007bff; /* Facebook-ish blue */
		border-radius: 50%; /* Makes the div circular */
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 10px;
		font-size: 16px;
		font-weight: bold;
	}

	#friends li button {
		display: flex;
		align-items: center;
		text-align: left;
		width: 15vw;
	}

	.message-info {
		text-align: center;
	}
</style>
