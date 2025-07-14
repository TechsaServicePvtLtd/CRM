import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
import axios from "axios";
import Select from "react-select";
import { AuthContext } from "../../context/AuthContext";

const  AddDeal = () => {
  const initialInputs = {
     customer_entity: "",
    Creation_Date: "",
    End_date: "",
    Description: "",
    OEM: "",
    Status: "",
  };

  const { currentUser } = useContext(AuthContext);

  const [inputs, setInputs] = useState(initialInputs);
  const [customerEntities, setCustomerEntities] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [newType, setNewType] = useState("");
  const [err, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerEntities = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Contact/customerentity`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.accessToken}`,
            },
          }
        );
        setCustomerEntities(response.data);
      } catch (error) {
        console.error("Error fetching customer entities:", error);
      }
    };

    const fetchTypeOptions = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Opportunity/product`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.accessToken}`,
            },
          }
        );
        setTypeOptions(response.data);
      } catch (error) {
        console.error("Error fetching type options:", error);
      }
    };

    fetchCustomerEntities();
    fetchTypeOptions();

    // Set current user's name and surname
    setInputs((prev) => ({
      ...prev,
      user_name: currentUser.name,
      user_surname: currentUser.surname,
    }));
  }, [currentUser]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));


  };


  const handleSelectChange = (selectedOption) => {
    setInputs((prev) => ({
      ...prev,
      customer_entity: selectedOption.value,
    }));
  
  };

  const handleNewTypeChange = (e) => {
    setNewType(e.target.value);
  };

  const handleAddType = () => {
    if (newType.trim() === "") return;

    setTypeOptions((prev) => [...prev, { id: newType, name: newType }]);
    setInputs((prev) => ({
      ...prev,
      type: newType,
    }));
    setNewType("");
    toast.success("New type added successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/Deal/addDeal`,
        inputs,
        {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        }
      );
      setInputs(initialInputs);
      toast.success("Deal Registered successfully");
      navigate("/Deal");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "An unexpected error occurred";
      setError(err.response);
      toast.error(errorMessage);
    }
  };

  const customerEntityOptions = customerEntities.map((entity) => ({
    value: entity.customer_entity,
    label: entity.customer_entity,
  }));

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Add Deal
        </h2>
      </div>
      <div className="mt-8 sm:w-full">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="customer_entity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name Of Customer Entity
                </label>
                <div className="mt-1">
                  <Select
                    options={customerEntityOptions}
                    onChange={handleSelectChange}
                    required
                    value={customerEntityOptions.find(
                      (option) => option.value === inputs.customer_entity
                    )}
                    placeholder="Select Customer Entity"
                    className="basic-single"
                    classNamePrefix="select"
                  />
                </div>
              </div>

          <div>
                <label
                  htmlFor="Creation_Date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deal Creation Time
                </label>
                <div className="mt-1 relative">
                  <input
                    type="date"
                    name="Creation_Date"
                    required
                    onChange={handleChange}
                    value={inputs.Creation_Date}
                    placeholder="Opportunity Closure Time"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>     

               <div>
                <label
                  htmlFor="End_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deal End Time
                </label>
                <div className="mt-1 relative">
                  <input
                    type="date"
                    name="End_date"
                    required
                    onChange={handleChange}
                    value={inputs.End_date}
                    placeholder="Opportunity Closure Time"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>     

              <div>
                <label
                  htmlFor="Description"
                  className="block text-sm font-medium text-gray-700"
                >
                 Description
                </label>
                <div className="mt-1 relative">
                  <textarea
                    type="text"
                    name="Description"
                    required
                    onChange={handleChange}
                    value={inputs.Description}
                    placeholder="Description"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="OEM"
                  className="block text-sm font-medium text-gray-700"
                >
                  OEM
                </label>
                <div className="mt-1 relative">
                  <select
                    name="OEM"
                    required
                    onChange={handleChange}
                    value={inputs.OEM}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="" disabled>
                      Select Option
                    </option>
                    {typeOptions.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M14.707 7.293a1 1 0 00-1.414 0L10 10.586 6.707 7.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-2 flex items-center">
                  <input
                    type="text"
                    value={newType}
                    onChange={handleNewTypeChange}
                    placeholder="Add new type"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddType}
                    className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="Status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deal Status
                </label>
                <div className="mt-1 relative">
                  <select
                    name="Status"
                    required
                    onChange={handleChange}
                    value={inputs.Status}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="" disabled>
                      Select Option
                    </option>
                      <option value="Done">Done</option>
                    <option value="Approved">Approved</option>
                    <option value="Decline">Decline</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                type="submit"
                className="group relative w-[100px] h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create
              </button>
              <Link to="/Deal">
                <button className="group relative w-[100px] h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Back
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDeal;