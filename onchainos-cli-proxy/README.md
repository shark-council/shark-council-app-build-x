# OnchainOS CLI Proxy Server

This is a lightweight Express server built with TypeScript to securely expose the `onchainos` CLI on a remote Linux machine so it can be called by Vercel serverless functions via HTTP requests.

## Setup Instructions

### 1. Install Dependencies and Build

```bash
cd onchainos-cli-proxy
npm install
npm run build
```

### 2. Environment Variables

Create a `.env` file or export these variables in your environment/systemd service:

- `API_KEY`: **(Required)** A strong, randomly generated string to authenticate requests.
- `PORT`: (Optional) The port to run on (default: `3000`).
- `CLI_PATH`: (Optional) The absolute path to the `onchainos` executable if it differs from the default `~/.local/bin/onchainos`.

### 3. Run the Server

For production, it is recommended to run the proxy using a process manager like PM2:

```bash
npm install -g pm2
API_KEY="your-super-secret-api-key" pm2 start dist/index.js --name "onchainos-proxy"
pm2 save
```

### 4. Securing with Tailscale

To prevent this server from being exposed to the public internet, use Tailscale.

1. Install Tailscale on your Linux server and log in.
2. In your Tailscale admin console, you can use **Tailscale Funnel** to expose this specific port to your Vercel app over HTTPS, or configure your Vercel deployment to connect to your Tailnet via a subnet router or auth key (if using a Vercel integration that supports WireGuard).
3. If using Tailscale Funnel, run:
   ```bash
   tailscale funnel 3000
   ```
   This will give you a public `https://your-machine.tailscale.net` URL that routes traffic to your proxy, secured by HTTPS, but you **still must use the API_KEY** because Funnel makes it accessible to the internet.

## Vercel Configuration

In your Vercel project settings, add the following Environment Variables:

- `ONCHAINOS_PROXY_URL`: The URL where this proxy is hosted (e.g., `https://your-linux-server-ip:3000` or the Tailscale Funnel URL). _Do not include a trailing slash._
- `ONCHAINOS_PROXY_API_KEY`: The exact string you set as `API_KEY` on the Linux server.
