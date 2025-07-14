import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import Select from "react-select";
import API_BASE_URL from "../../config";
import { AuthContext } from "../../context/AuthContext";

Modal.setAppElement("#root");

const FilterModal = ({ isOpen, onClose, onApplyFilters, resetFilters }) => {
  const [customerEntities, setCustomerEntities] = useState([]);
  const [allCustomerEntities, setAllCustomerEntities] = useState([]);
  const [type, setType] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [licenseType, setLicenseType] = useState([]);
  const [status, setStatus] = useState([]);
  const [licenseFrom, setLicenseFrom] = useState("");
  const [licenseTo, setLicenseTo] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [shouldApplyFilters, setShouldApplyFilters] = useState(false);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCustomerEntities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Deal/customerentity`, {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`
          },
         signal });
        setAllCustomerEntities(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled", err.message);
        } else {
          console.error("Error fetching customer entities:", err);
        }
      }
    };

    const fetchTypeOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Opportunity/product`,
           {
            headers: {
              Authorization: `Bearer ${currentUser.accessToken}`
            } }
        );
        setType(response.data);
      } catch (error) {
        console.error("Error fetching type options:", error);
      }
    };

    fetchCustomerEntities();
    fetchTypeOptions();

    return () => {
      controller.abort();
    };
  }, []);

  const applyFilters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Deal/showDeal`, {
        params: {
          customerEntities,
          licenseType,
          type: selectedTypes,
          status,     
          licenseFrom,
          licenseTo,
          dateFilterType,
          selectedDate: dateFilterType !== "between" ? selectedDate : null,
          startDate: dateFilterType === "between" ? startDate : null,
          endDate: dateFilterType === "between" ? endDate : null,
        },
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`
          }
      });
      onApplyFilters(response.data.products);
      localStorage.setItem(
        "OrderFilters",
        JSON.stringify({
          customerEntities,
          selectedTypes,
          licenseType,
          status,
          licenseFrom,
          licenseTo,
          dateFilterType,
          selectedDate,
          startDate,
          endDate,
        })
      );
    } catch (error) {
      console.error("Error applying filters:", error.message);
    }
  };

  useEffect(() => {
    const storedFilters = localStorage.getItem("OrderFilters");
    if (storedFilters) {
      const {
        customerEntities: storedCustomerEntities,
        selectedTypes: storedSelectedTypes,
        licenseType: storedLicenseType,

        status: storedStatus,

        licenseFrom: storedLicenseFrom,
        licenseTo: storedLicenseTo,
        dateFilterType: storedDateFilterType,
        selectedDate: storedSelectedDate,
        startDate: storedStartDate,
        endDate: storedEndDate,
      } = JSON.parse(storedFilters);

      setCustomerEntities(storedCustomerEntities || []);
      setSelectedTypes(storedSelectedTypes || []);
      setLicenseType(storedLicenseType || []);
   
      setStatus(storedStatus || []);
     
      setLicenseFrom(storedLicenseFrom || "");
      setLicenseTo(storedLicenseTo || "");
      setDateFilterType(storedDateFilterType || "");
      setSelectedDate(storedSelectedDate || new Date().toISOString().split("T")[0]);
      setStartDate(storedStartDate || null);
      setEndDate(storedEndDate || null);

      setShouldApplyFilters(true);
    }
  }, []);

  useEffect(() => {
    if (shouldApplyFilters) {
      applyFilters();
      setShouldApplyFilters(false);
    }
  }, [shouldApplyFilters]);

  const handleResetFilters = () => {
    setCustomerEntities([]);
    setSelectedTypes([]);
    setLicenseType([]);
    setStatus([]);
    setLicenseFrom("");
    setLicenseTo("");
    setDateFilterType("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setStartDate(null);
    setEndDate(null);
    resetFilters();
  };

  const customerEntityOptions = allCustomerEntities.map((entity) => ({
    value: entity.customer_entity,
    label: entity.customer_entity,
  }));

  const typeOptionsTransformed = type.map((entity) => ({
    value: entity.name,
    label: entity.name,
  }));

  const opportunityStatusOptions = [
     { value: "Done", label: "Done" },
    { value: "Approved", label: "Approved" },
    { value: "Decline", label: "Decline" },
    { value: "Won", label: "Won" },
    { value: "Lost", label: "Lost" },
  ];


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          zIndex: 9999,
        },
        content: {
          height: "50%",
          margin: "auto",
        },
      }}
    >
      <div className="filter-modal">
        <div className="flex flex-wrap">
          <Select
            isMulti
            options={customerEntityOptions}
            value={customerEntityOptions.filter((option) =>
              customerEntities.includes(option.value)
            )}
            onChange={(selectedOptions) =>
              setCustomerEntities(selectedOptions ? selectedOptions.map((option) => option.value) : [])
            }
            placeholder="Select Customer Entity"
            className="p-2 w-full md:w-1/4 rounded border border-gray-300 focus:outline-none focus:border-blue-500 ml-2 m-2"
          />

          <Select
            isMulti
            options={typeOptionsTransformed}
            value={typeOptionsTransformed.filter((option) =>
              selectedTypes.includes(option.value)
            )}
            onChange={(selectedOptions) =>
              setSelectedTypes(selectedOptions ? selectedOptions.map((option) => option.value) : [])
            }
            placeholder="Select OEM"
            className="p-2 w-full md:w-1/4 rounded border border-gray-300 focus:outline-none focus:border-blue-500 ml-2 m-2"
          />


          <Select
            isMulti
            options={opportunityStatusOptions}
            value={opportunityStatusOptions.filter((option) =>
              status.includes(option.value)
            )}
            onChange={(selectedOptions) =>
              setStatus(selectedOptions ? selectedOptions.map((option) => option.value) : [])
            }
            placeholder="Select Deal Status"
            className="p-2 w-full md:w-1/4 rounded border border-gray-300 focus:outline-none focus:border-blue-500 ml-2 m-2"
          />


          <div className="p-2 w-full md:w-1/4 rounded border border-gray-300 focus:outline-none focus:border-blue-500 ml-2 m-2">
            <label>Creation Date:</label>
            <input
              type="date"
              value={licenseFrom}
              onChange={(e) => setLicenseFrom(e.target.value)}
            />
          </div>

          <div className="p-2 w-full md:w-1/4 rounded border border-gray-300 focus:outline-none focus:border-blue-500 ml-2 m-2">
            <label>License To:</label>
            <input
              type="date"
              value={licenseTo}
              onChange={(e) => setLicenseTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2">
          <button
            onClick={() => {
              applyFilters();
              onClose();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            style={{ marginLeft: "10px" }}
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-red-500 text-white px-4 py-2 rounded"
            style={{ marginLeft: "10px" }}
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
