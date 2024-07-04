# CodingChallengeNode

## Steps to setup the project ##

  1. Clone the repository on your local machine
  2. Install dependencies using the following command
     
     ```
        npm install
     ```
  3. Create a .env file in the root folder and add the following variables in it.

     ```
       DB_HOST=db_host
       DB_PORT=db_port
       DB_USER=postgres
       DB_PASSWORD="your_password"
       DB_NAME=user_data or your_own_database
       CSV_FILE_NAME=data-income-age-group.csv or upload the file in the file folder and type its name
     ```
  4. Run the application using the following command.

     ```
       nodemon server.js
     ```
  5. The server is up and running on port 3000.
  6. Test the application using the following route.
     ```
       localhost:3000/api/csvToJson/
     ```
  7. The output will come in the console if the application is set up correctly.
     ```
       Age-Group % Distribution
       < 20: 25.45%
       20 to 40: 26.09%
       40 to 60: 25.02%
       > 60: 23.45%
     ```
