const API_BASE_URL =
  process.env.REACT_APP_USE_MOBILE_API === "true"
    ? process.env.REACT_APP_API_BASE_URL_MOBILE
    : process.env.REACT_APP_API_BASE_URL_LOCAL;

export default API_BASE_URL;