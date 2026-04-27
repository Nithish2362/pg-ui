export function getpayLoadFromToken() {
    // Split the JWT into its components
    const jwtToken = localStorage.getItem('token')
    if(!jwtToken) return {}
    const base64Url = jwtToken.split('.')[1];
    
    // Decode the Base64Url encoded payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    // Parse the JSON payload into an object
    const payload = JSON.parse(jsonPayload);
  
    // Return the issuer claim
    return payload;
  }