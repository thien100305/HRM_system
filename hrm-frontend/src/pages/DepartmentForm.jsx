import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DepartmentEditor from "../components/DepartmentEditor";
import { createDepartment } from "../services/departmentService";

function DepartmentForm() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setSaving(true);
            await createDepartment({ name: name.trim(), description: description.trim() });
            navigate("/departments");
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể thêm phòng ban"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <DepartmentEditor
            title="Thêm phòng ban mới"
            subtitle="Tạo một đơn vị mới trong cơ cấu tổ chức."
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onSubmit={handleSubmit}
            saving={saving}
            error={error}
            submitLabel="Tạo phòng ban"
        />
    );
}

export default DepartmentForm;
