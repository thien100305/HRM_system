import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DepartmentEditor from "../components/DepartmentEditor";
import { getDepartmentById, updateDepartment } from "../services/departmentService";

function EditDepartment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getDepartmentById(id)
            .then((data) => {
                setName(data.name || "");
                setDescription(data.description || "");
            })
            .catch(() => setError("Không thể tải dữ liệu phòng ban"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setSaving(true);
            await updateDepartment(id, {
                name: name.trim(),
                description: description.trim()
            });
            navigate("/departments");
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể cập nhật phòng ban"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Đang tải dữ liệu phòng ban...</div>;

    return (
        <DepartmentEditor
            title="Chỉnh sửa phòng ban"
            subtitle="Cập nhật tên và phạm vi hoạt động của phòng ban."
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onSubmit={handleSubmit}
            saving={saving}
            error={error}
            submitLabel="Lưu thay đổi"
        />
    );
}

export default EditDepartment;
