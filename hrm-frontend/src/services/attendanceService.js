import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
`${API_BASE_URL}/attendance`;

const getHeaders = () => ({
Authorization:
`Bearer ${
            localStorage.getItem("token")
        }`
});

export const getAttendance =
async () => {

    const response =
        await axios.get(
            API_URL,
            {
                headers: getHeaders()
            }
        );

    return response.data;
};

export const getAttendanceMonthlySummary = async (month, year) => {
    const response = await axios.get(
        `${API_URL}/summary`,
        {
            headers: getHeaders(),
            params: { month, year }
        }
    );

    return response.data;
};

export const getAttendanceById =
async (id) => {

    const response =
        await axios.get(
            `${API_URL}/${id}`,
            {
                headers: getHeaders()
            }
        );

    return response.data;
};

export const createAttendance =
async (attendance) => {

    const response =
        await axios.post(
            API_URL,
            attendance,
            {
                headers: getHeaders()
            }
        );

    return response.data;
};

export const updateAttendance =
async (id, attendance) => {

    const response =
        await axios.put(
            `${API_URL}/${id}`,
            attendance,
            {
                headers: getHeaders()
            }
        );

    return response.data;
};

export const deleteAttendance =
async (id) => {

    const response =
        await axios.delete(
            `${API_URL}/${id}`,
            {
                headers: getHeaders()
            }
        );

    return response.data;
};

export const importAttendance = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
        `${API_URL}/import`,
        formData,
        {
            headers: getHeaders()
        }
    );

    return response.data;
};

export const downloadAttendanceTemplate = async () => {
    const response = await axios.get(
        `${API_URL}/template`,
        {
            headers: getHeaders(),
            responseType: "blob"
        }
    );

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau-cham-cong.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};
