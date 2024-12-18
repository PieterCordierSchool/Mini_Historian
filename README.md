
# Historian App

## Overview

The Historian App is a web application that allows users to save, retrieve, and visualize data. This README provides instructions for setting up the database and table required for the application.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js
- SQL Server (or any compatible database)

## Cloning the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone https://github.com/your-username/historian-app.git
cd historian-app
```

Replace `your-username` with your actual GitHub username or the URL to the repository.

## Database Setup

To set up the database and table for the Historian App, follow these steps:

### Step 1: Create the Database

1. Open SQL Server Management Studio (SSMS) or your preferred SQL client.
2. Connect to your SQL Server instance.
3. Run the following SQL command to create the database:

    ```sql
    CREATE DATABASE historian_db;
    ```

### After creating the database, switch to it by running:

    ```sql
    USE historian_db;
    ```

### Step 2: Create the `historian_data` Table

Execute the following SQL command to create the `historian_data` table:

    ```sql
    CREATE TABLE historian_data (
        ID NVARCHAR(50) PRIMARY KEY,
        tagname NVARCHAR(255) NOT NULL,
        quality INT NOT NULL,
        value FLOAT NOT NULL
    );
    ```

## Configuration

After setting up the database, you need to update the database connection configuration in the application.

1. Open the `server.js` file located in the `server` directory.
2. Locate the `config` object and update the `user`, `password`, and `server` fields with your SQL Server credentials:

    ```javascript
    const config = {
        user: 'YOUR_USERNAME',  // Update with your SQL Server username
        password: 'YOUR_PASSWORD',  // Update with your SQL Server password
        server: 'YOUR_SERVER',  // Update with your server name
        database: 'historian_db',
        options: {
            encrypt: true,
            trustServerCertificate: true,
        },
    };
    ```

## Running the Application

### Step 1: Install Dependencies

Navigate to the project directory in your terminal and install the required dependencies:

```bash

npm install cors express mssql @testing-library/jest-dom @testing-library/react @testing-library/user-event axios chart.js multer papaparse react react-chartjs-2 react-dom react-scripts react-table uuid web-vitals

```

### Step 2: Start the Server

Run the following command to start the server:

```bash
node server/server.js
```

The application will be running on [http://localhost:5000](http://localhost:5000).

## Conclusion

You are now ready to use the Historian App! If you encounter any issues, please refer to the documentation or seek help from the community.


