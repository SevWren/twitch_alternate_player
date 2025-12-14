**Mandate: LLM Must Not Alter, Add, or USE Any Content within this document**

This is a **WIP** as of 12/13/2025, and ultimately may be 100% False.  

It is simply a first draft based purely off the analaysis of a dump of chrome dev log based on ad variables from within `player.js`.  The overall scope to determine the true amount of elements, structure etc, may be much broader than this. As this ad data was originally stored in variables that was never output to the console, it is unknown what other variables may be available or even further, what other variables are used to generate the ad data.

Breakdown of unique elements (attributes) found within the `#EXT-X-DATERANGE` tags for the ads.

There are **22 unique elements** identified across the different ad tags in this specific log dump.

AI Breakdown of Elements

1.  **ID**: Unique identifier for the ad segment (e.g., `"stitched-ad-..."`).
2.  **CLASS**: Identifies the tag type (e.g., `"twitch-stitched-ad"`).
3.  **START-DATE**: The ISO 8601 timestamp when the ad starts.
4.  **DURATION**: The length of the ad in seconds.
5.  **X-TV-TWITCH-AD-URL**: The URL associated with the ad media or tracking.
6.  **X-TV-TWITCH-AD-CLICK-BEACON-ID**: Unique ID for click tracking.
7.  **X-TV-TWITCH-AD-LINE-ITEM-ID**: ID for the specific ad campaign line item.
8.  **X-TV-TWITCH-AD-CLICK-TRACKING-URL**: URL used when a user clicks the ad.
9.  **X-TV-TWITCH-AD-AF-ICR-MEDIA-DURATION**: Internal duration metric (often matches DURATION).
10. **X-TV-TWITCH-AD-POD-LENGTH**: Total number of ads in the current break (pod).
11. **X-TV-TWITCH-AD-ROLL-TYPE**: Type of ad break (e.g., `MIDROLL`, `PREROLL`).
12. **X-TV-TWITCH-AD-CREATIVE-ID**: ID for the specific video creative.
13. **X-TV-TWITCH-AD-TRACKING-START**: URL fired when the ad starts tracking.
14. **X-TV-TWITCH-AD-DSA-VERSION**: Digital Services Act version compliance.
15. **X-TV-TWITCH-AD-DSA-SS-CONTEXT**: Server-side context flag for DSA.
16. **X-TV-TWITCH-AD-AF-ICR-CREATIVE-ID**: Internal creative ID (often matches CREATIVE-ID).
17. **X-TV-TWITCH-AD-ADVERIFICATIONS**: Large JSON blob containing verification data (OMID/IAB).
18. **X-TV-TWITCH-AD-DSA-SS-LOCATION**: Server-side location flag for DSA.
19. **X-TV-TWITCH-AD-LOUDNESS**: Audio loudness normalization value.
20. **X-TV-TWITCH-AD-AD-FORMAT**: Format type (e.g., `standard_video_ad`).
21. **X-TV-TWITCH-AD-POD-POSITION**: The specific index of this ad within the pod (0, 1, etc.).
22. **X-TV-TWITCH-AD-POD-FILLED-DURATION**: Total duration filled so far in the pod.
23. **X-TV-TWITCH-AD-RADS-TOKEN**: JWT Token used for ad authorization/verification.
24. **X-TV-TWITCH-AD-AD-SESSION-ID**: Session ID linking the ad view to the user session.
25. **X-TV-TWITCH-AD-COMMERCIAL-ID**: Commercial ID (appears in later midrolls).
26. **X-TV-TWITCH-AD-AF-ICR-AD-ID**: Internal Ad ID.

### Summary
While specific ads may omit certain optional tags (like `ADVERIFICATIONS` or specific `DSA` flags depending on the ad type), a fully populated ad tag in this log contains approximately **26 unique attributes**.

*   **Prerolls** in this log tend to have around **18-20** elements.
*   **Midrolls** in this log tend to have around **24-26** elements (often including the heavier verification blobs).