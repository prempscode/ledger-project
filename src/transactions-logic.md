Here are the notes breaking down how backend banking transactions and ledger systems work, based on the video segment from 1:45:57 to 1:56:30.

## How Banking Transactions and Ledger Systems Work

### 1. Introduction to the Ledger

A **Ledger** acts as the core register for a bank. It is the single source of truth that maintains a precise history of every deposit and withdrawal to track and maintain user account balances securely.

### 2. Anatomy of a Transaction

When a user initiates a transfer (e.g., User A sends ₹100 to User B), the backend first creates a single transaction record. This record holds five key pieces of data:

* **From Account:** The sender's account (User A).
* **To Account:** The receiver's account (User B).
* **Amount:** The exact sum being transferred (₹100).
* **Idempotency Key:** A uniquely generated string (e.g., `xyz`) attached to the request.
* **Status:** The state of the transaction, which is initially marked as **Pending**.

### 3. The Two Ledger Entries

A single money transfer requires **two** separate ledger entries to account for the flow of money:

1. **Debit Entry (Sender):** A log indicating that ₹100 was deducted (debited) from User A's account.
2. **Credit Entry (Receiver):** A log indicating that ₹100 was added (credited) to User B's account.

### 4. Processing and Atomicity

* **Status Update:** Only *after* both the debit and credit ledger entries are successfully created is the transaction status updated from **Pending** to **Completed**.
* **The "All or Nothing" Rule:** All steps (creating the transaction, debiting, crediting, and updating status) must execute successfully. If a failure occurs midway—for example, the money is debited from User A but fails to credit User B—the system must revert the entire process so no money is lost in limbo.

### 5. Why the Idempotency Key is Crucial

Network drops often cause payment apps (like UPI) to freeze and automatically retry the same payment request.
The **Idempotency Key** is sent with the request to prevent double-charging. If the backend receives a new request but sees an idempotency key that already belongs to a pending or completed transaction, it ignores the duplicate request, ensuring the ₹100 is only deducted once.

### 6. Dynamically Calculating Balances

* **No Hardcoded Balances:** Banks generally do not store a static "current balance" number directly in a user's database profile, as this can easily become out of sync and cause massive inconsistencies.
* **Ledger-Derived Balance:** Instead, a user's balance is dynamically calculated directly from their ledger history using a straightforward formula:
> **Total Balance = (Sum of all Credited amounts) - (Sum of all Debited amounts)**


<!-- Visual view from the yt video : with respect to the video from 1:45:57 to 1:56:30 {https://youtu.be/NQOAQP0mow0?si=0NMEzUlspqfcWIsV} -->

## How Banking Transactions and Ledger Systems Work

### 1. Introduction to the Ledger

A **Ledger** acts as the core register for a bank. It is the single source of truth that maintains a precise history of every deposit and withdrawal to track and maintain user account balances securely.

### 2. Anatomy of a Transaction

When a user initiates a transfer (e.g., User A sends ₹100 to User B), the backend first creates a single transaction record. This record holds five key pieces of data:

* **From Account:** The sender's account (User A).
* **To Account:** The receiver's account (User B).
* **Amount:** The exact sum being transferred (₹100).
* **Idempotency Key:** A uniquely generated string (e.g., `xyz`) attached to the request.
* **Status:** The state of the transaction, which is initially marked as **Pending**.

### 3. The Two Ledger Entries

A single money transfer requires **two** separate ledger entries to account for the flow of money:

1. **Debit Entry (Sender):** A log indicating that ₹100 was deducted (debited) from User A's account.
2. **Credit Entry (Receiver):** A log indicating that ₹100 was added (credited) to User B's account.

### 4. Processing and Atomicity

* **Status Update:** Only *after* both the debit and credit ledger entries are successfully created is the transaction status updated from **Pending** to **Completed**.
* **The "All or Nothing" Rule:** All steps (creating the transaction, debiting, crediting, and updating status) must execute successfully. If a failure occurs midway—for example, the money is debited from User A but fails to credit User B—the system must revert the entire process so no money is lost in limbo.

### 5. Why the Idempotency Key is Crucial

Network drops often cause payment apps (like UPI) to freeze and automatically retry the same payment request.
The **Idempotency Key** is sent with the request to prevent double-charging. If the backend receives a new request but sees an idempotency key that already belongs to a pending or completed transaction, it ignores the duplicate request, ensuring the ₹100 is only deducted once.

### 6. Dynamically Calculating Balances

* **No Hardcoded Balances:** Banks generally do not store a static "current balance" number directly in a user's database profile, as this can easily become out of sync and cause massive inconsistencies.
* **Ledger-Derived Balance:** Instead, a user's balance is dynamically calculated directly from their ledger history using a straightforward formula:
> **Total Balance = (Sum of all Credited amounts) - (Sum of all Debited amounts)**