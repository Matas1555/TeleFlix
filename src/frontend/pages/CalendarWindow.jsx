import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import { getUserEvents, getMovies, addEvent, deleteEvent, updateEvent } from "../../backend/controllers/calendarController";
import "../css/calendar.css";

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userEvents, setUserEvents] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchUserEvents();
      fetchMovies();
    }
  }, [selectedDate, currentUser]);

  const fetchUserEvents = async () => {
    try {
      const events = await getUserEvents(currentUser.email);
      console.log("Fetched user events:", events);
      setUserEvents(events);
    } catch (error) {
      console.error("Error fetching user's events:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const moviesList = await getMovies();
      console.log("Fetched movies:", moviesList);
      setMovies(moviesList);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleAddEvent = async (date, movieId) => {
    if (movieId) {
      const event = { userId: currentUser.email, date: new Date(date).toISOString(), movieId };
      const newEvent = await addEvent(event);
      setUserEvents([...userEvents, newEvent]);
    }
  };

  const handleEditEvent = async (event, movieId) => {
    if (movieId) {
      const updatedEvent = await updateEvent(event.id, { ...event, movieId });
      setUserEvents(userEvents.map(evt => evt.id === event.id ? updatedEvent : evt));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (confirmed) {
      const success = await deleteEvent(eventId);
      if (success) {
        setUserEvents(userEvents.filter(event => event.id !== eventId));
      }
    }
  };

  const openModal = (date, currentMovieId = null) => {
  console.log("Opening modal for date:", date);
  setEventDate(date);
  setSelectedMovie(currentMovieId);
  setIsModalOpen(true);
  console.log("Modal state after opening:", isModalOpen); // Log the modal state
};

  const closeModal = () => {
    setIsModalOpen(false);
    setEventDate(null);
    setSelectedMovie(null);
  };

  const handleMovieSelect = (event) => {
    setSelectedMovie(event.target.value);
  };

  const handleSaveEvent = () => {
    if (eventDate && selectedMovie) {
      const movie = movies.find(movie => movie.name === selectedMovie);
      const movieId = movie.id;
      const eventsForDay = userEvents.filter(event => event.date.split('T')[0] === eventDate);
      if (eventsForDay.length > 0) {
        handleEditEvent(eventsForDay[0], movieId);
      } else {
        handleAddEvent(eventDate, movieId);
      }
      closeModal();
    }
  };

  const selectDate = (day) => {
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    console.log("Selected date:", selectedDay);
    const eventsForDay = userEvents.filter(event => event.date.split('T')[0] === selectedDay);
    if (eventsForDay.length > 0) {
      openModal(selectedDay, eventsForDay[0].movieId);
    } else {
      openModal(selectedDay);
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
          const eventDay = new Date(year, month, dayCount).toISOString().split('T')[0];
          const hasEvent = userEvents.some(event => event.date.split('T')[0] === eventDay);
          const event = userEvents.find(event => event.date.split('T')[0] === eventDay);
          weekCells.push(
  <td key={`${year}-${month}-${dayCount}`} className={`day ${hasEvent ? 'event-day' : ''}`} onClick={() => selectDate(dayCount)}>
    <span className={hasEvent ? 'event-link' : ''}>
      {dayCount}
      {hasEvent && (
        <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}>
          &times;
        </button>
      )}
    </span>
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
      <div className="calendar-grid">{renderCalendar()}</div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select a Movie</h3>
            <select value={selectedMovie || ''} onChange={handleMovieSelect}>
              <option value="" disabled>Select a movie</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.name}>{movie.name}</option>
              ))}
            </select>
            <button onClick={handleSaveEvent}>Save</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
