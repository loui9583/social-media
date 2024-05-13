<script>
    import { onMount } from "svelte";
    import {api, username, token} from "../stores"
    import { goto } from '$app/navigation';
    const API = $api;

    onMount(() => {
 
    });

    let usernameInput = ""; // Refactored variable name
    let password = "";

    async function handleSubmit(event) {
        event.preventDefault(); // Prevent default form submission

        try {
            const response = await fetch(`${API}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: usernameInput, password }), // Updated to match refactored username
            });

            if (response.ok) {
                const data = await response.json();
             
                username.set(usernameInput);
                token.set(data.token);
             
                // Redirect to the profile page
                goto("/app")
            } else {
                // Handle login error
                console.error("Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }
</script>
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
    <button style="background: green; color: white" type="submit"
        >Sign in</button
    >    
</form>
<h4><a href="forgotpasswordform">Forgot</a></h4>
