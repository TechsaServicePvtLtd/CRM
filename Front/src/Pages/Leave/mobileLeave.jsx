import React, { useState, useEffect } from "react";
import SideNavBar from "../Sidebar/Navbar";
import MobileDetail from "./MobileDetail";
import axios from "axios";
import API_BASE_URL from "../../config";
import { CiFilter } from "react-icons/ci";
import FilterModal from "./FilterModal";

const MobileLeave = () => {
  const [applications, setApplications] = useState([]); // Initialize as an empty array
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(null); // Initialize as null
  const [filters, setFilters] = useState({
    name: "",
    surname: "",
    status: "",
    fromDate: "",
    toDate: "",
    type: "",
    duration: "",
    days: "",
    description: "",
    history: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/Leave/showApplicationLeave`
      );
     // console.log("API Response:", response.data);
      setApplications(response.data.dealers);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const handleCiFilterClick = () => {
    setFilterModalIsOpen(true);
  };

  const onApplyFilters = (filteredData) => {
    setFilteredUsers(filteredData);
    setFilterModalIsOpen(false);
  };

  const initialFilters = {
    name: "",
    status: "",
    fromDate: "",
    toDate: "",
    type: "",
    duration: "",
    days: "",
    description: "",
    history: "",
    assignedTo: "",
  };

  const renderApplications = () => {
    const dataToRender = filteredUsers !== null ? filteredUsers : applications;
    if (dataToRender.length === 0) {
      return <p>No leave applications found.</p>;
    }
    return dataToRender.map((application) => (
      <MobileDetail
        key={application.id}
        product={application}
        style={{ flex: "1 0 300px", margin: "10px" }}
      />
    ));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNavBar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "10px",
              }}
            >
              <CiFilter
                size={40}
                style={{ marginLeft: "25px" }}
                onClick={handleCiFilterClick}
              />
              <FilterModal
                isOpen={filterModalIsOpen}
                onClose={() => setFilterModalIsOpen(false)}
                onApplyFilters={onApplyFilters}
                users={applications}
                resetFilters={() => setFilters(initialFilters)}
              />
              <h1 className="text-2xl mt-8 font-semibold text-center">
                Leave Applications
              </h1>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-around",
            }}
          >
            {renderApplications()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLeave;
