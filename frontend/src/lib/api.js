import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isOfflineToastShown = false;

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || "An unexpected error occurred";

        // Log the full error for debugging
        console.error('API Error:', error);

        // Network error specific handling
        if (error.code === "ERR_NETWORK") {
            if (!isOfflineToastShown) {
                isOfflineToastShown = true;
                toast.error("Server Offline: Unable to connect to the backend.");
                // Reset flag after 3 seconds to allow showing the message again if needed later
                setTimeout(() => {
                    isOfflineToastShown = false;
                }, 3000);
            }
        } else if (error.response?.status === 401) {
            // Handle unauthorized access potentially here
            toast.error("Unauthorized: Please log in again.");
        } else if (error.response?.status >= 500) {
            toast.error(`Server Error: ${message}`);
        } else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
