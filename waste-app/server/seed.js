// Creates the first admin account: npm run seed

require("dotenv").config();

const dns = require("dns");
const mongoose = require("mongoose");
const User = require("./models/User");

// Force Node.js DNS resolver to use public DNS
dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

const mongoURI = process.env.MONGO_URI;

(async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log("MongoDB Atlas Connected Successfully");

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env"
            );
        }

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin already exists:", email);
        } else {
            await User.create({
                name: "City Admin",
                email: email,
                password: password,
                role: "admin"
            });

            console.log("Admin created successfully:", email);
        }

    } catch (error) {
        console.error("\nMongoDB connection/seeding error:");
        console.error(error.message);

    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("MongoDB connection closed.");
        }
    }
})();