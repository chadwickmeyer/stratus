## Relationship Collections

This note describes a future Stratus feature for explicit parent-child relationship collections. It is motivated by Sitetheory live edit, but the concept should remain framework-level enough to support other selectors and derived collections.

### Problem

Some UI collections are not standalone API resources. They are relationships owned by a parent model and hydrated by a separate child collection endpoint.

Example from Sitetheory live edit:

- parent entity: `/Api/Landing/43235`
- relationship path: `version.modules`
- hydrated child endpoint: `/Api/Landing/43235/Module/Content`
- child target: `Content`

The parent model owns the selected module ids, priority, and saved relationship order. The child endpoint returns full module models used by the page preview. Today these are synchronized procedurally with selector events and local collection mutation. That bridge works, but it is fragile because filters, status rules, query options, and cache timing can make the two projections drift.

### Goal

Add an explicit relationship layer that lets a component declare:

```html
<sa-selector
    data-relationship-parent="Landing"
    data-relationship-parent-id="43235"
    data-relationship-path="version.modules"
    data-relationship-child="Content"
    data-relationship-source="/Api/Landing/43235/Module/Content">
</sa-selector>
```

Stratus should treat that as one logical relationship with two projections:

- membership projection: ids, priority, status, and other relationship metadata from the parent model path
- render projection: hydrated child `Model` instances ordered by the membership projection

### Design Direction

Keep canonical entity data in `Stratus.Catalog[target][id]` where possible. The relationship layer should not duplicate full child models as plain objects unless it is temporarily hydrating missing data.

Track relationship instances by an explicit key, not by guessing that two URLs are equivalent. A safe key should include:

- parent target
- parent id
- relationship path
- child target
- relevant API option signature, such as `forceContext`, `minStatus`, filters, sort, pagination, and hydration flags

The relationship store should provide methods similar to:

```typescript
registerRelationship(config)
hydrateMembership(parentModel)
hydrateChildren(collectionResponse)
getMembership()
getRenderCollection()
add(childModel)
remove(childId)
reorder(childIds)
updateChild(childId, data)
serializeForParentSave()
```

### Mutation Rules

Add, remove, reorder, and status changes should update one relationship store first. Components should observe the relationship store rather than manually patching unrelated arrays.

Saving should write the parent relationship payload when membership or order changes. Child-only edits should update the canonical child model and should not force a parent relationship save unless the relationship metadata changed.

### Non-Goals

Do not globally collapse every collection endpoint into a shared cache key. Different query options can represent legitimately different collections.

Do not infer relationships from URL shape alone. Live edit and selectors should opt in with explicit relationship metadata until Stratus has enough relationship schema knowledge to infer safely.

Do not require all child models to be fully hydrated before the relationship can render. Missing children can be represented by membership data and replaced when the child endpoint responds.

### Implementation Path

Start with explicit opt-in support for live-edit module selectors. Once stable, generalize the API for other selector-backed relationships.

Suggested phases:

- Phase 1: relationship registry and derived render collection for explicit configs
- Phase 2: selector integration for add, remove, reorder, status, and save serialization
- Phase 3: optional AngularJS bridge helpers for legacy Stratus consumers
- Phase 4: broader cache/query signature cleanup and test coverage
