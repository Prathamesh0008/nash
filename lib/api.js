const api = {
  async get(url) {
    console.log("API GET called:", url);

    // TEMP MOCK DATA
    return [
      {
        id: 1,
        senderId: "u_other",
        text: "Hello! This is a test message.",
        time: "10:30 AM",
      },
      {
        id: 2,
        senderId: "u_me",
        text: "Hi! This is my reply.",
        time: "10:32 AM",
      },
    ];
  },

  async post(url, body) {
    console.log("API POST called:", url, body);
    return body; // Echo back for testing
  },
};

export default api;
