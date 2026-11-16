import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
    `${API_BASE_URL}/departments`;

const getHeaders = () => ({

    headers: {
        Authorization:
            `Bearer ${localStorage.getItem("token")}`
    }

});

export const getDepartments = async () => {

    const response =
        await axios.get(
            API_URL,
            getHeaders()
        );

    return response.data;
};

export const getDepartmentById =
    async (id) => {

        const response =
            await axios.get(
                `${API_URL}/${id}`,
                getHeaders()
            );

        return response.data;
    };

export const createDepartment =
    async (department) => {

        const response =
            await axios.post(
                API_URL,
                department,
                getHeaders()
            );

        return response.data;
    };

export const updateDepartment =
    async (id, department) => {

        const response =
            await axios.put(
                `${API_URL}/${id}`,
                department,
                getHeaders()
            );

        return response.data;
    };

export const deleteDepartment =
    async (id) => {

        await axios.delete(
            `${API_URL}/${id}`,
            getHeaders()
        );
    };
