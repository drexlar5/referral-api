const express = require("express");
const bodyParser = require("body-parser");
const request = require("supertest");

const app = express();

const userRoute = require("../../src/routes/user");

const mongoConnection = require("../../src/config/connection");

const User = require("../../src/models/user");

app.use(bodyParser.json());
app.use("/api/v1", userRoute);

describe("Referral App Integration Test", () => {
  beforeAll(async () => {
    mongoConnection
      .testConnection()
      .then(async () => {})
      .catch((err) => console.error("connection error", err));
  });

  afterAll(async () => {
    try {
      await User.deleteMany({ __v: 0 });
      await mongoConnection.disconnectTest();
    } catch (error) {
      console.error("mongo error", error);
    }
  });

  describe("User Integration Test", () => {
    const requestBody = {
      email: "johndoe@gmail.com",
      password: "1234",
    };

    beforeEach(async () => {
      await User.deleteMany({ __v: 0 });
    });

    async function registerUser() {
      const { body } = await request(app)
        .post("/api/v1/register")
        .send(requestBody);

      return {
        body,
      };
    }

    async function loginUser() {
      const { body } = await request(app)
        .post("/api/v1/login")
        .send(requestBody);

      return {
        body,
      };
    }

    describe("Create user Test", () => {
      it("should create a user", async (done) => {
        const { body: responseBody } = await registerUser();

        expect(responseBody).toBeObject();
        expect(responseBody.error).toBeFalse();
        expect(responseBody.message).toEqual("User created.");

        done();
      });
    });

    describe("Authenticate user Test", () => {
      it("should authenticate a user", async (done) => {
        await registerUser();
        const { body: responseBody } = await loginUser();

        expect(responseBody).toBeObject();
        expect(responseBody.error).toBeFalse();
        expect(responseBody.message).toEqual("User authenticated");
        expect(responseBody.data).toBeString();
        expect(responseBody.data).toStartWith(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        );

        done();
      });
    });

    describe("Refer user Test", () => {
      it("should create a referral url", async (done) => {
        await registerUser();
        const { body } = await loginUser();

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

    describe("Get user Test", () => {
      it("should return user details", async (done) => {
        await registerUser();
        const { body } = await loginUser();

        request(app)
          .get(`/api/v1/user`)
          .set("Authorization", `Bearer ${body?.data}`)
          .then((response) => {
            expect(response.body).toBeObject();
            expect(response.body.error).toBeFalse();
            expect(response.body.message).toEqual("User details found.");
            expect(response.body.data).toBeObject();
            expect(response.body.data).toContainKeys([
              "referral_code",
              "referral_count",
              "credit",
              "referred_users",
              "email",
            ]);
            expect(response.body.data.email).toMatch(requestBody.email);
            expect(response.body.data.credit).toBeNumber();
            expect(response.body.data.referral_count).toBeNumber();
            expect(response.body.data.referred_users).toBeArray();

            done();
          });
      });
    });
  });
});
