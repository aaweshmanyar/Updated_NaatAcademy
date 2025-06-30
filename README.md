# Article API

This Node.js application connects to a GoDaddy cPanel MySQL database to fetch and manage article data.

## Setup

1. Create a `.env` file in the root directory with the following content:
```
DB_HOST=your_godaddy_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=3000
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

## API Endpoints

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/search?term=searchterm` - Search articles by title or content

## Database Configuration

Make sure to update the `.env` file with your GoDaddy cPanel MySQL database credentials:
- Get the host from your cPanel MySQL configuration
- Use your cPanel database username and password
- Specify the correct database name

## Error Handling

The API includes proper error handling and will return appropriate HTTP status codes:
- 200: Success
- 404: Article not found
- 500: Server error 