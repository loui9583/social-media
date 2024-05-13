<script>
	import { onMount } from 'svelte';
	import io from 'socket.io-client';
	import { api, username, token, friends, chatVisible, userToConnectTo, messages } from '../../stores';
	import Navbar from '../../components/Navbar.svelte';
	import Messages from '../../components/Messages.svelte';
	import Friends from '../../components/Friends.svelte';
	import Feed from '../../components/Feed.svelte';
	import LeftSidebar from '../../components/LeftSidebar.svelte';
	
	
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
<div style="height: 50px;"></div>

<div class="chatContainerContainer">
	<p> &nbsp;</p>
	<Feed></Feed>
	{#if $chatVisible}
		<Messages closeChat={closeChat} socket={socket}></Messages>
	{/if}

	<Friends socket={socket}></Friends>
</div>

<style>
	.chatContainerContainer {
		
		display: flex;
		justify-content: space-between;
		background-color: #F0F2F5;  /* Facebook-like background color */
	}	
</style>

