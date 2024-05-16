<script>
	import { api } from '../../stores';
    import toastr from 'toastr';
	import 'toastr/build/toastr.css';
    import { goto } from '$app/navigation';
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
				toastr.info('User created. You can sign in now');
				goto('/')
			} else {
				
				const data = await response.json(); 
				toastr.error('Error creating user:', data.message); 
			}
		} catch (error) {
			console.error('Error during signup:', error);
		}
	}
</script>

<head>
	<link href="toastr.css" rel="stylesheet" />
</head>

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
