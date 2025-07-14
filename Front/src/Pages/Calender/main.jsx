import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import API_BASE_URL from '../../config';
import 'react-calendar/dist/Calendar.css';
import './holiday.css'; // Import the CSS file for custom styles
import { AuthContext } from '../../context/AuthContext';
import { PiConfettiBold } from "react-icons/pi";
import { FaUmbrellaBeach } from "react-icons/fa";

const Main = () => {
  const [file, setFile] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [leave, setLeave] = useState([]);
  const [value, setValue] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState([]);

  const { currentUser } = useContext(AuthContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_BASE_URL}/api/Holiday/holiday`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${currentUser.accessToken}`
        }
      });
      fetchHolidays();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Holiday/holidays`, {
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`
        }
      });
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const fetchBirthdays = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Holiday/birthday`, {
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`
        }
      });
      setBirthdays(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/Holiday/leave`, {
        name: currentUser.name,
        surname: currentUser.surname,
        role: currentUser.role
      },{
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`
        }
      });
      setLeave(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchBirthdays();
    //fetchLeaves();
  }, []);

  const isHoliday = (date) => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getFullYear() === date.getFullYear() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getDate() === date.getDate()
      );
    });
  };

  const isBirthday = (date) => {
    return birthdays.some(birthday => {
      const birthdayDate = new Date(birthday.DOB);
      return (
        birthdayDate.getMonth() === date.getMonth() &&
        birthdayDate.getDate() === date.getDate()
      );
    });
  };

  const isLeave = (date) => {
    return leave.some(l => {
      const from = new Date(l.fromDate);
      const to = new Date(l.toDate);
      return date >= from && date <= to;
    });
  };

  const handleDateClick = (date) => {
    const holidayEvents = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getFullYear() === date.getFullYear() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getDate() === date.getDate()
      );
    });

    const birthdayEvents = birthdays.filter(birthday => {
      const birthdayDate = new Date(birthday.DOB);
      return (
        birthdayDate.getMonth() === date.getMonth() &&
        birthdayDate.getDate() === date.getDate()
      );
    });

    const leaveEvents = leave.filter(l => {
      const from = new Date(l.fromDate);
      const to = new Date(l.toDate);
      return date >= from && date <= to;
    });

    setSelectedEvents([...holidayEvents, ...birthdayEvents, ...leaveEvents]);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month' && isBirthday(date)) {
      return <PiConfettiBold style={{ color: 'green' }} />;
    }if (view === 'month' && isLeave(date)) {
      return <FaUmbrellaBeach />;
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (isHoliday(date)) {
        return 'holiday';
      }
      if (isBirthday(date)) {
        return 'birthday';
      }
      if (isLeave(date)) {
        return 'leave'; // Leaves in green
      }
    }
    return 'default';
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-semibold text-center">Techsa Calendar</h1>
      {currentUser.role === 'Admin' && (
        <div>
          <div className="file-upload">
            <input type="file" onChange={handleFileChange} />
          </div>
          <button onClick={handleFileUpload}>Upload File</button>
        </div>
      )}
      <Calendar
        onChange={setValue}
        value={value}
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        tileContent={tileContent}
      />
      {selectedEvents.length > 0 && (
        <div className="event-details">
          {selectedEvents.map((event, index) => (
            <div key={index}>
              <h2>
                {`${event.name} ${event.surname ? event.surname : ''}`}
              </h2>
              {event.DOB && <p><b>Birthday:</b> {new Date(event.DOB).toDateString()}</p>}
              {event.fromDate && event.toDate && (
                <>
                  <p><b>Leave:</b> {new Date(event.fromDate).toDateString()} - {new Date(event.toDate).toDateString()}</p>
                  <p><b>Description:</b> {event.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Main;
