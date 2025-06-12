# buidaslab Engineering Assessment — Payment Service Abstraction

## Overview

You’re tasked with building a basic payment service abstraction that supports multiple payment providers (Paystack and Flutterwave) and persists transaction records to a database. This project simulates how we decouple logic for scalability and provider flexibility.

## Objective

Build a minimal but extendable service in TypeScript that can:

1. Accept basic payment initiation details.
2. Route the payment to the correct provider (via a strategy or abstraction pattern).
3. Log the transaction in the database.
4. (Optional but appreciated) Simulate verification logic.

---

## Requirements

- Use the provided starter template.
- Implement `Paystack` and `Flutterwave` services with mocked initiate and verify methods.
- Store transaction records in the database using Prisma.
- Include a reference ID and basic transaction status tracking (`pending`, `success`, `failed`).
- Demonstrate the ability to switch between providers cleanly.

---

## Tech Stack

- **Language:** TypeScript
- **ORM:** Yourchoice
- **Database:** Postgres
- **Execution:** Run with `npm run dev`

---

## What We'll Be Looking At

- Clean code structure & modularity
- Use of abstraction/strategy for provider logic
- How well database logic integrates with flow
- Type safety & error handling
- Analytical decisions and assumptions

---

## Bonus (Optional if time permits)

- Simulate verifying a transaction and updating the DB
- Introduce basic logging or error handling pattern

---

## Deliverable

- Keep it simple, structured, and production-minded.

## Docs

- Paystack: https://paystack.com/docs/api/transaction/#initialize
- Flutterwave:
  - Initialize Tx: https://developer.flutterwave.com/reference/checkout
  - Verify Tx: https://developer.flutterwave.com/reference/verify-transaction-with-tx_ref
