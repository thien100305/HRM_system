import { useEffect, useRef, useState } from "react";
import {
    deleteCompanyMessage,
    getCompanyMessages,
    sendCompanyMessage
} from "../services/companyChatService";

const getLastSeenKey = (username) => `hrm:company-chat:last-seen:${username}`;

function CompanyChat({ username, role }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [lastSeenId, setLastSeenId] = useState(
        () => Number(localStorage.getItem(getLastSeenKey(username)) || 0)
    );
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const openRef = useRef(false);
    const messagesEndRef = useRef(null);
    const canModerate = role === "ADMIN" || role === "HR";

    const rememberLastSeen = (id) => {
        if (!id) {
            return;
        }
        setLastSeenId(id);
        localStorage.setItem(getLastSeenKey(username), String(id));
    };

    useEffect(() => {
        let active = true;

        const refresh = () => {
            getCompanyMessages()
                .then((data) => {
                    if (!active) {
                        return;
                    }
                    setMessages(data);
                    if (openRef.current && data.length > 0) {
                        const newestId = data[data.length - 1].id;
                        setLastSeenId(newestId);
                        localStorage.setItem(getLastSeenKey(username), String(newestId));
                    }
                })
                .catch(() => {
                    // Chat không làm gián đoạn các chức năng nghiệp vụ khác.
                });
        };

        Promise.resolve().then(refresh);
        const intervalId = window.setInterval(refresh, 5000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [username]);

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const unreadCount = open
        ? 0
        : messages.filter(
            (message) => message.id > lastSeenId && message.senderUsername !== username
        ).length;

    const toggleChat = () => {
        const nextOpen = !open;
        setOpen(nextOpen);
        openRef.current = nextOpen;

        if (nextOpen && messages.length > 0) {
            rememberLastSeen(messages[messages.length - 1].id);
        }
    };

    const reloadMessages = async () => {
        const data = await getCompanyMessages();
        setMessages(data);
        if (openRef.current && data.length > 0) {
            rememberLastSeen(data[data.length - 1].id);
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!content.trim()) {
            return;
        }

        try {
            setSending(true);
            setError("");
            await sendCompanyMessage(content);
            setContent("");
            await reloadMessages();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể gửi tin nhắn"
            );
        } finally {
            setSending(false);
        }
    };

    const removeMessage = async (message) => {
        if (!window.confirm("Xóa tin nhắn này khỏi chat công ty?")) {
            return;
        }
        try {
            setError("");
            await deleteCompanyMessage(message.id);
            await reloadMessages();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể xóa tin nhắn"
            );
        }
    };

    const formatTime = (value) => new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit"
    }).format(new Date(value));

    return (
        <div className="company-chat">
            {open && (
                <section className="company-chat-panel" aria-label="Chat công ty">
                    <header className="company-chat-header">
                        <div>
                            <strong>Chat công ty</strong>
                            <small>Trao đổi chung · cập nhật tự động</small>
                        </div>
                        <button type="button" onClick={toggleChat} aria-label="Đóng chat">
                            ×
                        </button>
                    </header>

                    <div className="company-chat-messages">
                        {messages.length === 0 && (
                            <div className="company-chat-empty">
                                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                            </div>
                        )}

                        {messages.map((message) => {
                            const ownMessage = message.senderUsername === username;
                            return (
                                <div
                                    className={`company-message ${ownMessage ? "own" : ""}`}
                                    key={message.id}
                                >
                                    <div className="company-message-heading">
                                        <strong>{ownMessage ? "Bạn" : message.senderName}</strong>
                                        <span>{formatTime(message.sentAt)}</span>
                                    </div>
                                    <div className="company-message-bubble">
                                        <p>{message.content}</p>
                                        {canModerate && (
                                            <button
                                                type="button"
                                                onClick={() => removeMessage(message)}
                                                aria-label="Xóa tin nhắn"
                                                title="Xóa tin nhắn"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {error && <div className="company-chat-error">{error}</div>}

                    <form className="company-chat-compose" onSubmit={sendMessage}>
                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Nhập tin nhắn..."
                            maxLength={1000}
                            rows={2}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                        />
                        <button type="submit" disabled={sending || !content.trim()}>
                            {sending ? "…" : "➤"}
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                className="company-chat-trigger"
                onClick={toggleChat}
                aria-label={`Mở chat công ty${unreadCount ? `, ${unreadCount} tin mới` : ""}`}
            >
                <span aria-hidden="true">💬</span>
                {unreadCount > 0 && (
                    <b>{unreadCount > 9 ? "9+" : unreadCount}</b>
                )}
            </button>
        </div>
    );
}

export default CompanyChat;
