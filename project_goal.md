PROJECT GOAL — PERSONAL FINANCE, BUDGET & SUBSCRIPTION ANALYTICS

1. Project Purpose

Build a personal finance application where each user can record income, expenses, and recurring transactions, manage monthly and category-wise budgets, receive budget warnings, and view financial analytics.

This is a numbers-focused application. Correct calculations, data ownership, money precision, date boundaries, and recurring transaction safety are more important than adding unnecessary features.

2. Firm Scope

The application MUST include the following modules.

Authentication & User Management

Register

Login

Logout

JWT authentication

Protected routes

Profile/settings

Secure password handling

Strict user data ownership

A user must never access, edit, delete, aggregate, export, or otherwise view another user's financial data.

Categories

Provide useful default categories for income and expenses.

Examples:

Expense: Food, Travel, Entertainment, Home Expenses, Shopping, Health, Education, Bills & Utilities, Other

Income: Salary, Freelance, Gift, Other Income

Users must also be able to create their own categories, such as Grocery, Gym, or Pet Expenses.

Categories are user-owned. Custom categories from one user must never appear for another user.

Category management:

Create

View

Rename/update

Delete safely

Renaming or deleting a category must not silently corrupt historical transactions.

One-Time Transactions

Users can create:

One-time income

One-time expense

Transaction fields should support:

Type

Amount

Category

Date

Note (optional)

Payment mode

Users must be able to create, view, edit, and delete their own transactions.

Recurring Transactions

Use one recurring transaction system for both recurring income and recurring expenses.

Examples:

Monthly salary

Rent

EMI/home loan

ChatGPT subscription

YouTube Premium

Gym membership

Recurring transactions should support:

Income or expense type

Name/description

Amount

Existing or newly created category

Frequency

Start date

Due date/day

Active/paused status

Requirements:

Pause/resume recurring transactions

Generate actual transaction occurrences

Preserve historical amounts when future amounts change

Prevent duplicate occurrences when a job runs twice

Re-check paused/active status before execution

Handle month-end dates, such as the 31st in shorter months, using a documented rule

Budgets

Budgets and categories are separate concepts.

A category may exist without a budget.

Support:

Monthly overall budget

Optional category-wise monthly budgets

Budget usage calculation

Rules:

Budget amounts must be valid and positive

Prevent conflicting duplicate budgets for the same category/month

Handle months with no budget safely

Prevent divide-by-zero errors

Handle reducing a budget below already-spent money using a documented rule

Budget Alerts

Provide:

Near-limit warning

Budget exceeded alert

Alerts should work for:

Overall monthly budget

Category budgets

Analytics

The application must provide:

Total income

Total spending

Balance

Savings

Average spending

Top spending categories

Budget usage

Savings for the selected period:

Savings = Total Income - Total Expenses

This is calculated financial savings. Do NOT build a separate savings-account or savings-goal system unless the project scope is explicitly changed.

Support:

Daily analytics

Monthly analytics

Yearly analytics

Analytics must safely handle:

No transactions

Income with no expenses

Expenses with no income

Zero/divide-by-zero situations

Transaction Lists

Support:

Search

Filter

Sort

Pagination

Filters may include:

Transaction type

Category

Date range

Pagination and sorting inputs must be validated. Sorting must use an allowlist; arbitrary SQL column names must never be accepted.

Reports & CSV Export

Provide:

Monthly summary

Income summary

Expense summary

Savings summary

Category breakdown

Budget usage

CSV export must:

Use the same filtering rules as the transaction list/UI

Correctly escape commas, quotes, newlines, and Unicode

Stream very large exports instead of assembling the entire file in memory

3. Technical Principles

Money Precision

Never trust ordinary binary floating-point math for financial calculations.

Use either:

Integer smallest currency units, OR

A suitable database DECIMAL strategy

Server-side calculations are authoritative.

Validate and safely reject invalid values such as:

Zero or negative amounts where invalid

NaN-like input

Unsupported precision

Unsafe extremely large amounts

Data Ownership

Every protected database operation must enforce user ownership.

Never rely only on a client-provided user ID.

Database Aggregation

Calculate totals and analytics in the database where practical. Do not load every transaction into application memory just to build dashboards.

Recurring Idempotency

The same scheduled recurring occurrence must never be created twice because a scheduler runs twice or retries.

Use an appropriate unique occurrence/idempotency mechanism.

Date Boundaries

Define and consistently apply a timezone/business-date rule.

Reports and analytics must correctly handle:

Day boundaries

Month boundaries

Year boundaries

Leap years

Month-end dates

User/server timezone differences

Data Integrity

Use database transactions where multiple dependent writes must succeed or fail together.

A failed write must not leave partially created financial records.

4. Required Database Areas

The exact schema may evolve, but the project needs data structures for:

Users

Categories

Transactions

Budgets

Recurring transactions

Recurring occurrence/idempotency tracking

Alerts, if persistent alerts are implemented

Relationships and ownership must preserve referential integrity.

5. Important Edge Cases

The implementation must verify:

Authentication & Authorization

Missing, expired, malformed, or invalid tokens

Attempts to access another user's records by changing IDs

Input

Zero/negative amounts

Invalid numeric input

Excessive precision

Extremely large amounts

Unexpected transaction types/fields

Dates

Future-dated expenses according to the documented product rule

Different server/user timezones

Leap day

Month-end/year-end boundaries

Duplicate Requests

Double-clicking transaction creation

Client retries

Budgets

No budget exists

Zero/negative budget

Budget below amount already spent

Duplicate category budget for the same month

Recurring Transactions

Day 31 in a shorter month

Scheduler runs twice

Subscription paused after scheduling but before execution

Amount changes after historical occurrences

Categories

Category rename

Category deletion while transactions reference it

Analytics

No transactions

Income but no expenses

Expenses but no income

Refund/reversal handled through an explicit supported method

Lists & Queries

Search text containing %, _, quotes, emoji, or injection-like input

Invalid/negative pagination

Huge page limits

Unknown sort columns

Export

CSV with commas, quotes, newlines, and Unicode

Very large exports

Failure & Deletion

Database write failure after validation

Account deletion with financial history

Preserve referential integrity and document the deletion strategy

6. Explicitly Out of Scope

Do NOT add these unless the project scope is explicitly changed:

Investment portfolio tracking

Stock tracking

Cryptocurrency tracking

Bank account integration

Automatic bank transaction syncing

Payment gateway

Savings goals

Multiple bank account management

AI financial advisor

Complex financial forecasting

Multi-currency support

Avoid feature creep.

7. Development Rule for Antigravity

Before implementing any new feature, check this file and the project's master progress tracker.

Rules:

Do not add features outside this scope without explicit approval.

Do not skip a required feature because the UI appears complete.

Prefer simple, correct implementations over unnecessary complexity.

Financial calculations must remain correct and server-authoritative.

Security, ownership, validation, and edge cases are part of the feature—not optional polish.

When a feature is completed, update the master progress tracker accurately.

If a requirement is ambiguous, document the chosen product rule instead of silently guessing.

8. Definition of Project Success

The project is complete only when a user can:

Securely create and access their account.

Use default or custom categories.

Record one-time income and expenses.

Manage recurring income and recurring expenses safely.

Set overall and category-wise monthly budgets.

Receive meaningful budget warnings.

View correct daily, monthly, and yearly analytics.

See calculated savings as Income - Expenses.

Search, filter, sort, and paginate transactions.

Generate reports and correctly formatted CSV exports.

Trust that their data is private, calculations are accurate, and duplicate recurring charges are not created.

Core Principle

BUILD THE REQUIRED PERSONAL FINANCE SYSTEM COMPLETELY AND CORRECTLY.

DO NOT EXPAND THE PROJECT WITH UNREQUESTED FEATURES.
DO NOT SACRIFICE DATA CORRECTNESS FOR UI APPEARANCE.
DO NOT TREAT SECURITY, OWNERSHIP, VALIDATION, OR EDGE CASES AS OPTIONAL.
