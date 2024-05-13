<script>
	import Post from './Post.svelte';
    let posts = [
    {
        id: 1,
        content: 'Hello world!',
        username: 'Alice',
        comments: [
            {
                id: 1,
                content: 'HEY!',
                username: 'Johnson'
            },
            {
                id: 2,
                content: 'Svelte is awesome!',
                username: 'Bob'
            },
            {
                id: 3,
                content: "How's everyone doing?",
                username: 'Charlie'
            },
            {
                id: 4,
                content: "Here's a cool project I'm working on.",
                username: 'Dana'
            },
            {
                id: 5,
                content: 'Another post, just to fill the feed.',
                username: 'Eli'
            }
        ]
    },
    {
        id: 2,
        content: 'Exploring the world of coding!',
        username: 'Fiona',
        comments: [
            {
                id: 6,
                content: 'This is so inspiring!',
                username: 'Greg'
            },
            {
                id: 7,
                content: 'Can you share more details?',
                username: 'Hannah'
            }
        ]
    },
    {
        id: 3,
        content: 'JavaScript tips and tricks.',
        username: 'Ivan',
        comments: [
            {
                id: 8,
                content: 'Super helpful, thanks!',
                username: 'Jackie'
            },
            {
                id: 9,
                content: 'I tried this, and it worked perfectly!',
                username: 'Karl'
            }
        ]
    },
    {
        id: 4,
        content: 'What do you think about the latest tech trends?',
        username: 'Liam',
        comments: [
            {
                id: 10,
                content: 'Very intriguing!',
                username: 'Mona'
            },
            {
                id: 11,
                content: 'I think VR will dominate soon.',
                username: 'Nate'
            }
        ]
    }
];

	let newPost = '';
	let newUsername = '';
</script>

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

	textarea[type="text"] {
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
