

## The White Space Issue

**Root cause:** In `TrainingWorkspace.tsx` (line 1006), the left content column is set to `w-[65%]` when the Andrea panel is expanded, and the `TrainerChatPanel` has a fixed width of `md:w-96` (384px). On wider screens, these two don't add up to 100% of the available space, leaving a visible gap on the right side.

## Fix

Two changes needed:

1. **`TrainerChatPanel.tsx` (line 212):** Change the expanded width from `w-full md:w-96` to `w-full md:w-[35%]` so it fills the remaining space as a percentage complement to the left column's 65%.

2. **`TrainingWorkspace.tsx` (line 998):** Ensure the parent flex container has no gap or extra space — it already uses `flex-1 flex overflow-hidden` which should be fine once the widths sum to 100%.

This is a one-line CSS class change in each file. The panel will remain collapsible (to `w-12`) and the left column will still expand to `flex-1` when collapsed.

