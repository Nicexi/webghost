export function compareSnapshots(before, after) {
  const oldText = new Set((before.text || "").split(/\\s+/).filter(Boolean));
  const newText = new Set((after.text || "").split(/\\s+/).filter(Boolean));

  return {
    titleChanged: before.title !== after.title,
    previousTitle: before.title,
    currentTitle: after.title,
    added: [...newText].filter((word) => !oldText.has(word)),
    removed: [...oldText].filter((word) => !newText.has(word)),
    previousCapturedAt: before.capturedAt,
    currentCapturedAt: after.capturedAt
  };
}
