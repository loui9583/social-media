<script>
	import { onMount } from 'svelte';
	import io from 'socket.io-client';
	import { api, username, token, friends, chatVisible, userToConnectTo, messages } from '../../stores';
	import Navbar from '../../components/navbar.svelte';
	import Messages from '../../components/messages.svelte';
	import Friends from '../../components/friends.svelte';
	
	let socket;
	
	function closeChat() {
        $chatVisible = false; // Use $ to interact with store
    }

	function initSocket(){
		if ($token) {
			socket = io($api, {
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
				$messages = [...$messages, { message, username: senderUsername }];
				console.log($messages);
			});
		}
	}

	onMount(() => {
		initSocket();
	});
</script>

<Navbar></Navbar>

<div class="chatContainerContainer">
	{#if $chatVisible}
		<Messages closeChat={closeChat} socket={socket}></Messages>
	{/if}

	<Friends socket={socket}></Friends>
</div>

<style>
	.chatContainerContainer {
		width: 100%;
		display: flex;
		justify-content: end;
		align-items: end;
	}

	
</style>
