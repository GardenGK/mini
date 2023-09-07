const http = require("http");
const express = require("express");
const { DataSource } = require("typeorm");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");

dotenv.config();

require("dotenv").config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

const myDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json

app.get("/", async (req, res) => {
  try {
    return res.status(200).json({ message: "Welcome to jungyeon's server!" });
  } catch (err) {
    console.log(err);
  }
});

//1. API 로 users 화면에 보여주기
app.get("/users", async (req, res) => {
  try {
    const userData = await myDataSource.query(
      `SELECT id, name, email FROM users`
    );

    // console 출력
    console.log("USER DATA :", userData);

    // FRONT 전달

    return res.status(200).json({
      users: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }
});
//2. users 생성

app.post("/users/signUp", async (req, res) => {
  try {
    // 1. user 정보를 frontend로부터 받는다. (프론트가 사용자 정보를 가지고, 요청을 보낸다)
    const me = req.body;
    const { name, password, email } = me;

    // 2. user 정보 console.log로 확인 한 번!
    console.log("ME: ", me);

    // 3. DATABASE 정보 저장.

    // email, name, password가 다 입력되지 않은 경우
    if (email === undefined || name === null || password === undefined) {
      const error = new Error("KEY_ERROR1");
      error.statusCode = 400;
      throw error;
    }
    if (!email || !name || !password) {
      const error = new Error("KEY_ERROR2");
      error.statusCode = 400;
      throw error;
    }

    // (필수) 비밀번호가 너무 짧을 때
    if (password.length < 8) {
      const error = new Error("INVALID_PASSWORD");
      error.statusCode = 400;
      throw error;
    }

    // (심화, 진행) 이메일이 중복되어 이미 가입한 경우
    // 1. 유저가 입력한 Email인 'shlee@wecode.co.kr'이 이미 우리 DB에 있는지 확인한다.

    const existingUser = await myDataSource.query(`
    SELECT id, email FROM users WHERE email='${email}';
  `);

    console.log("existing user: ", existingUser);

    // 2. 있으면, 즉, 중복이면 아래 if문 실행
    //
    if (existingUser.length > 0) {
      // existing user 이용해서 판별`
      const error = new Error("DUPLICATED_EMAIL_ADDRESS");
      error.statusCode = 400;
      throw error;
    }

    const userData = await myDataSource.query(`
      INSERT INTO users (
        name, 
        password,
        email
      )
      VALUES (
        '${name}',
        '${password}', 
        '${email}'
      )
    `);

    // 4. DB data 저장 여부 확인
    console.log("inserted user id", userData.insertId);

    // 5. send response to FRONTEND
    return res.status(201).json({
      message: "userCreated",
    });
  } catch (err) {
    console.log(err);
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }
});

// 과제 3 DELETE
// 가장 마지막 user를 삭제하는 엔드포인트
app.delete("/users", async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
});

// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.

app.put("/users/1", async (req, res) => {
  try {
    const newName = req.body.data.name;
  } catch (err) {
    console.log(err);
  }
});
/*
//로그인 
app.post('/users/login',async(req,res)=>{
  try{
    // 1. user 정보를 frontend로부터 받는다. (프론트가 사용자 정보를 가지고, 요청을 보낸다) 
    const me = req.body
    const {name,password,email} = me;

    // 2. user 정보 console.log로 확인 한 번!
    console.log("ME: ", me)
    const userData = await myDataSource.query(`SELECT id, name, email FROM users`)

    // console 출력

    console.log("USER DATA :", userData)

    // FRONT 전달

    return res.status(200).json({
      "users": userData

  }
}

  catch(err){
    console.log(err)
  }
})
*/
const server = http.createServer(app); // express app 으로 서버를 만듭니다.

const start = async () => {
  // 서버를 시작하는 함수입니다.
  try {
    server.listen(8001, () => console.log(`Server is listening on 8001`));
  } catch (err) {
    console.error(err);
  }
};

myDataSource.initialize().then(() => {
  console.log("Data Source has been initialized!!!!!");
});

start();
