const {
  authenticateUser,
  createUser,
  getReferralUrl,
  getUserById,
} = require("../../src/services/user");

const mongoConnection = require("../../src/config/connection");

const User = require("../../src/models/user");

describe("Referral App Unit Test", () => {
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

  describe("User service unit Test", () => {
    beforeEach(async () => {
      await User.deleteMany({ __v: 0 });
    });

    async function getUser(num, referral_code = null) {
      const user = await createUser(
        {
          email: num == 0 ? "demo@gmail.com" : `demo${num}@gmail.com`,
          password: "1234",
        },
        { code: referral_code }
      );

      return {
        user,
      };
    }

    async function loginUser(email, password = "1234") {
      const user = await authenticateUser({
        email,
        password,
      });

      return {
        user,
      };
    }

    describe("Create user Test", () => {
      it("should create a user with no referral code", async (done) => {
        const { user: data } = await getUser(0);

        expect(data).toBeObject();
        expect(data.email).toMatch(data.email);
        expect(data.referral_code).toBeNull();
        expect(data.credit).toBe(0);
        expect(data.referral_count).toBe(0);
        expect(data.referred_users).toEqual(expect.arrayContaining([]));
        done();
      });

      it("should not credit the referrer if the referrer count is less than 5", async (done) => {
        const { user: referrer } = await getUser(0);
        const referral_url = await getReferralUrl(referrer._id);
        const referral_code = referral_url.split("=")[1];

        // Four (4) users registering using referral code
        const { user: user1 } = await getUser(1, referral_code);
        const { user: user2 } = await getUser(2, referral_code);
        const { user: user3 } = await getUser(3, referral_code);
        const { user: user4 } = await getUser(4, referral_code);

        const usersArray = [user1._id, user2._id, user3._id, user4._id];
        const updatedReferrer = await User.findOne({ email: "demo@gmail.com" });

        console.log("updatedReferrer:", updatedReferrer);

        expect(updatedReferrer).toBeObject();
        expect(updatedReferrer.referral_code).toMatch(referral_code);
        expect(updatedReferrer.credit).toBe(0);
        expect(updatedReferrer.credit).toEqual(referrer.credit);
        expect(updatedReferrer.referral_count).toBe(4);
        expect(updatedReferrer.referral_count).toBeGreaterThan(
          referrer.referral_count
        );
        expect(updatedReferrer.referred_users).toEqual(
          expect.arrayContaining(usersArray)
        );
        done();
      });

      it("should credit the referrer if the referrer count is equal to 5", async (done) => {
        const { user: referrer } = await getUser(0);
        const referral_url = await getReferralUrl(referrer._id);
        const referral_code = referral_url.split("=")[1];

        // Five (5) users registering using referral code
        const { user: user1 } = await getUser(1, referral_code);
        const { user: user2 } = await getUser(2, referral_code);
        const { user: user3 } = await getUser(3, referral_code);
        const { user: user4 } = await getUser(4, referral_code);
        const { user: user5 } = await getUser(5, referral_code);

        const usersArray = [
          user1._id,
          user2._id,
          user3._id,
          user4._id,
          user5._id,
        ];
        const updatedReferrer = await User.findOne({ email: "demo@gmail.com" });

        expect(updatedReferrer).toBeObject();
        expect(updatedReferrer.referral_code).toMatch(referral_code);
        expect(updatedReferrer.credit).toBe(10);
        expect(updatedReferrer.credit).toBeGreaterThan(referrer.credit);
        expect(updatedReferrer.referral_count).toBe(5);
        expect(updatedReferrer.referral_count).toBeGreaterThan(
          referrer.referral_count
        );
        expect(updatedReferrer.referred_users).toEqual(
          expect.arrayContaining(usersArray)
        );
        done();
      });

      it("should not credit the referrer if the referrer count is more than 5 and not a multiple of 5", async (done) => {
        const { user: referrer } = await getUser(0);
        const referral_url = await getReferralUrl(referrer._id);
        const referral_code = referral_url.split("=")[1];

        // Five (5) users registering using referral code
        const { user: user1 } = await getUser(1, referral_code);
        const { user: user2 } = await getUser(2, referral_code);
        const { user: user3 } = await getUser(3, referral_code);
        const { user: user4 } = await getUser(4, referral_code);
        const { user: user5 } = await getUser(5, referral_code);

        const updatedReferrer1 = await User.findOne({
          email: "demo@gmail.com",
        });

        // Additional two (2) users registering using referral code
        // to make a total of seven (7) referred users
        const { user: user6 } = await getUser(6, referral_code);
        const { user: user7 } = await getUser(7, referral_code);

        const usersArray = [
          user1._id,
          user2._id,
          user3._id,
          user4._id,
          user5._id,
          user6._id,
          user7._id,
        ];
        const updatedReferrer2 = await User.findOne({
          email: "demo@gmail.com",
        });

        expect(updatedReferrer2).toBeObject();
        expect(updatedReferrer2.referral_code).toMatch(referral_code);
        expect(referrer.credit).toBe(0);
        expect(updatedReferrer2.credit).toBe(10);
        expect(updatedReferrer2.credit).toEqual(updatedReferrer1.credit);
        expect(updatedReferrer2.referral_count).toBe(7);
        expect(updatedReferrer2.referral_count).toBeGreaterThan(
          referrer.referral_count
        );
        expect(updatedReferrer2.referral_count).toBeGreaterThan(
          updatedReferrer1.referral_count
        );
        expect(updatedReferrer2.referred_users).toEqual(
          expect.arrayContaining(usersArray)
        );
        done();
      });

      it("should throw an error if user is already registered", async (done) => {
        try {
          await getUser(0);
          await getUser(0);
        } catch (err) {
          expect(err.message).toMatch("User already exists.");
          expect(err.statusCode).toBe(401);
        }
        done();
      });
    });

    describe("Authenticate user Test", () => {
      it("should authenticate a user", async (done) => {
        await getUser(0);
        const { user: data } = await loginUser("demo@gmail.com");

        expect(data).toBeString();
        expect(data).toStartWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
        done();
      });

      it("should throw an error if user is not registered", async (done) => {
        try {
          await loginUser("janedoe@yahoo.com");
        } catch (err) {
          expect(err.message).toMatch("User does not exist.");
          expect(err.statusCode).toBe(401);
        }
        done();
      });

      it("should throw an error if user passes wrong password", async (done) => {
        try {
          await getUser(0);
          await loginUser("demo@gmail.com", "12345");
        } catch (err) {
          expect(err.message).toMatch("Wrong password.");
          expect(err.statusCode).toBe(401);
        }
        done();
      });
    });

    describe("Refer user Test", () => {
      it("should create a referral url", async (done) => {
        const { user } = await getUser(0);
        const data = await getReferralUrl(user._id);

        expect(data).toBeString();
        expect(data).toStartWith("http://localhost:3001/register?code=");
        done();
      });

      it("should create a user with referral code", async (done) => {
        const { user } = await getUser(0);
        const referral_url = await getReferralUrl(user._id);
        const referral_code = referral_url.split("=")[1];
        const { user: data } = await getUser(1, referral_code);

        expect(data).toBeObject();
        expect(data.email).toMatch(data.email);
        expect(data.referral_code).toBeNull();
        expect(data.credit).toBe(10);
        expect(data.referral_count).toBe(0);
        expect(data.referred_users).toEqual(expect.arrayContaining([]));
        done();
      });

      it("should throw an error if wrong id is passed", async (done) => {
        try {
          await getReferralUrl("601604531619190112400001");
        } catch (err) {
          expect(err.message).toMatch("User does not exist.");
          expect(err.statusCode).toBe(401);
        }
        done();
      });

      it("should throw an error if the user wants to generate another referral token", async (done) => {
        const { user } = await getUser(0);

        try {
          await getReferralUrl(user._id);
        } catch (err) {
          expect(err.message).toMatch(
            "User has created a referal code already."
          );
          expect(err.statusCode).toBe(501);
        }
        done();
      });
    });

    describe("Get user Test", () => {
      it("should return a single user detail", async (done) => {
        const { user } = await getUser(0);
        const data = await getUserById(user._id);

        expect(data).toBeObject();
        expect(data).toContainKeys([
          "referral_code",
          "referral_count",
          "credit",
          "referred_users",
          "email",
        ]);
        expect(data.email).toMatch(data.email);
        expect(data.credit).toBeNumber();
        expect(data.referral_count).toBeNumber();
        expect(data.referred_users).toBeArray();
        done();
      });

      it("should throw an error if no user is found", async (done) => {
        try {
          await getUserById("601604531619190112400001");
        } catch (err) {
          expect(err.message).toMatch("User does not exist.");
          expect(err.statusCode).toBe(401);
        }
        done();
      });
    });
  });
});
