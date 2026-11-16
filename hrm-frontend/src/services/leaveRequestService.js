import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL =
`${API_BASE_URL}/leave-requests`;

const getHeaders = () => ({
headers: {
Authorization:
`Bearer ${localStorage.getItem("token")}`
}
});

export const getLeaveRequests =
async () => {


    const response =
        await axios.get(
            API_URL,
            getHeaders()
        );

    return response.data;
};


export const getLeaveRequestById =
async (id) => {


    const response =
        await axios.get(
            `${API_URL}/${id}`,
            getHeaders()
        );

    return response.data;
};


export const createLeaveRequest =
async (leaveRequest) => {


    const response =
        await axios.post(
            API_URL,
            leaveRequest,
            getHeaders()
        );

    return response.data;
};


export const updateLeaveRequest =
async (id, leaveRequest) => {


    const response =
        await axios.put(
            `${API_URL}/${id}`,
            leaveRequest,
            getHeaders()
        );

    return response.data;
};


export const deleteLeaveRequest =
async (id) => {


    const response =
        await axios.delete(
            `${API_URL}/${id}`,
            getHeaders()
        );

    return response.data;
};


export const approveLeave =
async (id) => {


    const response =
        await axios.put(
            `${API_URL}/${id}/approve`,
            {},
            getHeaders()
        );

    return response.data;
};


export const rejectLeave =
async (id) => {


    const response =
        await axios.put(
            `${API_URL}/${id}/reject`,
            {},
            getHeaders()
        );

    return response.data;
};
