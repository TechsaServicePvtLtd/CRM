import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EditDealModal from './EditDealModal';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import { AuthContext } from '../../context/AuthContext';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import axios from 'axios';

const DealDetailView = ({ product }) => {
  const [editModalOpen, setEditModalOpen] = useState(false); 
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);

const { currentUser } = useContext(AuthContext);
const navigate = useNavigate()

  const handleEditClick = () => {
  //  console.log("Clicked");
    setEditModalOpen(true); // Open the modal when Edit button is clicked
  };

  const handleDeleteClick = (itemId) => {
    setDeleteItemId(itemId); // Set the itemId to be deleted
    setShowDeleteConfirmation(true); // Show the delete confirmation dialog
  };

  const handleDeleteConfirmation = (itemId) => {
    //console.log("Deleting order with ID:", itemId);

    axios({
      method: "delete",
      url: `${API_BASE_URL}/api/Deal/deleteDeal`,
      
      data: { id: itemId }, // Include only the ID in the request payload
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.accessToken}`,
      },
    })
      .then((response) => {
        console.log("Delete successful. Deleted order_id:", itemId);
        toast.success("Deleted Successfully");
        navigate('/Deal')
      })
      .catch((error) => {
        console.error("Error deleting:", error);
        toast.error("Error deleting order");
      });
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteItemId(null);
    setShowDeleteConfirmation(false);
  };

  const {
    id,
     customer_entity,
    Creation_Date,
    End_date,
    Description,
    OEM,
    Status,  } = product;

//console.log("Product passed to DealDetailView:", product);

  return (
    <div className="flex flex-col justify-center items-center mt-8">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">

          <p className="text-xl font-semibold mb-2">Customer Name : {customer_entity}</p>
  
        <p className="text-gray-600 mb-2">Creation Date : {Creation_Date}</p>
        <p className="text-gray-600 mb-2">End Date : {End_date}</p>
        <p className="text-gray-600 mb-2">Description : {Description}</p>
        <p className="text-gray-600 mb-2">OEM : {OEM}</p>
        <p className="text-gray-600 mb-2">Current Status : {Status}</p>



        <div className="flex items-center justify-around mt-4">
          <button onClick={handleEditClick} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">
            Edit
          </button>
          {editModalOpen && <EditDealModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />}
            <button onClick={() => handleDeleteClick(id)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-red-600 focus:outline-none">
              Delete
            </button>
            <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
        onDelete={() => {
          handleDeleteConfirmation(deleteItemId);
          handleCloseDeleteConfirmation();
        }}
      />
          <Link to="/Deal">
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
              Back
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DealDetailView;