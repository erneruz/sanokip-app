

export function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  const wordsPerMinute = 200;

  return Math.max(
    1,
    Math.ceil(words / wordsPerMinute)
  );
}