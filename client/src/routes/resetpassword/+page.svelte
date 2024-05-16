<script>
    import toastr from "toastr";
    import "toastr/build/toastr.css";
    import { api } from "../../stores";
    const API = $api;

    let password = "";

    async function changepassword() {
        try {
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            let token = params.get("token");

            if (!token) {
                throw new Error("Token not found in URL");
            }

            await fetch(`${API}/users/changepassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password })
            });

            toastr.info("Password changed");
        } catch (error) {
            console.error("Error changing password:", error.message);
            toastr.error("Failed to change password. Please try again later.");
        }
    }
</script>

<input type="password" bind:value={password} />
<button on:click={changepassword}>Change Password</button>

<head>
    <link href="toastr.css" rel="stylesheet" />
</head>