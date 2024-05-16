<script>
	import { onMount, onDestroy } from 'svelte';
	import io from 'socket.io-client';
	import {
		api,
		username,
		token,
		friends,
		chatVisible,
		userToConnectTo,
		messages
	} from '../../stores';
	import Navbar from '../../components/Navbar.svelte';
	import Messages from '../../components/Messages.svelte';
	import Friends from '../../components/Friends.svelte';
	import Feed from '../../components/Feed.svelte';
	import { goto } from '$app/navigation';

	let socket;

	function closeChat() {
		$chatVisible = false;
	}

	function initSocket() {
		if ($token) {
			socket = io($api, {
				auth: {
					token: $token
				},
				transports: ['websocket', 'polling'],
				rejectUnauthorized: false
			});

			socket.on('connect_error', (error) => {
				console.error('Connection error:', error);
			});

			const room = [$username, $userToConnectTo].sort().join('-');
			socket.emit('join room', room);

			socket.on('chat message', ({ message, username: senderUsername }) => {
				$messages = [...$messages, { message, username: senderUsername }];
				console.log($messages);
			});
		}
	}

	function closeSocket() {
		if (socket) {
			socket.close();
		}
	}

	onMount(() => {
		if (!$token) {
			goto('/');
		}
		initSocket();
	});

	onDestroy(() => {
		closeSocket();
	});
</script>

{#if $token}
	<Navbar {socket}></Navbar>
	<div id="nav-spacer"></div>

	<div class="chatContainerContainer">
		<p>&nbsp;</p>
		<Feed></Feed>
		{#if $chatVisible}
			<Messages {closeChat} {socket}></Messages>
		{/if}

		<Friends {socket}></Friends>
	</div>
{/if}

<style>
	#nav-spacer {
		height: 50px;
	}
	.chatContainerContainer {
		display: flex;
		justify-content: space-between;
		background-color: #f0f2f5;
	}
</style>
