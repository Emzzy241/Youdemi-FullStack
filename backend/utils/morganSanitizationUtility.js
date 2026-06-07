import morgan from "morgan"

//  a sanitization utility inside a custom Morgan token.
const setupMorganSanitization = () => {
  morgan.token('safe-url', (req) => {
    // 1. Strip query strings completely
    const urlWithoutQueries = req.url.split('?')[0];
    
    // 2. Safely replace 24-character hex MongoDB IDs with ':id'
    return urlWithoutQueries.replace(/[0-9a-fA-F]{24}/g, ':id');
  });

};

export default setupMorganSanitization