import { useState } from "react";

import {
    createPosition
} from "../services/positionService";

import {
    useNavigate
} from "react-router-dom";

function PositionForm() {

    const navigate =
        useNavigate();

    const [name,
        setName] = useState("");

    const [description,
        setDescription] = useState("");

    const handleSubmit =
        async (e) => {

            e.preventDefault();

            await createPosition({
                name,
                description
            });

            alert(
                "Thêm thành công"
            );

            navigate(
                "/positions"
            );
        };

    return (

        <div className="container">

            <h1>Thêm chức vụ</h1>

            <form
                onSubmit={
                    handleSubmit
                }
            >

                <div className="mb-3">

                    <label>
                        Tên chức vụ
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="mb-3">

                    <label>
                        Mô tả
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    className="btn btn-success"
                >
                    Lưu
                </button>

            </form>

        </div>
    );
}

export default PositionForm;