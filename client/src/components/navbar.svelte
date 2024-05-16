<script>
	import toastr from 'toastr';
	import 'toastr/build/toastr.css';
	import { api, username, token, friends, user } from '../stores';
	import { goto } from '$app/navigation';
	export let socket;
	let addFriendInput = '';

	toastr.options = {
		closeButton: true
	};

	function signOut() {
		socket.disconnect();
		username.set('');
		token.set('');
		goto('/');
	}

	async function getFriends() {
		try {
			const response = await fetch(`${$api}/users`, {
				headers: {
					Authorization: `Bearer ${$token}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			friends.set(data.friends);
		} catch (error) {
			console.error('Failed to fetch friends:', error);
			toastr.error('Failed to fetch friends');
		}
	}

	async function addFriend(friendUsername) {
		const response = await fetch(`${$api}/users/exists/${friendUsername}`);
		let isUserExists = await response.json();

		isUserExists = isUserExists.exists;
		let isInFriendlist = false;

		for (let friend of $friends) {
			if (friendUsername === friend) {
				isInFriendlist = true;
			}
		}

		if (isInFriendlist) {
			toastr.error("Can't add friend, already in friendlist");
		}

		if (!isUserExists) {
			toastr.error("Can't add friend: user " + friendUsername + ' not found');
		}

		if (friendUsername === $username) {
			toastr.error("Can't add yourself as a friend");
		}

		if (isUserExists && !isInFriendlist && friendUsername !== $username) {
			try {
				const response = await fetch(`${$api}/users/addFriend`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${$token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ friendUsername: friendUsername })
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				toastr.success('Friend added successfully!');
				await getFriends();
			} catch (error) {
				console.error('Failed to add friend:', error);
				toastr.error('Failed to add friend');
			}
		} else {
			console.log('error adding friend');
		}
	}
</script>

<div class="container">
	<div class="flex-container">
		<div>
			<input class="user-input" type="text" bind:value={addFriendInput} />
			<button
				class="change-user-button"
				on:click={() => {
					addFriend(addFriendInput);
				}}>Add friend</button
			>
		</div>

		<div>
			<p class="username-display">
				{$username}
			</p>
			<button on:click={signOut}>Sign Out</button>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		background-color: #2c3e50;
		color: #ecf0f1;
		border-radius: 5px;

		margin-bottom: 1em;
		font-family: Arial, sans-serif;
		position: fixed;
		top: 0;
		width: calc(100vw - 45px);
		z-index: 2;
	}

	.flex-container {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
	}

	.username-display {
		display: inline;
		background-color: #34495e;
		padding: 8px 12px;
		border-radius: 5px;
		margin-right: 10px;
	}

	.user-input {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 5px;
		margin-right: 10px;
	}

	.change-user-button {
		padding: 8px 16px;
		background-color: #3498db;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.change-user-button:hover {
		background-color: #2980b9;
	}

	button {
		padding: 8px 16px;
		background-color: #e74c3c;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #c0392b;
	}
</style>
