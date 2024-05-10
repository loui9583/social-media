<script>
    import { api } from "../../stores";
    const API = $api;

    let username = "";
    let password = "";
    let email = "";

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            // Get API link from the store
            
            const response = await fetch(`${API}/users/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password, email }),
            });

            if (response.ok) {
                console.log("User created");
                window.location.href="/";
            } else {
                console.error("Error creating user");
            }
        } catch (error) {
            console.error("Error during signup:", error);
        }
    }
</script>

<h3>Sign Up</h3>
<form on:submit={handleSubmit}>
    <input
        bind:value={username}
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
    <br />
    <input bind:value={email} type="email" name="email" placeholder="Email" />
    <br /><br />
    <button style="background: green; color: white" type="submit">
        Sign Up
    </button>
</form>