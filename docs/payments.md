# Payment Architecture & Provider Migration Note

## Overview
Lovewrit uses Razorpay for digital payment processing across regional currencies and automated webhooks.

## Historical Note on Payment Gateway Migration
Previously, earlier prototypes of Lovewrit utilized Stripe for checkout processing. The platform has since fully migrated to Razorpay (`razorpay` official SDK), replacing all Stripe checkout sessions, webhooks, and client-side scripts with Razorpay Orders API, client modal unboxing, and HMAC-SHA256 cryptographic verification.
