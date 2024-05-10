import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import { getUserEvents } from "../../backend/controllers/calendarController";
import "../css/calendar.css";

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userEvents, setUserEvents] = useState([]);
  const { currentUser } = useAuth();
  useEffect(() => {
    // Fetch user's events from the database when the component mounts or selected date changes
    fetchUserEvents();
  });

  const fetchUserEvents = async () => {
    try {
      // Fetch user's events
      const events = await getUserEvents(currentUser); // Replace userId with actual user ID
      setUserEvents(events);
    } catch (error) {
      console.error("Error fetching user's events:", error);
    }
  };

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const monthName = (month) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(selectedDate.getFullYear(), month, 1));
  };

  const selectDate = (day) => {
    console.log("Selected Date:", new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const totalDaysInMonth = daysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarRows = [];

    // Header row with days of the week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
      <th key={index} className="day">{dayName}</th>
    ));
    calendarRows.push(<tr key="dayNames">{dayNames}</tr>);

    // Create rows for each week
    let dayCount = 1;
    while (dayCount <= totalDaysInMonth) {
      const weekCells = [];
      for (let i = 0; i < 7; i++) {
        if ((dayCount === 1 && i < firstDayOfMonth) || dayCount > totalDaysInMonth) {
          weekCells.push(<td key={i} className="day"></td>);
        } else {
          // Check if the current day has an event
          const eventDay = new Date(year, month, dayCount).toISOString().split('T')[0];
          
          const hasEvent = userEvents.some(event => event.date === eventDay);

          weekCells.push(
            <td key={dayCount} className={`day ${hasEvent ? 'event-day' : ''}`} onClick={() => selectDate(dayCount)}>
              <span className={hasEvent ? 'event-link' : ''}>{dayCount}</span>
            </td>
          );
          dayCount++;
        }
      }
      calendarRows.push(<tr key={dayCount}>{weekCells}</tr>);
    }

    return (
      <table className="calendar-grid">
        <tbody>
          {calendarRows}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <button onClick={prevMonth}>Previous Month</button>
        <h2>{monthName(selectedDate.getMonth())} {selectedDate.getFullYear()}</h2>
        <button onClick={nextMonth}>Next Month</button>
      </div>
      <div className="days">
        <div className="day1"></div>
        <div className="day2"></div>
        <div className="day3"></div>
        <div className="day4"></div>
        <div className="day5"></div>
        <div className="day6"></div>
        <div className="day7"></div>
      </div>
      <div className="calendar-grid">{renderCalendar()}</div>
    </div>
  );
}

export default Calendar;