import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';
import env from 'dotenv';
const app = express();
const port = 3000;

app.use(express.static('public'));

env.config();
// Setup view engine and form parser
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection
const db = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,  
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

// Start the server after DB is ready
db.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
        process.exit(1);
    });


//add update 
app.get('/add', (req, res) => {
    res.render('add');
});

// Handle form submission
app.post("/add", async (req, res) => {
    const { type, title, category, location, description, contact_name, contact_phone, password, latitude, longitude } = req.body;
    if (!type.trim() || !title.trim() || !category.trim() || !location.trim() || !description.trim() || !contact_name.trim() || !contact_phone.trim() || !latitude || !longitude || !password) {
        return res.status(400).send("Fields cannot be empty");
    }

    try {
        const result = await db.query(`
  INSERT INTO help_posts (type, title, category, location, description, contact_name, contact_phone, latitude, longitude,password)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10) RETURNING *
`, [type.trim(), title.trim(), category.trim(), location.trim(), description.trim(), contact_name.trim(), contact_phone.trim(), latitude, longitude, password]);
        console.log("Update added:", result.rows[0]);
        res.redirect('/');

    } catch (err) {
        console.error("Error saving update:", err);
        res.status(500).send("Error saving update");
    }
});

app.get('/', async (req, res) => {
    const category = req.query.category;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM help_posts WHERE 1=1';
    let values = [];
    let count = 1;

    if (category) {
        baseQuery += ` AND category = $${count++}`;
        values.push(category);
    }

    if (search) {
        baseQuery += ` AND (title ILIKE $${count} OR description ILIKE $${count})`;
        values.push(`%${search}%`);
        count++;
    }

    try {
        // Count total updates
        const countResult = await db.query(`SELECT COUNT(*) ${baseQuery}`, values);
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        // Get updates with LIMIT + OFFSET
        const dataQuery = `SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        const result = await db.query(dataQuery, values);

        const updates = result.rows.map(update => {
            const date = new Date(update.created_at);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formatted = date.toLocaleDateString('en-US', options);
            return { ...update, formattedDate: formatted };
        });

        res.render('index', {
            updates,
            selectedCategory: category || '',
            searchQuery: search || '',
            page,
            totalPages,
            isNearby: false
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading updates");
    }
});

app.post('/delete/:id', async (req, res) => {
    const postId = req.params.id;
    const enteredPassword = req.body.password;

    try {
        const result = await db.query('SELECT password FROM help_posts WHERE id = $1', [postId]);

        if (result.rows.length === 0) {
            return res.status(404).send("Post not found");
        }

        const savedPassword = result.rows[0].password;

        if (enteredPassword === savedPassword) {
            await db.query('DELETE FROM help_posts WHERE id = $1', [postId]);
            res.redirect('/');
        } else {
            res.status(403).send("Incorrect password. Cannot delete.");
        }
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).send("Error deleting post");
    }
});



app.get("/nearby", async (req, res) => {
    const userLat = parseFloat(req.query.lat);
    const userLon = parseFloat(req.query.lon);
    const radius = 10; // km

    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    try {
        // First
        const result = await db.query(`
      SELECT * FROM (
        SELECT *, 
          (6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )) AS distance
        FROM help_posts
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ) AS nearby_posts
      WHERE distance < $3
      ORDER BY distance ASC
      LIMIT $4 OFFSET $5
    `, [userLat, userLon, radius, limit, offset]);

        // pagination logic
        const countResult = await db.query(`
      SELECT COUNT(*) FROM (
        SELECT 
          (6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )) AS distance
        FROM help_posts
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ) AS distances
      WHERE distance < $3
    `, [userLat, userLon, radius]);

        const totalPosts = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalPosts / limit);
        const updates = result.rows.map(update => {
            const date = new Date(update.created_at);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formatted = date.toLocaleDateString('en-US', options);
            return { ...update, formattedDate: formatted };
        });
        res.render("index", {
            updates,
            selectedCategory: '',
            searchQuery: '',
            page,
            totalPages,
            isNearby: true
        });

    } catch (err) {
        console.error("Error fetching nearby posts:", err);
        res.status(500).send("Error fetching nearby posts");
    }
});
