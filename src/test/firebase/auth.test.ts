import * as auth from "firebase/auth";
import { Auth } from "firebase/auth";


jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

describe("Firebase Auth", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("login fails with wrong credentials", async () => {

    const mockedSignIn = auth.signInWithEmailAndPassword as jest.Mock;

    mockedSignIn.mockRejectedValue(
      new Error("Invalid credentials")
    );

    await expect(
      auth.signInWithEmailAndPassword({} as Auth, "a@test.com", "wrong")
    ).rejects.toThrow("Invalid credentials");

  });

});