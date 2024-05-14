<script>
	import { onMount } from "svelte";

    import { username, api, token } from '../stores';
    
    export let post;
    let likes = 0;
    let newComment = '';
    let comments = [
      // your comments data
    ];
    let page = 1;

    onMount( async () => {

    })
  

    function toggleLike() {
      likes += 1;
    }
</script>

<style>
    .post {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin: 20px;
        padding: 20px;
        width: calc(100vw - 320px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
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

    .like-button, .submit-button {
        border: none;
        background-color: #e7f3ff;
        color: #4267B2;
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

<div>
<div  style="background: #EAEAEA; border: 2px solid lightgrey" class="post">
    <div class="post-header">
        <div class="username">{post.username}<p style="font-size: 0.9em; font-weight: lighter; display: inline">&nbsp;posted</p></div>
        <button class="like-button" on:click={toggleLike}>
            Like | {likes}
        </button>
    </div>
    
    <div style="padding: 5px; background: #E3E3E3; border-radius: 10px">
    <p class="post-text">{post.content}</p>
</div>
<hr>
    <div class="comment-section">
        <p>&nbsp;<strong>Comments</strong></p>
        {#each post.comments as comment}
            <div class="comment">{comment.username}: {comment.content}</div>
            <hr>
        {/each}
    </div>
    <div class="add-comment">
        <input class="comment-input" type="text" placeholder="Add a comment..." />
        <button class="submit-button">Add comment</button>
    </div>
</div>
</div>