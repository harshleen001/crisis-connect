# 🌍 CrisisConnect

**CrisisConnect** is a simple web platform to post or find help during emergencies. Users can offer/request support for food, shelter, medical aid, and more. Built with Node.js, Express, PostgreSQL, and EJS.

## 🔧 Features
- Post help offers or requests
- Filter by category (Food, Medical, Shelter, Others)
- Search by keyword
- “Near Me” geolocation-based help
- Location auto-fill
- SweetAlert confirmation on delete
- Clean responsive UI

## 🚀 Tech Stack
- Node.js + Express.js
- PostgreSQL
- EJS Templates + CSS
- Geolocation API + SweetAlert2

## 🛠️ Setup
1. Clone the repo  
   `git clone https://github.com/yourusername/crisis-connect.git`
2. Install dependencies  
   `npm install`
3. Set up PostgreSQL DB:  
   Create `crisis-connect` DB and run schema.
4. Add `.env`:
DB_USER=your_user
DB_PASSWORD=your_pass
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crisis-connect

yaml
Copy
Edit
5. Start:  
   `node index.js` → [http://localhost:3000](http://localhost:3000)

## 📄 Sample Posts
Use included `sample_data.sql` to populate test data.

---