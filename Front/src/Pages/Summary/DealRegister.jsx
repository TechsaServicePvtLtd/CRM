import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { Loader } from "../loader";
import { AuthContext } from "../../context/AuthContext";

const DealRegister = ({id}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    if (formattedDate.getTime() === new Date("1970-01-01T00:00:00Z").getTime()) {
      return "";
    }
    return formattedDate.toLocaleString("en-Uk", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "IST",
    });
  };
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (id) {
      
      const fetchOpportunities = async () => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/Deal/showOpportunityDeal`,
            { id },
            {
              headers: {
                Authorization: `Bearer ${currentUser.accessToken}`,
              },
            }
          );
          setUsers(response.data.products);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching opportunities:", err);
          setLoading(false);
        }
      };
  
      fetchOpportunities();
    }
  }, [id, currentUser]);
  



  return (
    <>
<div className="h-screen flex-1 p-7">
  <div>
    <h1 className="text-2xl font-semibold text-center">Deal Registered</h1>
  </div>

  <div>
    {loading ? (
      <Loader />
    ) : users.length === 0 ? (
      <div className="text-xl font text-center">Please add New Deals.</div>
    ) : (
      <div>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="table-auto" style={{ width: "100%",backgroundColor:"#ffff", border:"1px solid #000000" }}>
            <thead>
              <tr style={{ textAlign: "center",border:" solid #000000" }}>
                <th className="border px-4 py-2"  style={{ border:" solid #000000" }}>OEM</th>
                  <th className="border px-4 py-2" style={{ border:" solid #000000" }}>Description</th>
                <th className="border px-4 py-2" style={{ border:" solid #000000" }}>Creation Date</th>
                <th className="border px-4 py-2" style={{ border:" solid #000000" }}>Creation End</th>
                <th className="border px-4 py-2" style={{ border:" solid #000000" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) &&
                users.map((user) => (
                  <tr style={{ textAlign: "center",border:"solid #000000" }} key={user.id}>
                    <td className="border px-4 py-2" style={{ border:" solid #000000" }}>{user.OEM}</td>
                    <td className="border px-4 py-2" style={{ border:" solid #000000" }}>{user.Description}</td>
                    <td className="border px-4 py-2" style={{ border:" solid #000000" }}>{formatDate(user.Creation_Date)}</td>
                    <td className="border px-4 py-2" style={{ border:" solid #000000" }}>{formatDate(user.End_date)}</td>
                       <td className="border px-4 py-2" style={{ border:" solid #000000" }}>{user.Status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
</div>


 </>
  );  
};

export default DealRegister;
