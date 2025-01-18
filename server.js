
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB Atlas
mongoose.connect('***************', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
    seedLocations(); // Seed locations when the server starts
})
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define schema for Bus Pass
const busPassSchema = new mongoose.Schema({
    name: String,
    email: String,
    validTill: Date,
    photo: String,  // Filename of the uploaded photo
    passType: String,
    route: String,
    collegeName: String,
    source: String,  // Added source field
    destination: String,  // Added destination field
    price: Number,  // Added price field
});

const BusPass = mongoose.model('BusPass', busPassSchema);

// Define schema for Locations (Source and Destination with distance)
const locationSchema = new mongoose.Schema({
    source: String,
    destination: String,
    distance: Number,
});

const Location = mongoose.model('Location', locationSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Route to create a new bus pass
app.post('/bus-pass', upload.single('photo'), async (req, res) => {
    try {
        const busPass = new BusPass({
            name: req.body.name,
            email: req.body.email,
            validTill: req.body.validTill,
            photo: req.file ? req.file.filename : null,
            passType: req.body.passType,
            route: req.body.route,
            collegeName: req.body.collegeName,
            source: req.body.source,
            destination: req.body.destination,
            price: req.body.price,
        });

        await busPass.save();
        res.status(201).json({ message: 'Bus pass created successfully', busPass });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to create bus pass', error: error.message });
    }
});

// Route to fetch available source and destination locations
app.get('/api/locations', async (req, res) => {
    try {
        const locations = await Location.find();  // Fetch all locations from database
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Failed to fetch locations', error: error.message });
    }
});

// Route to calculate price based on source and destination
app.get('/api/price', async (req, res) => {
    const { source, destination } = req.query;

    try {
        // Find all locations with the given source
        const locations = await Location.find({ source });

        // Filter locations to find one with the matching destination
        const matchedLocation = locations.find(location => location.destination === destination);

        if (matchedLocation) {
            // Calculate price based on distance (e.g., price = distance * 10)
            const price = matchedLocation.distance * 10;
            res.json({ price });
        } else {
            res.status(400).json({ error: 'Invalid source or destination' });
        }
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ message: 'Failed to calculate price', error: error.message });
    }
});

// Function to seed predefined locations
async function seedLocations() {
    const predefinedLocations = [
        { source: "Moulali", destination: "Ghatkesar", distance: 50 },
        { source: "Tarnaka", destination: "Uppal", distance: 10 },
        { source: "Uppal", destination: "Narapally", distance: 15 },
        { source: "Miyapur", destination: "Korremula", distance: 35 },
        { source: "Secunderabad", destination: "Uppal", distance: 20 },
        { source: "Narapally", destination: "Secunderabad", distance: 40 },
        { source: "Uppal", destination: "Moulali", distance: 10 },
        { source: "Malkajgiri", destination: "Medipally", distance: 15 },
        { source: "Lb Nagar", destination: "Narapally", distance: 35 },
        { source: "RTC X Roads", destination: "Secunderabad", distance: 20 },
        { source: "Tarnaka",destination: "Malkajgiri",distance:12},
        { source: "Tarnaka",destination: "Narapply",distance:25},
        { source: "Tarnaka",destination: "Lb Nagar",distance:18},
        { source: "Tarnaka",destination: "Korremula",distance:28},
        { source: "Uppal", destination: "Tank-Bund", distance: 30 },
        { source: "Uppal", destination: "Warangal", distance: 100 },
        { source: "Uppal", destination: "Secunderabad", distance: 35 },
        { source: "Uppal", destination: "RTC Colony", distance: 25 },
        { source: "Miyapur", destination: "Uppal", distance: 30 },
        { source: "Miyapur", destination: "Moulali", distance: 40 },
        { source: "Miyapur", destination: "HiTechCity", distance: 10 },
        { source: "Miyapur", destination: "Malkajgiri", distance: 40 },
        { source: "Secunderabad", destination: "Ramanthapur", distance: 29 },
        { source: "Secunderabad", destination: "ECIL", distance: 20 },
        { source: "Secunderabad", destination: "Tarnaka", distance: 8 },
        { source: "Secunderabad", destination: "Raidurgam", distance: 32 },
        { source: "Secunderabad", destination: "Korremula", distance: 40 },
        { source: "Narapally", destination: "Ecil", distance: 25 },
        { source: "Narapally", destination: "Uppal", distance: 10 },
        { source: "Narapally", destination: "Habsiguda", distance: 15 },
        { source: "Narapally", destination: "RTC Colony", distance: 23 },


    ];

    try {
        await Location.deleteMany({}); // Clear existing data
        await Location.insertMany(predefinedLocations); // Insert new data
        console.log('Locations seeded successfully');
    } catch (error) {
        console.error('Error seeding locations:', error);
    }
}

// Start the server
app.listen(5001, () => {
    console.log('Server is running on http://localhost:5001');
});
