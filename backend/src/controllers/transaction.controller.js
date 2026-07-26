const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 11-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Create transaction (PENDING)
 * 5. Atomically debit sender balance
 * 6. Credit receiver balance
 * 7. Create DEBIT ledger entry
 * 8. Create CREDIT ledger entry
 * 9. Mark transaction COMPLETED
 * 10. Commit MongoDB transaction
 * 11. Send email
 */

async function createTransaction(req, res) {
  //1. Validate request

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  //  2. Validate idempotency key
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  // 3. Check account status
  // now we will check the status of accounts: here both the accounts sender and recievers account should be active
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  let transaction;
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    //4. Create transaction (PENDING)
    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    // 5. Atomically debit sender balance
    const updatedSender = await accountModel.findOneAndUpdate(
      {
        _id: fromAccount,
        balance: { $gte: amount },
      },
      {
        $inc: {
          balance: -amount,
        },
      },
      {
        session,
        new: true,
      },
    );

    if (!updatedSender) {
      throw new Error("Insufficient Balance");
    }

    // 6. Credit receiver balance
    await accountModel.findByIdAndUpdate(
      toAccount,
      {
        $inc: {
          balance: amount,
        },
      },
      { session },
    );

    // 7. Create DEBIT ledger entry
    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    // await (() => {
    //   return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    // })();

    // 8. Create CREDIT ledger entry
    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    // 9. Mark transaction COMPLETED
    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    // 10. Commit MongoDB transaction
    await session.commitTransaction();
  } catch (error) {
    // Roll back ANY partial writes from the session
    if (session) {
      await session.abortTransaction();
    }

    // Update the stuck transaction to FAILED so it's not PENDING forever
    if (transaction && transaction._id) {
      await transactionModel.findByIdAndUpdate(transaction._id, {
        status: "FAILED",
      });
    }
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // 11. Send email notification
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  const existing = await transactionModel.findOne({ idempotencyKey });

  if (existing) {
    if (existing.status === "COMPLETED") {
      return res.status(200).json({
        message: "Initial funds already processed",

        transaction: existing,
      });
    }
    if (existing.status === "PENDING") {
      return res
        .status(200)
        .json({ message: "Initial funds still processing" });
    }

    if (existing.status === "FAILED" || existing.status === "REVERSED") {
      return res.status(500).json({
        message: "Initial funds previously failed, please retry with a new key",
      });
    }
  }

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    // Credit the receiving account's balance
    await accountModel.findByIdAndUpdate(
      toAccount,
      {
        $inc: {
          balance: amount,
        },
      },
      { session },
    );

    // Debit the system funding account's balance
    await accountModel.findByIdAndUpdate(
      fromUserAccount._id,
      {
        $inc: {
          balance: -amount,
        },
      },
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Initial funds transaction failed, please retry",
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
