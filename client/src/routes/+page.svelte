<script>
    import { onMount } from "svelte";
    import { api, username, token } from "../stores";
    import { goto } from '$app/navigation';
    const API = $api;

    onMount(() => {
 
    });

    let usernameInput = ""; 
    let password = "";

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(`${API}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: usernameInput, password }),
            });

            if (response.ok) {
                const data = await response.json();
             
                username.set(usernameInput);
                token.set(data.token);
             
                goto("/app");
            } else {
                console.error("Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }
</script>

<style>
    /* Styling for the login form */
    form {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9f9f9;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    input[type="text"],
    input[type="password"] {
        width: 100%;
        padding: 12px;
        margin: 8px 0;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button[type="submit"] {
        width: 100%;
        padding: 12px;
        margin: 8px 0;
        box-sizing: border-box;
        border: none;
        border-radius: 4px;
        background-color: #4caf50;
        color: white;
        font-size: 16px;
        cursor: pointer;
    }

    button[type="submit"]:hover {
        background-color: #45a049;
    }

    h3 {
        text-align: center;
    }

    h4 {
        text-align: center;
    }
</style>

<h4>Don't have a user?  <a href="/signup">Sign up here</a></h4>
<hr>

<h3>Login</h3>
<form on:submit={handleSubmit}>
    <input
        bind:value={usernameInput} 
        type="text"
        name="username"
        placeholder="Username"
    />
    <br />
    <input
        bind:value={password}
        type="password"
        name="password"
        placeholder="Password"
    />
    <br /><br />
    <button type="submit">Sign in</button>    
</form>
<h4><a href="forgotpassword">Forgot Password?</a></h4>
