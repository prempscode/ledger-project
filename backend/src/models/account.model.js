const mongoose = require("mongoose");
const leger = require("../models/ledger.model");
const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account must be associated with a user"],
      // creating index so that when we search users it will be fast and optimized
      // indexing on mongo database works on : B+Tree data structure
      // MongoDB relies on a B+tree data structure via its default WiredTiger storage engine to handle indexing.
      // https://youtu.be/aZjYr87r1b8?si=9V10TLLu5JxmVt-R
      // Creates an index on the `user` field.
      // An index stores the field values in a sorted structure (B+ Tree),
      // allowing MongoDB to locate documents much faster than scanning
      // every document in the collection.
      //
      // Without index:
      //    Time Complexity ≈ O(n) (Collection Scan)
      //
      // With index:
      //    Time Complexity ≈ O(log n) (B+ Tree Search)
      //
      // Useful when we frequently search accounts by userId.
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE,FROZEN or CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required for creating an account !"],
      default: "INR",
    },
    balance: {
      type: Number,
      default: 5000,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1 }, { status: 1 });
// Creates a compound index on `user` and `status`.
//
// `1` means ascending order.
//
// MongoDB first sorts by `user`, then by `status`.
//
// This index is useful for queries like:
// Account.find({ user: userId, status: "ACTIVE" })
//
// It can also be used for queries on:
// ✔ user
// ✔ user + status
//
// But it cannot efficiently be used for queries only on:
// ✖ status
//
// MongoDB stores the index using a B+ Tree, allowing
// much faster lookups than scanning the entire collection.
// https://chatgpt.com/share/6a6320a8-cd84-83ee-8ae1-321b4a785823


const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
