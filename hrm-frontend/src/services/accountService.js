import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/accounts`;

const config = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getAccounts = async () => {
    const response = await axios.get(API_URL, config());
    return response.data;
};

export const createAccount = async (account) => {
    const response = await axios.post(API_URL, account, config());
    return response.data;
};

export const updateAccount = async (id, account) => {
    const response = await axios.put(`${API_URL}/${id}`, account, config());
    return response.data;
};

export const deleteAccount = async (id) => {
    await axios.delete(`${API_URL}/${id}`, config());
};
