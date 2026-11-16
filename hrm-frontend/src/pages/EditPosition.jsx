import { useEffect, useState } from "react";

import {
    getPositionById,
    updatePosition
} from "../services/positionService";

import {
    useNavigate,
    useParams
} from "react-router-dom";

function EditPosition() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [name,
        setName] = useState("");

    const [description,
        setDescription] = useState("");

    useEffect(() => {

        loadPosition();

    }, []);

    const loadPosition =
        async () => {

            const data =
                await getPositionById(id);

            setName(data.name);

            setDescription(
                data.description
            );
        };

    const handleSubmit =
        async (e) => {

            e.preventDefault();

            await updatePosition(
                id,
                {
                    name,
                    description
                }
            );

            alert(
                "Cập nhật thành công"
            );

            navigate(
                "/positions"
            );
        };

    return (

        <div className="container">

            <h1>Sửa chức vụ</h1>

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
                    className="btn btn-primary"
                >
                    Cập nhật
                </button>

            </form>

        </div>
    );
}

export default EditPosition;