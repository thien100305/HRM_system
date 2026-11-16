import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
    `${API_BASE_URL}/positions`;

export const getPositions = async () => {

    const token =
        localStorage.getItem("token");

    const response = await axios.get(
        API_URL,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getPositionById = async (id) => {

    const token =
        localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const createPosition = async (position) => {

    const token =
        localStorage.getItem("token");

    const response = await axios.post(
        API_URL,
        position,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const updatePosition = async (
    id,
    position
) => {

    const token =
        localStorage.getItem("token");

    const response = await axios.put(
        `${API_URL}/${id}`,
        position,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const deletePosition = async (id) => {

    const token =
        localStorage.getItem("token");

    const response = await axios.delete(
        `${API_URL}/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    return response.data;
};
