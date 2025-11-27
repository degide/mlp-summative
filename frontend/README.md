# Animal Classification Frontend

A React application built with Vite that provides a user interface for the Animal Classification system.

## Screenshot

![dashboard.png](../screenshots/dashboard.png)

## Tech Stack

- **Framework**: React ^18

- **Build Tool**: Vite

- **Styling**: Tailwind CSS

- **Icons**: Lucide React

- **Charts**: Recharts

## Project Structure

- `src/App.jsx`: The main application component.

- `src/components/`: Reusable UI components like Cards and Status Badges.

- `src/views/`: View components.

- `src/main.js`: The application entrypoint

- `vite.config.js`: Configuration for the Vite build server.

## Development

**Installation**

Navigate to the `frontend` folder and install dependencies:

```sh
npm install
```

**Add `env` variables**

```sh
cp .env.example .env
```

Edit the env variables as needed

**Running the Dev Server**

```sh
npm run dev
```

The application will usually run on `http://localhost:5173`.

## Live demo (deployment)

URL: https://mlp-summative-dt9p.onrender.com

##  Features

1. Visualizes the distribution of uploaded images using a bar chart.

2. Displays current model accuracy.

3. Allows drag-and-drop images upload.

4. Sends images to `backend` for prediction and displays the result.

5. **Upload**: Sends batches of images to the `backend` to be saved in class-specific folders.

6. **Trigger**: Initiates the `celery` retrain task and monitors the job ID.

## License

MIT

## Contributors

- Egide HARERIMANA <h.egide@alustudent.com>