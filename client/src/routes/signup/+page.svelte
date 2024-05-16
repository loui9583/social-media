<script>
	import { api } from '../../stores';
	const API = $api;

	let username = '';
	let password = '';
	let email = '';

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			const response = await fetch(`${API}/users/signup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password, email })
			});

			if (response.ok) {
				console.log('User created');
				window.location.href = '/';
			} else {
				console.error('Error creating user');
			}
		} catch (error) {
			console.error('Error during signup:', error);
		}
	}
</script>

<h3>Sign Up</h3>
<form on:submit={handleSubmit}>
	<input bind:value={username} type="text" name="username" placeholder="Username" />
	<br />
	<input bind:value={password} type="password" name="password" placeholder="Password" />
	<br />
	<input bind:value={email} type="email" name="email" placeholder="Email" />
	<br /><br />
	<button class="sign-up-submit-btn" type="submit"> Sign Up </button>
</form>

<style>
	.sign-up-submit-btn {
		background: green;
		color: white;
	}
</style>
