import React, { useState, useEffect, useContext } from 'react';
import SideNavBar from '../Sidebar/Navbar';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import DealDetailView from './DealDetailVeiw';

const ViewDeal = () => {
  const [products, setProducts] = useState([]);
  const { id } = useParams();

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`${API_BASE_URL}/api/Deal/showOneDeal/${id}`,{
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`
          }
        })
        .then((response) => {
          console.log('API Response:', response);
          const formattedProducts = response.data.map(product => ({
            ...product,
            id: id, // Assuming _id is the unique identifier
            Creation_Date: formatDate(product.Creation_Date),
            End_date: formatDate(product.End_date),
          }));
          setProducts(formattedProducts);
        })
        .catch((error) => {
          console.error('Error fetching product data:', error);
        });
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Check if the date is 01/01/1970
    if (day === '01' && month === '01' && year === 1970) {
      return '';
    }

    return `${day}/${month}/${year}`;
  };

  

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNavBar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-center">Deal Registered</h1>
        </div>
        {products.map((product) => (
          <DealDetailView key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ViewDeal;
