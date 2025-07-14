import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdAddCircle } from "react-icons/io";
import TableDeal from "./tableDeal";

const Main = () => {
  const navigate = useNavigate();

  const handleAddClick = () => {
    const path = "/addDeal";
    navigate(path);
  };

  return (
    <>
    <div className="flex flex-col h-screen p-7">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-center">Deal Registration</h1>
      </div>
      <div className="flex justify-end mb-4">
      
        <IoMdAddCircle 
        size={40}
        onClick={handleAddClick}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <TableDeal />
      </div>
    </div>
    
     </>
  );
};

export default Main;
