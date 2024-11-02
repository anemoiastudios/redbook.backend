const Notification = require("../models/notification");
const NotificationController = require("../controllers/notificationController");

jest.mock("../models/notification");

describe("notificationController", () => {

	describe("getNotifications", () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		// it("should return user's notifications", async () => {
		// 	const mockNotifications = [
		// 		new Notification({ userId: "user1", type: "mention", content: "You were mentioned in a post", link: "xyz" }),
		// 		new Notification({ userId: "user1", type: "follow_request", content: "user2 sent you a follow request", link: "xyz" }),
		// 	];
		// 	Notification.find.mockResolvedValueOnce(mockNotifications[0]);
		// 	Notification.find.mockResolvedValueOnce(mockNotifications[1]);

		// 	const req = { params: { userId: "user1" } };
		// 	const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

		// 	await NotificationController.getNotifications(req, res);

		// 	// expect(res.status).toHaveBeenCalledWith(200);
		// 	expect(res.json).toHaveBeenCalledWith(mockNotifications);
		// });

		it("should return 500 on error", async () => {

			const req = { params: { userId: "user1" } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await NotificationController.getNotifications(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
		});
	});

	describe("markAsRead", () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it("should mark a notification as read", async () => {
			const notificationId = "notificationId";
			Notification.findByIdAndUpdate.mockResolvedValueOnce({});

			const req = { params: { notificationId } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await NotificationController.markAsRead(req, res);

			expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(notificationId, { read: true });
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.json).toHaveBeenCalledWith({ message: "Notification read successfully" });
		});

		it("should return 500 on error", async () => {
			const notificationId = "notificationId";

			const req = { params: { notificationId } };
			const res = { json: jest.fn(), status: jest.fn().mockReturnValue({ json: jest.fn() }) };

			await NotificationController.markAsRead(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
		});
	});

});