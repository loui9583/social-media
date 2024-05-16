<script>
	import { onDestroy, onMount } from 'svelte';
	export let socket;
	import { friends, username, userToConnectTo, messages, chatVisible, token, api } from '../stores';
	import { get } from 'svelte/store';

	let friendsWithStatus = [];
	let intervalId;
	
	async function getRoomMessages(roomname) {
		const response = await fetch(`${$api}/chatroom/${roomname}`, {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		
		console.log(data)

		if (data.messages.length>0){
			$messages = [...$messages, ...data.messages]
		}

		console.log($messages)

		
	}

	async function getFriends() {
		const response = await fetch(`${$api}/user`, {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		let tempArr = [];

		for (let friend of data.friends) {
			let onlineStatus = await isUserOnline(friend); 
			let newFriend = { friend: friend, online: onlineStatus }; 
			tempArr.push(newFriend);
		}
		friendsWithStatus = tempArr;
		friends.set(data.friends); 	
	}

	async function isUserOnline(username) {
		const response = await fetch(`${$api}/users/isconnected/${username}`);
		const data = await response.json();

		return data;
	}

	onMount(async () => {
		await getFriends();
		intervalId = setInterval(getFriends, 5000);
		
	});

	onDestroy(() => {
		$chatVisible = false; 
		clearInterval(intervalId);
	})

	const changeUserToConnectTo = () => {
		const room = [$username, $userToConnectTo].sort().join('-');
		socket.emit('leave room', room);
		socket.emit('join room', room); 
		$messages = []; 
		getRoomMessages(room)
	};

	function changeFriend(friend) {
		$userToConnectTo = friend; 
		changeUserToConnectTo();
		$chatVisible = true; 
	}
</script>

<div class="friends-container">
	<h4>Contacts</h4>
	<ul class="friend-list">
		{#each friendsWithStatus as friend}
			<li>
				<button
					on:click={() => {
						changeFriend(friend.friend);
					}}
				>
					<div class="initial-circle">{friend.friend.charAt(0)}</div>
					<span class="friend-name">{friend.friend}</span>
					<div class="status-indicator {friend.online.isConnected ? 'online' : 'offline'}"></div>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.friends-container {
		margin-top: 20px;
		margin-left: 1vw;
		background: #dcdbdd;
		height: calc(100vh - 100px);
		overflow-y: auto;
		padding: 20px;
		border-radius: 10px;
		position: fixed;
		right: 0;
	}

	.friends-container h4 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #333;
	}

	.friend-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.friend-list li {
		margin-bottom: 10px;
	}

	.friend-list li button {
		display: flex;
		align-items: center;
		text-align: left;

		padding: 10px;
		background-color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s ease;
		width: 150px;
	}

	.friend-list li button:hover {
		background-color: #f0f0f0;
	}

	.initial-circle {
		width: 30px;
		height: 30px;
		background-color: #007bff;
		border-radius: 50%;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 10px;
		font-size: 16px;
		font-weight: bold;
	}

	.friend-name {
		flex-grow: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.status-indicator {
		height: 10px;
		width: 10px;
		border-radius: 50%;
		display: inline-block;
		margin-left: 10px;
	}

	.online {
		background-color: green;
	}

	.offline {
		background-color: red;
	}
</style>
