import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        host: true, // Automatically detect IP address for the server
        port: 3000, // Default port during development (change as needed)
    },
    preview: {
        port: 10000, // Ensure the preview uses the Render expected port
        host: true // Listen on all IPs; necessary for Render environment
    }
});
