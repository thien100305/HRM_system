IF OBJECT_ID('dbo.task_assignments', 'U') IS NULL
EXEC('CREATE TABLE dbo.task_assignments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(1000),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    assigned_by VARCHAR(50),
    employee_id BIGINT NOT NULL,
    CONSTRAINT FK_TASK_ASSIGNMENT_EMPLOYEE
        FOREIGN KEY(employee_id) REFERENCES dbo.employees(id),
    CONSTRAINT CK_TASK_ASSIGNMENT_DATES
        CHECK(due_date >= start_date)
)');

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_task_assignments_employee_due_date'
      AND object_id = OBJECT_ID('dbo.task_assignments')
)
EXEC('CREATE INDEX IX_task_assignments_employee_due_date
    ON dbo.task_assignments(employee_id, due_date)');

IF COL_LENGTH('dbo.task_assignments', 'attachment_name') IS NULL
EXEC('ALTER TABLE dbo.task_assignments ADD
    attachment_name NVARCHAR(255) NULL,
    attachment_content_type VARCHAR(150) NULL,
    attachment_data VARBINARY(MAX) NULL,
    attachment_uploaded_at DATETIME2 NULL');

IF COL_LENGTH('dbo.leave_requests', 'leave_session') IS NULL
EXEC('ALTER TABLE dbo.leave_requests ADD leave_session VARCHAR(20) NOT NULL
    CONSTRAINT DF_leave_requests_leave_session DEFAULT ''FULL_DAY''');

IF COL_LENGTH('dbo.salary', 'leave_day_units') IS NULL
EXEC('ALTER TABLE dbo.salary ADD leave_day_units DECIMAL(5,1) NOT NULL
    CONSTRAINT DF_salary_leave_day_units DEFAULT 0');

UPDATE dbo.salary
SET leave_day_units = CAST(leave_days AS DECIMAL(5,1)),
    leave_days = 0
WHERE leave_day_units = 0
  AND leave_days <> 0;

IF OBJECT_ID('dbo.company_messages', 'U') IS NULL
EXEC('CREATE TABLE dbo.company_messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    sender_username VARCHAR(50) NOT NULL,
    sender_name NVARCHAR(100) NOT NULL,
    message_content NVARCHAR(1000) NOT NULL,
    sent_at DATETIME2 NOT NULL
)');

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_company_messages_sent_at'
      AND object_id = OBJECT_ID('dbo.company_messages')
)
EXEC('CREATE INDEX IX_company_messages_sent_at
    ON dbo.company_messages(sent_at)');
