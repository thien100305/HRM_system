import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
    `${API_BASE_URL}/dashboard`;

export const getDashboardData =
    async () => {

        const token =
            localStorage.getItem("token");

        const response =
            await axios.get(
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

export const getSalaryStatistics = async (limit = 12) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/salary-statistics`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit }
        }
    );

    return response.data;
};
