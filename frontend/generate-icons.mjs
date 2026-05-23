import sharp from 'sharp'
import fs from 'fs'

const sizes = [192, 512]

for (const size of sizes) {
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.16}"/>
      <text x="${size / 2}" y="${size * 0.65}" 
        font-size="${size * 0.4}" 
        text-anchor="middle" 
        fill="white">🚚</text>
    </svg>
  `)

  await sharp(svg)
    .png()
    .toFile(`public/icons/icon-${size}.png`)

  console.log(`Generated icon-${size}.png`)
}