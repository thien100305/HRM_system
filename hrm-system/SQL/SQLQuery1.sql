/* HRM database bootstrap - SQL Server
   Có thể chạy lại an toàn trên database HRM_DB. */
SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.roles (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
END;

IF OBJECT_ID('dbo.departments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.departments (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        department_code VARCHAR(20) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(255),
        CONSTRAINT UQ_departments_code UNIQUE (department_code)
    );
END;

IF OBJECT_ID('dbo.positions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.positions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        position_code VARCHAR(20) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(255),
        CONSTRAINT UQ_positions_code UNIQUE (position_code)
    );
END;

IF OBJECT_ID('dbo.employees', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.employees (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        employee_code VARCHAR(20) NOT NULL UNIQUE,
        full_name NVARCHAR(100) NOT NULL,
        gender BIT, dob DATE, phone VARCHAR(20), email VARCHAR(100),
        address NVARCHAR(255), department_id BIGINT, position_id BIGINT,
        salary DECIMAL(18,2), hire_date DATE, status NVARCHAR(50),
        CONSTRAINT FK_EMP_DEPARTMENT FOREIGN KEY(department_id) REFERENCES dbo.departments(id),
        CONSTRAINT FK_EMP_POSITION FOREIGN KEY(position_id) REFERENCES dbo.positions(id)
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_employees_email' AND object_id = OBJECT_ID('dbo.employees')
)
    CREATE UNIQUE INDEX UX_employees_email
    ON dbo.employees(email)
    WHERE email IS NOT NULL AND email <> '';

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_employees_phone' AND object_id = OBJECT_ID('dbo.employees')
)
    CREATE UNIQUE INDEX UX_employees_phone
    ON dbo.employees(phone)
    WHERE phone IS NOT NULL AND phone <> '';

IF OBJECT_ID('dbo.attendance', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.attendance (
        id BIGINT IDENTITY(1,1) PRIMARY KEY, employee_id BIGINT NOT NULL,
        attendance_date DATE NOT NULL, check_in TIME, check_out TIME, status NVARCHAR(50),
        CONSTRAINT FK_ATTENDANCE_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES dbo.employees(id),
        CONSTRAINT UQ_attendance_employee_date UNIQUE(employee_id, attendance_date)
    );
END;

IF OBJECT_ID('dbo.leave_requests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.leave_requests (
        id BIGINT IDENTITY(1,1) PRIMARY KEY, employee_id BIGINT NOT NULL,
        start_date DATE NOT NULL, end_date DATE NOT NULL, reason NVARCHAR(500), status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        leave_session VARCHAR(20) NOT NULL CONSTRAINT DF_leave_requests_leave_session DEFAULT 'FULL_DAY',
        CONSTRAINT FK_LEAVE_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES dbo.employees(id),
        CONSTRAINT CK_leave_dates CHECK(end_date >= start_date)
    );
END;

IF OBJECT_ID('dbo.task_assignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.task_assignments (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(1000),
        start_date DATE NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(30) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        assigned_by VARCHAR(50),
        attachment_name NVARCHAR(255),
        attachment_content_type VARCHAR(150),
        attachment_data VARBINARY(MAX),
        attachment_uploaded_at DATETIME2,
        employee_id BIGINT NOT NULL,
        CONSTRAINT FK_TASK_ASSIGNMENT_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES dbo.employees(id),
        CONSTRAINT CK_TASK_ASSIGNMENT_DATES CHECK(due_date >= start_date)
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_task_assignments_employee_due_date'
      AND object_id = OBJECT_ID('dbo.task_assignments')
)
    CREATE INDEX IX_task_assignments_employee_due_date
    ON dbo.task_assignments(employee_id, due_date);

IF COL_LENGTH('dbo.task_assignments', 'attachment_name') IS NULL
    ALTER TABLE dbo.task_assignments ADD
        attachment_name NVARCHAR(255) NULL,
        attachment_content_type VARCHAR(150) NULL,
        attachment_data VARBINARY(MAX) NULL,
        attachment_uploaded_at DATETIME2 NULL;

IF OBJECT_ID('dbo.company_messages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.company_messages (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        sender_username VARCHAR(50) NOT NULL,
        sender_name NVARCHAR(100) NOT NULL,
        message_content NVARCHAR(1000) NOT NULL,
        sent_at DATETIME2 NOT NULL
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_company_messages_sent_at'
      AND object_id = OBJECT_ID('dbo.company_messages')
)
    CREATE INDEX IX_company_messages_sent_at
    ON dbo.company_messages(sent_at);

IF OBJECT_ID('dbo.salary', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.salary (
        id BIGINT IDENTITY(1,1) PRIMARY KEY, employee_id BIGINT NOT NULL,
        month INT NOT NULL, year INT NOT NULL, basic_salary DECIMAL(18,2) NOT NULL DEFAULT 0,
        allowance DECIMAL(18,2) NOT NULL DEFAULT 0, working_days INT NOT NULL DEFAULT 0,
        leave_days INT NOT NULL DEFAULT 0, leave_day_units DECIMAL(5,1) NOT NULL DEFAULT 0,
        late_days INT NOT NULL DEFAULT 0,
        attendance_bonus DECIMAL(18,2) NOT NULL DEFAULT 0,
        late_penalty DECIMAL(18,2) NOT NULL DEFAULT 0,
        total_salary DECIMAL(18,2) NOT NULL DEFAULT 0,
        CONSTRAINT FK_SALARY_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES dbo.employees(id),
        CONSTRAINT CK_salary_month CHECK(month BETWEEN 1 AND 12),
        CONSTRAINT UQ_salary_period UNIQUE(employee_id, month, year)
    );
END;

/* Bổ sung các cột tính lương tự động cho database đã tồn tại. */
IF COL_LENGTH('dbo.salary', 'late_days') IS NULL
    ALTER TABLE dbo.salary ADD late_days INT NOT NULL CONSTRAINT DF_salary_late_days DEFAULT 0;

IF COL_LENGTH('dbo.leave_requests', 'leave_session') IS NULL
    ALTER TABLE dbo.leave_requests ADD leave_session VARCHAR(20) NOT NULL
        CONSTRAINT DF_leave_requests_leave_session DEFAULT 'FULL_DAY';

IF COL_LENGTH('dbo.salary', 'leave_day_units') IS NULL
EXEC('ALTER TABLE dbo.salary ADD leave_day_units DECIMAL(5,1) NOT NULL
    CONSTRAINT DF_salary_leave_day_units DEFAULT 0');

UPDATE dbo.salary
SET leave_day_units = CAST(leave_days AS DECIMAL(5,1)),
    leave_days = 0
WHERE leave_day_units = 0
  AND leave_days <> 0;

IF COL_LENGTH('dbo.salary', 'attendance_bonus') IS NULL
    ALTER TABLE dbo.salary ADD attendance_bonus DECIMAL(18,2) NOT NULL CONSTRAINT DF_salary_attendance_bonus DEFAULT 0;

IF COL_LENGTH('dbo.salary', 'late_penalty') IS NULL
    ALTER TABLE dbo.salary ADD late_penalty DECIMAL(18,2) NOT NULL CONSTRAINT DF_salary_late_penalty DEFAULT 0;

IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL, role_id BIGINT, employee_id BIGINT,
        approval_status VARCHAR(20) NOT NULL CONSTRAINT DF_users_approval_status DEFAULT 'APPROVED',
        self_registered BIT NOT NULL CONSTRAINT DF_users_self_registered DEFAULT 0,
        registered_at DATETIME2,
        CONSTRAINT FK_USER_ROLE FOREIGN KEY(role_id) REFERENCES dbo.roles(id),
        CONSTRAINT FK_USER_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES dbo.employees(id)
    );
END;

IF COL_LENGTH('dbo.users', 'approval_status') IS NULL
    ALTER TABLE dbo.users ADD approval_status VARCHAR(20) NOT NULL
        CONSTRAINT DF_users_approval_status DEFAULT 'APPROVED';

IF COL_LENGTH('dbo.users', 'self_registered') IS NULL
    ALTER TABLE dbo.users ADD self_registered BIT NOT NULL
        CONSTRAINT DF_users_self_registered DEFAULT 0;

IF COL_LENGTH('dbo.users', 'registered_at') IS NULL
    ALTER TABLE dbo.users ADD registered_at DATETIME2;

MERGE dbo.roles AS target USING (VALUES ('ROLE_ADMIN'),('ROLE_HR'),('ROLE_EMPLOYEE')) AS source(name)
ON target.name=source.name WHEN NOT MATCHED THEN INSERT(name) VALUES(source.name);

MERGE dbo.departments AS target USING (VALUES
 ('IT',N'Công nghệ thông tin',N'Vận hành hệ thống và sản phẩm số'),
 ('HR',N'Nhân sự',N'Quản trị và phát triển nguồn nhân lực'),
 ('ACC',N'Kế toán',N'Tài chính và kế toán')) AS source(code,name,description)
ON target.department_code=source.code WHEN NOT MATCHED THEN INSERT(department_code,name,description) VALUES(source.code,source.name,source.description);

MERGE dbo.positions AS target USING (VALUES
 ('NV',N'Nhân viên',N'Nhân viên chính thức'),('TN',N'Trưởng nhóm',N'Quản lý nhóm'),('TP',N'Trưởng phòng',N'Quản lý phòng ban')) AS source(code,name,description)
ON target.position_code=source.code WHEN NOT MATCHED THEN INSERT(position_code,name,description) VALUES(source.code,source.name,source.description);

/* Tài khoản khởi tạo dùng mật khẩu 123456 để tương thích dữ liệu cũ.
   Hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên. */
MERGE dbo.users AS target USING (VALUES
 ('admin','123456','ROLE_ADMIN'),('hr','123456','ROLE_HR'),('employee','123456','ROLE_EMPLOYEE')) AS source(username,password,role_name)
ON target.username=source.username WHEN NOT MATCHED THEN
INSERT(username,password,role_id) VALUES(source.username,source.password,(SELECT id FROM dbo.roles WHERE name=source.role_name));

/* Liên kết tài khoản employee với hồ sơ NV001 nếu dữ liệu nhân viên mẫu đã có. */
UPDATE dbo.users
SET employee_id = (
    SELECT id
    FROM dbo.employees
    WHERE employee_code = 'NV001'
)
WHERE username = 'employee'
  AND employee_id IS NULL
  AND EXISTS (
      SELECT 1
      FROM dbo.employees
      WHERE employee_code = 'NV001'
  );

COMMIT TRANSACTION;
