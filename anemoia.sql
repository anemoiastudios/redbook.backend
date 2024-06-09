/*
 Navicat Premium Data Transfer

 Source Server         : 121.40.116.145-epay
 Source Server Type    : MongoDB
 Source Server Version : 70008
 Source Host           : 121.40.116.145:27017
 Source Schema         : anemoia

 Target Server Type    : MongoDB
 Target Server Version : 70008
 File Encoding         : 65001

 Date: 06/06/2024 16:20:17
*/


// ----------------------------
// Collection structure for users
// ----------------------------
db.getCollection("users").drop();
db.createCollection("users");

// ----------------------------
// Documents of users
// ----------------------------
db.getCollection("users").insert([ {
    _id: "6647686d6af395d934525f6a",
    username: "Root",
    password: "Root",
    firstName: "John",
    lastName: "Doe",
    birthday: ISODate("1990-01-01T00:00:00.000Z"),
    email: "john.doe@example.com",
    createdAt: ISODate("2024-05-17T14:23:41.285Z")
} ]);
db.getCollection("users").insert([ {
    _id: "664874256af395d934525f75",
    username: "Hhhh",
    password: "uuuhA",
    firstName: "Alice",
    lastName: "Smith",
    birthday: ISODate("1995-06-15T00:00:00.000Z"),
    email: "alice.smith@example.com",
    createdAt: ISODate("2024-05-18T09:25:57.486Z")
} ]);
