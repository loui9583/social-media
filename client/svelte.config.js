import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        // Use the Vercel adapter for Vercel deployment
        adapter: adapter(),
        // Add any other configurations here as needed
    }
};

export default config;
