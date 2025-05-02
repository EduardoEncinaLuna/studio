export async function checkTarget(
  imageId: number,
  x: number,
  y: number,
  width: number
): Promise<boolean> {
  console.log(x,y, width);
  const response = await fetch("/api/check-target", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId, x, y, width }),
  });

  const data = await response.json();
  return data.success;
}