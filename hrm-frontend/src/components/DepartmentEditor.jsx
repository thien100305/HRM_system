import { Link } from "react-router-dom";

const buildCodePreview = (name) => {
    const code = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

    return code || "---";
};

function DepartmentEditor({
    title,
    subtitle,
    name,
    description,
    onNameChange,
    onDescriptionChange,
    onSubmit,
    saving,
    error,
    submitLabel
}) {
    return (
        <div className="department-form-page">
            <div className="form-page-heading">
                <div className="form-page-icon">▤</div>
                <div>
                    <span className="form-eyebrow">QUẢN LÝ PHÒNG BAN</span>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form className="department-form-card" onSubmit={onSubmit}>
                <div className="department-form-intro">
                    <div>
                        <strong>Thông tin phòng ban</strong>
                        <span>Điền tên và mô tả để tổ chức cơ cấu nhân sự rõ ràng hơn.</span>
                    </div>
                    <div className="department-code-preview">
                        <small>Mã tự động</small>
                        <strong>{buildCodePreview(name)}</strong>
                    </div>
                </div>

                <div className="department-form-body">
                    <div className="department-field">
                        <label htmlFor="department-name">
                            Tên phòng ban <span>*</span>
                        </label>
                        <input
                            id="department-name"
                            type="text"
                            className="form-control"
                            placeholder="Ví dụ: Phòng Kinh doanh"
                            value={name}
                            onChange={(event) => onNameChange(event.target.value)}
                            maxLength={100}
                            autoFocus
                            required
                        />
                        <small>Mã phòng ban được tạo tự động từ chữ cái đầu của tên.</small>
                    </div>

                    <div className="department-field">
                        <label htmlFor="department-description">Mô tả chức năng</label>
                        <textarea
                            id="department-description"
                            className="form-control"
                            placeholder="Mô tả nhiệm vụ, phạm vi hoạt động của phòng ban..."
                            value={description}
                            onChange={(event) => onDescriptionChange(event.target.value)}
                            maxLength={255}
                            rows={5}
                        />
                        <small>{description.length}/255 ký tự</small>
                    </div>
                </div>

                <div className="department-form-actions">
                    <Link to="/departments" className="btn department-cancel-btn">
                        Quay lại
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Đang lưu..." : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DepartmentEditor;
