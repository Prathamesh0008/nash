export default function DemoImage(seed = 1) {
  const palette = ["0f172a", "1e293b", "4c1d95", "9333ea", "0ea5e9"];
  const color = palette[Math.abs(Number(seed || 1)) % palette.length];
  return `https://dummyimage.com/800x1000/${color}/ffffff&text=Profile`;
}
