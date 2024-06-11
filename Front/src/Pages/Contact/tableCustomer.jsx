import axios from "axios";
import React, { useEffect, useState } from "react";
import "./orders.css";
import DataTable, { createTheme } from "react-data-table-component";
import API_BASE_URL from "../../config";
import { MdEdit, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import ExportTable from "./ExportTable";
import { CiFilter } from "react-icons/ci";
import FilterModal from "./FilterModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";


const TableCustomer = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); 
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [filters, setFilters] = useState({
    city: "",
    customerentity:""
  });

  useEffect(() => {
    const controller = new AbortController(); 
    const signal = controller.signal; 
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/contact/showCustomer`,{
            signal: signal,
          }
        );
        setUsers(response.data.products);
        setFilteredUsers(response.data.products);
        console.log(response.data.products);
        
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled", err.message);
        } else {
          console.error("Error fetching orders:", err);
        }
      }
      return () => {
        controller.abort(); // Cancel the request if the component unmounts
      };
    };

    fetchOrders();
  }, []);

  const handleEditClick = (userId) => {
    navigate(`edit/${userId.id}`);
  };



  const handleDeleteConfirmation = (itemId) => {
    axios
      .delete(`${API_BASE_URL}/api/Contact/deleteCustomer`, { data: { id: itemId } })
      .then((response) => {
        console.log("Delete successful:", response.data);
        toast.success("Deleted Successfully");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error deleting:", error);
      });
  };

  // Function to handle closing the delete confirmation dialog
  const handleCloseDeleteConfirmation = () => {
    setDeleteItemId(null);
    setShowDeleteConfirmation(false);
  };

  // Function to handle delete operation
  const handleDeleteClick = (row) => {
    setDeleteItemId(row.id);
    setShowDeleteConfirmation(true);
  };

  const handleViewClick = (customer_entity) => {
    navigate(`${customer_entity}`);
  };

 

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Name Of Customer Entity",
      selector: (row) => row.customer_entity,
      sortable: true,
      width: "340px",
      cell: (row) => (
        <span
          className="view-link"
          onClick={() => handleViewClick(row.customer_entity)}
          style={{ cursor: "pointer", width: "100%", height: "100%" }}
        >
          {row.customer_entity}
        </span>
      ),
    },
    {
      name: "E-Mail",
      selector: (row) => row.email,
      sortable: true,
      width: "250px",
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      width: "250px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      sortable: true,
      width: "250px",
    },
    {
      name: "State",
      selector: (row) => row.state,
      sortable: true,
      width: "250px",
    },
    {
      name: "Website",
      selector: (row) => row.website,
      sortable: true,
      width: "250px",
    },
    {
      name: "Edit",
      cell: (row) => <MdEdit onClick={() => handleEditClick(row)}>Edit</MdEdit>,
      button: true,
    },
    {
      name: "Delete",
      cell: (row) => (
        <MdDelete onClick={() => handleDeleteClick(row)}>Delete</MdDelete>
      ),
      button: true,
    },
    {
      name: "View",
      cell: (row) => <FaEye onClick={() => handleViewClick(row)} />,
      button: true,
    },
  ];

  const CustomHeader = ({ column }) => (
    <div title={column.name} style={{ whiteSpace: "normal" }}>
      {column.name}
    </div>
  );

  const modifiedColumns = columns.map((col) => ({
    ...col,
    header: <CustomHeader column={col} />,
  }));

  const onApplyFilters = (filteredData) => {
    setFilteredUsers(filteredData);
    setFilterModalIsOpen(false);
  };

  const initialFilters = {
    city: "",
    customerentity:""
  };

  createTheme(
    "solarized",
    {
      text: {
        primary: "#FFFFFF",
        secondary: "#FFFFFF",
      },
      background: {
        default: "rgba(59,139,246,1)",
      },
      context: {
        background: "#cb4b16",
        text: "#FFFFFF",
      },
      divider: {
        default: "#073642",
      },
      action: {
        button: "rgba(0,0,0,.54)",
        hover: "rgba(59,139,246,1)",
        disabled: "rgba(0,0,0,.12)",
      },
    },
    "light"
  );

  const customStyles = {
    headCells: {
      style: {
        color: "rgb(255 255 255)",
        zIndex: "auto",
        "&:not(:last-of-type)": {
          borderRightStyle: "solid",
          borderRightWidth: "1px",
        },
      },
    },
    header: {
      style: {
        minHeight: "56px",
        fontSize: "25px",
      },
    },
    headRow: {
      style: {
        borderTopStyle: "solid",
        borderTopWidth: "1px",
      },
    },
    cells: {
      style: {
        "&:not(:last-of-type)": {
          borderRightStyle: "solid",
          borderRightWidth: "1px",
        },
        fontSize: "16px",
      },
    },
  };

  const handleCiFilterClick = () => {
    setFilterModalIsOpen(true);
  };
  
  const handleExportClick = () => {
    setExportModalIsOpen(true);
  };

  return (
    <div className="order">
      <div className="flex items-center">
        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}
        >
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleExportClick}
          >
            Export
          </button>
          <ExportTable
            data={filteredUsers}
            isOpen={exportModalIsOpen}
            onRequestClose={() => setExportModalIsOpen(false)}
          />

          <CiFilter
            size={40}
            style={{ marginLeft: "25px" }}
            onClick={handleCiFilterClick}
          />

          <FilterModal
            isOpen={filterModalIsOpen}
            onClose={() => setFilterModalIsOpen(false)}
            onApplyFilters={onApplyFilters}
            filters={filters}
            resetFilters={() => setFilters(initialFilters)}
          />
         
          <DeleteConfirmationDialog
            isOpen={showDeleteConfirmation}
            onClose={handleCloseDeleteConfirmation}
            onDelete={() => {
              handleDeleteConfirmation(deleteItemId); // Call the delete confirmation function with the deleteItemId
              handleCloseDeleteConfirmation(); // Close the dialog after deletion
            }}
          />
        </div>
      </div>
      <DataTable
        className="dataTable"
        columns={modifiedColumns}
        data={filteredUsers}
        //fixedHeader
        customStyles={customStyles} // Pass the updated customStyles object here
        fixedHeaderScrollHeight="800px"
        striped
        theme="solarized"
        pagination
        highlightOnHover
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 40, 60]}
        paginationComponentOptions={{
          rowsPerPageText: "Rows per page:",
          rangeSeparatorText: "of",
          noRowsPerPage: false,
          selectAllRowsItem: false,
        }}
      />
    </div>
  );
};

export default TableCustomer;
