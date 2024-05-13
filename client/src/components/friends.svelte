<script>
	export let socket;
	import { friends, username, userToConnectTo, messages, chatVisible, token, api } from '../stores';

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
		friends.set(data.friends); // Correct way to set the store value
	}
    
	getFriends()

	const changeUserToConnectTo = () => {
		const room = [$username, $userToConnectTo].sort().join('-');
		socket.emit('leave room', room); // Leave current room
		socket.emit('join room', room); // Join new room
		$messages = []; // Clear messages
	};

	function changeFriend(friend) {
		$userToConnectTo = friend; // Use $ to interact with store
		changeUserToConnectTo();
		$chatVisible = true; // Open the chat box when a new friend is selected
	}
</script>

<div class="friends-container">
	<h4>Contacts</h4>
	<ul class="friend-list">
		{#each $friends as friend}
			<li>
				<button on:click={() => { changeFriend(friend); }}>
					<div class="initial-circle">{friend.charAt(0)}</div>
					<span class="friend-name">{friend}</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.friends-container {
		margin-top: 20px;
		margin-left: 1vw;
		background: #DCDBDD;
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
</style>
