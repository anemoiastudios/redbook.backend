const User = require("../models/user");
const UserController = require("../controllers/userController");
const md5 = require("md5");

jest.mock("../models/user");
jest.mock("md5");


describe("userController", () => {

	describe("getAllUsers", () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

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
		afterEach(() => {
			jest.clearAllMocks();
		});

		it("should return user by username", async () => {
			const mockUser = { username: "johndoe", email: "johndoe@example.com" };
			User.findOne.mockResolvedValueOnce(mockUser);

			const req = { params: { username: "johndoe" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

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
		afterEach(() => {
			jest.clearAllMocks();
		});

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

	describe('updateUserByUsername', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should update a user', async () => {
			const mockUser = { username: 'johndoe', email: 'johndoe@example.com', bio: 'Old bio' };
			const updatedUser = { ...mockUser, username: 'newUsername', bio: 'New bio' };

			User.findOne.mockResolvedValueOnce(mockUser);
			User.findOne.mockResolvedValueOnce(null, updatedUser); // Check for username conflict and update

			const req = {
				params: { username: 'johndoe' },
				body: { username: 'newUsername', bio: 'New bio' },
			};
			const res = { status: jest.fn(), json: jest.fn() };

			await UserController.updateUserByUsername(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

	});


	describe("deleteUserByUsername", () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it("should delete a user", async () => {
			const mockUser = { username: "johndoe", email: "johndoe@example.com" };
			User.findOneAndDelete.mockResolvedValueOnce(mockUser);

			const req = { params: { username: "johndoe" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.deleteUserByUsername(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("should return 404 for non-existent user", async () => {
			User.findOneAndDelete.mockResolvedValueOnce(null);

			const req = { params: { username: "invalid_username" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.deleteUserByUsername(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
		});

		it("should return 500 on error", async () => {
			const error = new Error("Server error");
			User.findOneAndDelete.mockRejectedValueOnce(error);

			const req = { params: { username: "johndoe" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await UserController.deleteUserByUsername(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Server error", error: error.message });
		});
	});

	describe('loginUser', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should login a user with valid credentials', async () => {
			const mockUser = { username: 'johndoe', password: md5('password') };
			const mockToken = 'fake-jwt-token';

			User.findOne.mockResolvedValueOnce(mockUser);
			// jwt.sign.mockReturnValueOnce(mockToken);

			const req = { body: { username: 'johndoe', password: 'password' } };
			const res = { status: jest.fn(), json: jest.fn() };

			await UserController.loginUser(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
		});

		it('should return 404 for non-existent user', async () => {
			User.findOne.mockResolvedValueOnce(null);

			const req = { body: { username: 'invalid_user', password: 'password' } };
			const res = { status: jest.fn(), json: jest.fn() };

			await UserController.loginUser(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "The user does not exist" });
		});

		it('should return 401 for invalid password', async () => {
			const mockUser = { username: 'johndoe', password: 'hashedPassword' };

			User.findOne.mockResolvedValueOnce(mockUser);
			md5.mockReturnValueOnce('invalid_hash'); // Replace md5 with your hashing function

			const req = { body: { username: 'johndoe', password: 'wrong_password' } };
			const res = { status: jest.fn(), json: jest.fn() };

			await UserController.loginUser(req, res);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({ message: "password error" });
		});
	});

});