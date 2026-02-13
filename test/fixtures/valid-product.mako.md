---
mako: "1.0"
type: product
entity: "Nike Air Max 90"
tokens: 280
language: en
updated: "2026-02-13"

actions:
  - name: add_to_cart
    description: "Add to cart"
    endpoint: /api/cart/add
    method: POST
    params:
      - name: product_id
        type: string
        required: true
        description: "Product ID"

links:
  internal:
    - url: /category/running
      context: "Browse running shoes"
  external:
    - url: https://nike.com/air-max-90
      context: "Official Nike page"
---

# Nike Air Max 90

Mid-range casual running shoe by Nike.

## Key Facts
- Price: 79.99 EUR
- Rating: 4.3/5 (234 reviews)
- Availability: In stock
- Sizes: 38-46

## Context
Direct competitors: Adidas Ultraboost (129 EUR), New Balance 1080 (139 EUR).
