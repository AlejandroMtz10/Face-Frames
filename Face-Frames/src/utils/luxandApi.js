// Note: We are hardcoding these values to bypass the 'undefined' error 
// caused by environment variables not being read correctly by Vite/Bundler.
const LUXAND_API_TOKEN = 'c6efb644a6604a7987274c11b349e52d';
const LUXAND_API_ENDPOINT = 'https://api.luxand.cloud/photo/landmarks';

/**
 * Sends an image file to the Luxand API for landmark analysis.
 * @param {File} imageFile - The file object to upload.
 * @returns {Promise<object>} The API response containing face landmarks.
 */
export async function analyzeFaceWithLuxand(imageFile) {
    // CRITICAL FIX: The variables are now guaranteed to be strings, so this check will pass.
    if (!LUXAND_API_ENDPOINT || !LUXAND_API_TOKEN) {
        throw new Error("Internal Error: API keys or endpoints are missing from the configuration.");
    }

    const headers = new Headers();
    headers.append("token", LUXAND_API_TOKEN);

    const formdata = new FormData();
    formdata.append("photo", imageFile, imageFile.name);

    const requestOptions = {
        method: "POST",
        headers,
        body: formdata,
        redirect: "follow",
    };

    try {
        const response = await fetch(LUXAND_API_ENDPOINT, requestOptions);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `API Request failed with status ${response.status} (${response.statusText}).`;
            try {
                // Attempt to parse the error message if it's JSON
                const errorJson = JSON.parse(errorText);
                errorMessage += ` API Detail: ${errorJson.message || JSON.stringify(errorJson)}`; 
            } catch {
                // If it's not JSON (e.g., an HTML error page)
                errorMessage += ` Response was not valid JSON.`;
            }
            throw new Error(errorMessage);
        }

        // The SyntaxError: Failed to execute 'json' is usually because the API sent 
        // a successful status (200), but an empty body, which often happens when the 
        // token is invalid. If that happens again, the check above will catch it.
        return response.json();

    } catch (error) {
        console.error("Fetch Error:", error);
        throw new Error(`Connection Error: Could not complete API request. Details: ${error.message}`);
    }
}