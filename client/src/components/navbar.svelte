<script>
	import { api, username, token, friends } from '../stores';
    import { goto } from '$app/navigation';
	let addFriendInput = '';

	function signOut() {
		username.set('');
		token.set('');
		goto('/');
	}

	async function getFriends() {
		try {
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
		} catch (error) {
			console.error('Failed to fetch friends:', error);
			// Optionally, update UI to show an error message
		}
	}

	async function addFriend(friendUsername) {
		//see if user exists in db

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
			alert("Can't add friend already in friendlist");
		}

		if (!isUserExists) {
			alert("Can't add friend: user " + friendUsername + ' not found');
		}

		if (isUserExists && !isInFriendlist) {
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

				await getFriends();
			} catch (error) {
				console.error('Failed to add friend:', error);
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
			<p class="username-display" style="display: inline;">
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
		background-color: #333;
		color: white;
		border-radius: 5px;
		margin-top: 1em;
		margin-bottom: 1em;
	}

	.flex-container {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

	.username-display {
		background-color: #555;
		padding: 5px;
		border-radius: 5px;
	}
</style>
