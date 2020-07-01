/**
 * API Request handler
 * @param url - api endpoint
 * @param method - http method
 * @param bodyParams - body parameters of request
 */
const cors = "https://cors-anywhere.herokuapp.com/";
export const apiRequest = async (
    url: string,
    method: string,
    bodyParams?: { email: string; password: string }
): Promise<any> => {    
    const response = await fetch(`${cors}${url}`, {
        method,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }, 
        body: bodyParams ? JSON.stringify(bodyParams) : undefined
    });
    return await response.json();
};

