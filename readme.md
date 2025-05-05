# Order Form

This is a web-based order form for the local gardening club (Obst- und Gartenbauverein), built with React. It enables members to easily submit their orders online.

## Features

* ✨ Modern, responsive design
* 📢 Form validation using Zod and Superforms
* ✉️ Order submission via email
* 📄 Excel export (planned)
* 🚪 Admin login for customizing the form (planned)
* 🛡️ Cloudflare Turnstile integration for spam protection (integrated in form.svelte using the Turnstile widget and token validation via the server endpoint)

## Project Structure

* `src/routes` – SvelteKit routes including the order form pages
* `src/lib` – Reusable components and helper functions
* `static/` – Static assets (e.g. club logo)

## Development

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* [Visual Studio Code](https://code.visualstudio.com/) with [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

```bash
git clone https://github.com/cabrauck/ogv-bestellformular.git
cd ogv-bestellformular
code .
```

Then in VSCode: "Reopen in Container"

### Start Development Server

```bash
npm run dev -- --open
```

The app will be available at `http://localhost:5173`.

## Deployment

The project is optimized for deployment on [Cloudflare Pages](https://pages.cloudflare.com/).

### Build Command for Pages

```bash
npm run build
```

## Contributing

Pull requests are welcome. Please ensure clean code and use `prettier` for formatting:

```bash
npm run format
```