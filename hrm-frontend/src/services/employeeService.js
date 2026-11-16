import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
    `${API_BASE_URL}/employees`;

const getHeaders = () => ({
    headers: {
        Authorization:
            `Bearer ${localStorage.getItem("token")}`
    }
});

// Lấy tất cả nhân viên
export const getEmployees = async () => {

    const response =
        await axios.get(
            API_URL,
            getHeaders()
        );

    return response.data;
};

// Lấy nhân viên theo ID
export const getEmployeeById = async (id) => {

    const response =
        await axios.get(
            `${API_URL}/${id}`,
            getHeaders()
        );

    return response.data;
};

// Thêm nhân viên
export const createEmployee = async (
    employee
) => {

    const response =
        await axios.post(
            API_URL,
            employee,
            getHeaders()
        );

    return response.data;
};

// Cập nhật nhân viên
export const updateEmployee = async (
    id,
    employee
) => {

    const response =
        await axios.put(
            `${API_URL}/${id}`,
            employee,
            getHeaders()
        );

    return response.data;
};

// Xóa nhân viên
export const deleteEmployee = async (
    id
) => {

    const response =
        await axios.delete(
            `${API_URL}/${id}`,
            getHeaders()
        );

    return response.data;
};
