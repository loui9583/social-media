<script>
	import toastr from 'toastr';
	import 'toastr/build/toastr.css';
	import { api } from '../../stores';
	const API = $api;

	let username = '';

	async function forgotpassword() {
		try {
			const response = await fetch(`${API}/users/forgotpassword`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username })
			});

			if (response.ok) {
				toastr.info('Email sent');
			} else {
				throw new Error('Failed to send email');
			}
		} catch (error) {
			console.error('Error changing password:', error.message);
			toastr.error('Failed to change password. Please try again later.');
		}
	}
</script>

<h3>Please enter your username, and we will send you a link to reset your password:</h3>
<input type="text" bind:value={username} />
<br /><br />
<button class="forgot-password-submit-btn" on:click={forgotpassword}>Confirm</button>

<style>
	.forgot-password-submit-btn {
		color: white;
		background: green;
	}
</style>
