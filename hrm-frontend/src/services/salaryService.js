import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
    `${API_BASE_URL}/salary`;

const getHeaders = () => ({

    headers: {
        Authorization:
            `Bearer ${localStorage.getItem("token")}`
    }

});

export const getSalaries = async () => {

    const response =
        await axios.get(
            API_URL,
            getHeaders()
        );

    return response.data;
};

export const getSalaryById =
    async (id) => {

        const response =
            await axios.get(
                `${API_URL}/${id}`,
                getHeaders()
            );

        return response.data;
    };

export const createSalary =
    async (salary) => {

        const response =
            await axios.post(
                API_URL,
                salary,
                getHeaders()
            );

        return response.data;
    };

export const generateMonthlySalaries =
    async (month, year) => {

        const response =
            await axios.post(
                `${API_URL}/generate`,
                null,
                {
                    ...getHeaders(),
                    params: { month, year }
                }
            );

        return response.data;
    };

export const updateSalary =
    async (id, salary) => {

        const response =
            await axios.put(
                `${API_URL}/${id}`,
                salary,
                getHeaders()
            );

        return response.data;
    };

export const deleteSalary =
    async (id) => {

        await axios.delete(
            `${API_URL}/${id}`,
            getHeaders()
        );
    };
