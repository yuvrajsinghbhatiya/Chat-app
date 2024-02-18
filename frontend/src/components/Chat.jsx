import React, { useState, useEffect, useRef } from "react";
import { GoHome } from "react-icons/go";
import { IoMdSend } from "react-icons/io";
import PropTypes from "prop-types";
import io from "socket.io-client";

const socket = io.connect("https://whisper-backend-s3nd.onrender.com");

function Chat({ isDarkTheme, user }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("general");
  const [rooms, setRooms] = useState(["general"]);

  useEffect(() => {
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("roomList", (roomList) => {
      setRooms(roomList);
    });

    return () => {
      socket.off("message");
      socket.off("roomList");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === '') return;
    const newMessage = { text: message, user, timestamp: Date.now() };
    console.log('newMessage:', newMessage);
    socket.emit('sendMessage', { message: newMessage});
    setMessage('');
    setMessages(prevMessages => [...prevMessages, newMessage]); // Update messages state with the new message
  };

  useEffect(() => {
    fetch(`https://whisper-backend-s3nd.onrender.com/getMessages/${currentRoom}`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => console.error("Error fetching messages:", error));
  });

  const joinRoom = (room) => {
    socket.emit("joinRoom", room);
    setCurrentRoom(room);
  };

  const leaveRoom = (room) => {
    socket.emit("leaveRoom", room);
    setCurrentRoom("general");
  };

  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (message.startsWith("/join")) {
        const roomToJoin = message.split(" ")[1];
        joinRoom(roomToJoin);
      } else if (message === "/leave") {
        leaveRoom(currentRoom);
      } else {
        sendMessage();
      }
    }
  };

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  return (
    <div
      className={`w-screen flex ${
        isDarkTheme ? "bg-neutral-800 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-1/4 p-8 ${
          isDarkTheme
            ? "bg-neutral-800 text-white"
            : "bg-neutral-180 text-gray-700"
        }`}
      >
        {/* Sidebar content */}
        <h2 className="text-xl font-bold mb-2">ROOMS</h2>
        <ul className="space-y-4 mt-4">
          {rooms.map((room) => (
            <li
              key={room}
              className={`cursor-pointer ${
                room === currentRoom
                  ? "text-blue-500 font-bold"
                  : "text-neutral-700"
              }`}
              onClick={() =>
                room === currentRoom ? leaveRoom(room) : joinRoom(room)
              }
            >
              <span
                className={`flex items-center ${
                  isDarkTheme
                    ? "bg-neutral-700 text-white"
                    : "bg-gray-200 text-black"
                }  w-full p-2 rounded-lg `}
              >
                <GoHome className="mr-2" />
                {room}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Main chat area */}
      <div
        className={`w-full p-4 ${
          isDarkTheme
            ? "bg-neutral-700 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {/* Chat messages */}
        <div
          id="chat-box"
          ref={chatBoxRef} // Attach the ref to the chat messages container
          className={`flex-grow overflow-y-scroll ${
            isDarkTheme
              ? "bg-neutral-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          style={{ maxHeight: "calc(90vh - 8rem)", scrollbarWidth: "none" }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.user === user ? "justify-end" : "justify-start"
              } mb-2 mr-3`}
            >
              <div
                className={`px-4 py-2 rounded-xl ${
                  msg.user === user
                    ? isDarkTheme
                      ? "bg-teal-700 text-white message-right"
                      : "bg-blue-500 text-white message-right"
                    : isDarkTheme
                    ? "bg-neutral-800 text-white message-left"
                    : "bg-white text-gray-700 message-left"
                } ${msg.user !== user ? "ml-2 mt-2" : ""} max-w-md`}
              >
                <div className="flex flex-col ">
                  <div className="text-md font-medium">{msg.text}</div>
                  <div
                    className={`text-xxs text-neutral-400 mt-2 ml-6 text-right ${
                      index === 0 && msg.user === user ? "text-right" : ""
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                    <span className="ml-2">{msg.user}</span> {/* Display sender's username */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div
          className={`mt-4 mb-4 rounded-xl ${
            isDarkTheme ? "bg-neutral-800 text-white" : "bg-white text-gray-700"
          }`}
          style={{
            position: "fixed",
            bottom: 0,
            width: "75%",
            padding: "1rem",
          }}
        >
          <div className="flex justify-between">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={`flex-grow  rounded-xl p-2 focus:outline-none ${
                isDarkTheme
                  ? "bg-neutral-700 text-white "
                  : "border bg-gray-100 text-black"
              }`}
            />

            <button
              onClick={sendMessage}
              className={`${
                isDarkTheme
                  ? "bg-teal-700 text-white"
                  : "bg-blue-500 text-white"
              } rounded-full px-4 py-2  ml-4 text-md`}
            >
              <IoMdSend size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Chat.propTypes = {
  isDarkTheme: PropTypes.bool,
  user: PropTypes.string,
};

export default Chat;
