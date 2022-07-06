# HPAIR App Backend

## Documentation
[Link to Documentation](https://documenter.getpostman.com/view/14038453/UzBtnPSz)
[Link to Endpoint](https://hpair-app-backend.herokuapp.com/)

## Features
- []

## Dependencies
 - cors
 - dotenv
 - express
 - multer
 - jsonwebtoken
 - firebase-admin
 - morgan
 - salted-md5
 - uuid4

 ## Running


### Directions to install > 
```bash
npm install
```
- Create the Environment Variable File and define the variables
- Have the Firebase Private Key JSON file for Service Account and conver the content of the file into Base64 format
- Assign the Environment Variable GOOGLE_CONFIG_BASE64 with the Base64 format content of the Firebase Private Key JSON file
- Assign the respective Firestore collection names to FIREBASE_FRIEND_COLLECTION and FIREBASE_APPLICANT_COLLECTION
- Assign a Token Secret for Auth Token creation to TOKEN_SECRET

## Environment Variables
 - PORT
 - TOKEN_SECRET
 - GOOGLE_CONFIG_BASE64
 - FIREBASE_FRIEND_COLLECTION
 - FIREBASE_APPLICANT_COLLECTION
 - FIREBASE_ARTICLE_COLLECTION
 - STORAGE_BUCKET
 - SALT
 - BASE_URL


### Directions to execute

```bash
nodemon app.js
```
or

```bash
node app.js
```

<p align="center">
	Made with ❤
</p>