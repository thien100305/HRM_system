import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/task-assignments`;

const config = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getTaskAssignments = async () => {
    const response = await axios.get(API_URL, config());
    return response.data;
};

export const getTaskAssignmentById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, config());
    return response.data;
};

export const createTaskAssignment = async (assignment) => {
    const response = await axios.post(API_URL, assignment, config());
    return response.data;
};

export const updateTaskAssignment = async (id, assignment) => {
    const response = await axios.put(`${API_URL}/${id}`, assignment, config());
    return response.data;
};

export const updateTaskStatus = async (id, status, file = null) => {
    if (file) {
        const formData = new FormData();
        formData.append("status", status);
        formData.append("file", file);
        const response = await axios.patch(
            `${API_URL}/${id}/status`,
            formData,
            config()
        );
        return response.data;
    }

    const response = await axios.patch(
        `${API_URL}/${id}/status`,
        { status },
        config()
    );
    return response.data;
};

export const downloadTaskAttachment = async (assignment) => {
    const response = await axios.get(
        `${API_URL}/${assignment.id}/attachment`,
        { ...config(), responseType: "blob" }
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = assignment.attachmentName || "minh-chung";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const deleteTaskAssignment = async (id) => {
    await axios.delete(`${API_URL}/${id}`, config());
};
