import React, { useState, useEffect } from 'react';
import SideNavBar from '../Sidebar/Navbar';
import OpportunityDetail from './OpportunityDetail';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useParams } from 'react-router-dom';

const ViewOpportunity = () => {
  const [products, setProducts] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`${API_BASE_URL}/api/Opportunity/showOneOpportunity/${id}`)
        .then((response) => {
          console.log('API Response:', response);
          const formattedProducts = response.data.map(product => ({
            ...product,
            closure_time: formatDate(product.closure_time),
            license_from: formatDate(product.license_from),
            license_to: formatDate(product.license_to),
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
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNavBar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-center">Opportunity Detail</h1>
        </div>
        {products.map((product) => (
          <OpportunityDetail key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ViewOpportunity;
