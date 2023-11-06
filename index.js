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
// Delete Multiple Images
app.post('/deleteImages', async (req, res) => {
    try {
        const { selectedImages } = req.body;
        const SelectImage = selectedImages.map(i => i.url.slice(9));

        let images = fs.readdirSync('./uploads'); // List all files in the 'uploads' folder

        // Filter out selected images
        images = images.filter(image => !SelectImage.includes(image));

        console.log("🚀 ~ file: index.js:41 ~ app.post ~ images:", images, "length:", images.length)

        for (const image of SelectImage) {
            const imagePath = `./uploads/${image}`;
            // Check if the file exists before attempting deletion
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Images deleted successfully' });
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

// app.post('/upload', async (req, res) => {
//     try {

//         const { name, description } = req.body;
//         // const image = req.files.image;
//         const file = req.files?.file;
//         let filePath = "";
//         // Save the file to the file system
//         if (file) {
//             filePath = `uploads/${file.name}`;
//             file.mv(filePath);

//         }
//         const newItem = new Item({
//             name,
//             description,
//             imagePath: filePath,
//         });

//         // Save the item to the database
//         await newItem.save();

//         res.status(201).json({
//             message: 'Image uploaded and item created successfully',
//             item: newItem,
//         });


//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

app.post('/upload', cors({
    origin: 'http://localhost:5173/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}), async (req, res) => {
    try {
        const { name, description } = req.body;
        const file = req.files?.file;
        let filePath = "";
        if (file) {
            filePath = `./uploads/${file.name}`;
            file.mv(filePath);
        }
        const newItem = new Item({
            name,
            description,
            imagePath: filePath,
        });

        await newItem.save();

        res.status(201).json({
            message: 'Image uploaded and item created successfully',
            item: newItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
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
app.get('/', (req, res) => {
    res("server is running")
})
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});