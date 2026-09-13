# AI Image Generator Web App

This project is a full-stack AI Image Generator. It features a modern, responsive React frontend (built with Vite) that connects to a powerful, cloud-hosted GPU backend (running Automatic1111's Stable Diffusion API on Google Colab).

## Project Structure

- `frontend/`: The React web application where users can enter prompts and view generated images.
- `colab_backend.ipynb`: The Jupyter Notebook script that runs the Stable Diffusion AI backend on a free Google Colab GPU.

---

## 🚀 Getting Started

To use this application, you need to start the AI Backend on Google Colab first, and then connect your local Frontend to it.

### Step 1: Start the Backend (Google Colab)

The backend runs on Google Colab to take advantage of their free GPUs for fast image generation.

1. Go to [Google Colab](https://colab.research.google.com/).
2. Click **File** > **Upload notebook** and upload the `colab_backend.ipynb` file from this repository.
3. In Colab, go to **Runtime** > **Change runtime type** and ensure the Hardware Accelerator is set to **T4 GPU**.
4. Click the **Play** button on the cell to start the server.
5. The installation will take a few minutes (it downloads the AI models and sets up the environment). 
6. Once it finishes, look at the bottom of the output logs for a public URL that looks like this:
   `Running on public URL: https://xxxx-xxxx.gradio.live`
7. **Copy this URL**. Keep the Colab tab open in your browser so the backend stays active.

### Step 2: Start the Frontend (Local)

Now, start the user interface on your computer.

1. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local address provided in the terminal (usually `http://localhost:5173`) in your web browser.

### Step 3: Connect Frontend to Backend

1. On the web app, look for the API URL input field.
2. Paste the `gradio.live` URL you copied from Google Colab in Step 1.
3. Type a prompt (e.g., "A futuristic city at sunset") and hit generate!

---

## Troubleshooting

- **Connection Error / Timeout**: The Colab session might have disconnected or the Gradio link might have expired (they last 72 hours). Go back to your Colab tab, restart the runtime, run the cell again, and get a new URL.
- **Out of Memory Error**: Ensure you have selected a GPU runtime in Colab.

## License
MIT License
