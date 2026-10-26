// Turns a path inside the /public folder into a URL that works in dev and after `npm run build`.
// Example: asset("images/amenities/gym.svg")
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
