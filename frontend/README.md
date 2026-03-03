# SmartShop Lite Frontend

This is the new React Frontend for SmartShop Lite.

## Setup Instructions

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Go to `http://localhost:5173`

## Features

-   **Dashboard:** Overview of sales, products, and revenue charts.
-   **POS System:** Fast billing with product search and cart management.
-   **Inventory Management:** Add, edit, delete products with low stock alerts.
-   **Sales History:** View past transactions and download invoices (mock).
-   **Reports:** Monthly sales summaries.

## Tech Stack

-   React (Vite)
-   Tailwind CSS
-   Axios
-   React Router DOM
-   Recharts
-   React Hot Toast
-   Lucide React Icons

## Notes

-   Ensure the backend server is running on `http://localhost:5000`.
-   If you encounter API errors, check the console and ensure CORS is enabled on the backend if running on a different port (Vite proxy config handles standard localhost:5000).