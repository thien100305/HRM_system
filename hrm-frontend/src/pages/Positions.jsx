import { useEffect, useState } from "react";

import {
getPositions,
deletePosition
} from "../services/positionService";

import { Link } from "react-router-dom";

function Positions() {

const [positions, setPositions] =
    useState([]);

useEffect(() => {
    loadPositions();
}, []);

const loadPositions =
    async () => {

        const data =
            await getPositions();

        setPositions(data);
    };

const handleDelete =
    async (id) => {

        if (
            !window.confirm(
                "Bạn có chắc muốn xóa?"
            )
        ) {
            return;
        }

        await deletePosition(id);

        loadPositions();
    };

return (

    <div className="container">

        <h1>Danh sách chức vụ</h1>

        <Link
            to="/positions/add"
            className="btn btn-success mb-3"
        >
            Thêm chức vụ
        </Link>

        <table className="table table-bordered">

            <thead>

                <tr>

                    <th>Mã CV</th>

                    <th>Tên chức vụ</th>

                    <th>Mô tả</th>

                    <th>Thao tác</th>

                </tr>

            </thead>

            <tbody>

                {
                    positions.map(pos => (

                        <tr key={pos.id}>

                            <td>
                                {pos.positionCode}
                            </td>

                            <td>
                                {pos.name}
                            </td>

                            <td>
                                {pos.description}
                            </td>

                            <td>

                                <Link
                                    to={`/positions/edit/${pos.id}`}
                                    className="btn btn-warning me-2"
                                >
                                    Sửa
                                </Link>

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            pos.id
                                        )
                                    }
                                    className="btn btn-danger"
                                >
                                    Xóa
                                </button>

                            </td>

                        </tr>

                    ))
                }

            </tbody>

        </table>

    </div>
);

}

export default Positions;
