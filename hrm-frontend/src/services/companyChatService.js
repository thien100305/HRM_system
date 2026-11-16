import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/company-chat`;

const config = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getCompanyMessages = async () => {
    const response = await axios.get(API_URL, config());
    return response.data;
};

export const sendCompanyMessage = async (content) => {
    const response = await axios.post(API_URL, { content }, config());
    return response.data;
};

export const deleteCompanyMessage = async (id) => {
    await axios.delete(`${API_URL}/${id}`, config());
};
