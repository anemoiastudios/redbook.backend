const User = require("../models/user");
const UserController = require("../controllers/userController");
const md5 = require("md5");

jest.mock("../models/user");
jest.mock("md5");

describe("userController", () => {
	describe("getAllUsers", () => {
		it("should return all users", async () => {
			const mockUsers = [
				{ username: "johndoe", email: "johndoe@example.com" },
				{ username: "janedoe", email: "janedoe@example.com" },
			];
			User.find.mockResolvedValueOnce(mockUsers);

			const req = {};
			const res = { json: jest.fn() };

			await UserController.getAllUsers(req, res);

			expect(res.json).toHaveBeenCalledWith(mockUsers);
		});

		it("should return 500 on error", async () => {
			const error = new Error("Server error");
			User.find.mockRejectedValueOnce(error);

			const req = {};
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.getAllUsers(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
		});
	});

	describe("getUserByUsername", () => {
		it("should return user by username", async () => {
			const mockUser = { username: "johndoe", email: "johndoe@example.com" };
			User.findOne.mockResolvedValueOnce(mockUser);

			const req = { params: { username: "johndoe" } };
			const res = { json: jest.fn() };

			await UserController.getUserByUsername(req, res);

			expect(res.json).toHaveBeenCalledWith(mockUser);
		});

		it("should return 404 for non-existent user", async () => {
			User.findOne.mockResolvedValueOnce(null);

			const req = { params: { username: "invalid_username" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.getUserByUsername(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
		});

		it("should return 500 on error", async () => {
			const error = new Error("Server error");
			User.findOne.mockRejectedValueOnce(error);

			const req = { params: { username: "johndoe" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.getUserByUsername(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
		});
	});

	describe("createUser", () => {
		it("should create a new user", async () => {
			const mockUser = new User({ username: "johndoe", email: "johndoe@example.com" });
			User.findOne.mockResolvedValueOnce(null);
			mockUser.save.mockResolvedValueOnce(mockUser);
			md5.mockReturnValueOnce("hashedPassword");

			const req = { body: { username: "johndoe", email: "johndoe@example.com", password: "password" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.createUser(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(md5).toHaveBeenCalledWith("password");
		});

		it("should return 400 for existing username", async () => {
			const mockUser = new User({ username: "johndoe", email: "johndoe@example.com" });
			User.findOne.mockResolvedValueOnce(mockUser);

			const req = { body: { username: "johndoe", email: "johndoe@example.com", password: "password" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.createUser(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: "The user name already exists" });
		});

		it("should return 500 on error", async () => {
			const error = new Error("Server error");
			User.findOne.mockRejectedValueOnce(error);

			const req = { body: { username: "johndoe", email: "johndoe@example.com", password: "password" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.createUser(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
		});
	});
});