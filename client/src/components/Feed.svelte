<script>
	import Post from './Post.svelte';
	import { username, api, token } from '../stores';
    import { onMount } from "svelte";

	let posts = [];
    let page = 1;

	async function getPosts() {
		const response = await fetch(`${$api}/posts?page=${page}&limit=20`, {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await response.json();
		posts = data;
		posts = posts;
		page = +1;
	}

	onMount(async () => {
        await getPosts();
    });

	let newPost = '';
	let newUsername = '';
</script>

<div class="container" style="margin-right: 20px">
	<div class="input-area">
		<textarea type="text" bind:value={newPost} placeholder="What's on your mind?" />
		<button>Post</button>
	</div>

	<div class="posts-container">
		<div style="display: flex; flex-direction: column">
			{#each posts as post}
				<Post {post} />
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
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
