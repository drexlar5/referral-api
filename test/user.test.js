const UserService = require("../src/services/user");

const mongoConn = require("../src/config/connection");

const User = require("../src/models/user");

describe("Referral App Unit Test", () => {
  beforeAll(async () => {
    mongoConn
      .testConnection()
      .then(async () => {})
      .catch((err) => console.error("connection error", err));
  });

  afterAll(async () => {
    await User.deleteOne({ email: "demo@gmail.com" });
    await User.deleteOne({ email: "janedoe@yahoo.com" });
    await mongoConn.disconnectTest();
  });

  describe("User service unit Test", () => {
    describe("Create user Test", () => {
      beforeEach(async () => {
        await User.deleteOne({ email: "demo@gmail.com" });
      });

      it("should create a user with no referral code", async (done) => {
        const data = await UserService.createUser({
          email: "demo@gmail.com",
          password: "1234",
        });
        
        expect(data).toBeString();
        expect(data).toMatch("User created successfully with credit balance of $0.");
        done();
      });

      it("should throw an error if user is already registered", async (done) => {
        try {
          await UserService.createUser({
            email: "demo@gmail.com",
            password: "1234",
          });
        } catch (err) {
          expect(err.message).toMatch('Email already exists.');
          expect(err.statusCode).toBe(401);
        }
        done();
      });
    });

    describe("Authenticate user Test", () => {
      it("should authenticate a user", async (done) => {
        const data = await UserService.authenticateUser({
          email: "demo@gmail.com",
          password: "1234",
        });

        expect(data).toBeString();
        expect(data).toStartWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
        done();
      });

      it("should throw an error if user is not registered", async (done) => {
        try {
          await UserService.authenticateUser({
            email: "janedoe@yahoo.com",
            password: "1234",
          });
        } catch (err) {
          expect(err.message).toMatch('User does not exist.');
          expect(err.statusCode).toBe(401);
        }
        done();
      });

      it("should throw an error if user passes wrong password", async (done) => {
        try {
          await UserService.authenticateUser({
            email: "demo@gmail.com",
            password: "12345",
          });
        } catch (err) {
          expect(err.message).toMatch('Wrong password.');
          expect(err.statusCode).toBe(401);
        }
        done();
      });
    });

    describe("Refer user Test", () => {
      it("should create a referral url", async (done) => {
        const user = await User.findOne({email: "demo@gmail.com"});
        const data = await UserService.getReferralCode(user._id);

        expect(data).toBeString();
        expect(data).toStartWith("http://localhost:3001/register?code=");
        done();
      });

      it("should create a user with referral code", async (done) => {        
        const user = await User.findOne({email: "demo@gmail.com"});
        const data = await UserService.createUser({
          email: "janedoe@yahoo.com",
          password: "1234",
        }, { code: user.referral_code });

        expect(data).toBeString();
        expect(data).toMatch("User created successfully with credit balance of $10.");
        done();
      });

      it("should throw an error if wrong id is passed", async (done) => {
        try {
          await UserService.getReferralCode('601604531619190112400001');
        } catch (err) {
          expect(err.message).toMatch('User does not exist.');
          expect(err.statusCode).toBe(401);
        }
        done();
      });
      
      it("should throw an error if the user wants to generate another referral token", async (done) => {
        const user = await User.findOne({email: "demo@gmail.com"});
        
        try {
          await UserService.getReferralCode(user._id);
        } catch (err) {
          expect(err.message).toMatch('User has created a referal code already.');
          expect(err.statusCode).toBe(501);
        }
        done();
      });
    });
  });
});