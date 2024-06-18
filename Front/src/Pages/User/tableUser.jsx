import React, { useEffect, useState } from 'react';
import "./orders.css";
import DataTable from 'react-data-table-component';
import { MdEdit, MdDelete } from "react-icons/md";
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from "../../config";
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationDialog from "./DeleteConfirmationDialog.jsx";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/user/userData`);
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const handleEditClick = (userId) => {
        navigate(`edit/${userId}`);
    };

    const handleDeleteClick = (itemId) => {
        setDeleteItemId(itemId);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirmation = () => {
        if (deleteItemId) {
            axios.delete(`${API_BASE_URL}/api/user/delete`, { data: { id: deleteItemId } })
                .then((response) => {
                    console.log("Delete successful. Deleted user ID:", deleteItemId);
                    setUsers(users.filter(user => user.id !== deleteItemId));
                    setFilteredUsers(filteredUsers.filter(user => user.id !== deleteItemId));
                    toast.success("Deleted Successfully");
                })
                .catch((error) => {
                    console.error("Error deleting user:", error);
                    toast.error("Error deleting user");
                })
                .finally(() => {
                    setShowDeleteConfirmation(false);
                    setDeleteItemId(null);
                });
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setDeleteItemId(null);
        setShowDeleteConfirmation(false);
    };

    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)
        );
        setFilteredUsers(filteredData);
    };

    const columns = [
        {
            name: 'Sr. No',
            selector: (_, index) => index + 1,
            sortable: false,
            width: '80px',
        },
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Surname',
            selector: (row) => row.surname,
            sortable: true,
        },
        {
            name: 'Role',
            selector: (row) => row.role,
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row) => row.email,
            sortable: true,
        },
        {
            name: 'Total Leave Taken',
            selector: (row) => row.holidays_taken,
            sortable: true,
        },
        {
            name: 'Half Day Taken',
            selector: (row) => row.half_day,
            sortable: true,
        },
        {
            name: 'Created at',
            selector: (row) => {
              const date = new Date(row.created_at);
              return date.toLocaleString('en-UK', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'IST',
              });
            },
            sortable: true,
            width: '250px',
          },
        {
            name: 'Edit',
            cell: (row) => (
                <MdEdit onClick={() => handleEditClick(row.id)}>Edit</MdEdit>
            ),
            button: true,
        },
        {
            name: 'Delete',
            cell: (row) => (
                <MdDelete onClick={() => handleDeleteClick(row.id)}>Delete</MdDelete>
            ),
            button: true,
        },
    ];

    return (
        <div className='order'>
            <input
                type="text"
                placeholder="Search"
                onChange={handleSearch}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <DataTable
                className='dataTable'
                columns={columns}
                data={filteredUsers}
                fixedHeader
                fixedHeaderScrollHeight='450px'
                striped
                pagination
            />
            <DeleteConfirmationDialog
                isOpen={showDeleteConfirmation}
                onClose={handleCloseDeleteConfirmation}
                onDelete={handleDeleteConfirmation}
            />
        </div>
    );
};

export default Users;
