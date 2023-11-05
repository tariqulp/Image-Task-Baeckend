const express = require('express');
const cors = require('cors'); // Import the cors
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors());
app.use(fileUpload());
app.use(express.json());


app.use(bodyParser.json());
app.use('/uploads', express.static(__dirname + '/uploads'));

// Import the database connection
require('./db');

// Define a Mongoose model for your data
const Item = require('./models/item');

// GET route to retrieve items
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

// POST route to create a new item
app.post('/items', async (req, res) => {
    const newItem = new Item(req.body);
    try {
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/upload', async (req, res) => {
    try {
        // if (!req.files || !req.files.image) {
        //     return res.status(400).json({ message: 'No file uploaded' });
        // }

        const { name, description } = req.body;
        // const image = req.files.image;
        const file = req.files?.file;
        let filePath = "";
        // Save the file to the file system
        if (file) {
            filePath = `uploads/${file.name}`;
            file.mv(filePath);

        }
        const newItem = new Item({
            name,
            description,
            imagePath: filePath,
        });

        // Save the item to the database
        await newItem.save();

        res.status(201).json({
            message: 'Image uploaded and item created successfully',
            item: newItem,
        });

        // // Generate a unique file path using a timestamp
        // const filePath = `uploads/${Date.now()}_${image.name}`;

        // // Move the uploaded image to the specified path
        // image.mv(filePath, async (err) => {
        //     if (err) {
        //         return res.status(500).json({ message: 'Error uploading file' });
        //     }

        //     // Create a new item with the image path and other details
        //     const newItem = new Item({
        //         name,
        //         description,
        //         imagePath: filePath,
        //     });

        //     // Save the item to the database
        //     await newItem.save();

        //     res.status(201).json({
        //         message: 'Image uploaded and item created successfully',
        //         item: newItem,
        //     });
        // });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/images', (req, res) => {
    const uploadPath = './uploads'; // Path to the 'uploads' folder
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading directory' });
        }
        // const imagePaths = files.map(file => `/uploads/${file}`);
        // res.json(imagePaths);
        const images = files.map((file, index) => ({
            id: index + 1,
            url: `/uploads/${file}`,
        }));

        res.json(images);
    });
    //res.json("imagePaths");
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});