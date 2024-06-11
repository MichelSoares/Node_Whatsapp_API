import axios from "axios";
const api = axios.create({
  baseURL: `${process.env.URL_API_SERVER}`,
 /* baseURL: "https://localhost:44444/", */
});

export default api;