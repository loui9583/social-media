<script>
	import Post from './Post.svelte';
	import { username, api, token } from '../stores';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import toastr from 'toastr';
	import 'toastr/build/toastr.css';

	toastr.options.allowHtml = true;

	let posts = [];
	let page = 1;
	let newPost = '';
	let newUsername = '';
	let getNewestPostInterval;
	let lastToastrNotification = '';

	function handleScroll() {
		if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
			getPosts();
		}
	}

	async function addPost() {
		try {
			const response = await fetch(`${$api}/posts`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${$token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ content: newPost })
			});

			if (response.ok) {
				getNewestPost();
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message);
			}
		} catch (error) {
			console.error('Error:', error.message);
		}
	}

	async function getNewestPost() {
		const response = await fetch(`${$api}/posts?page=1&limit=1`, {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await response.json();
		let newPost;
		if (Array.isArray(data)) {
			newPost = data[0];
		}

		if (newPost && newPost._id !== posts[0]._id) {
			if (scrollY === 0) {
				posts.unshift(newPost);
				posts = posts;
			} else {
				let message = `<a href="#" onclick="window.scrollTo(0,0); return false;">${newPost.username} just made a new post.</a>`;

				if (message !== lastToastrNotification) {
					toastr.info(message);
				}

				lastToastrNotification = message;
			}
		}
	}

	async function getPosts() {
		const response = await fetch(`${$api}/posts?page=${page}&limit=3`, {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await response.json();
		if (Array.isArray(data)) {
			posts = [...posts, ...data];
		} else {
			console.error('Data is not an array:', data);
		}
		page++;
		if (data.length === 0) {
			page = 1;
			getPosts();
		}
	}

	onMount(async () => {
		await getPosts();

		getNewestPostInterval = setInterval(getNewestPost, 2000);

		window.addEventListener('scroll', handleScroll);
	});

	onDestroy(() => {
		clearInterval(getNewestPostInterval);
		window.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="container">
	<div id="input-area" class="input-area">
		<textarea type="text" bind:value={newPost} placeholder="What's on your mind?" />
		<button on:click={addPost}>Post</button>
	</div>

	<div class="posts-container">
		<div class="posts">
			{#each posts as post}
				<Post {post} />
			{/each}
		</div>
	</div>
</div>

<style>
	.posts {
		display: flex;
		flex-direction: column;
	}
	.container {
		margin-right: 20px;
		display: flex;
		flex-direction: column;
		flex: 1;

		padding: 20px;
		background: #f7f7f7;
	}

	.input-area {
		padding: 20px;
		width: calc(100vw - 277px);
		display: flex;
	}

	textarea[type='text'] {
		flex-grow: 1;
		padding: 10px;
		border: 2px solid #ccc;
		border-radius: 5px;
	}

	button {
		padding: 10px 20px;
		border: none;
		background-color: #0084ff;
		color: white;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
	}

	.posts-container {
		overflow-y: auto;
		flex: 1;

		display: flex;
	}
</style>
