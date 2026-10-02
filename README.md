# TrunkFlow public service status

This folder is the complete **status-only repository package**. It contains no application, database, customer data or private operational monitoring. Upptime maintains public incident history; the independent GitHub Pages page adds explicit freshness checks. Do not copy the parent Platform repository here.

Before enabling: create the public `TrunkFlow-LLC/trunkflow-status` repository, copy only this folder including its hidden workflow/config files, and select GitHub Actions as the Pages source. Set repository variable `TRUNKFLOW_STATUS_ENABLED=true` after the canonical `/api/readiness` route is active. No Supabase, Cloudflare, OneDrive, Resend or private-application credential belongs in this repository. Only its automatic `GITHUB_TOKEN` is used.

The separate manual `publish-shell.yml` workflow publishes an explicit unknown initial state without contacting either service or enabling scheduled monitoring. Use it for initial setup while the protected gateway is being connected. Publishing this shell alone does not verify service health.

Use `https://trunkflow-llc.github.io/trunkflow-status/` independently of app DNS. Confirm that the GitHub organization's account Pages site does not redirect all project sites to the application domain. If it does, use a TrunkFlow-owned GitHub organization without that custom domain. Do not change the app's DNS or Microsoft email.

The custom page is intentional: it starts with **Status unavailable**, validates timestamps on every load and every minute, and turns older-than-20-minute or malformed readings into unknown. No-JavaScript clients also remain unknown. GitHub Actions scheduling is best-effort and can be delayed or disabled after inactivity; an old green result must never imply current availability. Successful publication, clock-skew tests and deliberate scheduling interruption must be exercised after authorization.

Public reports include exactly service ID, availability, check time and last successful check. Probe response bodies, URL credentials, operator counts and customer data are discarded. Private operational alerts live in the separate private application repository.

The stock Upptime website/template-updater workflows are deliberately omitted so they cannot replace the freshness-aware page. Review dependency changes before updating the pinned Upptime version. Actions itself notifies repository maintainers about failed scheduled runs according to their GitHub notification settings. No paid monitoring, additional messaging integration or email recipient is configured.

References: [Upptime configuration](https://upptime.js.org/docs/configuration/), [Upptime template workflow](https://github.com/upptime/upptime/blob/master/.github/workflows/uptime.yml), [GitHub workflow scheduling](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
