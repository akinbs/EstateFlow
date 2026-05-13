# Firestore Composite Index Requirements

## Overview

Currently the backend uses in-memory filtering for city, district, neighborhood, propertyType,
priceMin/Max, and rooms because Firestore requires explicit composite indexes for multi-field
queries. The fetch limit is capped at 500 documents (sufficient for MVP).

For production workloads, the queries below must be backed by Firestore composite indexes.

---

## Required Indexes — `properties` collection

### 1. Public listing page (most common query)

| Fields | Direction |
|--------|-----------|
| `status` | ASC |
| `listingType` | ASC |
| `createdAt` | DESC |

> Covers: `status == "active" AND listingType == "sale|rent" ORDER BY createdAt DESC`

### 2. Featured properties

| Fields | Direction |
|--------|-----------|
| `status` | ASC |
| `featured` | ASC |
| `createdAt` | DESC |

> Covers: `status == "active" AND featured == true ORDER BY createdAt DESC`

### 3. Price-sorted listing

| Fields | Direction |
|--------|-----------|
| `status` | ASC |
| `listingType` | ASC |
| `price` | ASC / DESC |

> Covers price_asc and price_desc sort orders.

### 4. Full compound query (production goal)

| Fields | Direction |
|--------|-----------|
| `status` | ASC |
| `listingType` | ASC |
| `city` | ASC |
| `propertyType` | ASC |
| `price` | ASC |
| `createdAt` | DESC |

> Move city/propertyType/price filters from in-memory to Firestore query layer.

---

## Required Indexes — `leads` collection

### 1. Admin lead list by status

| Fields | Direction |
|--------|-----------|
| `status` | ASC |
| `createdAt` | DESC |

### 2. Leads by property

| Fields | Direction |
|--------|-----------|
| `propertyId` | ASC |
| `createdAt` | DESC |

---

## How to create indexes

### Option A — Firebase Console
Firebase Console → Firestore Database → Indexes → Add Index

### Option B — `firestore.indexes.json` (recommended for CI/CD)

```json
{
  "indexes": [
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "listingType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "featured", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "leads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy with: `firebase deploy --only firestore:indexes`

---

## Migration path from in-memory to Firestore filters

When the properties collection exceeds ~500 docs, move these filters to Firestore:

1. Create the composite index above (Option B)
2. In `property_service.list_properties()`, add Firestore `.where()` calls for
   `city`, `district`, `propertyType`, and price range (requires range index)
3. Remove the corresponding in-memory filter blocks
4. Switch `_FETCH_LIMIT` to cursor-based pagination using `.start_after(last_doc)`
