<script>
    import toastr from "toastr";
    import "toastr/build/toastr.css";
    import { api } from "../../stores";
    const API = $api;
  
    
    let username = "";
  
    async function forgotpassword() {
      try {
        // Get API link from the store
  
        const response = await fetch(`${API}/users/forgotpassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });
  
        if (response.ok) {
          // Check for successful response before toastr
          toastr.info("Email sent");
        } else {
          throw new Error("Failed to send email"); // Handle non-2xx responses
        }
      } catch (error) {
        console.error("Error changing password:", error.message);
        toastr.error("Failed to change password. Please try again later.");
      }
    }
  </script>
  
  <head>
    <link href="toastr.css" rel="stylesheet" />
  </head>
  
  <h3>
    Please enter your username, and we will send you a link to reset your
    password:
  </h3>
  <input type="text" bind:value={username} />
  <br /><br />
  <button style="color: white; background: green" on:click={forgotpassword}
    >Confirm</button
  >