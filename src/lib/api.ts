export async function checkTarget(
  imageId: number,
  x: number,
  y: number
): Promise<boolean> {
  const response = await fetch("/api/check-target", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId, x, y }),
  });

  const data = await response.json();
  return data.success;
}