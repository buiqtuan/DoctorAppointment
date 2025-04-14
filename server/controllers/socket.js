const { Server } = require("socket.io");

/**
 * Socket.io server instance with CORS enabled
 * Used for real-time communication between clients
 */
const io = new Server({
  cors: true,
});

// Maps to track connections between email addresses and socket IDs
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

// Handle client connections
io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);
  
  /**
   * Event handler for when a user joins a room
   * @param {Object} data - Contains email and room information
   * @param {string} data.email - User's email address
   * @param {string} data.room - Room identifier
   */
  socket.on("room:join", (data) => {
    const { email, room } = data;
    
    // Store the relationship between email and socket ID
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    
    // Notify everyone in the room that a new user joined
    io.to(room).emit("user:joined", { email, id: socket.id });
    
    // Add the socket to the room
    socket.join(room);
    
    // Confirm room join to the user
    io.to(socket.id).emit("room:join", data);
  });

  /**
   * Event handler for initiating a call to another user
   * @param {Object} payload - Contains recipient and offer information
   * @param {string} payload.to - Recipient's socket ID
   * @param {Object} payload.offer - WebRTC offer
   */
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  /**
   * Event handler for when a call is accepted
   * @param {Object} payload - Contains recipient and answer information
   * @param {string} payload.to - Recipient's socket ID
   * @param {Object} payload.ans - WebRTC answer
   */
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  /**
   * Event handler for WebRTC negotiation request
   * @param {Object} payload - Contains recipient and offer information
   * @param {string} payload.to - Recipient's socket ID
   * @param {Object} payload.offer - WebRTC offer for negotiation
   */
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  /**
   * Event handler for WebRTC negotiation completion
   * @param {Object} payload - Contains recipient and answer information
   * @param {string} payload.to - Recipient's socket ID
   * @param {Object} payload.ans - WebRTC negotiation answer
   */
  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  
  /**
   * Event handler for when a user disconnects
   * Cleanup could be added here to remove from maps
   */
  socket.on("disconnect", () => {
    // Remove user from tracking maps
    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
      socketIdToEmailMap.delete(socket.id);
      console.log(`Socket Disconnected: ${socket.id}, Email: ${email}`);
    }
  });
});

// Export the socket.io server instance
module.exports = io;
