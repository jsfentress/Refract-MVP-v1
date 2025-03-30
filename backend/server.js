const express = require("express");
const app = express();
const PORT = 3001;

app.get("/api/claim/:tokenId", (req, res) => {
  const { tokenId } = req.params;

  const metadata = {
    name: `Refract Claim #${tokenId}`,
    description: "Claim backed by 1.25 ETH, unlocking over 90 days.",
    image: `https://refract.app/api/render/${tokenId}.png`,
    attributes: [
      { trait_type: "Total ETH", value: "1.25" },
      { trait_type: "Unlock Schedule", value: "30%, 30%, 40%" },
      { trait_type: "Start Date", value: "2025-04-01" },
      { trait_type: "Status", value: "Partial" }
    ]
  };

  res.json(metadata);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
