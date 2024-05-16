<script>
	import { onDestroy, onMount } from 'svelte';
	import { username, api, token } from '../stores';

	export let post;
	let likes = 0;
	let newComment = '';
	let comments = post.comments || [];
	let intervalId;
	async function addComment() {
		try {
			const response = await fetch(`${$api}/posts/${post._id}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$token}`
				},
				body: JSON.stringify({ content: newComment })
			});
			if (response.ok) {
				newComment = '';
				updatePost();
			}
		} catch (error) {
			console.error('Failed to add comment:', error);
		}
	}

	async function updatePost() {
		try {
			const response = await fetch(`${$api}/post/${post._id}`);
			const data = await response.json();
			post = data;
			comments = [...data.comments];
		} catch (error) {
			console.error('Failed to update post:', error);
		}
	}

	onMount(() => {
		intervalId = setInterval(updatePost, 5000);
	});

	onDestroy(() => {
		clearInterval(intervalId);
	});
</script>

<div>
	<div class="post">
		<div class="post-header">
			<div class="username">
				{post.username}
				<p class="posted">&nbsp;posted</p>
			</div>
		</div>

		<div class="post-text-container">
			<p class="post-text">{post.content}</p>
		</div>
		<hr />
		<div class="comment-section">
			<p>&nbsp;<strong>Comments</strong></p>
			{#each post.comments as comment}
				<div class="comment">{comment.username}: {comment.content}</div>
				<hr />
			{/each}
		</div>
		<div class="add-comment">
			<input
				class="comment-input"
				bind:value={newComment}
				type="text"
				placeholder="Add a comment..."
			/>
			<button on:click={addComment} class="submit-button">Add comment</button>
		</div>
	</div>
</div>

<style>
	.posted {
		font-size: 0.9em;
		font-weight: lighter;
		display: inline;
	}

	.post-text-container {
		padding: 5px;
		background: #e3e3e3;
		border-radius: 10px;
	}

	.post {
		background: #eaeaea;
		border: 2px solid lightgrey;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		margin: 20px;
		padding: 20px;
		width: calc(100vw - 320px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 15px;
	}

	.username {
		font-weight: bold;
		font-size: 1.1em;
	}

	.submit-button {
		border: none;
		background-color: #e7f3ff;
		color: #4267b2;
		padding: 8px 15px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
	}

	.comment-section {
		margin-top: 10px;
	}

	.comment {
		margin-top: 5px;
		padding: 5px;

		border-radius: 5px;
	}

	.add-comment {
		display: flex;
		margin-top: 15px;
		align-items: center;
	}

	.comment-input {
		flex: 1;
		padding: 8px;
		border: 2px solid #ccc;
		border-radius: 5px;
		margin-right: 10px;
	}

	.submit-button {
		flex-shrink: 0;
	}
	.post-text {
		font-size: 1.2em;
		font-weight: 300;
	}
</style>
