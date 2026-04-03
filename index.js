require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const contactRoutes = require("./routes/mail");
const chatRoutes = require("./routes/chat");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

connectDB();

// Routes
app.use("/api/mail", contactRoutes);
app.use("/api/chat", chatRoutes);

// start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});