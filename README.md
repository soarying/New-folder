Instruction:

please download or git clone the repository URL.

Create your .env file with:

PORT=8080 --- This is the port you want
DB_HOST=localhost --- your PostgreSQL hostname
DB_PORT=5432 --- postgreSQL port 
DB_USER=postgres --- the user name
DB_PASSWORD=1234567890 - passwords
DB_NAME=myDB_speer - database name 
ENCRYPT_ALGORITHM=aes-256-cbc -- This is my encrypt algorithm
ENCRYPT_SECRET=hZF6cTYDPRKYxD8E0v8NlFCt  -- the secret for encrypting
JWT_SECRET=5qb&H:!!9rm@k4+DKwrEYcGj<:iz_3kz.Z.%pVF-7HDJT,~nl::lnhver$/Gz|Dx~nbq-tP_V^CzJd&1t4XzCV@~N%=lJ<9m  --- this the jwt token secret.


 You can run "npm install --legacy-peer-deps", for I have some conflict with eslint, but nothing will affect running it.
 I usually use nodemon so your command would be "npm run devStart";\.
 I am using a third-party library called Sequelize for the database. It is a lightweight ORM for most SQL databases.
 I am using jest and supertest for the test code; you can run with "npm test"


I have deployed it to Render with https://new-folder-24xe.onrender.com. Feel free to test it.
My postman share is https://www.postman.com/restless-shuttle-4454/workspace/speer/request/10158969-b51ad4e1-c8db-4b56-b33e-4f6e7ff0b265?tab=auth , you can not send anything, but you can see the structure
