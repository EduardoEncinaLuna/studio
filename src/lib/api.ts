export async function checkTarget(
  imageId: number,
  x: number,
  y: number
): Promise<boolean> {
  console.log(x, y)
  const response = await fetch("/api/check-target", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId, x, y }),
  });
  console.log(response);

  const data = await response.json();
  return data.success;
}