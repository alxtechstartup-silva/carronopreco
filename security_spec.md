# Security Specification - Carro no Preço

## Data Invariants
1. A Vehicle must be owned by the user who created it (ownerId).
2. A Lead must reference a valid Vehicle (simulated since rules can't check other collections on create without `get`, but we'll enforce schema).
3. Users can only modify their own data in the `users` collection.
4. Analytics entries are write-only for public, read-only for admins.

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing**: Attempt to create a vehicle with an `ownerId` that isn't the logged-in user.
2. **Privilege Escalation**: Attempt to update a user's role to 'admin' from the client.
3. **Orphaned Lead**: Create a lead without a `vehicleInfo`.
4. **Lead Injection**: Attempt to read leads belonging to other consultants.
5. **Analytics Wipe**: Attempt to delete analytic logs.
6. **Vehicle Price Poisoning**: Setting a negative price or a string as a price.
7. **Cross-User Vehicle Edit**: User A trying to update User B's vehicle.
8. **Unverified Auth**: Attempting to write data with an unverified email (if enforced).
9. **Resource Exhaustion**: Sending a vehicle description larger than 5000 characters.
10. **ID Poisoning**: Using a path variable containing special characters or excessive length.
11. **State Bypassing**: Setting a lead status to 'closed' directly on creation.
12. **Metadata Tampering**: Overwriting `createdAt` with a backdated timestamp.

## Firestore Rules
(To be generated in /firestore.rules)
