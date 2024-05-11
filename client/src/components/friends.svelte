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

<style>
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
</style>
