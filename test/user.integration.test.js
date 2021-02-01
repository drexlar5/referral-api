const express = require("express");
const bodyParser = require("body-parser");
const request = require("supertest");

const app = express();

const authRoute = require("../src/routes/user");

const mongoConn = require("../src/config/connection");

const User = require("../src/models/user");

app.use(bodyParser.json());
app.use("/api/v1", authRoute);

describe("Referral App Integration Test", () => {
  beforeAll(async () => {
    mongoConn
      .testConnection()
      .then(async () => {})
      .catch((err) => console.error("connection error", err));
  });

  afterAll(async () => {
    await User.deleteOne({ email: "johndoe@gmail.com" });
    await mongoConn.disconnectTest();
  });

  describe("User Integration Test", () => {
    const requestBody = {
      email: "johndoe@gmail.com",
      password: "1234",
    };

    describe("Create user Test", () => {
      beforeEach(async () => {
        await User.deleteOne({ email: "johndoe@gmail.com" });
      });

      it("should create a user", async (done) => {
        const { body } = await request(app)
          .post("/api/v1/register")
          .send(requestBody);

        expect(body).toBeObject();
        expect(body.error).toBeFalse();
        expect(body.message).toEqual("User created.");

        done();
      });
    });

    describe("Authenticate user Test", () => {
      it("should authenticate a user", async (done) => {
        const { body } = await request(app)
          .post("/api/v1/login")
          .send(requestBody);

        expect(body).toBeObject();
        expect(body.error).toBeFalse();
        expect(body.message).toEqual("User authenticated");
        expect(body.data).toBeString();
        expect(body.data).toStartWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");

        done();
      });
    });

    describe("Refer user Test", () => {
      it("should create a referral url", async (done) => {
        const { body } = await request(app)
          .post("/api/v1/login")
          .send(requestBody);

        request(app)
          .get("/api/v1/refer")
          .set("Authorization", `Bearer ${body?.data}`)
          .then((response) => {

            expect(response.body).toBeObject();
            expect(response.body.error).toBeFalse();
            expect(response.body.message).toEqual("Referral code created.");
            expect(response.body.data).toBeString();
            expect(response.body.data).toStartWith(
              "http://localhost:3001/register?code="
            );

            done();
          });
      });
    });
  });
});
