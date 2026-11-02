# Deployment Instructions

This source belongs to the existing Sites project `appgprj_6a68dab7877881919ef39b46aaed6c22` and should be deployed in place.

1. Install dependencies using the repository's existing CI/bootstrap scripts.
2. Keep `.openai/hosting.json` bound to the existing project with D1 binding `DB`.
3. Apply the generated Drizzle migration in `drizzle/0000_wet_moon_knight.sql` through the Sites deployment workflow.
4. Run the repository tests and a Sites Agent Preview.
5. Publish a checkpoint to the same project, never a duplicate project.
6. Verify production deployment status and `/study-tracker/` availability.

The service-worker cache name is `powerhouse-v4-study-tracker-1`; changing tracker shell assets in a later release should also bump this cache name.
