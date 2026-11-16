import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaveRequests } from "../services/leaveRequestService";

const notifiedStatuses = new Set(["Approved", "Rejected"]);

const notificationKey = (request) => `${request.id}:${request.status}`;

const readStorageKey = (username) => `hrm:leave-notifications:read:${username}`;

const loadReadKeys = (username) => {
    try {
        return JSON.parse(localStorage.getItem(readStorageKey(username)) || "[]");
    } catch {
        return [];
    }
};

function LeaveNotifications({ username }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [readKeys, setReadKeys] = useState(() => loadReadKeys(username));

    useEffect(() => {
        let active = true;

        const refresh = () => {
            getLeaveRequests()
                .then((data) => {
                    if (active) {
                        setRequests(data.filter((request) =>
                            notifiedStatuses.has(request.status)
                        ));
                    }
                })
                .catch(() => {
                    // Không làm gián đoạn màn hình chính nếu tải thông báo thất bại.
                });
        };

        Promise.resolve().then(refresh);
        const intervalId = window.setInterval(refresh, 30000);
        const handleFocus = () => refresh();
        window.addEventListener("focus", handleFocus);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, []);

    const notifications = useMemo(
        () => [...requests].sort((first, second) => second.id - first.id),
        [requests]
    );

    const unreadCount = notifications.filter(
        (request) => !readKeys.includes(notificationKey(request))
    ).length;

    const saveReadKeys = (nextKeys) => {
        setReadKeys(nextKeys);
        localStorage.setItem(readStorageKey(username), JSON.stringify(nextKeys));
    };

    const markAsRead = (request) => {
        const key = notificationKey(request);
        if (!readKeys.includes(key)) {
            saveReadKeys([...readKeys, key]);
        }
    };

    const markAllAsRead = () => {
        saveReadKeys([
            ...new Set([
                ...readKeys,
                ...notifications.map(notificationKey)
            ])
        ]);
    };

    const openRequest = (request) => {
        markAsRead(request);
        setOpen(false);
        navigate("/leave-requests");
    };

    return (
        <div className="notification-center">
            <button
                type="button"
                className="notification-trigger"
                aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
            >
                <span aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <div>
                            <strong>Thông báo</strong>
                            <small>{unreadCount} thông báo chưa đọc</small>
                        </div>
                        {unreadCount > 0 && (
                            <button type="button" onClick={markAllAsRead}>
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map((request) => {
                                const unread = !readKeys.includes(notificationKey(request));
                                const approved = request.status === "Approved";

                                return (
                                    <button
                                        type="button"
                                        className={`notification-item ${unread ? "unread" : ""}`}
                                        key={notificationKey(request)}
                                        onClick={() => openRequest(request)}
                                    >
                                        <span className={`notification-status ${approved ? "approved" : "rejected"}`}>
                                            {approved ? "✓" : "×"}
                                        </span>
                                        <span>
                                            <strong>
                                                Đơn nghỉ phép đã {approved ? "được duyệt" : "bị từ chối"}
                                            </strong>
                                            <small>
                                                Từ {request.startDate} đến {request.endDate}
                                            </small>
                                            {request.reason && <small>Nội dung: {request.reason}</small>}
                                        </span>
                                        {unread && <i aria-label="Chưa đọc" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="notification-empty">
                                Chưa có thông báo nghỉ phép.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeaveNotifications;
