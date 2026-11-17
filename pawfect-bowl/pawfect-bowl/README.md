# Pawfect Bowl — Product Case Study (APM Portfolio)

## 1. Problem
Urban pet parents in India distrust the ingredients in kibble and find DIY fresh feeding hard (what/how much?). Result: guilt, guesswork, overfeeding.

## 2. Target user & JTBD
**Persona:** Ananya, 29, Bengaluru, works in tech, treats her Labrador as family, spends ₹3–5k/month on food.
**JTBD:** "When I'm busy, help me feed my dog something fresh and right-sized so I feel confident I'm being a good pet parent."

## 3. Value proposition & differentiation
Personalised portions (calorie math, not generic scoops) + transparent ingredients + transparent pricing + subscription-style plans.

## 4. Goals & metrics
- **North Star:** Weekly delivered bowls per active dog.
- **Funnel:** Home → Dog profile → Meal selected → Checkout → Order (see `/metrics.html`).
- **Guardrails:** Refund rate, delivery on-time %, allergy-related complaints.
- **Business:** AOV, plan mix (7/14/30), 60-day repeat rate, CAC payback.

## 5. Key product decisions (and why)
| Decision | Rationale | Trade-off |
|---|---|---|
| Dog profile BEFORE menu | Personalisation = our differentiator; portion shown builds trust | Adds friction; measure drop-off at step 2 |
| 7/14/30-day plans with 0/5/10% discount | Pushes AOV and retention | Margin dilution; A/B test discount levels |
| Transparent price breakdown | Trust in a skeptical category | Exposes pricing to competitors |
| 3 proteins only at launch | Ops simplicity, lower waste | Limited choice; allergy coverage |

## 6. Prioritisation (RICE)
| Feature | Reach | Impact | Confidence | Effort | Score |
|---|---|---|---|---|---|
| Real payments (Razorpay) | 100% | 3 | 90% | 2 | 135 |
| Subscription pause/skip | 60% | 2 | 80% | 3 | 32 |
| Vet-approved allergy filter | 30% | 3 | 70% | 3 | 21 |
| Referral program | 40% | 2 | 50% | 2 | 20 |

## 7. Roadmap
- **Now (MVP):** build-a-meal, quote, test checkout, tracking, analytics funnel.
- **Next:** payments, auth, WhatsApp order updates, subscriptions.
- **Later:** vet consults, breed-based recommendations, retail/offline kitchens.

## 8. Experiments to run
1. Default plan 14 days vs 7 days → AOV vs conversion.
2. Show portion grams vs hide → checkout conversion.
3. Free first-meal sample → trial conversion & CAC.

## 9. Risks
Pet-nutrition claims (regulatory/medical), cold-chain logistics, allergy safety, CAC in a niche market.

## 10. Data model
`customers 1—N dogs`, `customers 1—N orders`, `orders N—1 meals`, `orders N—M add_ons (order_add_ons)`, `events` (session-level analytics). See `schema.sql`.

## Run
```
npm install && npm start   # http://localhost:3000 ; dashboard at /metrics.html
```
## API
`GET /api/catalog` · `POST /api/recommend` · `POST /api/quote` · `POST /api/orders` · `GET /api/orders/:id` · `POST /api/events` · `GET /api/metrics`

## Interview talking points
- Why calories-based portions are the wedge vs. competitors.
- How I'd read the funnel: biggest drop → hypothesis → experiment.
- What I cut from MVP and why (payments, auth, subscriptions).
