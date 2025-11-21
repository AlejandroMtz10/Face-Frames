const LUXAND_API_ENDPOINT = import.meta.env.VITE_LUXAND_ENDPOINT;
const LUXAND_API_TOKEN = import.meta.env.VITE_LUXAND_TOKEN;

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