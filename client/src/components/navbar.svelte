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
		background-color: #2c3e50; /* Updated background color */
		color: #ecf0f1; /* Updated text color */
		border-radius: 5px;
	
		margin-bottom: 1em;
		font-family: Arial, sans-serif; /* Updated font */
		position: fixed; top: 0;
		width: calc(100vw - 45px); 
		z-index: 2;
	}

	.flex-container {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center; /* Center vertically */
	}

	.username-display {
		background-color: #34495e; /* Updated background color */
		padding: 8px 12px; /* Adjusted padding */
		border-radius: 5px;
		margin-right: 10px; /* Added margin for spacing */
	}

	.user-input {
		padding: 8px;
		border: 1px solid #ccc; /* Updated border color */
		border-radius: 5px;
		margin-right: 10px; /* Added margin for spacing */
	}

	.change-user-button {
		padding: 8px 16px;
		background-color: #3498db; /* Updated background color */
		color: #fff; /* Updated text color */
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.change-user-button:hover {
		background-color: #2980b9; /* Darker shade on hover */
	}

	button {
		padding: 8px 16px;
		background-color: #e74c3c; /* Updated background color */
		color: #fff; /* Updated text color */
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #c0392b; /* Darker shade on hover */
	}
</style>
