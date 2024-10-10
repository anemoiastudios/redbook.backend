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

});