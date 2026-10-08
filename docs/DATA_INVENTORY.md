# Lovewrit Data Inventory & Privacy Classification

This document provides a comprehensive inventory of all database tables, columns, stored attributes, privacy classifications (PII), retention periods, business purposes, and data association (Buyer vs. Guest).

---

## 1. Summary of Data Principles

- **Minimal Data Collection**: We only collect buyer and recipient details necessary to create, personalize, and deliver keepsake cards and pages.
- **Zero Third-Party Ad Profiling**: Buyer letters, notes, and photos are strictly private and never shared, sold, or processed for advertising.
- **Database Engine Portability**: All primary keys utilize globally unique CUID strings (`@default(cuid())`), avoiding database-specific autoincrement sequences. DateTime fields use standard ISO timestamps. JSON payloads are stored as UTF-8 text strings to maintain 100% compatibility across PostgreSQL, SQLite, and MySQL.

---

## 2. Table Inventories

### Table: `Order`
Main keepsake record tracking purchase, configuration, and fulfillment state.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | Permanent / Until Deleted | Unique row reference | System |
| `slug` | String | Public URL slug (e.g. `c/xyz`, `p/xyz`) | No | Permanent / Lifetime of gift | Public link access | Buyer |
| `customerEmail` | String | Buyer email address | **Yes** | 3 years / Account lifetime | Order receipts, access recovery | Buyer |
| `customerName` | String | Buyer full name | **Yes** | 3 years / Lifetime of gift | Receipt billing, display name | Buyer |
| `productType` | String | `"CARD"` or `"PAGE"` | No | Permanent | Product fulfillment routing | Buyer |
| `templateId` | String | Template identifier (e.g. `forever-valentine`) | No | Permanent | Render layout selection | Buyer |
| `tier` | String | `"SELF_SERVICE"`, `"CUSTOM"`, or `"RUSH"` | No | Permanent | Service level tracking | Buyer |
| `isBundle` | Boolean | Whether order includes Card + Page bundle | No | Permanent | Pricing / feature unlock | Buyer |
| `customNotes` | String? | Buyer instructions for Custom/Rush tiers | Potential | 1 year after delivery | White-glove concierge design | Buyer |
| `status` | String | `"PENDING"`, `"PAID"`, or `"FAILED"` | No | Permanent | Financial fulfillment state | Buyer |
| `founderStatus` | String | Concierge delivery status | No | Permanent | Operational queue state | Buyer |
| `founderAssignedLink` | String? | Staging or draft preview link | No | Until delivery | Concierge delivery workflow | Buyer |
| `adminToken` | String? | Moderation token for host/buyer | No | Lifetime of keepsake | Host guestbook moderation | Buyer |
| `currency` | String | Currency code (`INR`, `USD`, `EUR`, `GBP`) | No | 7 years (Tax/Accounting) | Financial accounting | Buyer |
| `amountTotal` | Int | Total charged in smallest unit (cents/paise) | No | 7 years (Tax/Accounting) | Financial accounting | Buyer |
| `region` | String | Billing region (`asia_africa`, `americas`, etc.) | No | 7 years | Pricing localization | Buyer |
| `razorpayOrderId` | String? | Razorpay order reference ID | No | 7 years | Gateway reconciliation | Buyer |
| `razorpayPaymentId` | String? | Razorpay payment capture ID | No | 7 years | Payment verification & audit | Buyer |
| `paymentProvider` | String | Payment gateway (`"razorpay"`, `"free"`) | No | 7 years | Reconciliation audit | Buyer |
| `ipAddress` | String? | Client IP address at order creation | **Yes** | 90 days | Anti-fraud & abuse mitigation | Buyer |
| `isAdSupported` | Boolean | Whether experience displays sponsored ads | No | Lifetime of gift | Monetization model flag | Buyer |
| `pinCode` | String? | Optional 4-6 digit numeric unlock PIN | No | Lifetime of gift | Private password protection | Buyer |
| `nickname` | String? | Pet name / endearing nickname | No | Lifetime of gift | Display customization | Buyer |
| `tipUpiId` | String? | Optional UPI VPA for recipient tips | **Yes** | Lifetime of gift | Direct gratuity affordance | Buyer |
| `tipPaypalUsername` | String? | Optional PayPal username for tips | **Yes** | Lifetime of gift | Direct gratuity affordance | Buyer |
| `referralCodeUsed` | String? | Referral code applied during checkout | No | Permanent | Discount attribution | Buyer |
| `myReferralCode` | String? | Unique referral code assigned to buyer | No | Permanent | Referral reward tracking | Buyer |
| `createdAt` | DateTime | Timestamp when order was placed | No | Permanent | Audit & chronological sorting | System |
| `updatedAt` | DateTime | Timestamp of last modification | No | Permanent | Cache invalidation & audit | System |

---

### Table: `CardData`
Personalization payload for greeting card format.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | Lifetime of card | Unique record reference | System |
| `orderId` | String | Foreign key to `Order.id` | No | Cascade with Order | Relationship mapping | System |
| `senderName` | String | Sender name printed on card | **Yes** | Lifetime of card | Card recipient greeting | Buyer |
| `recipientName` | String | Honored recipient name | **Yes** | Lifetime of card | Card recipient greeting | Buyer / Recipient |
| `occasion` | String | Occasion category (e.g. `anniversary`) | No | Lifetime of card | Theme & aesthetic styling | Buyer |
| `message` | String | Letter / sentiment text | Potential | Lifetime of card | Emotional card message | Buyer |
| `secondaryMessage` | String? | Bilingual / secondary translation | Potential | Lifetime of card | Dual-language greeting | Buyer |
| `photoUrl` | String | Primary card photo URL | **Yes** | Lifetime of card | Visual keepsake imagery | Buyer |
| `photoShape` | String | Framing shape (`oval`, `arch`, `circle`) | No | Lifetime of card | CSS layout styling | Buyer |
| `colorTheme` | String | Visual color scheme palette name | No | Lifetime of card | CSS styling | Buyer |
| `fontFamily` | String | Selected typography style | No | Lifetime of card | CSS typography styling | Buyer |
| `borderStyle` | String | Border aesthetic style name | No | Lifetime of card | CSS framing styling | Buyer |
| `stickersJson` | String? | Placed digital stickers coordinates | No | Lifetime of card | Decorative customization | Buyer |
| `isFlipReveal` | Boolean | Whether card unfolds with 3D flip | No | Lifetime of card | Animation reveal mode | Buyer |
| `location` | String? | Event city or memory landmark | Potential | Lifetime of card | Sentiment personalization | Buyer |
| `venueName` | String? | Event or party venue name | No | Lifetime of card | Event invitation details | Buyer |
| `venueAddress` | String? | Event physical address | Potential | Lifetime of card | Navigation for guests | Buyer |
| `venueMapUrl` | String? | Google Maps hyperlink | No | Lifetime of card | Navigation for guests | Buyer |
| `voiceMessageUrl` | String? | Optional recorded audio memo URL | **Yes** | Lifetime of card | Audio keepsake note | Buyer |
| `revealAt` | DateTime? | Scheduled future unlock time | No | Until date passed | Scheduled delivery gate | Buyer |
| `showOmMotif` | Boolean | Religious emblem flag | No | Lifetime of card | Cultural motif display | Buyer |
| `showBismillah` | Boolean | Religious emblem flag | No | Lifetime of card | Cultural motif display | Buyer |
| `language` | String | Primary ISO language code | No | Lifetime of card | Language localization | Buyer |
| `secondaryLanguage` | String? | Secondary ISO language code | No | Lifetime of card | Language localization | Buyer |
| `createdAt` | DateTime | Creation timestamp | No | Permanent | Chronological ordering | System |

---

### Table: `PageData`
Personalization payload for interactive multimedia keepsake mini-website.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | Lifetime of page | Unique record reference | System |
| `orderId` | String | Foreign key to `Order.id` | No | Cascade with Order | Relationship mapping | System |
| `senderName` | String | Sender name | **Yes** | Lifetime of page | Unboxing reveal greeting | Buyer |
| `recipientName` | String | Recipient name | **Yes** | Lifetime of page | Dedication plaque greeting | Buyer / Recipient |
| `occasion` | String | Occasion category | No | Lifetime of page | Theme selection | Buyer |
| `letter` | String | Story / tribute letter text | Potential | Lifetime of page | Core emotional story text | Buyer |
| `photoUrls` | String (JSON) | Array of uploaded photo URLs | **Yes** | Lifetime of page | Photo gallery & collage | Buyer |
| `collageLayout` | String? | Layout style (`masonry`, `carousel`) | No | Lifetime of page | Photo gallery display | Buyer |
| `musicTrack` | String? | Selected soundtrack track URL | No | Lifetime of page | Background audio ambiance | Buyer |
| `musicType` | String? | `"builtin"` or `"custom"` | No | Lifetime of page | Audio player routing | Buyer |
| `isProposal` | Boolean | Interactive proposal reveal flag | No | Lifetime of page | Interactive reveal mechanics | Buyer |
| `proposalQuestion` | String? | Customized proposal question prompt | No | Lifetime of page | Interactive reveal mechanics | Buyer |
| `colorTheme` | String | Color palette name | No | Lifetime of page | Theme styling | Buyer |
| `fontFamily` | String | Typography selection | No | Lifetime of page | CSS typography styling | Buyer |
| `ambientEffect` | String? | Particle effect (`petals`, `stars`) | No | Lifetime of page | Visual scene effect | Buyer |
| `timelineJson` | String? | JSON milestone memories list | Potential | Lifetime of page | Interactive timeline scene | Buyer |
| `secretNotesJson` | String? | Tap-to-reveal secret notes JSON | Potential | Lifetime of page | Interactive hidden notes | Buyer |
| `milestoneVenue` | String? | Memory landmark text | Potential | Lifetime of page | Storytelling display | Buyer |
| `venueName` | String? | Event venue name | No | Lifetime of page | Event details scene | Buyer |
| `venueAddress` | String? | Event address | Potential | Lifetime of page | Event details scene | Buyer |
| `venueMapUrl` | String? | Google Maps hyperlink | No | Lifetime of page | Guest navigation | Buyer |
| `voiceMessageUrl` | String? | Voice recording URL | **Yes** | Lifetime of page | Personal audio recording | Buyer |
| `revealAt` | DateTime? | Scheduled unlock timestamp | No | Until date passed | Scheduled delivery gate | Buyer |
| `showOmMotif` | Boolean | Religious emblem flag | No | Lifetime of page | Cultural motif display | Buyer |
| `showBismillah` | Boolean | Religious emblem flag | No | Lifetime of page | Cultural motif display | Buyer |
| `isAdSupported` | Boolean | AdSense display flag | No | Lifetime of page | Monetization routing | Buyer |
| `requireGuestbookApproval` | Boolean | Pre-moderation gate flag | No | Lifetime of page | Guestbook security | Buyer |
| `language` | String | ISO language code | No | Lifetime of page | Localization | Buyer |
| `scenesJson` | String? | Custom SceneConfig JSON array | Potential | Lifetime of page | Scene Engine sequence data | Buyer |
| `sceneEngineEnabled` | Boolean | Scene Engine mode toggle | No | Lifetime of page | Architecture routing | Buyer |
| `createdAt` | DateTime | Creation timestamp | No | Permanent | Chronological sorting | System |

---

### Table: `GuestbookEntry`
Public or host-approved RSVP response and guest wish.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | Lifetime of page | Unique entry reference | System |
| `pageDataId` | String | Foreign key to `PageData.id` | No | Cascade with Page | Relationship mapping | System |
| `authorName` | String | Guest name (max 60 chars) | **Yes** | Lifetime of page | Public RSVP / blessing signature | Guest |
| `message` | String | Guest message (max 1500 chars) | Potential | Lifetime of page | Message on guestbook wall | Guest |
| `attendance` | String? | `"ATTENDING"`, `"REGRETS"`, etc. | No | Lifetime of page | Event headcount tally | Guest |
| `headcount` | Int | Attending party size (1-50) | No | Lifetime of page | Event headcount tally | Guest |
| `status` | String | `"PENDING"`, `"APPROVED"`, `"FLAGGED"` | No | Lifetime of page | Content moderation state | Host / Guest |
| `createdAt` | DateTime | Timestamp of guest RSVP | No | Permanent | Chronological order & rate limit | Guest |

---

### Table: `RecipientReaction`
Private or displayed reaction from the honored recipient or visitor.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | Lifetime of page | Unique reaction reference | System |
| `pageDataId` | String | Foreign key to `PageData.id` | No | Cascade with Page | Relationship mapping | System |
| `senderName` | String | Reaction author name | **Yes** | Lifetime of page | Display signature | Recipient / Guest |
| `reactionType` | String | `"text"`, `"voice"`, or `"emoji"` | No | Lifetime of page | Rendering format | Recipient / Guest |
| `message` | String? | Reaction note text | Potential | Lifetime of page | Recipient reply note | Recipient / Guest |
| `voiceUrl` | String? | Audio voice memo reply URL | **Yes** | Lifetime of page | Audio reply memo | Recipient / Guest |
| `createdAt` | DateTime | Timestamp of reaction | No | Permanent | Chronological sorting | Recipient / Guest |

---

### Table: `ReferralRecord`
Community referral tracking and discount balance.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | Lifetime of account | Unique record reference | System |
| `code` | String | Unique referral code (e.g. `LOVE20`) | No | Lifetime of account | Attribution lookup | Buyer |
| `ownerEmail` | String | Referral owner email address | **Yes** | Lifetime of account | Reward notification | Buyer |
| `ownerName` | String | Referral owner full name | **Yes** | Lifetime of account | Referral welcome banner | Buyer |
| `creditBalance` | Int | Earned store credit in paise/cents | No | Lifetime of account | Discount balance | Buyer |
| `timesUsed` | Int | Successful attribution count | No | Lifetime of account | Abuse monitoring & analytics | Buyer |
| `createdAt` | DateTime | Registration timestamp | No | Permanent | Chronological sorting | System |

---

### Table: `RateLimitEvent`
Security and anti-abuse event log.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary key identifier | No | 30 days | Unique event reference | System |
| `ipAddress` | String | Hashed / masked or normalized IP | **Yes** | 30 days (Rolling prune) | Rate limiting & abuse mitigation | Client |
| `email` | String? | Target email address | **Yes** | 30 days | Brute-force detection | Client |
| `action` | String | Rate limit action identifier | No | 30 days | Sliding window limit check | System |
| `allowed` | Boolean | Whether request was permitted | No | 30 days | Abuse detection | System |
| `reason` | String? | Rejection reason string | No | 30 days | Diagnostic auditing | System |
| `createdAt` | DateTime | Timestamp of event | No | 30 days | Sliding window expiration | System |

---

### Table: `PlatformSetting`
Internal system configuration and feature flags.

| Column | Type | Stored Content | PII? | Retention | Purpose | Association |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `key` | String | Setting key (e.g. `candle_count:slug`) | No | Permanent | System configuration | System |
| `value` | String | Serialized string or numeric count | No | Permanent | System configuration | System |
| `updatedAt` | DateTime | Last updated timestamp | No | Permanent | Operational audit | System |
